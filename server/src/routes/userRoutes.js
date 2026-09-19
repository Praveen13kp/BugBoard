import { Router } from 'express';
import authenticate from '../middleware/authenticate.js';
import requireRole from '../middleware/requireRole.js';
import * as userController from '../controllers/userController.js';

const router = Router();
router.get('/', authenticate, requireRole('ADMIN'), userController.listUsers);

export default router;