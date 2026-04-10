import { throwAppError } from '../utils/appError.js';

export const validateInvitationCode = (invitationCode) => {
  const normalizedCode = invitationCode?.trim().toUpperCase();

  if (!normalizedCode) {
    throwAppError('Company invitation code is required', 400);
  }

  return normalizedCode;
};
