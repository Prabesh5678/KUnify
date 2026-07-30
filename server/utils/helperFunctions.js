import { OAuth2Client } from "google-auth-library";
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
import cloudinary from "../configs/cloudinary.config.js";
import path from "path";
import crypto from "crypto";
import fs from "fs/promises";
import { fileTypeFromFile } from "file-type";

export const handleGoogleAuth = async (credential) => {
  if (!credential) {
    return { success: false, message: "No credential provided" };
  }
  try {
    // Verify with Google
    let payload;
    try {
      const ticket = await client.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      payload = ticket.getPayload();
    } catch (verifyErr) {
      return { success: false, message: "Invalid Google token" };
    }
    const { sub: googleId, email, name, picture } = payload;
    if (!email) {
      return { success: false, message: "Email not provided by Google" };
    }
    return { success: true, googleId, email, name, avatar: picture };
  } catch (error) {
    console.error(error.stack);
    return {
      success: false,
      message: "Error occurred while handling Google authentication.",
    };
  }
};


export const uploadFile = async (file, folder = "uploads") => {
  const provider = process.env.STORAGE_PROVIDER;
  const env = process.env.NODE_ENV;

  try {
    // Only allow uploads folder
    folder = "uploads";

    // Only allow PDF extension
    const ext = path.extname(file.originalname).toLowerCase();

    if (ext !== ".pdf") {
      throw new Error("Only PDF files are allowed");
    }

    // Verify actual file content (prevents fake .pdf files)
    const fileType = await fileTypeFromFile(file.path);

    if (!fileType || fileType.mime !== "application/pdf") {
      throw new Error("Invalid PDF file");
    }

    // Secure random filename (prevents collision + ignores malicious names)
    const filename = `${crypto.randomUUID()}.pdf`;

    if (provider === "local") {
      // Store under /uploads/<env>/uploads/
      const uploadDir = path.join(process.cwd(), "uploads", env, folder);

      await fs.mkdir(uploadDir, { recursive: true });

      const destPath = path.join(uploadDir, filename);

      await fs.copyFile(file.path, destPath);

      // Clean up multer temp file
      await fs.unlink(file.path).catch(() => {});

      const baseUrl = process.env.BASE_URL;

      const url = `${baseUrl}/uploads/${env}/${folder}/${filename}`;

      return {
        url,
        publicId: null,
      };
    }

    // Cloudinary
    const result = await cloudinary.uploader.upload(file.path, {
      folder: "kunify/uploads",
      resource_type: "raw",
      type: "upload",
      access_mode: "public",
      flags: "attachment",
      public_id: crypto.randomUUID(),
    });

    await fs.unlink(file.path).catch(() => {});

    let url = result.secure_url;

    if (url.includes("/upload/")) {
      url = url.replace("/upload/", "/upload/fl_attachment/");
    }

    return {
      url,
      publicId: result.public_id,
    };
  } catch (err) {
    await fs.unlink(file.path).catch(() => {});

    throw new Error(`File upload failed: ${err.message}`);
  }
};

export const deleteFile = async (fileUrl, publicId) => {
  const provider = process.env.STORAGE_PROVIDER;

  try {
    if (!publicId) {
      // Local storage deletion

      if (!fileUrl) {
        throw new Error("File URL is required");
      }

      const pathname = new URL(fileUrl).pathname;

      // Convert URL path to local filesystem path
      const diskPath = path.join(process.cwd(), pathname);

      // Only allow deleting files inside /uploads
      const uploadRoot = path.join(process.cwd(), "uploads");

      if (!diskPath.startsWith(uploadRoot)) {
        throw new Error("Invalid file deletion path");
      }

      await fs.unlink(diskPath);
    } else {
      // Cloudinary deletion

      await cloudinary.uploader.destroy(publicId, {
        resource_type: "raw",
      });
    }

    console.log(`File deleted successfully from ${provider} storage.`);

    return {
      success: true,
    };
  } catch (err) {
    console.error(`Error deleting file: ${err.message}`);

    return {
      success: false,
      message: err.message,
    };
  }
};
