export function canManageProjects(role) {
  return role === 'ADMIN';
}

export function canAssignIssue(role) {
  return role === 'ADMIN' || role === 'DEVELOPER';
}

function referenceId(reference) {
  return reference?.id ?? reference?.toString?.() ?? null;
}

export function canTransitionIssue(user, issue) {
  if (user.role === 'ADMIN' || user.role === 'DEVELOPER') return true;
  if (user.role === 'TESTER') {
    const reporter = String(referenceId(issue.reporter) ?? '');
    const assignee = String(referenceId(issue.assignee) ?? '');
    return reporter === user.id || assignee === user.id;
  }
  return false;
}

export function canUpdateIssue(user, issue) {
  if (user.role === 'ADMIN' || user.role === 'DEVELOPER') return true;
  if (user.role === 'TESTER') {
    return String(referenceId(issue.reporter) ?? '') === user.id;
  }
  return false;
}