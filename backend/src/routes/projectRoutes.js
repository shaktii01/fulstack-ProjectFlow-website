import express from 'express';
import {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject
} from '../controllers/projectController.js';
import { protect, authorizeRoles } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.route('/')
  .post(protect, authorizeRoles('company'), createProject)
  .get(protect, getProjects); // Both company and employee

router.route('/:id')
  .get(protect, getProjectById) // Both
  .put(protect, authorizeRoles('company'), updateProject)
  .delete(protect, authorizeRoles('company'), deleteProject);

export default router;
