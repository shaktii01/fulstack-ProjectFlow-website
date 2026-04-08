import asyncHandler from 'express-async-handler';
import Task from '../models/Task.js';
import Project from '../models/Project.js';
import User from '../models/User.js';

// @desc    Create a task
// @route   POST /api/tasks
// @access  Private/Company
const createTask = asyncHandler(async (req, res) => {
  const { project, title, description, taskType, assignedTo, priority, dueDate, tags } = req.body;

  // Validate Project
  const projectDoc = await Project.findById(project);
  if (!projectDoc) {
    res.status(404);
    throw new Error('Project not found');
  }

  if (projectDoc.company.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to access this project');
  }

  // Validate Assigned Employee belongs to project
  if (assignedTo) {
    const isMember = projectDoc.members.some(member => member.toString() === assignedTo);
    if (!isMember) {
      res.status(400);
      throw new Error('Assigned user must be a member of the selected project');
    }
  }

  const task = await Task.create({
    project,
    title,
    description,
    taskType,
    createdBy: req.user._id,
    assignedTo,
    assignedByCompany: req.user._id,
    priority,
    dueDate,
    tags
  });

  res.status(201).json(task);
});

// @desc    Get all tasks (with filters)
// @route   GET /api/tasks
// @access  Private
const getTasks = asyncHandler(async (req, res) => {
  const { projectId } = req.query;
  
  let query = { isDeleted: false };

  // If projectId is provided
  if (projectId) {
    const project = await Project.findById(projectId);
    if (!project) {
      res.status(404);
      throw new Error('Project not found');
    }

    // Role checks
    if (req.user.role === 'company' && project.company.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized');
    }
    
    if (req.user.role === 'employee') {
      const isMember = project.members.some(m => m.toString() === req.user._id.toString());
      if (!isMember) {
        res.status(403);
        throw new Error('Not authorized to view tasks for this project');
      }
    }

    query.project = projectId;
  } else {
    // No specific project provided, so get all accessible tasks
    if (req.user.role === 'company') {
      // Find all projects for company
      const companyProjects = await Project.find({ company: req.user._id }).select('_id');
      const projectIds = companyProjects.map(p => p._id);
      query.project = { $in: projectIds };
    } else if (req.user.role === 'employee') {
      // Find all projects where employee is a member
      const memberProjects = await Project.find({ members: req.user._id }).select('_id');
      const projectIds = memberProjects.map(p => p._id);
      query.project = { $in: projectIds };
    }
  }

  const tasks = await Task.find(query)
    .populate('assignedTo', 'fullName email profileImage')
    .populate('createdBy', 'fullName')
    .populate('project', 'name code')
    .sort({ createdAt: -1 });

  res.json(tasks);
});

// @desc    Get single task
// @route   GET /api/tasks/:id
// @access  Private
const getTaskById = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id)
    .populate('assignedTo', 'fullName email profileImage')
    .populate('createdBy', 'fullName')
    .populate('project', 'name company members');

  if (!task || task.isDeleted) {
    res.status(404);
    throw new Error('Task not found');
  }

  // Auth Checks
  const projectDoc = task.project;
  
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

  res.json(task);
});

// @desc    Update a task
// @route   PUT /api/tasks/:id
// @access  Private
const updateTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id).populate('project');

  if (!task || task.isDeleted) {
    res.status(404);
    throw new Error('Task not found');
  }

  const projectDoc = task.project;

  if (req.user.role === 'company') {
    // Company can update everything
    if (projectDoc.company.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized');
    }
    
    // Check if new assignedTo is in project
    if (req.body.assignedTo) {
      const isMember = projectDoc.members.some(m => m.toString() === req.body.assignedTo);
      if (!isMember) {
        res.status(400);
        throw new Error('Assigned user must be a member of the selected project');
      }
    }

    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('assignedTo', 'fullName email profileImage');
    
    return res.json(updatedTask);
  }

  if (req.user.role === 'employee') {
    // Employee can ONLY update status
    const isMember = projectDoc.members.some(m => m.toString() === req.user._id.toString());
    if (!isMember) {
      res.status(403);
      throw new Error('Not authorized');
    }

    // Only allow status update
    if (req.body.status) {
      task.status = req.body.status;
      if (req.body.status === 'done' && task.status !== 'done') {
        task.completedAt = Date.now();
      }
      const updatedTask = await task.save();
      return res.json(updatedTask);
    } else {
      res.status(400);
      throw new Error('Employees can only update task status');
    }
  }
});

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
// @access  Private/Company
const deleteTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id).populate('project');

  if (!task || task.isDeleted) {
    res.status(404);
    throw new Error('Task not found');
  }

  if (task.project.company.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized');
  }

  task.isDeleted = true;
  await task.save();

  res.json({ message: 'Task removed' });
});

export {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask
};
