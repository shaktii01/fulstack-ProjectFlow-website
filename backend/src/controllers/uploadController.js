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

export { uploadImage };
