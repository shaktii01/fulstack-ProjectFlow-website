import asyncHandler from 'express-async-handler';
import multer, { memoryStorage } from 'multer';
import { uploadProfileImage } from '../services/uploadService.js';
import { throwAppError } from '../utils/appError.js';

export const upload = multer({
  storage: memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  },
});

export const uploadMediaMulter = multer({
  storage: memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB limit
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype.startsWith('image/') ||
      file.mimetype.startsWith('video/') ||
      file.mimetype === 'application/pdf'
    ) {
      cb(null, true);
    } else {
      cb(new Error('Only image, video, and PDF files are allowed'), false);
    }
  },
});

const uploadImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    throwAppError('No file provided', 400);
  }

  const result = await uploadProfileImage({
    userId: req.user._id,
    fileBuffer: req.file.buffer,
  });

  res.json({ url: result.url, fileId: result.fileId });
});

const uploadMediaController = asyncHandler(async (req, res) => {
  if (!req.file) {
    throwAppError('No file provided', 400);
  }

  // Use the new service function
  const { uploadMedia } = await import('../services/uploadService.js');
  const result = await uploadMedia({
    userId: req.user._id,
    fileBuffer: req.file.buffer,
    originalName: req.file.originalname,
  });
  
  let type = 'image';
  if (req.file.mimetype.startsWith('video/')) type = 'video';
  if (req.file.mimetype === 'application/pdf') type = 'pdf';

  res.json({
    url: result.url,
    fileId: result.fileId,
    type,
    name: req.file.originalname,
  });
});

export { uploadImage, uploadMediaController };
