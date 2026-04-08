import express from 'express';
import { updateProfile, getMyCompany, requestToJoinCompany } from '../controllers/profileController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.put('/', updateProfile);
router.get('/my-company', getMyCompany);
router.post('/my-company/request', requestToJoinCompany);

export default router;
