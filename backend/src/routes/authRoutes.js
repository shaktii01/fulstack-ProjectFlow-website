import express from 'express';
import {
  registerCompany,
  registerEmployee,
  loginUser,
  logoutUser,
  getUserProfile,
  getAuthSession,
  forgotPassword,
  resetPassword,
} from '../controllers/authController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/register/company', registerCompany);
router.post('/register/employee', registerEmployee);
router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:token', resetPassword);
router.get('/session', getAuthSession);
router.get('/profile', protect, getUserProfile);

export default router;
