import asyncHandler from 'express-async-handler';
import {
  createJoinCompanyRequest,
  getMyCompanyDetails,
  updateUserProfile,
} from '../services/profileService.js';
import { validateInvitationCode } from '../validators/profileValidators.js';
import { throwAppError } from '../utils/appError.js';

const updateProfile = asyncHandler(async (req, res) => {
  const updatedUser = await updateUserProfile(req.user._id, req.body);

  res.json({
    _id: updatedUser._id,
    fullName: updatedUser.fullName,
    email: updatedUser.email,
    phone: updatedUser.phone,
    profileImage: updatedUser.profileImage,
    role: updatedUser.role,
    companyName: updatedUser.companyName,
    bio: updatedUser.bio,
    address: updatedUser.address,
    invitationCode: updatedUser.invitationCode,
  });
});

const getMyCompany = asyncHandler(async (req, res) => {
  const companySnapshot = await getMyCompanyDetails(req.user._id);
  res.json(companySnapshot);
});

const requestToJoinCompany = asyncHandler(async (req, res) => {
  if (req.user.role !== 'employee') {
    throwAppError('Only employees can send company join requests', 403);
  }

  const invitationCode = validateInvitationCode(req.body.invitationCode);
  const response = await createJoinCompanyRequest(req.user._id, invitationCode);
  res.status(201).json(response);
});

export {
  updateProfile,
  getMyCompany,
  requestToJoinCompany,
};
