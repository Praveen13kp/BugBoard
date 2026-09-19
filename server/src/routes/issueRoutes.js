import { Router } from 'express';
import authenticate from '../middleware/authenticate.js';
import * as activityController from '../controllers/activityController.js';
import * as commentController from '../controllers/commentController.js';
import * as issueController from '../controllers/issueController.js';

const router = Router();
router.use(authenticate);

router.get('/', issueController.listIssues);
router.post('/', issueController.createIssue);
router.get('/:issueId', issueController.getIssue);
router.patch('/:issueId', issueController.updateIssue);
router.patch('/:issueId/status', issueController.changeStatus);
router.patch('/:issueId/assignee', issueController.changeAssignee);
router.get('/:issueId/comments', commentController.listComments);
router.post('/:issueId/comments', commentController.addComment);
router.get('/:issueId/activity', activityController.getActivity);

export default router;