import Activity from '../models/Activity.js';
import { getIssueForUser } from './issueService.js';

export async function recordActivity(issueId, actorId, action, { field = null, oldValue = null, newValue = null } = {}) {
  return Activity.create({
    issue: issueId,
    actor: actorId,
    action,
    field,
    oldValue,
    newValue,
    timestamp: new Date(),
  });
}

export async function listActivityForIssue(user, issueId) {
  const issue = await getIssueForUser(user, issueId);
  return Activity.find({ issue: issue.id }).sort({ timestamp: -1 }).populate('actor', 'name email role');
}