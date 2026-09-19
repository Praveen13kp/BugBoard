import assert from 'node:assert/strict';
import { after, before, beforeEach, describe, it } from 'node:test';
import request from 'supertest';
import { app, clearDatabase, createProjectAs, createUser, signIn, startTestDb, stopTestDb } from './helpers.js';

describe('Activity history', () => {
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
    const outsider = await createUser({ name: 'Outsider', email: 'outsider@bugboard.test', role: 'DEVELOPER' });
    devId = developer.id;
    adminToken = (await signIn('admin@bugboard.test', 'Password123!')).token;
    devToken = (await signIn('dev@bugboard.test', 'Password123!')).token;
    outsiderToken = (await signIn('outsider@bugboard.test', 'Password123!')).token;

    const project = await createProjectAs(adminToken, { name: 'Activity Core', key: 'ACT' });
    await request(app)
      .post(`/api/projects/${project.id}/members`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ members: [developer.id] });
    projectId = project.id;
  });

  after(stopTestDb);

  async function createIssue() {
    const response = await request(app)
      .post('/api/issues')
      .set('Authorization', `Bearer ${devToken}`)
      .send({
        title: 'Activity trail bug',
        description: 'Tracks creation and field changes.',
        severity: 'MEDIUM',
        priority: 'HIGH',
        project: projectId,
      });
    assert.equal(response.status, 201, JSON.stringify(response.body));
    return response.body.data.issue;
  }

  it('records creation, status, assignee, severity, and priority changes', async () => {
    const issue = await createIssue();

    await request(app)
      .patch(`/api/issues/${issue.id}/status`)
      .set('Authorization', `Bearer ${devToken}`)
      .send({ status: 'IN_PROGRESS' });
    await request(app)
      .patch(`/api/issues/${issue.id}/assignee`)
      .set('Authorization', `Bearer ${devToken}`)
      .send({ assignee: devId });
    await request(app)
      .patch(`/api/issues/${issue.id}`)
      .set('Authorization', `Bearer ${devToken}`)
      .send({ severity: 'CRITICAL', priority: 'URGENT' });

    const response = await request(app).get(`/api/issues/${issue.id}/activity`).set('Authorization', `Bearer ${devToken}`);
    assert.equal(response.status, 200);

    const entries = response.body.data.activity;
    const fields = entries
      .filter((entry) => entry.field)
      .map((entry) => entry.field)
      .sort();
    assert.ok(entries.some((entry) => entry.action === 'created'));
    assert.deepEqual(fields, ['assignee', 'priority', 'severity', 'status'].sort());

    const statusEntry = entries.find((entry) => entry.field === 'status');
    assert.equal(statusEntry.oldValue, 'OPEN');
    assert.equal(statusEntry.newValue, 'IN_PROGRESS');
    assert.ok(statusEntry.actor.id === devId);

    const assigneeEntry = entries.find((entry) => entry.field === 'assignee');
    assert.equal(assigneeEntry.newValue, 'Dev');
  });

  it('blocks a non-member from reading activity', async () => {
    const issue = await createIssue();
    const response = await request(app).get(`/api/issues/${issue.id}/activity`).set('Authorization', `Bearer ${outsiderToken}`);
    assert.equal(response.status, 403);
  });
});