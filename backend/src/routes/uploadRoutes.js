import express from 'express';
import { uploadImage, upload, uploadMediaController, uploadMediaMulter } from '../controllers/uploadController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(protect);

// POST /api/upload/image — multipart upload, processed server-side to ImageKit
router.post('/image', upload.single('image'), uploadImage);

// POST /api/upload/media — for comments (images, videos, pdfs)
router.post('/media', uploadMediaMulter.single('file'), uploadMediaController);

export default router;
