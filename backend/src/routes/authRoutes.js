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
  getCsrfToken,
} from '../controllers/authController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { createRateLimiter } from '../middlewares/rateLimitMiddleware.js';

const router = express.Router();

const authLimiter = createRateLimiter({
  maxRequests: 20,
  windowMs: 15 * 60 * 1000,
  message: 'Too many authentication attempts. Please try again later.',
});

const passwordResetLimiter = createRateLimiter({
  maxRequests: 10,
  windowMs: 15 * 60 * 1000,
  message: 'Too many password reset attempts. Please wait and retry.',
});

const csrfTokenLimiter = createRateLimiter({
  maxRequests: 120,
  windowMs: 15 * 60 * 1000,
  message: 'Too many CSRF token requests. Please slow down.',
});

router.get('/csrf-token', csrfTokenLimiter, getCsrfToken);
router.post('/register/company', authLimiter, registerCompany);
router.post('/register/employee', authLimiter, registerEmployee);
router.post('/login', authLimiter, loginUser);
router.post('/logout', logoutUser);
router.post('/forgot-password', passwordResetLimiter, forgotPassword);
router.put('/reset-password/:token', passwordResetLimiter, resetPassword);
router.get('/session', getAuthSession);
router.get('/profile', protect, getUserProfile);

export default router;
