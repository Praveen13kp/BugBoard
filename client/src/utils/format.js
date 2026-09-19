export const STATUS_LABELS = {
  OPEN: 'Open',
  IN_PROGRESS: 'In Progress',
  TESTING: 'Testing',
  RESOLVED: 'Resolved',
  CLOSED: 'Closed',
};

export const SEVERITY_LABELS = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
  CRITICAL: 'Critical',
};

export const PRIORITY_LABELS = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
  URGENT: 'Urgent',
};

export const USER_ROLE_LABELS = {
  ADMIN: 'Admin',
  DEVELOPER: 'Developer',
  TESTER: 'Tester',
};

export function formatDate(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
}