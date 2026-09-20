import asyncHandler from '../utils/asyncHandler.js';
import { serializeAttachment } from '../utils/serializers.js';
import * as attachmentService from '../services/attachmentService.js';
import { upload } from '../utils/attachmentStorage.js';

export const uploadAttachment = [
  upload.single('file'),
  asyncHandler(async (request, response) => {
    const attachment = await attachmentService.saveAttachment(request.user, request.params.issueId, request.file);
    response.status(201).json({ success: true, data: { attachment: serializeAttachment(attachment) } });
  }),
];

export const listAttachments = asyncHandler(async (request, response) => {
  const attachments = await attachmentService.listAttachments(request.user, request.params.issueId);
  response.json({ success: true, data: { attachments: attachments.map(serializeAttachment) } });
});

export const getAttachment = asyncHandler(async (request, response) => {
  const attachments = await attachmentService.listAttachments(request.user, request.params.issueId);
  const attachment = attachments.find((item) => String(item.id) === String(request.params.attachmentId));
  if (!attachment) {
    response.status(404).json({
      success: false,
      error: { code: 'ATTACHMENT_NOT_FOUND', message: 'The attachment was not found.' },
    });
    return;
  }
  response.json({ success: true, data: { attachment: serializeAttachment(attachment) } });
});

export const downloadAttachment = asyncHandler(async (request, response) => {
  await attachmentService.streamAttachment(
    request.user,
    request.params.issueId,
    request.params.attachmentId,
    response,
  );
});

export const removeAttachment = asyncHandler(async (request, response) => {
  const attachment = await attachmentService.removeAttachment(
    request.user,
    request.params.issueId,
    request.params.attachmentId,
  );
  response.json({ success: true, data: { attachment: serializeAttachment(attachment) } });
});