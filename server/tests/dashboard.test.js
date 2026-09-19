import assert from 'node:assert/strict';
import { after, before, beforeEach, describe, it } from 'node:test';
import request from 'supertest';
import { app, clearDatabase, createProjectAs, createUser, signIn, startTestDb, stopTestDb } from './helpers.js';

describe('Dashboard API', () => {
  let adminToken;
  let devToken;
  let outsiderToken;
  let devId;
  let projectId;

  before(startTestDb);

  beforeEach(async () => {
    await clearDatabase();
    await createUser({ name: 'Admin', email: 'admin@bugboard.test', role: 'ADMIN' });
    const developer = await createUser({ name: 'Dev', email: 'dev@bugboard.test', role: 'DEVELOPER' });
    const outsider = await createUser({ name: 'Outsider', email: 'outsider@bugboard.test', role: 'TESTER' });
    devId = developer.id;
    adminToken = (await signIn('admin@bugboard.test', 'Password123!')).token;
    devToken = (await signIn('dev@bugboard.test', 'Password123!')).token;
    outsiderToken = (await signIn('outsider@bugboard.test', 'Password123!')).token;

    const project = await createProjectAs(adminToken, { name: 'Dashboard Core', key: 'DASH' });
    await request(app)
      .post(`/api/projects/${project.id}/members`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ members: [developer.id] });
    projectId = project.id;
  });

  after(stopTestDb);

  async function createIssue(overrides = {}) {
    const response = await request(app)
      .post('/api/issues')
      .set('Authorization', `Bearer ${devToken}`)
      .send({
        title: 'Dashboard sample',
        description: 'Used for dashboard statistics.',
        severity: 'MEDIUM',
        priority: 'HIGH',
        project: projectId,
        ...overrides,
      });
    assert.equal(response.status, 201, JSON.stringify(response.body));
    return response.body.data.issue;
  }

  it('returns access-scoped statistics', async () => {
    await createIssue({ title: 'Open issue', severity: 'CRITICAL' });
    await createIssue({ title: 'Assigned open issue', assignee: devId, severity: 'CRITICAL' });

    const devStats = await request(app).get('/api/dashboard').set('Authorization', `Bearer ${devToken}`);
    assert.equal(devStats.status, 200);
    const stats = devStats.body.data.stats;
    assert.equal(stats.total, 2);
    assert.equal(stats.open, 2);
    assert.equal(stats.critical, 2);
    assert.equal(stats.resolved, 0);
    assert.equal(stats.assignedToMe, 1);

    const outsiderStats = await request(app).get('/api/dashboard').set('Authorization', `Bearer ${outsiderToken}`);
    assert.equal(outsiderStats.body.data.stats.total, 0);
  });

  it('counts resolved issues only in accessible projects', async () => {
    await createIssue({ title: 'Resolving one', assignee: devId });
    const issue = await createIssue({ title: 'Resolving two' });

    await request(app).patch(`/api/issues/${issue.id}/status`).set('Authorization', `Bearer ${devToken}`).send({ status: 'IN_PROGRESS' });
    await request(app).patch(`/api/issues/${issue.id}/status`).set('Authorization', `Bearer ${devToken}`).send({ status: 'TESTING' });
    await request(app).patch(`/api/issues/${issue.id}/status`).set('Authorization', `Bearer ${devToken}`).send({ status: 'RESOLVED' });

    const stats = await request(app).get('/api/dashboard').set('Authorization', `Bearer ${adminToken}`);
    assert.equal(stats.body.data.stats.resolved, 1);
  });
});