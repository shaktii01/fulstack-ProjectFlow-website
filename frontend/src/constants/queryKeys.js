export const QUERY_KEYS = {
  AUTH_SESSION: ['authSession'],
  PROJECTS: ['projects'],
  PROJECT_DETAIL: (projectId) => ['project', projectId],
  TASKS: ['tasks'],
  PROJECT_TASKS: (projectId) => ['tasks', projectId],
  TASK_DETAIL: (taskId) => ['task', taskId],
  MY_TASKS: ['myTasks'],
  COMMENTS: (taskId) => ['comments', taskId],
  COMPANY_STATS: ['companyStats'],
  COMPANY_EMPLOYEES: ['companyEmployees'],
  COMPANY_REQUESTS: ['joinRequests'],
  MY_COMPANY: ['myCompany'],
};
