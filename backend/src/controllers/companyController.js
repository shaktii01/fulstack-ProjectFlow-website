import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import JoinRequest from '../models/JoinRequest.js';
import Project from '../models/Project.js';
import Task from '../models/Task.js';
import Notification from '../models/Notification.js';

// @desc    Get dashboard stats
// @route   GET /api/company/dashboard
// @access  Private/Company
const getDashboardStats = asyncHandler(async (req, res) => {
  const companyId = req.user._id;

  const employeeCount = await User.countDocuments({ companyId, role: 'employee' });
  const projectCount = await Project.countDocuments({ company: companyId, isActive: true });
  const pendingRequests = await JoinRequest.countDocuments({ companyId, status: 'pending' });
  
  // Task stats
  const companyProjects = await Project.find({ company: companyId, isActive: true }).select('_id');
  const projectIds = companyProjects.map(p => p._id);
  
  const totalTasks = await Task.countDocuments({ project: { $in: projectIds }, isDeleted: false });
  const completedTasks = await Task.countDocuments({ project: { $in: projectIds }, isDeleted: false, status: 'done' });
  const inProgressTasks = await Task.countDocuments({ project: { $in: projectIds }, isDeleted: false, status: 'in_progress' });
  const overdueTasks = await Task.countDocuments({ 
    project: { $in: projectIds }, isDeleted: false, status: { $ne: 'done' },
    dueDate: { $lt: new Date() }
  });

  // Recent tasks
  const recentTasks = await Task.find({ project: { $in: projectIds }, isDeleted: false })
    .populate('assignedTo', 'fullName')
    .populate('project', 'name code')
    .sort({ createdAt: -1 })
    .limit(5);

  // Recent employees
  const recentEmployees = await User.find({ companyId, role: 'employee' })
    .select('fullName email department designation profileImage createdAt')
    .sort({ createdAt: -1 })
    .limit(5);

  res.json({
    employeeCount,
    projectCount,
    pendingRequests,
    totalTasks,
    completedTasks,
    inProgressTasks,
    overdueTasks,
    recentTasks,
    recentEmployees,
  });
});

// @desc    Get all active employees
// @route   GET /api/company/employees
// @access  Private/Company
const getEmployees = asyncHandler(async (req, res) => {
  const companyId = req.user._id;

  const employees = await User.find({ companyId, role: 'employee' }).select('-password');
  res.json(employees);
});

// @desc    Update employee by company
// @route   PUT /api/company/employees/:id
// @access  Private/Company
const updateEmployee = asyncHandler(async (req, res) => {
  const employee = await User.findOne({ _id: req.params.id, companyId: req.user._id });

  if (!employee) {
    res.status(404);
    throw new Error('Employee not found or does not belong to this company');
  }

  const { department, designation, address, bio, accountStatus, isActive } = req.body;

  employee.department = department || employee.department;
  employee.designation = designation || employee.designation;
  employee.address = address || employee.address;
  employee.bio = bio || employee.bio;
  
  if (isActive !== undefined) {
    employee.isActive = isActive;
  }

  // Admin override of basic fields if provided
  if (req.body.fullName) employee.fullName = req.body.fullName;
  if (req.body.phone) employee.phone = req.body.phone;

  const updatedEmployee = await employee.save();
  res.json(updatedEmployee);
});

// @desc    Remove employee from company
// @route   DELETE /api/company/employees/:id
// @access  Private/Company
const removeEmployee = asyncHandler(async (req, res) => {
  const employee = await User.findOne({ _id: req.params.id, companyId: req.user._id });

  if (!employee) {
    res.status(404);
    throw new Error('Employee not found or does not belong to this company');
  }

  // Detach from company
  employee.companyId = undefined;
  employee.department = undefined;
  employee.designation = undefined;
  employee.isActive = false; // deactivate them? or just detach. Let's deactivate as per best practice
  await employee.save();

  // Remove from all projects within the company
  await Project.updateMany(
    { company: req.user._id },
    { $pull: { members: employee._id } }
  );

  res.json({ message: 'Employee removed successfully' });
});

// --- JOIN REQUESTS MANAGEMENT ---

// @desc    Get all pending join requests
// @route   GET /api/company/requests
// @access  Private/Company
const getJoinRequests = asyncHandler(async (req, res) => {
  const requests = await JoinRequest.find({
    companyId: req.user._id,
    status: { $in: ['pending', 'accepted'] },
  })
    .populate('employeeId', 'fullName email phone profileImage createdAt companyId')
    .sort({ createdAt: -1 });

  const actionableRequests = requests.filter((request) => {
    if (!request.employeeId) {
      return false;
    }

    if (request.status === 'pending') {
      return true;
    }

    return request.employeeId.companyId?.toString() !== req.user._id.toString();
  });

  res.json(actionableRequests);
});

// @desc    Accept or Reject join request
// @route   PUT /api/company/requests/:id
// @access  Private/Company
const updateJoinRequest = asyncHandler(async (req, res) => {
  const { status } = req.body; // 'accepted' or 'rejected'

  if (!['accepted', 'rejected'].includes(status)) {
    res.status(400);
    throw new Error('Invalid status');
  }

  const joinRequest = await JoinRequest.findOne({
    _id: req.params.id,
    companyId: req.user._id,
  });

  if (!joinRequest) {
    res.status(404);
    throw new Error('Join request not found');
  }

  if (status === 'accepted') {
    // Link employee to company
    const employee = await User.findById(joinRequest.employeeId);
    if (!employee) {
      res.status(404);
      throw new Error('Employee not found');
    }

    if (
      employee.companyId &&
      employee.companyId.toString() !== req.user._id.toString()
    ) {
      res.status(400);
      throw new Error('Employee already belongs to another company');
    }

    const shouldNotify =
      joinRequest.status !== 'accepted' ||
      employee.companyId?.toString() !== req.user._id.toString();

    employee.companyId = req.user._id;
    employee.isActive = true;
    await employee.save();

    joinRequest.status = status;
    await joinRequest.save();

    if (shouldNotify) {
      await Notification.create({
        recipient: employee._id,
        type: 'join_request_accepted',
        message: `Your request to join ${req.user.companyName} has been accepted.`,
        referenceId: joinRequest._id,
        referenceModel: 'JoinRequest'
      });
    }
  } else {
    if (joinRequest.status === 'accepted') {
      const employee = await User.findById(joinRequest.employeeId).select('companyId');
      if (employee?.companyId?.toString() === req.user._id.toString()) {
        res.status(400);
        throw new Error('Accepted join requests cannot be rejected after activation');
      }
    }

    joinRequest.status = status;
    await joinRequest.save();
  }

  res.json(joinRequest);
});

export {
  getDashboardStats,
  getEmployees,
  updateEmployee,
  removeEmployee,
  getJoinRequests,
  updateJoinRequest
};
