import { throwAppError } from '../utils/appError.js';

export const validateCompanyRegistrationPayload = (payload) => {
  const requiredFields = ['fullName', 'email', 'password', 'companyName'];
  const missingField = requiredFields.find((field) => !payload?.[field]);

  if (missingField) {
    throwAppError(`${missingField} is required`, 400);
  }
};

export const validateEmployeeRegistrationPayload = (payload) => {
  const requiredFields = ['fullName', 'email', 'password', 'invitationCode'];
  const missingField = requiredFields.find((field) => !payload?.[field]);

  if (missingField) {
    throwAppError(`${missingField} is required`, 400);
  }
};

export const validateLoginPayload = (payload) => {
  if (!payload?.email || !payload?.password) {
    throwAppError('Email and password are required', 400);
  }
};

export const validateForgotPasswordPayload = (payload) => {
  const email = payload?.email?.trim().toLowerCase();
  if (!email) {
    throwAppError('Email is required', 400);
  }

  return email;
};

export const validateResetPasswordPayload = (payload) => {
  if (!payload?.password) {
    throwAppError('Password is required', 400);
  }
};
