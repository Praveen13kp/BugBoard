function userReferenceId(reference) {
  return reference?.id ?? reference?.toString?.() ?? null;
}

export function canManageProjects(role) {
  return role === 'ADMIN';
}

export function canAssignIssue(role) {
  return role === 'ADMIN' || role === 'DEVELOPER';
}

export function canTransitionIssue(user, issue) {
  if (user.role === 'ADMIN' || user.role === 'DEVELOPER') return true;

  // Testers may move the workflow forward/back for issues they reported or own.
  if (user.role === 'TESTER') {
    const reporter = String(userReferenceId(issue.reporter) ?? '');
    const assignee = String(userReferenceId(issue.assignee) ?? '');
    return reporter === user.id || assignee === user.id;
  }

  return false;
}

export function canUpdateIssue(user, issue) {
  if (user.role === 'ADMIN' || user.role === 'DEVELOPER') return true;

  // Testers may edit the issues they reported.
  if (user.role === 'TESTER') {
    return String(userReferenceId(issue.reporter) ?? '') === user.id;
  }

  return false;
}