import assert from 'node:assert/strict';
import { after, before, beforeEach, describe, it } from 'node:test';
import request from 'supertest';
import { app, clearDatabase, createProjectAs, createUser, signIn, startTestDb, stopTestDb } from './helpers.js';

describe('Projects', () => {
  let admin;
  let developer;
  let tester;
  let adminToken;
  let developerToken;

  before(startTestDb);

  beforeEach(async () => {
    await clearDatabase();
    admin = await createUser({ name: 'Admin User', email: 'admin@bugboard.test', role: 'ADMIN' });
    developer = await createUser({ name: 'Dev User', email: 'dev@bugboard.test', role: 'DEVELOPER' });
    tester = await createUser({ name: 'Test User', email: 'tester@bugboard.test', role: 'TESTER' });
    adminToken = (await signIn('admin@bugboard.test', 'Password123!')).token;
    developerToken = (await signIn('dev@bugboard.test', 'Password123!')).token;
  });

  after(stopTestDb);

  it('lets an admin create a project and adds the creator as a member', async () => {
    const project = await createProjectAs(adminToken, { name: 'Web App', key: 'WEB' });

    assert.equal(project.key, 'WEB');
    assert.ok(project.members.some((member) => member.id === admin.id));
  });

  it('rejects project creation by a developer with 403', async () => {
    const response = await request(app)
      .post('/api/projects')
      .set('Authorization', `Bearer ${developerToken}`)
      .send({ name: 'Forbidden Project', key: 'FORBID' });

    assert.equal(response.status, 403);
  });

  it('rejects a duplicate project key with 409', async () => {
    await createProjectAs(adminToken, { name: 'First App', key: 'DUP' });

    const response = await request(app)
      .post('/api/projects')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Second App', key: 'dup' });

    assert.equal(response.status, 409);
    assert.equal(response.body.error.code, 'PROJECT_KEY_IN_USE');
  });

  it('rejects unknown member identifiers with 422', async () => {
    const response = await request(app)
      .post('/api/projects')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Bad Members', key: 'BADMEM', members: ['000000000000000000000000'] });

    assert.equal(response.status, 422);
    assert.equal(response.body.error.code, 'INVALID_MEMBER');
  });

  it('only exposes projects to members and admin', async () => {
    const project = await createProjectAs(adminToken, { name: 'Team Project', key: 'TEAM' });
    await request(app)
      .post(`/api/projects/${project.id}/members`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ members: [developer.id] });

    const adminList = await request(app).get('/api/projects').set('Authorization', `Bearer ${adminToken}`);
    const devList = await request(app).get('/api/projects').set('Authorization', `Bearer ${developerToken}`);
    const testerToken = (await signIn('tester@bugboard.test', 'Password123!')).token;
    const testerList = await request(app).get('/api/projects').set('Authorization', `Bearer ${testerToken}`);

    assert.ok(adminList.body.data.projects.some((p) => p.id === project.id));
    assert.ok(devList.body.data.projects.some((p) => p.id === project.id));
    assert.ok(testerList.body.data.projects.every((p) => p.id !== project.id));
  });

  it('denies access to a project the user is not a member of', async () => {
    const project = await createProjectAs(adminToken, { name: 'Closed Project', key: 'CLOSED' });
    const testerToken = (await signIn('tester@bugboard.test', 'Password123!')).token;

    const response = await request(app)
      .get(`/api/projects/${project.id}`)
      .set('Authorization', `Bearer ${testerToken}`);

    assert.equal(response.status, 403);
    assert.equal(response.body.error.code, 'PROJECT_ACCESS_DENIED');

    const adminResponse = await request(app)
      .get(`/api/projects/${project.id}`)
      .set('Authorization', `Bearer ${adminToken}`);
    assert.equal(adminResponse.status, 200);
  });

  it('lets an admin update a project but blocks developers', async () => {
    const project = await createProjectAs(adminToken, { name: 'Updatable', key: 'UPD' });

    const forbidden = await request(app)
      .patch(`/api/projects/${project.id}`)
      .set('Authorization', `Bearer ${developerToken}`)
      .send({ name: 'No Access' });
    assert.equal(forbidden.status, 403);

    const response = await request(app)
      .patch(`/api/projects/${project.id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Updated Name' });

    assert.equal(response.status, 200);
    assert.equal(response.body.data.project.name, 'Updated Name');
  });

  it('adds and removes members', async () => {
    const project = await createProjectAs(adminToken, { name: 'Member Ops', key: 'MOPS' });

    const addResponse = await request(app)
      .post(`/api/projects/${project.id}/members`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ members: [developer.id, tester.id] });
    assert.equal(addResponse.status, 200);
    assert.equal(addResponse.body.data.project.memberCount, 3);

    const removeResponse = await request(app)
      .delete(`/api/projects/${project.id}/members/${tester.id}`)
      .set('Authorization', `Bearer ${adminToken}`);
    assert.equal(removeResponse.status, 200);
    assert.equal(removeResponse.body.data.project.memberCount, 2);
    assert.ok(!removeResponse.body.data.project.members.some((member) => member.id === tester.id));
  });

  it('returns 404 when removing a non-member', async () => {
    const project = await createProjectAs(adminToken, { name: 'Remove Trap', key: 'RT' });
    const response = await request(app)
      .delete(`/api/projects/${project.id}/members/${tester.id}`)
      .set('Authorization', `Bearer ${adminToken}`);

    assert.equal(response.status, 404);
  });
});