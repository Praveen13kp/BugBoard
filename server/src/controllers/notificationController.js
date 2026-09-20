import asyncHandler from '../utils/asyncHandler.js';
import { serializeNotification } from '../utils/serializers.js';
import * as notificationService from '../services/notificationService.js';

function parseLimit(query) {
  if (query.limit === undefined) return 30;
  const limit = Number(query.limit);
  if (!Number.isInteger(limit) || limit < 1 || limit > 100) return 30;
  return limit;
}

export const listNotifications = asyncHandler(async (request, response) => {
  const { notifications, unreadCount } = await notificationService.listNotifications(request.user, {
    unreadOnly: request.query.unread === 'true',
    limit: parseLimit(request.query),
  });
  response.json({
    success: true,
    data: { notifications: notifications.map(serializeNotification), unreadCount },
  });
});

export const getUnreadCount = asyncHandler(async (request, response) => {
  const unreadCount = await notificationService.getUnreadCount(request.user);
  response.json({ success: true, data: { unreadCount } });
});

export const markRead = asyncHandler(async (request, response) => {
  const notification = await notificationService.markNotificationRead(request.user, request.params.notificationId);
  response.json({ success: true, data: { notification: serializeNotification(notification) } });
});

export const markAllRead = asyncHandler(async (request, response) => {
  const result = await notificationService.markAllNotificationsRead(request.user);
  response.json({ success: true, data: result });
});

export const clearRead = asyncHandler(async (request, response) => {
  const result = await notificationService.clearReadNotifications(request.user);
  response.json({ success: true, data: result });
});