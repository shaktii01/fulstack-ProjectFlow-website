import mongoose from 'mongoose';
import Comment from '../models/Comment.js';
import Task from '../models/Task.js';
import Notification from '../models/Notification.js';
import { throwAppError } from '../utils/appError.js';

const getTaskWithActiveProject = async (taskId) => {
  const task = await Task.findById(taskId).populate('project');

  if (!task || task.isDeleted) {
    throwAppError('Task not found', 404);
  }

  const projectDoc = task.project;
  if (!projectDoc || !projectDoc.isActive || projectDoc.isArchived) {
    throwAppError('Task not found', 404);
  }

  return { task, projectDoc };
};

export const addCommentForTask = async (user, payload) => {
  const { taskId, text, mentions, parentComment } = payload;
  const normalizedMentions = Array.isArray(mentions)
    ? [...new Set(mentions.map((mentionId) => mentionId?.toString()).filter(Boolean))]
    : [];

  const { task, projectDoc } = await getTaskWithActiveProject(taskId);

  if (user.role === 'company') {
    if (projectDoc.company.toString() !== user._id.toString()) {
      throwAppError('Not authorized', 403);
    }
  } else {
    const isAssigned = task.assignedTo && task.assignedTo.toString() === user._id.toString();
    if (!isAssigned) {
      throwAppError('You can only comment on tasks assigned to you', 403);
    }
  }

  let validParentComment = null;
  if (parentComment) {
    if (!mongoose.isValidObjectId(parentComment)) {
      throwAppError('Invalid parent comment', 400);
    }

    validParentComment = await Comment.findOne({
      _id: parentComment,
      task: task._id,
      project: projectDoc._id,
      isDeleted: false,
    }).select('_id');

    if (!validParentComment) {
      throwAppError('Parent comment not found for this task', 400);
    }
  }

  const allowedMentionIds = new Set([
    projectDoc.company.toString(),
    ...(projectDoc.members || []).map((memberId) => memberId.toString()),
  ]);

  const validMentions = normalizedMentions.filter(
    (mentionId) =>
      mentionId !== user._id.toString() && allowedMentionIds.has(mentionId)
  );

  const comment = await Comment.create({
    task: task._id,
    project: projectDoc._id,
    user: user._id,
    text,
    mentions: validMentions,
    parentComment: validParentComment?._id || null,
  });

  if (validMentions.length > 0) {
    const notifications = validMentions.map((mentionId) => ({
      recipient: mentionId,
      type: 'mentioned_in_comment',
      message: `${user.fullName} mentioned you in a comment`,
      referenceId: task._id,
      referenceModel: 'Task',
    }));

    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }
  }

  return Comment.findById(comment._id)
    .populate('user', 'fullName profileImage role')
    .populate('mentions', 'fullName');
};

export const listTaskCommentsByAccess = async (user, taskId) => {
  const { projectDoc } = await getTaskWithActiveProject(taskId);

  if (user.role === 'company' && projectDoc.company.toString() !== user._id.toString()) {
    throwAppError('Not authorized', 403);
  }

  if (user.role === 'employee') {
    const isMember = projectDoc.members.some((member) => member.toString() === user._id.toString());
    if (!isMember) {
      throwAppError('Not authorized', 403);
    }
  }

  return Comment.find({ task: taskId, isDeleted: false })
    .populate('user', 'fullName profileImage role')
    .populate('mentions', 'fullName')
    .sort({ createdAt: 1 });
};
