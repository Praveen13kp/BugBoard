export const ISSUE_STATUS_ORDER = ['OPEN', 'IN_PROGRESS', 'TESTING', 'RESOLVED', 'CLOSED'];

export function groupIssuesByStatus(issues, order = ISSUE_STATUS_ORDER) {
  const groups = new Map(order.map((status) => [status, []]));
  for (const issue of issues) {
    if (!groups.has(issue.status)) continue;
    groups.get(issue.status).push(issue);
  }
  return groups;
}