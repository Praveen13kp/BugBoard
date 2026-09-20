import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { groupIssuesByStatus, ISSUE_STATUS_ORDER } from '../src/utils/issueGroups.js';
import { ISSUE_SORTS, formatDate } from '../src/utils/format.js';

function issue(status, id) {
  return { id, status, title: `Issue ${id}` };
}

describe('Issue grouping and sort options', () => {
  it('orders kanban columns in workflow order', () => {
    assert.deepEqual(ISSUE_STATUS_ORDER, ['OPEN', 'IN_PROGRESS', 'TESTING', 'RESOLVED', 'CLOSED']);
  });

  it('groups issues into the five workflow columns', () => {
    const issues = [
      issue('OPEN', '1'),
      issue('TESTING', '2'),
      issue('OPEN', '3'),
      issue('CLOSED', '4'),
    ];
    const groups = groupIssuesByStatus(issues);

    assert.deepEqual(
      [...groups.keys()],
      ['OPEN', 'IN_PROGRESS', 'TESTING', 'RESOLVED', 'CLOSED'],
    );
    assert.deepEqual(groups.get('OPEN').map((item) => item.id), ['1', '3']);
    assert.deepEqual(groups.get('TESTING').map((item) => item.id), ['2']);
    assert.equal(groups.get('IN_PROGRESS').length, 0);
    assert.equal(groups.get('RESOLVED').length, 0);
    assert.deepEqual(groups.get('CLOSED').map((item) => item.id), ['4']);
  });

  it('ignores issues with unknown statuses', () => {
    const groups = groupIssuesByStatus([issue('UNKNOWN', 'x'), issue('OPEN', 'ok')]);
    assert.equal(groups.size, 5);
    assert.deepEqual(groups.get('OPEN').map((item) => item.id), ['ok']);
  });

  it('exposes stable sort options', () => {
    assert.deepEqual(
      ISSUE_SORTS.map((option) => option.value),
      ['updated', 'newest', 'oldest', 'priority', 'severity'],
    );
    assert.equal(typeof formatDate(Date.now()), 'string');
  });
});