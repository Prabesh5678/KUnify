// utils/upload.utils.js
import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../configs/cloudinary.config.js';

// Configure Cloudinary storage for log sheets
const logStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'kunify/logs',
    allowed_formats: ['jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx', 'txt'],
    resource_type: 'auto',
  },
});

// Create multer upload middleware for log sheets
const logUpload = multer({
  storage: logStorage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    cb(null, true);
  },
});

// Single file upload middleware for logs
export const uploadSingle = logUpload.single('file');

// Multiple files upload middleware for logs
export const uploadMultiple = logUpload.array('files', 5);

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

// Proposal-specific upload function
export const uploadProposalToCloudinary = (buffer, options = {}) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      {
        folder: 'kunify/proposals',
        resource_type: 'raw',
        ...options
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    ).end(buffer);
  });
};

// Multer config for proposals (stores in memory for Cloudinary upload)
const proposalMemoryStorage = multer.memoryStorage();

export const proposalUpload = multer({
  storage: proposalMemoryStorage,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed for proposals'), false);
    }
  },
});

// Single file upload for proposals
export const uploadProposalSingle = proposalUpload.single('file');