import express from 'express';
import {
  addComment,
  getTaskComments
} from '../controllers/commentController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .post(addComment);

router.route('/task/:taskId')
  .get(getTaskComments);

export default router;
