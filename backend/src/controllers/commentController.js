import asyncHandler from 'express-async-handler';
import { addCommentForTask, listTaskCommentsByAccess } from '../services/commentService.js';

const addComment = asyncHandler(async (req, res) => {
  const comment = await addCommentForTask(req.user, req.body);
  res.status(201).json(comment);
});

const getTaskComments = asyncHandler(async (req, res) => {
  const comments = await listTaskCommentsByAccess(req.user, req.params.taskId);
  res.json(comments);
});

export {
  addComment,
  getTaskComments,
};
