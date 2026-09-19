import Issue from '../models/Issue.js';
import Project from '../models/Project.js';
import User from '../models/User.js';
import AppError from '../utils/AppError.js';
import { canAssignIssue, canTransitionIssue, canUpdateIssue } from '../utils/permissions.js';
import { allowedNextStatuses, canTransition } from '../utils/workflow.js';
import { ensureProjectAccess } from './accessService.js';
import { recordActivity } from './activityService.js';

const USER_FIELDS = 'name email role';
const PROJECT_FIELDS = 'name key members';

function issueQuery(conditions = {}) {
  return Issue.find(conditions)
    .populate('project', PROJECT_FIELDS)
    .populate('reporter', USER_FIELDS)
    .populate('assignee', USER_FIELDS);
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

async function accessibleProjectCondition(user, projectId) {
  if (projectId) {
    const project = await Project.findById(projectId);
    if (!project) {
      throw new AppError('The project was not found.', 404, 'PROJECT_NOT_FOUND');
    }
    ensureProjectAccess(user, project);
    return { project: projectId };
  }

  if (user.role === 'ADMIN') return {};

  const projectIds = await Project.find({ members: user.id }).select('_id');
  return { project: { $in: projectIds.map((project) => project._id) } };
}

async function loadIssue(conditions) {
  return Issue.findOne(conditions)
    .populate('project', PROJECT_FIELDS)
    .populate('reporter', USER_FIELDS)
    .populate('assignee', USER_FIELDS);
}

export async function listIssues(user, filters) {
  const query = await accessibleProjectCondition(user, filters.projectId);

  if (filters.status) query.status = filters.status;
  if (filters.priority) query.priority = filters.priority;
  if (filters.severity) query.severity = filters.severity;
  if (filters.reporterId) query.reporter = filters.reporterId;
  if (filters.assigneeId) query.assignee = filters.assigneeId;
  if (filters.search) {
    const pattern = new RegExp(escapeRegExp(filters.search), 'i');
    query.$or = [{ title: pattern }, { description: pattern }];
  }

  return issueQuery(query).sort({ updatedAt: -1 });
}

export async function getIssueForUser(user, issueId) {
  const issue = await loadIssue({ _id: issueId });

  if (!issue) {
    throw new AppError('The requested issue was not found.', 404, 'ISSUE_NOT_FOUND');
  }
  if (!issue.project) {
    throw new AppError('The issue project was not found.', 404, 'PROJECT_NOT_FOUND');
  }

  ensureProjectAccess(user, issue.project);
  return issue;
}

async function validateAssignee(project, assigneeId) {
  if (!assigneeId) return null;

  const user = await User.findById(assigneeId);
  if (!user) {
    throw new AppError('The assignee does not exist.', 422, 'INVALID_ASSIGNEE');
  }

  const isMember = (project.members || []).some((id) => String(id) === String(assigneeId));
  if (!isMember) {
    throw new AppError('The assignee must be a member of the project.', 422, 'ASSIGNEE_NOT_MEMBER');
  }

  return user;
}

export async function createIssue(user, input) {
  const project = await Project.findById(input.projectId);
  if (!project) {
    throw new AppError('The project was not found.', 404, 'PROJECT_NOT_FOUND');
  }
  ensureProjectAccess(user, project);

  const assignee = await validateAssignee(project, input.assigneeId);

  const issue = await Issue.create({
    project: project.id,
    title: input.title,
    description: input.description,
    severity: input.severity,
    priority: input.priority,
    status: input.status || 'OPEN',
    reporter: user.id,
    assignee: assignee ? assignee.id : null,
  });

  await recordActivity(issue.id, user.id, 'created', { newValue: `${issue.title} was opened.` });
  if (assignee) {
    await recordActivity(issue.id, user.id, 'updated', { field: 'assignee', oldValue: 'unassigned', newValue: assignee.name });
  }

  return getIssueForUser(user, issue.id);
}

function assertCanUpdate(user, issue) {
  if (!canUpdateIssue(user, issue)) {
    throw new AppError('You do not have permission to update this issue.', 403, 'FORBIDDEN');
  }
}

export async function updateIssue(user, issueId, updates) {
  const issue = await getIssueForUser(user, issueId);
  assertCanUpdate(user, issue);

  const fieldChanges = [
    ['title', updates.title],
    ['description', updates.description],
    ['severity', updates.severity],
    ['priority', updates.priority],
  ];

  const applied = [];
  for (const [field, value] of fieldChanges) {
    if (value !== undefined && value !== issue[field]) {
      applied.push({ field, oldValue: issue[field], newValue: value });
      issue[field] = value;
    }
  }

  if (!applied.length) {
    throw new AppError('No field values changed.', 400, 'NO_CHANGES');
  }

  await issue.save();
  for (const change of applied) {
    await recordActivity(issue.id, user.id, 'updated', {
      field: change.field,
      oldValue: change.oldValue,
      newValue: change.newValue,
    });
  }

  return getIssueForUser(user, issue.id);
}

export async function changeIssueStatus(user, issueId, nextStatus) {
  const issue = await getIssueForUser(user, issueId);

  if (!canTransitionIssue(user, issue)) {
    throw new AppError('You do not have permission to change this status.', 403, 'FORBIDDEN');
  }

  if (nextStatus === issue.status) {
    throw new AppError(`The issue is already in the ${nextStatus} status.`, 400, 'ISSUE_ALREADY_IN_STATUS');
  }

  if (!canTransition(issue.status, nextStatus)) {
    const allowed = allowedNextStatuses(issue.status).join(', ') || 'none';
    throw new AppError(
      `Invalid status transition from ${issue.status} to ${nextStatus}. Allowed next statuses: ${allowed}.`,
      400,
      'INVALID_STATUS_TRANSITION',
    );
  }

  const previousStatus = issue.status;
  issue.status = nextStatus;
  await issue.save();
  await recordActivity(issue.id, user.id, 'updated', { field: 'status', oldValue: previousStatus, newValue: nextStatus });

  return getIssueForUser(user, issue.id);
}

export async function changeIssueAssignee(user, issueId, assigneeId) {
  const issue = await getIssueForUser(user, issueId);

  if (!canAssignIssue(user.role)) {
    throw new AppError('You do not have permission to reassign issues.', 403, 'FORBIDDEN');
  }

  const assignee = await validateAssignee(issue.project, assigneeId);
  if (String(issue.assignee?._id ?? '') === String(assignee?._id ?? '')) {
    throw new AppError('The issue is already assigned to this user.', 400, 'NO_ASSIGNEE_CHANGE');
  }

  const previousName = issue.assignee?.name || 'unassigned';
  issue.assignee = assignee ? assignee.id : null;
  await issue.save();
  await recordActivity(issue.id, user.id, 'updated', {
    field: 'assignee',
    oldValue: previousName,
    newValue: assignee ? assignee.name : 'unassigned',
  });

  return getIssueForUser(user, issue.id);
}