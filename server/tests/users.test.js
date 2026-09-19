import assert from 'node:assert/strict';
import { after, before, beforeEach, describe, it } from 'node:test';
import request from 'supertest';
import { app, clearDatabase, createUser, signIn, startTestDb, stopTestDb } from './helpers.js';

describe('Users', () => {
  let adminToken;
  let devToken;

  before(startTestDb);

  beforeEach(async () => {
    await clearDatabase();
    await createUser({ name: 'Admin', email: 'admin@bugboard.test', role: 'ADMIN' });
    await createUser({ name: 'Dev', email: 'dev@bugboard.test', role: 'DEVELOPER' });
    await createUser({ name: 'Tester', email: 'tester@bugboard.test', role: 'TESTER' });
    adminToken = (await signIn('admin@bugboard.test', 'Password123!')).token;
    devToken = (await signIn('dev@bugboard.test', 'Password123!')).token;
  });

  after(stopTestDb);

  it('lists users for administrators', async () => {
    const response = await request(app).get('/api/users').set('Authorization', `Bearer ${adminToken}`);
    assert.equal(response.status, 200);
    assert.equal(response.body.data.users.length, 3);
    assert.ok(response.body.data.users.every((user) => user.password === undefined));
  });

  it('blocks developers from listing users', async () => {
    const response = await request(app).get('/api/users').set('Authorization', `Bearer ${devToken}`);
    assert.equal(response.status, 403);
  });

  it('requires authentication', async () => {
    const response = await request(app).get('/api/users');
    assert.equal(response.status, 401);
  });
});