import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../configs/cloudinary.config.js';

// Configure Cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'kunify/logs',
    allowed_formats: ['jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx', 'txt'],
    resource_type: 'auto',
  },
});

// Create multer upload middleware
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 2 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept all file types defined in allowed_formats
    cb(null, true);
  },
});

// Single file upload middleware
export const uploadSingle = upload.single('file');

// Multiple files upload middleware
export const uploadMultiple = upload.array('files', 5); // Max 5 files

// Helper function to delete file from Cloudinary
export const deleteCloudinaryFile = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId);
    return true;
  } catch (error) {
    console.error('Error deleting Cloudinary file:', error);
    return false;
  }
};