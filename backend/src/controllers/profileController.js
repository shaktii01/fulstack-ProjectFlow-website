import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import JoinRequest from '../models/JoinRequest.js';

// @desc    Update user profile (self)
// @route   PUT /api/profile
// @access  Private
const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  if (req.body.fullName) user.fullName = req.body.fullName;
  if (req.body.phone) user.phone = req.body.phone;
  if (req.body.profileImage) user.profileImage = req.body.profileImage;
  
  if (req.body.email && req.body.email !== user.email) {
    const exists = await User.findOne({ email: req.body.email });
    if (exists) {
      res.status(400);
      throw new Error('Email is already in use');
    }
    user.email = req.body.email;
  }

  if (req.body.password) {
    user.password = req.body.password;
  }

  if (req.body.bio !== undefined) user.bio = req.body.bio;
  if (req.body.address !== undefined) user.address = req.body.address;

  // Company-specific fields
  if (user.role === 'company') {
    if (req.body.companyName) user.companyName = req.body.companyName;
  }

  const updatedUser = await user.save();

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

// @desc    Get employee's company info
// @route   GET /api/profile/my-company
// @access  Private/Employee
const getMyCompany = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
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
      return res.json({
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
      });
    }
  }

  const pendingRequest = await JoinRequest.findOne({ employeeId: user._id, status: 'pending' })
    .populate('companyId', 'companyName fullName');

  if (pendingRequest) {
    return res.json({ status: 'pending', companyName: pendingRequest.companyId?.companyName });
  }

  const rejectedRequest = await JoinRequest.findOne({ employeeId: user._id, status: 'rejected' })
    .populate('companyId', 'companyName fullName')
    .sort({ updatedAt: -1 });

  if (rejectedRequest) {
    return res.json({ status: 'rejected', companyName: rejectedRequest.companyId?.companyName });
  }

  res.json({ status: 'none' });
});

// @desc    Submit a company join request using invitation code
// @route   POST /api/profile/my-company/request
// @access  Private/Employee
const requestToJoinCompany = asyncHandler(async (req, res) => {
  if (req.user.role !== 'employee') {
    res.status(403);
    throw new Error('Only employees can send company join requests');
  }

  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  if (user.companyId) {
    res.status(400);
    throw new Error('You are already assigned to a company');
  }

  const invitationCode = req.body.invitationCode?.trim().toUpperCase();

  if (!invitationCode) {
    res.status(400);
    throw new Error('Company invitation code is required');
  }

  const company = await User.findOne({ role: 'company', invitationCode });

  if (!company) {
    res.status(400);
    throw new Error('Invalid invitation code');
  }

  const existingPendingRequest = await JoinRequest.findOne({
    employeeId: user._id,
    status: 'pending',
  }).populate('companyId', 'companyName');

  if (existingPendingRequest) {
    res.status(400);
    if (existingPendingRequest.companyId?._id?.toString() === company._id.toString()) {
      throw new Error(`Your request to join ${company.companyName} is already pending`);
    }

    throw new Error(
      `You already have a pending request for ${existingPendingRequest.companyId?.companyName || 'another company'}`
    );
  }

  const joinRequest = await JoinRequest.create({
    employeeId: user._id,
    companyId: company._id,
    status: 'pending',
  });

  res.status(201).json({
    message: `Join request sent to ${company.companyName}`,
    joinRequest,
  });
});

export {
  updateProfile,
  getMyCompany,
  requestToJoinCompany,
};
