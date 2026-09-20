import asyncHandler from '../utils/asyncHandler.js';
import { serializeIssue } from '../utils/serializers.js';
import * as issueService from '../services/issueService.js';
import {
  parseIssueFilters,
  parseIssueListQuery,
  validateAssigneeChange,
  validateCreateIssue,
  validateStatusChange,
  validateUpdateIssue,
} from '../validators/issueValidator.js';

export const listIssues = asyncHandler(async (request, response) => {
  const filters = parseIssueFilters(request.query);
  const list = parseIssueListQuery(request.query);
  const { issues, pagination } = await issueService.listIssues(request.user, filters, list);
  response.json({ success: true, data: { issues: issues.map(serializeIssue), pagination } });
});

export const getIssue = asyncHandler(async (request, response) => {
  const issue = await issueService.getIssueForUser(request.user, request.params.issueId);
  response.json({ success: true, data: { issue: serializeIssue(issue) } });
});

export const createIssue = asyncHandler(async (request, response) => {
  const input = validateCreateIssue(request.body);
  const issue = await issueService.createIssue(request.user, input);
  response.status(201).json({ success: true, data: { issue: serializeIssue(issue) } });
});

export const updateIssue = asyncHandler(async (request, response) => {
  if (request.body.status !== undefined || request.body.assignee !== undefined) {
    response
      .status(422)
      .json({
        success: false,
        error: {
          code: 'USE_DEDICATED_ENDPOINT',
          message: 'Use PATCH /api/issues/:issueId/status or /assignee to change workflow fields.',
        },
      });
    return;
  }

  const updates = validateUpdateIssue(request.body);
  const issue = await issueService.updateIssue(request.user, request.params.issueId, updates);
  response.json({ success: true, data: { issue: serializeIssue(issue) } });
});

export const changeStatus = asyncHandler(async (request, response) => {
  const status = validateStatusChange(request.body);
  const issue = await issueService.changeIssueStatus(request.user, request.params.issueId, status);
  response.json({ success: true, data: { issue: serializeIssue(issue) } });
});

export const changeAssignee = asyncHandler(async (request, response) => {
  const assigneeId = validateAssigneeChange(request.body);
  const issue = await issueService.changeIssueAssignee(request.user, request.params.issueId, assigneeId);
  response.json({ success: true, data: { issue: serializeIssue(issue) } });
});