import Activity from '../models/Activity.js';

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