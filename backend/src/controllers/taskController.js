import asyncHandler from 'express-async-handler';
import {
  createTaskForProject,
  deleteTaskByCompany,
  getTaskByUserAccess,
  listTasksByUserRole,
  updateTaskByUserAccess,
} from '../services/taskService.js';
import { validateTaskCreatePayload } from '../validators/taskValidators.js';

const createTask = asyncHandler(async (req, res) => {
  validateTaskCreatePayload(req.body);
  const task = await createTaskForProject(req.user._id, req.body);
  res.status(201).json(task);
});

const getTasks = asyncHandler(async (req, res) => {
  const tasks = await listTasksByUserRole(req.user, req.query.projectId);
  res.json(tasks);
});

const getTaskById = asyncHandler(async (req, res) => {
  const task = await getTaskByUserAccess(req.params.id, req.user);
  res.json(task);
});

const updateTask = asyncHandler(async (req, res) => {
  const task = await updateTaskByUserAccess(req.params.id, req.user, req.body);
  res.json(task);
});

const deleteTask = asyncHandler(async (req, res) => {
  await deleteTaskByCompany(req.params.id, req.user._id);
  res.json({ message: 'Task removed' });
});

export {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
};
