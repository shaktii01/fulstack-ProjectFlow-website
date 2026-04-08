import asyncHandler from 'express-async-handler';
import Project from '../models/Project.js';
import User from '../models/User.js';

// @desc    Create a project
// @route   POST /api/projects
// @access  Private/Company
const createProject = asyncHandler(async (req, res) => {
  const { name, code, description, startDate, endDate, members } = req.body;

  // Validate members belong to company
  if (members && members.length > 0) {
    const validMembers = await User.find({ _id: { $in: members }, companyId: req.user._id, role: 'employee' });
    if (validMembers.length !== members.length) {
      res.status(400);
      throw new Error('Some members do not exist or do not belong to this company');
    }
  }

  const project = await Project.create({
    name,
    code,
    description,
    startDate,
    endDate,
    members: members || [],
    company: req.user._id,
    createdBy: req.user._id,
  });

  res.status(201).json(project);
});

// @desc    Get all company projects
// @route   GET /api/projects
// @access  Private
const getProjects = asyncHandler(async (req, res) => {
  let query = {};

  if (req.user.role === 'company') {
    query = { company: req.user._id, isActive: true };
  } else if (req.user.role === 'employee') {
    // Employee can only see projects they are members of
    query = { members: req.user._id, isActive: true };
  }

  const projects = await Project.find(query)
    .populate('members', 'fullName email profileImage')
    .sort({ createdAt: -1 });

  res.json(projects);
});

// @desc    Get project by ID
// @route   GET /api/projects/:id
// @access  Private
const getProjectById = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id)
    .populate('members', 'fullName email profileImage designation')
    .populate('createdBy', 'fullName');

  if (!project) {
    res.status(404);
    throw new Error('Project not found');
  }

  // Authorization Check
  if (req.user.role === 'company' && project.company.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to access this project');
  }

  if (req.user.role === 'employee') {
    const isMember = project.members.some(member => member._id.toString() === req.user._id.toString());
    if (!isMember) {
      res.status(403);
      throw new Error('You are not a member of this project');
    }
  }

  res.json(project);
});

// @desc    Update a project
// @route   PUT /api/projects/:id
// @access  Private/Company
const updateProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);

  if (!project) {
    res.status(404);
    throw new Error('Project not found');
  }

  if (project.company.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to update this project');
  }

  // If updating members, validate them
  const { members } = req.body;
  if (members && members.length > 0) {
    const validMembers = await User.find({ _id: { $in: members }, companyId: req.user._id, role: 'employee' });
    if (validMembers.length !== members.length) {
      res.status(400);
      throw new Error('Some members do not exist or do not belong to this company');
    }
  }

  const updatedProject = await Project.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  ).populate('members', 'fullName email profileImage designation');

  res.json(updatedProject);
});

// @desc    Delete a project
// @route   DELETE /api/projects/:id
// @access  Private/Company
const deleteProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);

  if (!project) {
    res.status(404);
    throw new Error('Project not found');
  }

  if (project.company.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to delete this project');
  }

  project.isArchived = true;
  project.isActive = false;
  await project.save();

  res.json({ message: 'Project deleted successfully' });
});

export {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject
};
