import { Router } from 'express';
import authenticate from '../middleware/authenticate.js';
import * as dashboardController from '../controllers/dashboardController.js';

const router = Router();
router.get('/', authenticate, dashboardController.getStats);

export default router;