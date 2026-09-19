import assert from 'node:assert/strict';
import { after, before, beforeEach, describe, it } from 'node:test';
import request from 'supertest';
import { app, clearDatabase, createProjectAs, createUser, signIn, startTestDb, stopTestDb } from './helpers.js';

describe('Comments', () => {
  let adminToken;
  let devToken;
  let testerToken;
  let outsiderToken;
  let projectId;

  before(startTestDb);

  beforeEach(async () => {
    await clearDatabase();
    await createUser({ name: 'Admin', email: 'admin@bugboard.test', role: 'ADMIN' });
    const developer = await createUser({ name: 'Dev', email: 'dev@bugboard.test', role: 'DEVELOPER' });
    const tester = await createUser({ name: 'Tester', email: 'tester@bugboard.test', role: 'TESTER' });
    const outsider = await createUser({ name: 'Outsider', email: 'outsider@bugboard.test', role: 'DEVELOPER' });
    adminToken = (await signIn('admin@bugboard.test', 'Password123!')).token;
    devToken = (await signIn('dev@bugboard.test', 'Password123!')).token;
    testerToken = (await signIn('tester@bugboard.test', 'Password123!')).token;
    outsiderToken = (await signIn('outsider@bugboard.test', 'Password123!')).token;

    const project = await createProjectAs(adminToken, { name: 'Comments Core', key: 'COM' });
    await request(app)
      .post(`/api/projects/${project.id}/members`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ members: [developer.id, tester.id] });
    projectId = project.id;
  });

  after(stopTestDb);

  async function createIssue(token, overrides) {
    const response = await request(app)
      .post('/api/issues')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Comment subject bug',
        description: 'Used for comment tests.',
        severity: 'MEDIUM',
        priority: 'HIGH',
        project: projectId,
        ...overrides,
      });
    assert.equal(response.status, 201, JSON.stringify(response.body));
    return response.body.data.issue;
  }

  it('lets a project member add a comment and reads it back with author and timestamp', async () => {
    const issue = await createIssue(testerToken);

    const add = await request(app)
      .post(`/api/issues/${issue.id}/comments`)
      .set('Authorization', `Bearer ${testerToken}`)
      .send({ content: 'Reproduced on mobile devices.' });

    assert.equal(add.status, 201);
    assert.equal(add.body.data.comment.author.email, 'tester@bugboard.test');
    assert.equal(add.body.data.comment.content, 'Reproduced on mobile devices.');
    assert.ok(add.body.data.comment.createdAt);

    const list = await request(app).get(`/api/issues/${issue.id}/comments`).set('Authorization', `Bearer ${devToken}`);
    assert.equal(list.status, 200);
    assert.equal(list.body.data.comments.length, 1);
    assert.equal(list.body.data.comments[0].author.name, 'Tester');
    assert.ok(list.body.data.comments[0].createdAt);
  });

  it('returns comments newest first', async () => {
    const issue = await createIssue(devToken);
    await request(app)
      .post(`/api/issues/${issue.id}/comments`)
      .set('Authorization', `Bearer ${devToken}`)
      .send({ content: 'First comment' });
    await request(app)
      .post(`/api/issues/${issue.id}/comments`)
      .set('Authorization', `Bearer ${devToken}`)
      .send({ content: 'Second comment' });

    const list = await request(app).get(`/api/issues/${issue.id}/comments`).set('Authorization', `Bearer ${devToken}`);
    assert.equal(list.body.data.comments[0].content, 'Second comment');
  });

  it('rejects comments from a non-member with 403', async () => {
    const issue = await createIssue(testerToken);
    const response = await request(app)
      .post(`/api/issues/${issue.id}/comments`)
      .set('Authorization', `Bearer ${outsiderToken}`)
      .send({ content: 'Should not post.' });

    assert.equal(response.status, 403);
  });

  it('rejects empty comment content', async () => {
    const issue = await createIssue(testerToken);
    const response = await request(app)
      .post(`/api/issues/${issue.id}/comments`)
      .set('Authorization', `Bearer ${testerToken}`)
      .send({ content: '   ' });

    assert.equal(response.status, 422);
  });
});