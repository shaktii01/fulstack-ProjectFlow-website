import asyncHandler from 'express-async-handler';
import mongoose from 'mongoose';
import Comment from '../models/Comment.js';
import Task from '../models/Task.js';
import Notification from '../models/Notification.js';

// @desc    Add a comment to a task
// @route   POST /api/comments
// @access  Private
const addComment = asyncHandler(async (req, res) => {
  const { taskId, text, mentions, parentComment } = req.body;
  const normalizedMentions = Array.isArray(mentions)
    ? [...new Set(mentions.map((mentionId) => mentionId?.toString()).filter(Boolean))]
    : [];

  const task = await Task.findById(taskId).populate('project');

  if (!task || task.isDeleted) {
    res.status(404);
    throw new Error('Task not found');
  }

  const projectDoc = task.project;

  // Authorization: Only project members or company can comment
  if (req.user.role === 'company') {
    if (projectDoc.company.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized');
    }
  } else {
    // Only assigned employee or project members? Requirements say "Employee can comment only on company-assigned tasks" 
    // AND "Only project members can comment" -> Both means they must have the task assigned AND be in the project
    // Wait, the rule says "Employee can comment only on company-assigned tasks"
    const isAssigned = task.assignedTo && task.assignedTo.toString() === req.user._id.toString();
    if (!isAssigned) {
      res.status(403);
      throw new Error('You can only comment on tasks assigned to you');
    }
  }

  let validParentComment = null;

  if (parentComment) {
    if (!mongoose.isValidObjectId(parentComment)) {
      res.status(400);
      throw new Error('Invalid parent comment');
    }

    validParentComment = await Comment.findOne({
      _id: parentComment,
      task: task._id,
      project: projectDoc._id,
      isDeleted: false,
    }).select('_id');

    if (!validParentComment) {
      res.status(400);
      throw new Error('Parent comment not found for this task');
    }
  }

  const allowedMentionIds = new Set([
    projectDoc.company.toString(),
    ...(projectDoc.members || []).map((memberId) => memberId.toString()),
  ]);

  const validMentions = normalizedMentions.filter(
    (mentionId) =>
      mentionId !== req.user._id.toString() && allowedMentionIds.has(mentionId)
  );

  const comment = await Comment.create({
    task: task._id,
    project: projectDoc._id,
    user: req.user._id,
    text,
    mentions: validMentions,
    parentComment: validParentComment?._id || null,
  });

  // Handle Notifications for Mentions
  if (validMentions.length > 0) {
    const notifications = validMentions.map(mId => ({
      recipient: mId,
      type: 'mentioned_in_comment',
      message: `${req.user.fullName} mentioned you in a comment`,
      referenceId: task._id,
      referenceModel: 'Task',
    }));

    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }
  }

  const populatedComment = await Comment.findById(comment._id)
    .populate('user', 'fullName profileImage role')
    .populate('mentions', 'fullName');

  res.status(201).json(populatedComment);
});

// @desc    Get comments for a task
// @route   GET /api/comments/task/:taskId
// @access  Private
const getTaskComments = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.taskId).populate('project');

  if (!task || task.isDeleted) {
    res.status(404);
    throw new Error('Task not found');
  }

  const projectDoc = task.project;

  // Auth checks
  if (req.user.role === 'company' && projectDoc.company.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized');
  }

  if (req.user.role === 'employee') {
    const isMember = projectDoc.members.some(m => m.toString() === req.user._id.toString());
    if (!isMember) {
      res.status(403);
      throw new Error('Not authorized');
    }
  }

  const comments = await Comment.find({ task: req.params.taskId, isDeleted: false })
    .populate('user', 'fullName profileImage role')
    .populate('mentions', 'fullName')
    .sort({ createdAt: 1 });

  // Structure as threaded if needed in frontend, or just flat list
  res.json(comments);
});

export {
  addComment,
  getTaskComments
};
