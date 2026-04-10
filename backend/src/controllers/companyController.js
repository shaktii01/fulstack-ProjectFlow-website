import asyncHandler from 'express-async-handler';
import {
  getCompanyActionableRequests,
  getCompanyDashboardStats,
  getCompanyEmployees,
  removeEmployeeFromCompany,
  updateCompanyEmployeeById,
  updateCompanyJoinRequestStatus,
} from '../services/companyService.js';
import { validateJoinRequestStatus } from '../validators/companyValidators.js';

const getDashboardStats = asyncHandler(async (req, res) => {
  const stats = await getCompanyDashboardStats(req.user._id);
  res.json(stats);
});

const getEmployees = asyncHandler(async (req, res) => {
  const employees = await getCompanyEmployees(req.user._id);
  res.json(employees);
});

const updateEmployee = asyncHandler(async (req, res) => {
  const employee = await updateCompanyEmployeeById(req.user._id, req.params.id, req.body);
  res.json(employee);
});

const removeEmployee = asyncHandler(async (req, res) => {
  await removeEmployeeFromCompany(req.user._id, req.params.id);
  res.json({ message: 'Employee removed successfully' });
});

const getJoinRequests = asyncHandler(async (req, res) => {
  const requests = await getCompanyActionableRequests(req.user._id);
  res.json(requests);
});

const updateJoinRequest = asyncHandler(async (req, res) => {
  validateJoinRequestStatus(req.body.status);
  const joinRequest = await updateCompanyJoinRequestStatus(req.user, req.params.id, req.body.status);
  res.json(joinRequest);
});

export {
  getDashboardStats,
  getEmployees,
  updateEmployee,
  removeEmployee,
  getJoinRequests,
  updateJoinRequest,
};
