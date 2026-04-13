import asyncHandler from 'express-async-handler';
import { 
  addCommentForTask, 
  listTaskCommentsByAccess,
  deleteCommentWithMedia,
  deleteMediaItemFromComment
} from '../services/commentService.js';

const addComment = asyncHandler(async (req, res) => {
  const comment = await addCommentForTask(req.user, req.body);
  res.status(201).json(comment);
});

const getTaskComments = asyncHandler(async (req, res) => {
  const comments = await listTaskCommentsByAccess(req.user, req.params.taskId);
  res.json(comments);
});

const removeComment = asyncHandler(async (req, res) => {
  await deleteCommentWithMedia(req.user, req.params.commentId);
  res.json({ message: 'Comment deleted successfully' });
});

const removeMediaItem = asyncHandler(async (req, res) => {
  const updatedComment = await deleteMediaItemFromComment(
    req.user, 
    req.params.commentId, 
    req.params.fileId
  );
  res.json(updatedComment);
});

export {
  addComment,
  getTaskComments,
  removeComment,
  removeMediaItem,
};
