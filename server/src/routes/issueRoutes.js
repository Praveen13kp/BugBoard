import { Router } from 'express';
import authenticate from '../middleware/authenticate.js';
import * as issueController from '../controllers/issueController.js';

const router = Router();
router.use(authenticate);

router.get('/', issueController.listIssues);
router.post('/', issueController.createIssue);
router.get('/:issueId', issueController.getIssue);
router.patch('/:issueId', issueController.updateIssue);
router.patch('/:issueId/status', issueController.changeStatus);
router.patch('/:issueId/assignee', issueController.changeAssignee);

export default router;