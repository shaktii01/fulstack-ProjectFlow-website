import { throwAppError } from '../utils/appError.js';

const TASK_TYPE_ALIASES = {
  improvement: 'enhancement',
};

export const normalizeTaskType = (taskType) => {
  if (!taskType) return taskType;
  return TASK_TYPE_ALIASES[taskType] || taskType;
};

export const validateTaskCreatePayload = (payload) => {
  if (!payload?.project || !payload?.title) {
    throwAppError('Project and task title are required', 400);
  }
};
