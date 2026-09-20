import fs from 'node:fs';
import { isValidObjectId } from 'mongoose';
import Attachment from '../models/Attachment.js';
import AppError from '../utils/AppError.js';
import { getIssueForUser } from './issueService.js';
import { recordActivity } from './activityService.js';
import { canManageProjects, canUpdateIssue } from '../utils/permissions.js';
import {
  filePathFor,
  isImage,
  removeStoredFile,
  safeOriginalName,
  MAX_ATTACHMENT_BYTES,
} from '../utils/attachmentStorage.js';

async function loadAttachmentForIssue(issueId, attachmentId) {
  if (!isValidObjectId(attachmentId)) {
    throw new AppError('The attachment was not found.', 404, 'ATTACHMENT_NOT_FOUND');
  }
  const attachment = await Attachment.findOne({ _id: attachmentId, issue: issueId }).populate(
    'uploader',
    'name email role',
  );
  if (!attachment) {
    throw new AppError('The attachment was not found.', 404, 'ATTACHMENT_NOT_FOUND');
  }
  return attachment;
}

export async function listAttachments(user, issueId) {
  await getIssueForUser(user, issueId);
  return Attachment.find({ issue: issueId }).sort({ createdAt: -1 }).populate('uploader', 'name email role');
}

export async function saveAttachment(user, issueId, file) {
  const issue = await getIssueForUser(user, issueId);

  if (!canUpdateIssue(user, issue)) {
    throw new AppError('You do not have permission to attach files to this issue.', 403, 'FORBIDDEN');
  }

  if (!file) {
    throw new AppError('A file is required.', 422, 'FILE_REQUIRED');
  }

  if (file.size > MAX_ATTACHMENT_BYTES) {
    removeStoredFile(file.filename);
    throw new AppError('The file is larger than the 5 MB limit.', 413, 'FILE_TOO_LARGE');
  }

  const attachment = await Attachment.create({
    issue: issue.id,
    uploader: user.id,
    originalName: safeOriginalName(file.originalname),
    storedName: file.filename,
    mimeType: file.mimetype,
    size: file.size,
  });

  await recordActivity(issue.id, user.id, 'updated', {
    field: 'attachment',
    oldValue: null,
    newValue: `added "${attachment.originalName}"`,
  });

  await attachment.populate('uploader', 'name email role');
  return attachment;
}

export async function removeAttachment(user, issueId, attachmentId) {
  const issue = await getIssueForUser(user, issueId);
  const attachment = await loadAttachmentForIssue(issue.id, attachmentId);

  const uploaderId = String(attachment.uploader?._id ?? attachment.uploader ?? '');
  const reporterId = String(issue.reporter?._id ?? issue.reporter ?? '');

  const canRemove =
    canManageProjects(user.role) || uploaderId === String(user.id) || reporterId === String(user.id);

  if (!canRemove) {
    throw new AppError('You do not have permission to remove this attachment.', 403, 'FORBIDDEN');
  }

  removeStoredFile(attachment.storedName);
  await attachment.deleteOne();

  await recordActivity(issue.id, user.id, 'updated', {
    field: 'attachment',
    oldValue: `removed "${attachment.originalName}"`,
    newValue: null,
  });

  return attachment;
}

export async function streamAttachment(user, issueId, attachmentId, response) {
  const issue = await getIssueForUser(user, issueId);
  const attachment = await loadAttachmentForIssue(issue.id, attachmentId);

  const fullPath = filePathFor(attachment.storedName);
  if (!fs.existsSync(fullPath)) {
    throw new AppError('The stored file is missing.', 404, 'FILE_MISSING');
  }

  const inline = isImage(attachment.mimeType);
  response.setHeader('Content-Type', attachment.mimeType || 'application/octet-stream');
  response.setHeader('Content-Length', attachment.size);
  response.setHeader(
    'Content-Disposition',
    `${inline ? 'inline' : 'attachment'}; filename*=UTF-8''${encodeURIComponent(attachment.originalName)}`,
  );
  response.setHeader('X-Content-Type-Options', 'nosniff');
  response.setHeader('Cache-Control', 'private, max-age=0, must-revalidate');

  const data = await fs.promises.readFile(fullPath);
  response.end(data);
}