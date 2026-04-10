import { throwAppError } from '../utils/appError.js';

const VALID_REQUEST_STATUSES = ['accepted', 'rejected'];

export const validateJoinRequestStatus = (status) => {
  if (!VALID_REQUEST_STATUSES.includes(status)) {
    throwAppError('Invalid status', 400);
  }
};
