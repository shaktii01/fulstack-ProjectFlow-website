import express from 'express';
import { uploadImage, upload } from '../controllers/uploadController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(protect);

// POST /api/upload/image — multipart upload, processed server-side to ImageKit
router.post('/image', upload.single('image'), uploadImage);

export default router;
