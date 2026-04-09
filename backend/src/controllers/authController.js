import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import JoinRequest from '../models/JoinRequest.js';
import generateToken from '../utils/generateToken.js';
import { getAuthCookieOptions, getPrimaryFrontendUrl } from '../utils/clientConfig.js';
import sendEmail from '../utils/sendEmail.js';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';

const registerCompany = asyncHandler(async (req, res) => {
  const { fullName, email, password, companyName, phone } = req.body;

  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }

  // Generate unique invitation code
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

  if (user) {
    generateToken(res, user._id);
    res.status(201).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      companyName: user.companyName,
      invitationCode: user.invitationCode,
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});


const registerEmployee = asyncHandler(async (req, res) => {
  const { fullName, email, password, phone, invitationCode } = req.body;

  if (!invitationCode) {
    res.status(400);
    throw new Error('Company invitation code is required');
  }

  const company = await User.findOne({ role: 'company', invitationCode });

  if (!company) {
    res.status(400);
    throw new Error('Invalid invitation code');
  }

  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }

  const user = await User.create({
    fullName,
    email,
    password,
    role: 'employee',
    phone,
  });

  if (user) {
    // Automatically create a join request for the employee to the company
    await JoinRequest.create({
      employeeId: user._id,
      companyId: company._id,
      status: 'pending',
    });

    generateToken(res, user._id);
    res.status(201).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});


const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');

  if (user && (await user.matchPassword(password))) {
    if (!user.isActive) {
      res.status(401);
      throw new Error('Account is inactive. Please contact support.');
    }

    generateToken(res, user._id);

    res.json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      companyId: user.companyId,
    });
  } else {
    res.status(401);
    throw new Error('Invalid email or password');
  }
});


const logoutUser = asyncHandler(async (req, res) => {
  res.cookie('jwt', '', {
    ...getAuthCookieOptions(),
    expires: new Date(0),
    maxAge: 0,
  });
  res.status(200).json({ message: 'Logged out successfully' });
});


const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate('companyId', 'companyName');
  if (user) {
    res.json(user);
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

 
const getAuthSession = asyncHandler(async (req, res) => {
  const token = req.cookies.jwt;

  if (!token) {
    return res.json({ user: null });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId)
      .select('-password')
      .populate('companyId', 'companyName');

    if (!user || !user.isActive) {
      return res.json({ user: null });
    }

    return res.json({ user });
  } catch (error) {
    return res.json({ user: null });
  }
});


const forgotPassword = asyncHandler(async (req, res) => {
  const email = req.body.email?.trim().toLowerCase();

  if (!email) {
    res.status(400);
    throw new Error('Email is required');
  }

  const user = await User.findOne({ email });

  if (!user) {
    res.status(404);
    throw new Error('There is no user with that email');
  }

  // Get reset token
  const resetToken = user.getResetPasswordToken();

  await user.save({ validateBeforeSave: false });

  // Create reset url
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
      html
    });

    res.status(200).json({ success: true, message: 'Email sent' });
  } catch (err) {
    console.error('Password reset email error:', err.message);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save({ validateBeforeSave: false });

    res.status(500);
    throw new Error(`Email could not be sent: ${err.message}`);
  }
});


const resetPassword = asyncHandler(async (req, res) => {
  // Get hashed token
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    res.status(400);
    throw new Error('Invalid token or token expired');
  }

  // Set new password
  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Password resetting successful. You can log in now.'
  });
});

export {
  registerCompany,
  registerEmployee,
  loginUser,
  logoutUser,
  getUserProfile,
  getAuthSession,
  forgotPassword,
  resetPassword,
};
