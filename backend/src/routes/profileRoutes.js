import express from 'express';
import { updateProfile, getMyCompany } from '../controllers/profileController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.put('/', updateProfile);
router.get('/my-company', getMyCompany);

export default router;
