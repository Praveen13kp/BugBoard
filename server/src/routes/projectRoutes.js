import { Router } from 'express';
import authenticate from '../middleware/authenticate.js';
import requireRole from '../middleware/requireRole.js';
import * as projectController from '../controllers/projectController.js';

const router = Router();
router.use(authenticate);

router.get('/', projectController.listProjects);
router.post('/', requireRole('ADMIN'), projectController.createProject);
router.get('/:projectId', projectController.getProject);
router.patch('/:projectId', requireRole('ADMIN'), projectController.updateProject);
router.post('/:projectId/members', requireRole('ADMIN'), projectController.addMembers);
router.delete('/:projectId/members/:userId', requireRole('ADMIN'), projectController.removeMember);

export default router;