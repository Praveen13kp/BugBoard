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

export const ISSUE_SORTS = ['newest', 'oldest', 'updated', 'priority', 'severity'];

const MAX_ISSUE_LIMIT = 100;

export function parseIssueListQuery(query = {}) {
  const wantsPagination = query.page !== undefined || query.limit !== undefined;

  let page = 1;
  let limit = wantsPagination ? 20 : null;

  if (query.page !== undefined) {
    page = Number(query.page);
    if (!Number.isInteger(page) || page < 1) {
      throw new AppError('page must be a positive integer.', 422, 'VALIDATION_ERROR');
    }
  }

  if (query.limit !== undefined) {
    limit = Number(query.limit);
    if (!Number.isInteger(limit) || limit < 1 || limit > MAX_ISSUE_LIMIT) {
      throw new AppError(`limit must be an integer between 1 and ${MAX_ISSUE_LIMIT}.`, 422, 'VALIDATION_ERROR');
    }
  }

  let sort = 'updated';
  if (query.sort !== undefined) {
    if (!ISSUE_SORTS.includes(query.sort)) {
      throw new AppError(`sort must be one of: ${ISSUE_SORTS.join(', ')}.`, 422, 'VALIDATION_ERROR');
    }
    sort = query.sort;
  }

  return { paginate: wantsPagination, page, limit, sort };
}