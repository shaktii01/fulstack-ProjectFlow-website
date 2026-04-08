import express from 'express';
import {
  getDashboardStats,
  getEmployees,
  updateEmployee,
  removeEmployee,
  getJoinRequests,
  updateJoinRequest
} from '../controllers/companyController.js';
import { protect, authorizeRoles } from '../middlewares/authMiddleware.js';

const router = express.Router();

// All routes here are strictly for the company role
router.use(protect);
router.use(authorizeRoles('company'));

router.get('/dashboard', getDashboardStats);
router.get('/employees', getEmployees);
router.route('/employees/:id')
  .put(updateEmployee)
  .delete(removeEmployee);

router.route('/requests')
  .get(getJoinRequests);
router.route('/requests/:id')
  .put(updateJoinRequest);

export default router;
