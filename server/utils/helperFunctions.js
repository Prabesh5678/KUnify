import { OAuth2Client } from "google-auth-library";
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
import cloudinary from "../configs/cloudinary.config.js";
import fs from "fs/promises";
import path from "path";

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

  if (provider === "local") {
    // Store under /uploads/<folder>/ on the VPS
    const uploadDir = path.join(process.cwd(), "uploads",env, folder);
    await fs.mkdir(uploadDir, { recursive: true });

    const filename = `${Date.now()}-${file.originalname}`;
    const destPath = path.join(uploadDir, filename);

    await fs.copyFile(file.path, destPath);

    // Clean up multer's temp file
    await fs.unlink(file.path).catch(() => {});

    // Return a relative URL path (serve this via express.static or nginx)
    const baseUrl = process.env.BASE_URL;
    const url = `${baseUrl}/uploads/${env}/${folder}/${filename}`;
    return { url, publicId: null };
  }

  // Default: Cloudinary
  const result = await cloudinary.uploader.upload(file.path, {
    folder: `kunify/${folder}`,
    resource_type: "raw",
    type: "upload",
    access_mode: "public",
    flags: "attachment",
  });

  // Clean up multer's temp file
  await fs.unlink(file.path).catch(() => {});

  let url = result.secure_url;
  if (url.includes("/upload/")) {
    url = url.replace("/upload/", "/upload/fl_attachment/");
  }

  return { url, publicId: result.public_id };
};