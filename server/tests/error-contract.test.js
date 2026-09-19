import assert from 'node:assert/strict';
import { after, before, beforeEach, describe, it } from 'node:test';
import request from 'supertest';
import { app, clearDatabase, createUser, signIn, startTestDb, stopTestDb } from './helpers.js';

function assertErrorContract(response, expectedStatus, expectedCode) {
  assert.equal(response.status, expectedStatus);
  assert.equal(response.body.success, false);
  assert.equal(typeof response.body.error.code, 'string');
  assert.equal(typeof response.body.error.message, 'string');
  assert.equal(response.body.error.code, expectedCode);
}

describe('Error contract', () => {
  let adminToken;

  before(startTestDb);

  beforeEach(async () => {
    await clearDatabase();
    await createUser({ name: 'Admin', email: 'admin@bugboard.test', role: 'ADMIN' });
    adminToken = (await signIn('admin@bugboard.test', 'Password123!')).token;
  });

  after(stopTestDb);

  it('returns a consistent not-found error for unknown routes', async () => {
    const response = await request(app).get('/api/does-not-exist');
    assertErrorContract(response, 404, 'NOT_FOUND');
  });

  it('returns a consistent 400 for malformed JSON bodies', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .set('Content-Type', 'application/json')
      .send('{"email": "broken');

    assertErrorContract(response, 400, 'INVALID_JSON');
  });

  it('maps invalid ObjectId values to validation errors', async () => {
    const response = await request(app)
      .get('/api/projects/not-an-object-id')
      .set('Authorization', `Bearer ${adminToken}`);
    assertErrorContract(response, 422, 'VALIDATION_ERROR');
  });

  it('maps missing authentication to a 401 contract', async () => {
    const response = await request(app).get('/api/issues');
    assertErrorContract(response, 401, 'AUTHENTICATION_REQUIRED');
  });

  it('maps authorization failures to a 403 contract', async () => {
    await createUser({ name: 'Dev', email: 'dev@bugboard.test', role: 'DEVELOPER' });
    const devToken = (await signIn('dev@bugboard.test', 'Password123!')).token;
    const response = await request(app).get('/api/users').set('Authorization', `Bearer ${devToken}`);
    assertErrorContract(response, 403, 'FORBIDDEN');
  });
});