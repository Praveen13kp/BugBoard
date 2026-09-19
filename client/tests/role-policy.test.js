import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  canAssignIssue,
  canCreateProject,
  canManageProjects,
  canReportIssueForProject,
  canTransitionIssue,
  canUpdateIssue,
  isUserMember,
} from '../src/utils/permissions.js';
import { formatDate, PRIORITY_LABELS, SEVERITY_LABELS, STATUS_LABELS, USER_ROLE_LABELS } from '../src/utils/format.js';

function user(role, id = 'u1') {
  return { id, role };
}

const issue = {
  reporter: { id: 'reporter' },
  assignee: { id: 'assignee' },
};

describe('Frontend role policy', () => {
  it('only administrators can create or manage projects', () => {
    assert.equal(canManageProjects('ADMIN'), true);
    assert.equal(canManageProjects('DEVELOPER'), false);
    assert.equal(canManageProjects('TESTER'), false);
    assert.equal(canCreateProject('ADMIN'), true);
    assert.equal(canCreateProject('TESTER'), false);
  });

  it('allows administrators and developers to assign issues', () => {
    assert.equal(canAssignIssue('ADMIN'), true);
    assert.equal(canAssignIssue('DEVELOPER'), true);
    assert.equal(canAssignIssue('TESTER'), false);
  });

  it('lets administrators and developers transition any issue', () => {
    assert.equal(canTransitionIssue(user('ADMIN'), issue), true);
    assert.equal(canTransitionIssue(user('DEVELOPER'), issue), true);
  });

  it('lets testers transition only issues they reported or are assigned to', () => {
    assert.equal(canTransitionIssue(user('TESTER', 'reporter'), issue), true);
    assert.equal(canTransitionIssue(user('TESTER', 'assignee'), issue), true);
    assert.equal(canTransitionIssue(user('TESTER', 'someone-else'), issue), false);
  });

  it('lets testers edit only issues they reported', () => {
    assert.equal(canUpdateIssue(user('TESTER', 'reporter'), issue), true);
    assert.equal(canUpdateIssue(user('TESTER', 'assignee'), issue), false);
    assert.equal(canUpdateIssue(user('ADMIN'), issue), true);
  });

  it('restricts issue reporting to administrators and project members', () => {
    const project = { members: [{ id: 'reporter' }, { id: 'assignee' }] };
    assert.equal(canReportIssueForProject(user('ADMIN'), project), true);
    assert.equal(canReportIssueForProject(user('DEVELOPER', 'reporter'), project), true);
    assert.equal(canReportIssueForProject(user('DEVELOPER', 'outsider'), project), false);
    assert.equal(isUserMember(user('DEVELOPER', 'reporter'), project), true);
    assert.equal(isUserMember(user('DEVELOPER', 'outsider'), project), false);
  });

  it('exposes enum labels and a safe date formatter', () => {
    assert.equal(STATUS_LABELS.OPEN, 'Open');
    assert.equal(SEVERITY_LABELS.CRITICAL, 'Critical');
    assert.equal(PRIORITY_LABELS.URGENT, 'Urgent');
    assert.equal(USER_ROLE_LABELS.DEVELOPER, 'Developer');
    assert.equal(formatDate(null), '');
    assert.equal(formatDate('not-a-date'), '');
    assert.equal(typeof formatDate(Date.now()), 'string');
  });
});