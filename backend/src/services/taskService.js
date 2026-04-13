import Task from '../models/Task.js';
import Project from '../models/Project.js';
import Comment from '../models/Comment.js';
import { throwAppError } from '../utils/appError.js';
import { normalizeTaskType } from '../validators/taskValidators.js';

const COMPANY_TASK_UPDATABLE_FIELDS = new Set([
  'title',
  'description',
  'taskType',
  'assignedTo',
  'priority',
  'dueDate',
  'status',
  'tags',
  'attachments',
]);

const getActiveProjectById = async (projectId) => {
  const project = await Project.findById(projectId);
  if (!project) {
    throwAppError('Project not found', 404);
  }
  return project;
};

const ensureProjectMember = (project, userId, errorMessage = 'Not authorized') => {
  const isMember = project.members.some((member) => member.toString() === userId.toString());
  if (!isMember) {
    throwAppError(errorMessage, 403);
  }
};

const pickAllowedFields = (payload, allowedFields) =>
  Object.entries(payload || {}).reduce((accumulator, [key, value]) => {
    if (!allowedFields.has(key) || value === undefined) {
      return accumulator;
    }

    accumulator[key] = value;
    return accumulator;
  }, {});

export const createTaskForProject = async (companyId, payload) => {
  const { project, title, description, taskType, assignedTo, priority, dueDate, tags } = payload;

  const projectDoc = await getActiveProjectById(project);

  if (projectDoc.company.toString() !== companyId.toString()) {
    throwAppError('Not authorized to access this project', 403);
  }

  if (assignedTo) {
    ensureProjectMember(projectDoc, assignedTo, 'Assigned user must be a member of the selected project');
  }

  return Task.create({
    project,
    title,
    description,
    taskType: normalizeTaskType(taskType),
    createdBy: companyId,
    assignedTo,
    assignedByCompany: companyId,
    priority,
    dueDate,
    tags,
  });
};

export const listTasksByUserRole = async (user, projectId) => {
  const query = {};

  if (projectId) {
    const project = await getActiveProjectById(projectId);

    if (user.role === 'company' && project.company.toString() !== user._id.toString()) {
      throwAppError('Not authorized', 403);
    }

    if (user.role === 'employee') {
      ensureProjectMember(project, user._id, 'Not authorized to view tasks for this project');
    }

    query.project = projectId;
  } else if (user.role === 'company') {
    const companyProjects = await Project.find({ company: user._id }).select('_id');
    query.project = { $in: companyProjects.map((project) => project._id) };
  } else if (user.role === 'employee') {
    const memberProjects = await Project.find({ members: user._id }).select('_id');
    query.project = { $in: memberProjects.map((project) => project._id) };
  }

  return Task.find(query)
    .populate('assignedTo', 'fullName email profileImage')
    .populate('createdBy', 'fullName')
    .populate('project', 'name code')
    .sort({ createdAt: -1 });
};

export const getTaskByUserAccess = async (taskId, user) => {
  const task = await Task.findById(taskId)
    .populate('assignedTo', 'fullName email profileImage')
    .populate('createdBy', 'fullName')
    .populate('project', 'name company members isActive isArchived');

  if (!task) {
    throwAppError('Task not found', 404);
  }

  const projectDoc = task.project;
  if (!projectDoc) {
    throwAppError('Task not found', 404);
  }

  if (user.role === 'company' && projectDoc.company.toString() !== user._id.toString()) {
    throwAppError('Not authorized', 403);
  }

  if (user.role === 'employee') {
    ensureProjectMember(projectDoc, user._id);
  }

  return task;
};

export const updateTaskByUserAccess = async (taskId, user, payload) => {
  const task = await Task.findById(taskId).populate('project');

  if (!task) {
    throwAppError('Task not found', 404);
  }

  const projectDoc = task.project;
  if (!projectDoc) {
    throwAppError('Task not found', 404);
  }

  if (user.role === 'company') {
    if (projectDoc.company.toString() !== user._id.toString()) {
      throwAppError('Not authorized', 403);
    }

    const updates = pickAllowedFields(payload, COMPANY_TASK_UPDATABLE_FIELDS);

    if (Object.keys(updates).length === 0) {
      throwAppError('No valid task fields provided for update', 400);
    }

    if (updates.taskType) {
      updates.taskType = normalizeTaskType(updates.taskType);
    }

    if (Object.prototype.hasOwnProperty.call(updates, 'assignedTo') && updates.assignedTo) {
      ensureProjectMember(projectDoc, updates.assignedTo, 'Assigned user must be a member of the selected project');
    }

    const previousStatus = task.status;
    Object.assign(task, updates);

    if (Object.prototype.hasOwnProperty.call(updates, 'status')) {
      if (updates.status === 'done' && previousStatus !== 'done') {
        task.completedAt = Date.now();
      } else if (updates.status !== 'done' && previousStatus === 'done') {
        task.completedAt = undefined;
      }
    }

    await task.save();
    await task.populate('assignedTo', 'fullName email profileImage');
    return task;
  }

  if (user.role === 'employee') {
    ensureProjectMember(projectDoc, user._id);

    const requestedFields = Object.keys(payload || {});
    if (requestedFields.length !== 1 || requestedFields[0] !== 'status' || !payload.status) {
      throwAppError('Employees can only update task status', 400);
    }

    const previousStatus = task.status;
    task.status = payload.status;
    if (payload.status === 'done' && previousStatus !== 'done') {
      task.completedAt = Date.now();
    } else if (payload.status !== 'done' && previousStatus === 'done') {
      task.completedAt = undefined;
    }

    return task.save();
  }

  return task;
};

export const deleteTaskByCompany = async (taskId, companyId) => {
  const task = await Task.findById(taskId).populate('project');

  if (!task) {
    throwAppError('Task not found', 404);
  }

  if (task.project.company.toString() !== companyId.toString()) {
    throwAppError('Not authorized', 403);
  }

  await Task.findByIdAndDelete(taskId);

  await Comment.deleteMany({ task: taskId });
};
