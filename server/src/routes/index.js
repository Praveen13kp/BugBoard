import { Router } from 'express';
import authRoutes from './authRoutes.js';
import dashboardRoutes from './dashboardRoutes.js';
import healthRoutes from './healthRoutes.js';
import issueRoutes from './issueRoutes.js';
import projectRoutes from './projectRoutes.js';

const router = Router();
router.use(healthRoutes);
router.use('/auth', authRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/projects', projectRoutes);
router.use('/issues', issueRoutes);
export default router;
