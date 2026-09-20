import { Router } from 'express';
import authenticate from '../middleware/authenticate.js';
import * as activityController from '../controllers/activityController.js';
import * as attachmentController from '../controllers/attachmentController.js';
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

router.get('/:issueId/attachments', attachmentController.listAttachments);
router.post('/:issueId/attachments', attachmentController.uploadAttachment);
router.get('/:issueId/attachments/:attachmentId', attachmentController.getAttachment);
router.get('/:issueId/attachments/:attachmentId/file', attachmentController.downloadAttachment);
router.delete('/:issueId/attachments/:attachmentId', attachmentController.removeAttachment);

export default router;