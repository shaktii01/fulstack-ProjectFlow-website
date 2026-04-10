import User from '../models/User.js';
import JoinRequest from '../models/JoinRequest.js';
import Project from '../models/Project.js';
import Task from '../models/Task.js';
import Notification from '../models/Notification.js';
import { throwAppError } from '../utils/appError.js';

export const getCompanyDashboardStats = async (companyId) => {
  const employeeCount = await User.countDocuments({ companyId, role: 'employee' });
  const projectCount = await Project.countDocuments({ company: companyId, isActive: true });
  const pendingRequests = await JoinRequest.countDocuments({ companyId, status: 'pending' });

  const companyProjects = await Project.find({ company: companyId, isActive: true }).select('_id');
  const projectIds = companyProjects.map((project) => project._id);

  const totalTasks = await Task.countDocuments({ project: { $in: projectIds }, isDeleted: false });
  const completedTasks = await Task.countDocuments({ project: { $in: projectIds }, isDeleted: false, status: 'done' });
  const inProgressTasks = await Task.countDocuments({ project: { $in: projectIds }, isDeleted: false, status: 'in_progress' });
  const overdueTasks = await Task.countDocuments({
    project: { $in: projectIds },
    isDeleted: false,
    status: { $ne: 'done' },
    dueDate: { $lt: new Date() },
  });

  const recentTasks = await Task.find({ project: { $in: projectIds }, isDeleted: false })
    .populate('assignedTo', 'fullName')
    .populate('project', 'name code')
    .sort({ createdAt: -1 })
    .limit(5);

  const recentEmployees = await User.find({ companyId, role: 'employee' })
    .select('fullName email department designation profileImage createdAt')
    .sort({ createdAt: -1 })
    .limit(5);

  return {
    employeeCount,
    projectCount,
    pendingRequests,
    totalTasks,
    completedTasks,
    inProgressTasks,
    overdueTasks,
    recentTasks,
    recentEmployees,
  };
};

export const getCompanyEmployees = async (companyId) => {
  return User.find({ companyId, role: 'employee' }).select('-password');
};

export const updateCompanyEmployeeById = async (companyId, employeeId, payload) => {
  const employee = await User.findOne({ _id: employeeId, companyId });

  if (!employee) {
    throwAppError('Employee not found or does not belong to this company', 404);
  }

  const { department, designation, address, bio, isActive } = payload;
  employee.department = department || employee.department;
  employee.designation = designation || employee.designation;
  employee.address = address || employee.address;
  employee.bio = bio || employee.bio;
  if (isActive !== undefined) {
    employee.isActive = isActive;
  }

  if (payload.fullName) employee.fullName = payload.fullName;
  if (payload.phone) employee.phone = payload.phone;

  return employee.save();
};

export const removeEmployeeFromCompany = async (companyId, employeeId) => {
  const employee = await User.findOne({ _id: employeeId, companyId });
  if (!employee) {
    throwAppError('Employee not found or does not belong to this company', 404);
  }

  employee.companyId = undefined;
  employee.department = undefined;
  employee.designation = undefined;
  employee.isActive = false;
  await employee.save();

  await Project.updateMany(
    { company: companyId },
    { $pull: { members: employee._id } }
  );
};

export const getCompanyActionableRequests = async (companyId) => {
  const requests = await JoinRequest.find({
    companyId,
    status: { $in: ['pending', 'accepted'] },
  })
    .populate('employeeId', 'fullName email phone profileImage createdAt companyId')
    .sort({ createdAt: -1 });

  return requests.filter((request) => {
    if (!request.employeeId) return false;
    if (request.status === 'pending') return true;
    return request.employeeId.companyId?.toString() !== companyId.toString();
  });
};

export const updateCompanyJoinRequestStatus = async (company, requestId, status) => {
  const joinRequest = await JoinRequest.findOne({
    _id: requestId,
    companyId: company._id,
  });

  if (!joinRequest) {
    throwAppError('Join request not found', 404);
  }

  if (status === 'accepted') {
    const employee = await User.findById(joinRequest.employeeId);
    if (!employee) {
      throwAppError('Employee not found', 404);
    }

    if (employee.companyId && employee.companyId.toString() !== company._id.toString()) {
      throwAppError('Employee already belongs to another company', 400);
    }

    const shouldNotify =
      joinRequest.status !== 'accepted' ||
      employee.companyId?.toString() !== company._id.toString();

    employee.companyId = company._id;
    employee.isActive = true;
    await employee.save();

    joinRequest.status = status;
    await joinRequest.save();

    if (shouldNotify) {
      await Notification.create({
        recipient: employee._id,
        type: 'join_request_accepted',
        message: `Your request to join ${company.companyName} has been accepted.`,
        referenceId: joinRequest._id,
        referenceModel: 'JoinRequest',
      });
    }

    return joinRequest;
  }

  if (joinRequest.status === 'accepted') {
    const employee = await User.findById(joinRequest.employeeId).select('companyId');
    if (employee?.companyId?.toString() === company._id.toString()) {
      throwAppError('Accepted join requests cannot be rejected after activation', 400);
    }
  }

  joinRequest.status = status;
  await joinRequest.save();
  return joinRequest;
};
