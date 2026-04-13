import express from 'express';
import {
  addComment,
  getTaskComments,
  removeComment,
  removeMediaItem
} from '../controllers/commentController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .post(addComment);

router.route('/:commentId')
  .delete(removeComment);

router.route('/:commentId/media/:fileId')
  .delete(removeMediaItem);

router.route('/task/:taskId')
  .get(getTaskComments);

export default router;
