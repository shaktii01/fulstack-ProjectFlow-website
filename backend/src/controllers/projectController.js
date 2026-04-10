import asyncHandler from 'express-async-handler';
import {
  archiveCompanyProject,
  createProjectForCompany,
  getProjectByUserAccess,
  listProjectsByUserRole,
  updateCompanyProject,
} from '../services/projectService.js';
import { validateProjectCreatePayload, validateProjectUpdatePayload } from '../validators/projectValidators.js';

const createProject = asyncHandler(async (req, res) => {
  validateProjectCreatePayload(req.body);
  const project = await createProjectForCompany(req.user._id, req.body);
  res.status(201).json(project);
});

const getProjects = asyncHandler(async (req, res) => {
  const projects = await listProjectsByUserRole(req.user);
  res.json(projects);
});

const getProjectById = asyncHandler(async (req, res) => {
  const project = await getProjectByUserAccess(req.params.id, req.user);
  res.json(project);
});

const updateProject = asyncHandler(async (req, res) => {
  validateProjectUpdatePayload(req.body);
  const updatedProject = await updateCompanyProject(req.params.id, req.user._id, req.body);
  res.json(updatedProject);
});

const deleteProject = asyncHandler(async (req, res) => {
  await archiveCompanyProject(req.params.id, req.user._id);
  res.json({ message: 'Project deleted successfully' });
});

export {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
};
