import AppError from '../utils/AppError.js';
import { ISSUE_PRIORITIES, ISSUE_SEVERITIES, ISSUE_STATUSES } from '../utils/enums.js';
import {
  requireEnum,
  requireObjectId,
  requireOptionalObjectId,
  requireString,
} from '../utils/validation.js';

export function validateCreateIssue(body = {}) {
  return {
    projectId: requireObjectId(body.project, 'Project'),
    title: requireString(body.title, 'Title', { min: 3, max: 200 }),
    description: requireString(body.description, 'Description', { min: 3, max: 10000 }),
    severity: requireEnum(body.severity, 'Severity', ISSUE_SEVERITIES),
    priority: requireEnum(body.priority, 'Priority', ISSUE_PRIORITIES),
    status: body.status === undefined || body.status === null ? 'OPEN' : requireEnum(body.status, 'Status', ISSUE_STATUSES),
    assigneeId: requireOptionalObjectId(body.assignee, 'Assignee'),
  };
}

export function validateUpdateIssue(body = {}) {
  const updates = {};

  if (body.title !== undefined) updates.title = requireString(body.title, 'Title', { min: 3, max: 200 });
  if (body.description !== undefined) {
    updates.description = requireString(body.description, 'Description', { min: 3, max: 10000 });
  }
  if (body.severity !== undefined) updates.severity = requireEnum(body.severity, 'Severity', ISSUE_SEVERITIES);
  if (body.priority !== undefined) updates.priority = requireEnum(body.priority, 'Priority', ISSUE_PRIORITIES);

  if (Object.keys(updates).length === 0) {
    throw new AppError('Provide at least one field to update.', 422, 'VALIDATION_ERROR');
  }

  return updates;
}

export function validateStatusChange(body = {}) {
  return requireEnum(body.status, 'Status', ISSUE_STATUSES);
}

export function validateAssigneeChange(body = {}) {
  return requireOptionalObjectId(body.assignee, 'Assignee');
}

export function parseIssueFilters(query = {}) {
  const filters = {};

  if (typeof query.search === 'string' && query.search.trim()) {
    filters.search = query.search.trim().slice(0, 200);
  }
  if (query.project) filters.projectId = requireObjectId(query.project, 'Project');
  if (query.status) filters.status = requireEnum(query.status, 'Status', ISSUE_STATUSES);
  if (query.priority) filters.priority = requireEnum(query.priority, 'Priority', ISSUE_PRIORITIES);
  if (query.severity) filters.severity = requireEnum(query.severity, 'Severity', ISSUE_SEVERITIES);
  if (query.reporter) filters.reporterId = requireObjectId(query.reporter, 'Reporter');
  if (query.assignee) filters.assigneeId = requireObjectId(query.assignee, 'Assignee');

  return filters;
}