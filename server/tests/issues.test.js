import assert from 'node:assert/strict';
import { after, before, beforeEach, describe, it } from 'node:test';
import request from 'supertest';
import { app, clearDatabase, createProjectAs, createUser, signIn, startTestDb, stopTestDb } from './helpers.js';

describe('Issues', () => {
  let adminToken;
  let devToken;
  let testerToken;
  let outsiderToken;
  let devId;
  let testerId;
  let outsiderId;
  let projectId;

  before(startTestDb);

  beforeEach(async () => {
    await clearDatabase();
    const admin = await createUser({ name: 'Admin', email: 'admin@bugboard.test', role: 'ADMIN' });
    const developer = await createUser({ name: 'Dev', email: 'dev@bugboard.test', role: 'DEVELOPER' });
    const tester = await createUser({ name: 'Tester', email: 'tester@bugboard.test', role: 'TESTER' });
    const outsider = await createUser({ name: 'Outsider', email: 'outsider@bugboard.test', role: 'DEVELOPER' });

    devId = developer.id;
    testerId = tester.id;
    outsiderId = outsider.id;
    adminToken = (await signIn('admin@bugboard.test', 'Password123!')).token;
    devToken = (await signIn('dev@bugboard.test', 'Password123!')).token;
    testerToken = (await signIn('tester@bugboard.test', 'Password123!')).token;
    outsiderToken = (await signIn('outsider@bugboard.test', 'Password123!')).token;

    const project = await createProjectAs(adminToken, { name: 'Core Platform', key: 'CORE' });
    await request(app)
      .post(`/api/projects/${project.id}/members`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ members: [devId, testerId] });
    projectId = project.id;
  });

  after(stopTestDb);

  function issuePayload(overrides = {}) {
    return {
      title: 'Login screen crashes',
      description: 'The login screen crashes after submitting valid credentials.',
      severity: 'HIGH',
      priority: 'URGENT',
      project: projectId,
      ...overrides,
    };
  }

  async function createIssue(token, overrides) {
    const response = await request(app)
      .post('/api/issues')
      .set('Authorization', `Bearer ${token}`)
      .send(issuePayload(overrides));

    assert.equal(response.status, 201, JSON.stringify(response.body));
    return response.body.data.issue;
  }

  it('lets a project member create an issue as reporter', async () => {
    const issue = await createIssue(testerToken);

    assert.equal(issue.status, 'OPEN');
    assert.equal(issue.reporter.id, testerId);
    assert.equal(issue.project.id, projectId);
    assert.equal(issue.severity, 'HIGH');
  });

  it('rejects issue creation by a non-member with 403', async () => {
    const response = await request(app)
      .post('/api/issues')
      .set('Authorization', `Bearer ${outsiderToken}`)
      .send(issuePayload());

    assert.equal(response.status, 403);
    assert.equal(response.body.error.code, 'PROJECT_ACCESS_DENIED');
  });

  it('validates required issue fields', async () => {
    const response = await request(app)
      .post('/api/issues')
      .set('Authorization', `Bearer ${devToken}`)
      .send({ project: projectId, title: 'X', description: 'short', severity: 'NOPE', priority: 'URGENT' });

    assert.equal(response.status, 422);
  });

  it('rejects an unknown project with 404', async () => {
    const response = await request(app)
      .post('/api/issues')
      .set('Authorization', `Bearer ${devToken}`)
      .send(issuePayload({ project: '000000000000000000000000' }));

    assert.equal(response.status, 404);
  });

  it('requires the assignee to be a project member', async () => {
    const response = await request(app)
      .post('/api/issues')
      .set('Authorization', `Bearer ${devToken}`)
      .send(issuePayload({ assignee: outsiderId }));

    assert.equal(response.status, 422);
    assert.equal(response.body.error.code, 'ASSIGNEE_NOT_MEMBER');

    const missingUser = await request(app)
      .post('/api/issues')
      .set('Authorization', `Bearer ${devToken}`)
      .send(issuePayload({ assignee: '000000000000000000000000' }));
    assert.equal(missingUser.status, 422);
    assert.equal(missingUser.body.error.code, 'INVALID_ASSIGNEE');
  });

  it('blocks a non-member from viewing an issue', async () => {
    const issue = await createIssue(testerToken);
    const response = await request(app)
      .get(`/api/issues/${issue.id}`)
      .set('Authorization', `Bearer ${outsiderToken}`);

    assert.equal(response.status, 403);
  });

  it('allows a developer to update title and severity', async () => {
    const issue = await createIssue(testerToken);

    const response = await request(app)
      .patch(`/api/issues/${issue.id}`)
      .set('Authorization', `Bearer ${devToken}`)
      .send({ title: 'Fixed title', severity: 'CRITICAL' });

    assert.equal(response.status, 200);
    assert.equal(response.body.data.issue.title, 'Fixed title');
    assert.equal(response.body.data.issue.severity, 'CRITICAL');
  });

  it('lets a tester update their own reported issue only', async () => {
    const own = await createIssue(testerToken);
    const others = await createIssue(devToken);

    const ownUpdate = await request(app)
      .patch(`/api/issues/${own.id}`)
      .set('Authorization', `Bearer ${testerToken}`)
      .send({ title: 'My bug title' });
    assert.equal(ownUpdate.status, 200);

    const otherUpdate = await request(app)
      .patch(`/api/issues/${others.id}`)
      .set('Authorization', `Bearer ${testerToken}`)
      .send({ title: 'Not mine' });
    assert.equal(otherUpdate.status, 403);
  });

  it('enforces the status workflow', async () => {
    const issue = await createIssue(devToken);

    const toOpenAgain = await request(app)
      .patch(`/api/issues/${issue.id}/status`)
      .set('Authorization', `Bearer ${devToken}`)
      .send({ status: 'OPEN' });
    assert.equal(toOpenAgain.status, 400);
    assert.equal(toOpenAgain.body.error.code, 'ISSUE_ALREADY_IN_STATUS');

    const transitions = [
      ['IN_PROGRESS', 'IN_PROGRESS'],
      ['TESTING', 'TESTING'],
      ['IN_PROGRESS', 'IN_PROGRESS'],
      ['TESTING', 'TESTING'],
      ['RESOLVED', 'RESOLVED'],
      ['IN_PROGRESS', 'IN_PROGRESS'],
      ['TESTING', 'TESTING'],
      ['RESOLVED', 'RESOLVED'],
      ['CLOSED', 'CLOSED'],
    ];

    for (const [next, expected] of transitions) {
      const response = await request(app)
        .patch(`/api/issues/${issue.id}/status`)
        .set('Authorization', `Bearer ${devToken}`)
        .send({ status: next });
      assert.equal(response.status, 200, JSON.stringify(response.body));
      assert.equal(response.body.data.issue.status, expected);
    }
  });

  it('rejects a direct jump from OPEN to RESOLVED', async () => {
    const issue = await createIssue(devToken);

    const response = await request(app)
      .patch(`/api/issues/${issue.id}/status`)
      .set('Authorization', `Bearer ${devToken}`)
      .send({ status: 'RESOLVED' });

    assert.equal(response.status, 400);
    assert.equal(response.body.error.code, 'INVALID_STATUS_TRANSITION');
  });

  it('lets a tester transition issues they reported, but not others', async () => {
    const own = await createIssue(testerToken);
    const others = await createIssue(devToken);

    const ownMove = await request(app)
      .patch(`/api/issues/${own.id}/status`)
      .set('Authorization', `Bearer ${testerToken}`)
      .send({ status: 'IN_PROGRESS' });
    assert.equal(ownMove.status, 200);

    const otherMove = await request(app)
      .patch(`/api/issues/${others.id}/status`)
      .set('Authorization', `Bearer ${testerToken}`)
      .send({ status: 'IN_PROGRESS' });
    assert.equal(otherMove.status, 403);
  });

  it('allows only admin/developer to assign issues', async () => {
    const issue = await createIssue(testerToken);

    const testerAssign = await request(app)
      .patch(`/api/issues/${issue.id}/assignee`)
      .set('Authorization', `Bearer ${testerToken}`)
      .send({ assignee: devId });
    assert.equal(testerAssign.status, 403);

    const devAssign = await request(app)
      .patch(`/api/issues/${issue.id}/assignee`)
      .set('Authorization', `Bearer ${devToken}`)
      .send({ assignee: devId });
    assert.equal(devAssign.status, 200);
    assert.equal(devAssign.body.data.issue.assignee.id, devId);

    const unassign = await request(app)
      .patch(`/api/issues/${issue.id}/assignee`)
      .set('Authorization', `Bearer ${devToken}`)
      .send({ assignee: null });
    assert.equal(unassign.status, 200);
    assert.equal(unassign.body.data.issue.assignee, null);
  });

  it('filters and searches issues', async () => {
    await createIssue(testerToken, { title: 'Payments timeout', severity: 'CRITICAL', priority: 'URGENT' });
    await createIssue(devToken, { title: 'Slow dashboard', severity: 'LOW', priority: 'LOW' });

    const bySeverity = await request(app)
      .get(`/api/issues?severity=CRITICAL`)
      .set('Authorization', `Bearer ${devToken}`);
    assert.equal(bySeverity.body.data.issues.length, 1);
    assert.equal(bySeverity.body.data.issues[0].title, 'Payments timeout');

    const bySearch = await request(app)
      .get(`/api/issues?search=payments`)
      .set('Authorization', `Bearer ${devToken}`);
    assert.equal(bySearch.body.data.issues.length, 1);

    const byStatus = await request(app)
      .get(`/api/issues?status=OPEN`)
      .set('Authorization', `Bearer ${devToken}`);
    assert.equal(byStatus.body.data.issues.length, 2);

    const byProject = await request(app)
      .get(`/api/issues?project=${projectId}`)
      .set('Authorization', `Bearer ${devToken}`);
    assert.equal(byProject.body.data.issues.length, 2);
  });

  it('restricts issue filters to accessible projects', async () => {
    const issue = await createIssue(testerToken);

    const outsiderList = await request(app).get('/api/issues').set('Authorization', `Bearer ${outsiderToken}`);
    assert.ok(outsiderList.body.data.issues.every((item) => item.id !== issue.id));
  });

  it('paginates issues without changing the default all-results response', async () => {
    for (let index = 0; index < 5; index += 1) {
      await createIssue(devToken, { title: `Boundary pagination issue ${index}` });
    }

    const firstPage = await request(app)
      .get('/api/issues?page=1&limit=2')
      .set('Authorization', `Bearer ${devToken}`);
    assert.equal(firstPage.status, 200);
    assert.equal(firstPage.body.data.issues.length, 2);
    assert.deepEqual(firstPage.body.data.pagination, { page: 1, limit: 2, total: 5, totalPages: 3 });

    const lastPage = await request(app)
      .get('/api/issues?page=3&limit=2')
      .set('Authorization', `Bearer ${devToken}`);
    assert.equal(lastPage.body.data.issues.length, 1);
    assert.equal(lastPage.body.data.pagination.page, 3);
    assert.equal(lastPage.body.data.pagination.totalPages, 3);

    const all = await request(app).get('/api/issues').set('Authorization', `Bearer ${devToken}`);
    assert.equal(all.body.data.issues.length, 5);
    assert.equal(all.body.data.pagination, null);
  });

  it('validates pagination and sort query parameters', async () => {
    const badPage = await request(app).get('/api/issues?page=0').set('Authorization', `Bearer ${devToken}`);
    assert.equal(badPage.status, 422);

    const badLimit = await request(app).get('/api/issues?limit=101').set('Authorization', `Bearer ${devToken}`);
    assert.equal(badLimit.status, 422);
    assert.equal(badLimit.body.error.code, 'VALIDATION_ERROR');

    const badSort = await request(app).get('/api/issues?sort=injected').set('Authorization', `Bearer ${devToken}`);
    assert.equal(badSort.status, 422);
    assert.equal(badSort.body.error.code, 'VALIDATION_ERROR');
  });

  it('sorts issues by severity and priority using server-side rank', async () => {
    await createIssue(devToken, { title: 'Severity low', severity: 'LOW', priority: 'LOW' });
    await createIssue(devToken, { title: 'Severity critical', severity: 'CRITICAL', priority: 'LOW' });
    await createIssue(devToken, { title: 'Priority urgent', severity: 'LOW', priority: 'URGENT' });
    await createIssue(devToken, { title: 'Severity high', severity: 'HIGH', priority: 'MEDIUM' });

    const bySeverity = await request(app)
      .get('/api/issues?sort=severity')
      .set('Authorization', `Bearer ${devToken}`);
    assert.equal(bySeverity.status, 200);
    assert.equal(bySeverity.body.data.issues[0].title, 'Severity critical');
    assert.equal(bySeverity.body.data.issues[1].title, 'Severity high');

    const byPriority = await request(app)
      .get('/api/issues?sort=priority')
      .set('Authorization', `Bearer ${devToken}`);
    assert.equal(byPriority.status, 200);
    assert.equal(byPriority.body.data.issues[0].title, 'Priority urgent');
  });
});