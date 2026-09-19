import Issue from '../models/Issue.js';
import Project from '../models/Project.js';

async function accessibleProjectCondition(user) {
  if (user.role === 'ADMIN') return {};

  const projectIds = await Project.find({ members: user.id }).select('_id');
  return { project: { $in: projectIds.map((project) => project._id) } };
}

async function countIssues(user, extraCondition = {}) {
  const condition = { ...(await accessibleProjectCondition(user)), ...extraCondition };
  return Issue.countDocuments(condition);
}

export async function getDashboardStats(user) {
  const [total, open, inProgress, testing, resolved, closed, critical, assignedToMe] = await Promise.all([
    countIssues(user),
    countIssues(user, { status: 'OPEN' }),
    countIssues(user, { status: 'IN_PROGRESS' }),
    countIssues(user, { status: 'TESTING' }),
    countIssues(user, { status: 'RESOLVED' }),
    countIssues(user, { status: 'CLOSED' }),
    countIssues(user, { severity: 'CRITICAL' }),
    countIssues(user, { assignee: user.id }),
  ]);

  return { total, open, inProgress, testing, resolved, closed, critical, assignedToMe };
}