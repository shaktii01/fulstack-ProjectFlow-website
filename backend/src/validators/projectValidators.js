import { throwAppError } from '../utils/appError.js';

export const validateProjectCreatePayload = (payload) => {
  if (!payload?.name || !payload?.code) {
    throwAppError('Project name and code are required', 400);
  }
};

export const validateProjectUpdatePayload = (payload) => {
  if (!payload || typeof payload !== 'object') {
    throwAppError('Invalid project payload', 400);
  }
};
