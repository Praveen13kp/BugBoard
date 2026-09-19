import assert from 'node:assert/strict';
import { after, before, beforeEach, describe, it } from 'node:test';
import request from 'supertest';
import Activity from '../src/models/Activity.js';
import Comment from '../src/models/Comment.js';
import Issue from '../src/models/Issue.js';
import Project from '../src/models/Project.js';
import User from '../src/models/User.js';
import { runSeed, SEED_PASSWORD } from '../src/seed/seed.js';
import { app, clearDatabase, signIn, startTestDb, stopTestDb } from './helpers.js';

async function counts() {
  return {
    users: await User.countDocuments({}),
    projects: await Project.countDocuments({}),
    issues: await Issue.countDocuments({}),
    comments: await Comment.countDocuments({}),
    activities: await Activity.countDocuments({}),
  };
}

describe('Seed data', () => {
  before(startTestDb);
  beforeEach(clearDatabase);
  after(stopTestDb);

  it('creates demo users, projects, issues, comments, and activities', async () => {
    const stats = await runSeed();

    assert.equal(stats.users, 4);
    assert.equal(stats.projects, 3);
    assert.equal(stats.issues, 10);
    assert.ok(stats.comments >= 2);
    assert.ok(stats.activities >= stats.issues);

    const after = await counts();
    assert.equal(after.users, 4);
    assert.equal(after.projects, 3);
    assert.equal(after.issues, 10);

    const admin = await User.findOne({ email: 'admin@bugboard.dev' });
    assert.equal(admin.role, 'ADMIN');

    const openIssues = await Issue.countDocuments({ status: 'OPEN' });
    assert.ok(openIssues > 0);
  });

  it('provisions accounts that can sign in with the documented password', async () => {
    await runSeed();

    const session = await signIn('admin@bugboard.dev', SEED_PASSWORD);
    assert.ok(session.token);
    assert.equal(session.user.role, 'ADMIN');

    const response = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${session.token}`);
    assert.equal(response.status, 200);
  });

  it('is idempotent across repeated runs', async () => {
    await runSeed();
    const before = await counts();

    const rerun = await runSeed();

    assert.equal(rerun.users, 0);
    assert.equal(rerun.projects, 0);
    assert.equal(rerun.issues, 0);
    assert.equal(rerun.comments, 0);
    assert.equal(rerun.activities, 0);

    const after = await counts();
    assert.deepEqual(after, before);
  });
});