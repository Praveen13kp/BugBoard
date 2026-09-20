import { isValidObjectId } from 'mongoose';
import Notification from '../models/Notification.js';
import AppError from '../utils/AppError.js';

const POPULATE = { path: 'actor', select: 'name email role' };

function uniqueRecipients(recipients, actorId) {
  const actor = String(actorId ?? '');
  const seen = new Set();
  const result = [];
  for (const recipient of recipients || []) {
    const id = String(recipient ?? '');
    if (!id || id === actor || seen.has(id)) continue;
    seen.add(id);
    result.push(id);
  }
  return result;
}

export async function createIssueNotifications({ recipientIds, actorId, type, issue, message }) {
  const recipients = uniqueRecipients(recipientIds, actorId);
  if (!recipients.length) return [];

  const documents = recipients.map((userId) => ({
    user: userId,
    actor: actorId,
    type,
    issue: issue.id ?? issue._id ?? issue,
    issueTitle: issue.title,
    message,
    read: false,
  }));

  return Notification.insertMany(documents);
}

export async function listNotifications(user, { unreadOnly = false, limit = 30 } = {}) {
  const query = { user: user.id };
  if (unreadOnly) query.read = false;

  const [notifications, unreadCount] = await Promise.all([
    Notification.find(query).sort({ createdAt: -1 }).limit(limit).populate(POPULATE),
    Notification.countDocuments({ user: user.id, read: false }),
  ]);

  return { notifications, unreadCount };
}

export async function getUnreadCount(user) {
  return Notification.countDocuments({ user: user.id, read: false });
}

export async function markNotificationRead(user, notificationId) {
  if (!isValidObjectId(notificationId)) {
    throw new AppError('The notification was not found.', 404, 'NOTIFICATION_NOT_FOUND');
  }

  const notification = await Notification.findOneAndUpdate(
    { _id: notificationId, user: user.id },
    { read: true },
    { new: true },
  ).populate(POPULATE);

  if (!notification) {
    throw new AppError('The notification was not found.', 404, 'NOTIFICATION_NOT_FOUND');
  }

  return notification;
}

export async function markAllNotificationsRead(user) {
  const result = await Notification.updateMany({ user: user.id, read: false }, { read: true });
  return { modified: result.modifiedCount ?? 0 };
}

export async function clearReadNotifications(user) {
  const result = await Notification.deleteMany({ user: user.id, read: true });
  return { deleted: result.deletedCount ?? 0 };
}