import asyncHandler from 'express-async-handler';
import generateToken from '../utils/generateToken.js';
import { getAuthCookieOptions } from '../utils/clientConfig.js';
import { clearCsrfCookie, issueCsrfToken } from '../utils/csrf.js';
import {
  authenticateUser,
  getSessionUserFromToken,
  getUserProfileById,
  registerCompanyUser,
  registerEmployeeUser,
  requestPasswordReset,
  resetUserPassword,
} from '../services/authService.js';
import {
  validateCompanyRegistrationPayload,
  validateEmployeeRegistrationPayload,
  validateForgotPasswordPayload,
  validateLoginPayload,
  validateResetPasswordPayload,
} from '../validators/authValidators.js';

const registerCompany = asyncHandler(async (req, res) => {
  validateCompanyRegistrationPayload(req.body);

  const user = await registerCompanyUser(req.body);
  generateToken(res, user._id);
  const csrfToken = issueCsrfToken(req, res);

  res.status(201).json({
    _id: user._id,
    fullName: user.fullName,
    email: user.email,
    role: user.role,
    companyName: user.companyName,
    invitationCode: user.invitationCode,
    csrfToken,
  });
});

const registerEmployee = asyncHandler(async (req, res) => {
  validateEmployeeRegistrationPayload(req.body);

  const user = await registerEmployeeUser(req.body);
  generateToken(res, user._id);
  const csrfToken = issueCsrfToken(req, res);

  res.status(201).json({
    _id: user._id,
    fullName: user.fullName,
    email: user.email,
    role: user.role,
    csrfToken,
  });
});

const loginUser = asyncHandler(async (req, res) => {
  validateLoginPayload(req.body);

  const user = await authenticateUser(req.body);
  generateToken(res, user._id);
  const csrfToken = issueCsrfToken(req, res);

  res.json({
    _id: user._id,
    fullName: user.fullName,
    email: user.email,
    role: user.role,
    companyId: user.companyId,
    csrfToken,
  });
});

const logoutUser = asyncHandler(async (req, res) => {
  res.cookie('jwt', '', {
    ...getAuthCookieOptions(),
    expires: new Date(0),
    maxAge: 0,
  });
  clearCsrfCookie(res);

  res.status(200).json({ message: 'Logged out successfully' });
});

const getUserProfile = asyncHandler(async (req, res) => {
  const user = await getUserProfileById(req.user._id);
  res.json(user);
});

const getAuthSession = asyncHandler(async (req, res) => {
  const user = await getSessionUserFromToken(req.cookies.jwt);
  const csrfToken = issueCsrfToken(req, res);
  res.json({ user, csrfToken });
});

const getCsrfToken = asyncHandler(async (req, res) => {
  const csrfToken = issueCsrfToken(req, res);
  res.json({ csrfToken });
});

const forgotPassword = asyncHandler(async (req, res) => {
  const email = validateForgotPasswordPayload(req.body);
  await requestPasswordReset(email);
  res.status(200).json({
    success: true,
    message: 'If an account exists for this email, a password reset link has been sent.',
  });
});

const resetPassword = asyncHandler(async (req, res) => {
  validateResetPasswordPayload(req.body);
  await resetUserPassword(req.params.token, req.body.password);

  res.status(200).json({
    success: true,
    message: 'Password resetting successful. You can log in now.',
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
  getCsrfToken,
};
