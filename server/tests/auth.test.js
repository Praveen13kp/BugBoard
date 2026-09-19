import assert from 'node:assert/strict';
import { after, before, beforeEach, describe, it } from 'node:test';
import request from 'supertest';
import { app, clearDatabase, signIn, startTestDb, stopTestDb } from './helpers.js';

describe('Authentication', () => {
  before(startTestDb);
  beforeEach(clearDatabase);
  after(stopTestDb);

  it('registers a developer account and returns a token', async () => {
    const response = await request(app).post('/api/auth/register').send({
      name: 'Alice Dev',
      email: 'alice@bugboard.test',
      password: 'Password123!',
      role: 'DEVELOPER',
    });

    assert.equal(response.status, 201);
    assert.equal(response.body.success, true);
    assert.equal(response.body.data.user.role, 'DEVELOPER');
    assert.ok(response.body.data.token);
    assert.equal(response.body.data.user.password, undefined);
  });

  it('defaults to the tester role for public registration', async () => {
    const response = await request(app).post('/api/auth/register').send({
      name: 'Tester One',
      email: 'tester@bugboard.test',
      password: 'Password123!',
    });

    assert.equal(response.status, 201);
    assert.equal(response.body.data.user.role, 'TESTER');
  });

  it('rejects public registration of an administrator', async () => {
    const response = await request(app).post('/api/auth/register').send({
      name: 'Rogue Admin',
      email: 'rogue@bugboard.test',
      password: 'Password123!',
      role: 'ADMIN',
    });

    assert.equal(response.status, 403);
  });

  it('rejects a duplicate email with 409', async () => {
    await request(app).post('/api/auth/register').send({
      name: 'Dup User',
      email: 'dup@bugboard.test',
      password: 'Password123!',
      role: 'DEVELOPER',
    });

    const response = await request(app).post('/api/auth/register').send({
      name: 'Dup User Two',
      email: 'dup@bugboard.test',
      password: 'Password123!',
      role: 'DEVELOPER',
    });

    assert.equal(response.status, 409);
  });

  it('logs in with valid credentials', async () => {
    await request(app).post('/api/auth/register').send({
      name: 'Login User',
      email: 'login@bugboard.test',
      password: 'Password123!',
      role: 'DEVELOPER',
    });

    const response = await request(app).post('/api/auth/login').send({
      email: 'login@bugboard.test',
      password: 'Password123!',
    });

    assert.equal(response.status, 200);
    assert.ok(response.body.data.token);
  });

  it('rejects invalid credentials with 401', async () => {
    const response = await request(app).post('/api/auth/login').send({
      email: 'nobody@bugboard.test',
      password: 'WrongPassword',
    });

    assert.equal(response.status, 401);
    assert.equal(response.body.error.code, 'INVALID_CREDENTIALS');
  });

  it('rejects malformed login input with 422', async () => {
    const response = await request(app).post('/api/auth/login').send({ email: 'not-an-email', password: 'pw' });
    assert.equal(response.status, 422);
  });

  it('returns the current user from /me', async () => {
    const { token } = await (async () => {
      await request(app).post('/api/auth/register').send({
        name: 'Me User',
        email: 'me@bugboard.test',
        password: 'Password123!',
        role: 'TESTER',
      });
      return signIn('me@bugboard.test', 'Password123!');
    })();

    const response = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${token}`);
    assert.equal(response.status, 200);
    assert.equal(response.body.data.user.email, 'me@bugboard.test');
  });

  it('requires a token for /me', async () => {
    const response = await request(app).get('/api/auth/me');
    assert.equal(response.status, 401);
  });

  it('rejects an invalid token with 401', async () => {
    const response = await request(app).get('/api/auth/me').set('Authorization', 'Bearer not-a-real-token');
    assert.equal(response.status, 401);
    assert.equal(response.body.error.code, 'INVALID_TOKEN');
  });
});