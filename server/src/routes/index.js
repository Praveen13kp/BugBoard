import { Router } from 'express';
import authRoutes from './authRoutes.js';
import healthRoutes from './healthRoutes.js';

const router = Router();
router.use(healthRoutes);
router.use('/auth', authRoutes);
export default router;
