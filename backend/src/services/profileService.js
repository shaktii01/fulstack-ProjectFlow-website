import User from '../models/User.js';
import JoinRequest from '../models/JoinRequest.js';
import { throwAppError } from '../utils/appError.js';

export const updateUserProfile = async (userId, payload) => {
  const user = await User.findById(userId);
  if (!user) {
    throwAppError('User not found', 404);
  }

  if (payload.fullName) user.fullName = payload.fullName;
  if (payload.phone) user.phone = payload.phone;
  if (payload.profileImage) user.profileImage = payload.profileImage;

  if (payload.email && payload.email !== user.email) {
    const exists = await User.findOne({ email: payload.email });
    if (exists) {
      throwAppError('Email is already in use', 400);
    }
    user.email = payload.email;
  }

  if (payload.password) {
    user.password = payload.password;
  }

  if (payload.bio !== undefined) user.bio = payload.bio;
  if (payload.address !== undefined) user.address = payload.address;
  if (user.role === 'company' && payload.companyName) {
    user.companyName = payload.companyName;
  }

  return user.save();
};

export const getMyCompanyDetails = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throwAppError('User not found', 404);
  }

  if (user.companyId) {
    const company = await User.findById(user.companyId).select('fullName companyName email phone bio address profileImage createdAt');
    const acceptedRequest = await JoinRequest.findOne({
      employeeId: user._id,
      companyId: user.companyId,
      status: 'accepted',
    })
      .sort({ updatedAt: -1 })
      .select('updatedAt');

    if (company) {
      return {
        status: 'accepted',
        company,
        employee: {
          _id: user._id,
          fullName: user.fullName,
          email: user.email,
          phone: user.phone,
          profileImage: user.profileImage,
          department: user.department,
          designation: user.designation,
          address: user.address,
          bio: user.bio,
          isActive: user.isActive,
          joinedAt: acceptedRequest?.updatedAt || user.updatedAt || user.createdAt,
        },
      };
    }
  }

  const pendingRequest = await JoinRequest.findOne({ employeeId: user._id, status: 'pending' })
    .populate('companyId', 'companyName fullName');
  if (pendingRequest) {
    return { status: 'pending', companyName: pendingRequest.companyId?.companyName };
  }

  const rejectedRequest = await JoinRequest.findOne({ employeeId: user._id, status: 'rejected' })
    .populate('companyId', 'companyName fullName')
    .sort({ updatedAt: -1 });
  if (rejectedRequest) {
    return { status: 'rejected', companyName: rejectedRequest.companyId?.companyName };
  }

  return { status: 'none' };
};

export const createJoinCompanyRequest = async (userId, invitationCode) => {
  const user = await User.findById(userId);
  if (!user) {
    throwAppError('User not found', 404);
  }

  if (user.companyId) {
    throwAppError('You are already assigned to a company', 400);
  }

  const company = await User.findOne({ role: 'company', invitationCode });
  if (!company) {
    throwAppError('Invalid invitation code', 400);
  }

  const existingPendingRequest = await JoinRequest.findOne({
    employeeId: user._id,
    status: 'pending',
  }).populate('companyId', 'companyName');

  if (existingPendingRequest) {
    if (existingPendingRequest.companyId?._id?.toString() === company._id.toString()) {
      throwAppError(`Your request to join ${company.companyName} is already pending`, 400);
    }

    throwAppError(
      `You already have a pending request for ${existingPendingRequest.companyId?.companyName || 'another company'}`,
      400
    );
  }

  const joinRequest = await JoinRequest.create({
    employeeId: user._id,
    companyId: company._id,
    status: 'pending',
  });

  return {
    message: `Join request sent to ${company.companyName}`,
    joinRequest,
  };
};
