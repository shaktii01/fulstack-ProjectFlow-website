import Project from '../models/Project.js';
import User from '../models/User.js';
import Task from '../models/Task.js';
import Comment from '../models/Comment.js';
import { throwAppError } from '../utils/appError.js';

const PROJECT_UPDATABLE_FIELDS = new Set([
  'name',
  'code',
  'description',
  'members',
  'startDate',
  'endDate',
  'status',
  'priority',
]);

const ensureValidMembers = async (members, companyId) => {
  if (!members || members.length === 0) return;

  const validMembers = await User.find({
    _id: { $in: members },
    companyId,
    role: 'employee',
  });

  if (validMembers.length !== members.length) {
    throwAppError('Some members do not exist or do not belong to this company', 400);
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

export const createProjectForCompany = async (companyId, payload) => {
  const { name, code, description, startDate, endDate, members } = payload;
  await ensureValidMembers(members, companyId);

  const project = await Project.create({
    name,
    code,
    description,
    startDate,
    endDate,
    members: members || [],
    company: companyId,
    createdBy: companyId,
  });

  return project;
};

export const listProjectsByUserRole = async (user) => {
  let query = {};

  if (user.role === 'company') {
    query = { company: user._id, isActive: true };
  } else if (user.role === 'employee') {
    query = { members: user._id, isActive: true };
  }

  return Project.find(query)
    .populate('members', 'fullName email profileImage')
    .sort({ createdAt: -1 });
};

export const getProjectByUserAccess = async (projectId, user) => {
  const project = await Project.findById(projectId)
    .populate('members', 'fullName email profileImage designation')
    .populate('createdBy', 'fullName');

  if (!project || !project.isActive || project.isArchived) {
    throwAppError('Project not found', 404);
  }

  if (user.role === 'company' && project.company.toString() !== user._id.toString()) {
    throwAppError('Not authorized to access this project', 403);
  }

  if (user.role === 'employee') {
    const isMember = project.members.some((member) => member._id.toString() === user._id.toString());
    if (!isMember) {
      throwAppError('You are not a member of this project', 403);
    }
  }

  return project;
};

export const updateCompanyProject = async (projectId, companyId, payload) => {
  const project = await Project.findById(projectId);

  if (!project || !project.isActive || project.isArchived) {
    throwAppError('Project not found', 404);
  }

  if (project.company.toString() !== companyId.toString()) {
    throwAppError('Not authorized to update this project', 403);
  }

  const updates = pickAllowedFields(payload, PROJECT_UPDATABLE_FIELDS);

  if (Object.keys(updates).length === 0) {
    throwAppError('No valid project fields provided for update', 400);
  }

  if (Object.prototype.hasOwnProperty.call(updates, 'members')) {
    await ensureValidMembers(updates.members, companyId);
  }

  return Project.findByIdAndUpdate(projectId, updates, {
    new: true,
    runValidators: true,
  }).populate('members', 'fullName email profileImage designation');
};

export const archiveCompanyProject = async (projectId, companyId) => {
  const project = await Project.findById(projectId);

  if (!project || !project.isActive || project.isArchived) {
    throwAppError('Project not found', 404);
  }

  if (project.company.toString() !== companyId.toString()) {
    throwAppError('Not authorized to delete this project', 403);
  }

  project.isArchived = true;
  project.isActive = false;
  await project.save();

  await Task.updateMany(
    { project: project._id, isDeleted: false },
    { $set: { isDeleted: true, isActive: false } }
  );

  await Comment.updateMany(
    { project: project._id, isDeleted: false },
    { $set: { isDeleted: true } }
  );
};
