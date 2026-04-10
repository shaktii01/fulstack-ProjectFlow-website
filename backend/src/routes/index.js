import authRoutes from './authRoutes.js';
import companyRoutes from './companyRoutes.js';
import projectRoutes from './projectRoutes.js';
import taskRoutes from './taskRoutes.js';
import commentRoutes from './commentRoutes.js';
import profileRoutes from './profileRoutes.js';
import uploadRoutes from './uploadRoutes.js';

const registerRoutes = (app) => {
  app.use('/api/auth', authRoutes);
  app.use('/api/company', companyRoutes);
  app.use('/api/projects', projectRoutes);
  app.use('/api/tasks', taskRoutes);
  app.use('/api/comments', commentRoutes);
  app.use('/api/profile', profileRoutes);
  app.use('/api/upload', uploadRoutes);
};

export default registerRoutes;
