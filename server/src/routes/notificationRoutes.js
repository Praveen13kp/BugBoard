import { Router } from 'express';
import authenticate from '../middleware/authenticate.js';
import * as notificationController from '../controllers/notificationController.js';

const router = Router();
router.use(authenticate);

router.get('/', notificationController.listNotifications);
router.get('/unread-count', notificationController.getUnreadCount);
router.patch('/read-all', notificationController.markAllRead);
router.delete('/read', notificationController.clearRead);
router.patch('/:notificationId/read', notificationController.markRead);

export default router;