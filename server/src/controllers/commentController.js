import asyncHandler from '../utils/asyncHandler.js';
import { serializeComment } from '../utils/serializers.js';
import * as commentService from '../services/commentService.js';
import { validateComment } from '../validators/commentValidator.js';

export const listComments = asyncHandler(async (request, response) => {
  const comments = await commentService.listComments(request.user, request.params.issueId);
  response.json({ success: true, data: { comments: comments.map(serializeComment) } });
});

export const addComment = asyncHandler(async (request, response) => {
  const content = validateComment(request.body);
  const comment = await commentService.createComment(request.user, request.params.issueId, content);
  response.status(201).json({ success: true, data: { comment: serializeComment(comment) } });
});