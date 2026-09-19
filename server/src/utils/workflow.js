export const STATUS_TRANSITIONS = {
  OPEN: ['IN_PROGRESS'],
  IN_PROGRESS: ['TESTING'],
  TESTING: ['RESOLVED', 'IN_PROGRESS'],
  RESOLVED: ['CLOSED', 'IN_PROGRESS'],
  CLOSED: [],
};

export const WORKFLOW_START_STATUS = 'OPEN';

export function canTransition(fromStatus, toStatus) {
  return Boolean(STATUS_TRANSITIONS[fromStatus]?.includes(toStatus));
}

export function allowedNextStatuses(status) {
  return STATUS_TRANSITIONS[status] || [];
}