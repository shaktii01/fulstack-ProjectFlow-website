import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import JoinRequest from '../models/JoinRequest.js';
import sendEmail from '../utils/sendEmail.js';
import { getPrimaryFrontendUrl } from '../utils/clientConfig.js';
import { throwAppError } from '../utils/appError.js';

export const registerCompanyUser = async ({ fullName, email, password, companyName, phone }) => {
  const userExists = await User.findOne({ email });
  if (userExists) {
    throwAppError('User already exists', 400);
  }

  const invitationCode = crypto.randomBytes(4).toString('hex').toUpperCase();

  const user = await User.create({
    fullName,
    email,
    password,
    role: 'company',
    companyName,
    invitationCode,
    phone,
  });

  return user;
};

export const registerEmployeeUser = async ({ fullName, email, password, phone, invitationCode }) => {
  const company = await User.findOne({ role: 'company', invitationCode });
  if (!company) {
    throwAppError('Invalid invitation code', 400);
  }

  const userExists = await User.findOne({ email });
  if (userExists) {
    throwAppError('User already exists', 400);
  }

  const user = await User.create({
    fullName,
    email,
    password,
    role: 'employee',
    phone,
  });

  await JoinRequest.create({
    employeeId: user._id,
    companyId: company._id,
    status: 'pending',
  });

  return user;
};

export const authenticateUser = async ({ email, password }) => {
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.matchPassword(password))) {
    throwAppError('Invalid email or password', 401);
  }

  if (!user.isActive) {
    throwAppError('Account is inactive. Please contact support.', 401);
  }

  return user;
};

export const getUserProfileById = async (userId) => {
  const user = await User.findById(userId).populate('companyId', 'companyName');
  if (!user) {
    throwAppError('User not found', 404);
  }
  return user;
};

export const getSessionUserFromToken = async (token) => {
  if (!token) return null;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId)
      .select('-password')
      .populate('companyId', 'companyName');

    if (!user || !user.isActive) return null;
    return user;
  } catch (error) {
    return null;
  }
};

export const requestPasswordReset = async (email) => {
  const user = await User.findOne({ email });
  if (!user) {
    return;
  }

  const resetToken = user.getResetPasswordToken();
  await user.save({ validateBeforeSave: false });

  const frontendUrl = getPrimaryFrontendUrl();
  const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;

  const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please make a PUT request to: \n\n ${resetUrl}`;
  const html = `
    <h3>Password Reset Request</h3>
    <p>You are receiving this email because you (or someone else) has requested the reset of a password.</p>
    <p>Click the link below to reset your password:</p>
    <a href="${resetUrl}" target="_blank">Reset Password</a>
    <br/><br/>
    <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>
  `;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Password Reset Token',
      message,
      html,
    });
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });

    throwAppError('Email could not be sent', 500);
  }
};

export const resetUserPassword = async (token, password) => {
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    throwAppError('Invalid token or token expired', 400);
  }

  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  return user;
};
