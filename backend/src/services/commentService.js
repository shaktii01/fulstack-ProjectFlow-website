import mongoose from 'mongoose';
import Comment from '../models/Comment.js';
import Task from '../models/Task.js';
import Notification from '../models/Notification.js';
import { deleteMediaFromImageKit } from './uploadService.js';
import { throwAppError } from '../utils/appError.js';

const getTaskWithActiveProject = async (taskId) => {
  const task = await Task.findById(taskId).populate('project');

  if (!task) {
    throwAppError('Task not found', 404);
  }

  const projectDoc = task.project;
  if (!projectDoc) {
    throwAppError('Task not found', 404);
  }

  return { task, projectDoc };
};

export const addCommentForTask = async (user, payload) => {
  const { taskId, text, mentions, parentComment, media } = payload;
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

  // Ensure there is at least text or media
  if ((!text || !text.trim()) && (!media || media.length === 0)) {
    throwAppError('Comment must have text or media', 400);
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
    media: media || [],
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
    const isMember = projectDoc.members.some((member) => {
      const memberId = member._id ? member._id.toString() : member.toString();
      return memberId === user._id.toString();
    });
    if (!isMember) {
      throwAppError('Not authorized', 403);
    }
  }

  return Comment.find({ task: taskId })
    .populate('user', 'fullName profileImage role')
    .populate('mentions', 'fullName')
    .sort({ createdAt: -1 });
};

export const deleteCommentWithMedia = async (user, commentId) => {
  const comment = await Comment.findById(commentId).populate('project');

  if (!comment) {
    throwAppError('Comment not found', 404);
  }

  // Permission check: only author or company owner can delete
  const isAuthor = comment.user.toString() === user._id.toString();
  const isCompanyOwner = user.role === 'company' && comment.project.company.toString() === user._id.toString();

  if (!isAuthor && !isCompanyOwner) {
    throwAppError('Not authorized to delete this comment', 403);
  }

  // Delete all media from ImageKit
  if (comment.media && comment.media.length > 0) {
    const deletePromises = comment.media.map((item) => {
      if (item.fileId) {
        return deleteMediaFromImageKit(item.fileId);
      }
      return Promise.resolve();
    });
    await Promise.all(deletePromises);
  }

  await Comment.findByIdAndDelete(commentId);
};

export const deleteMediaItemFromComment = async (user, commentId, fileId) => {
  const comment = await Comment.findById(commentId).populate('project');

  if (!comment) {
    throwAppError('Comment not found', 404);
  }

  // Permission check
  const isAuthor = comment.user.toString() === user._id.toString();
  const isCompanyOwner = user.role === 'company' && comment.project.company.toString() === user._id.toString();

  if (!isAuthor && !isCompanyOwner) {
    throwAppError('Not authorized to modify this comment', 403);
  }

  const mediaItem = comment.media.find((item) => item.fileId === fileId);
  if (!mediaItem) {
    throwAppError('Media item not found in this comment', 404);
  }

  // Delete from ImageKit
  await deleteMediaFromImageKit(fileId);

  // Remove from comment document
  comment.media = comment.media.filter((item) => item.fileId !== fileId);
  
  // If comment is now empty (no text and no media), we might want to delete it entirely
  // but for now let's just save the update.
  await comment.save();
  
  return comment;
};
