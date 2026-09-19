import bcrypt from 'bcryptjs';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import request from 'supertest';
import app from '../src/app.js';
import Activity from '../src/models/Activity.js';
import Comment from '../src/models/Comment.js';
import Issue from '../src/models/Issue.js';
import Project from '../src/models/Project.js';
import User from '../src/models/User.js';

let mongod;

export { app };

export async function startTestDb() {
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());
}

export async function stopTestDb() {
  await mongoose.disconnect();
  if (mongod) await mongod.stop();
}

export async function clearDatabase() {
  await Promise.all([User, Project, Issue, Comment, Activity].map((model) => model.deleteMany({})));
}

export async function createUser(overrides = {}) {
  const data = {
    name: 'Test Account',
    email: 'test@bugboard.test',
    password: 'Password123!',
    role: 'DEVELOPER',
    ...overrides,
  };

  const passwordHash = await bcrypt.hash(data.password, 4);
  return User.create({ name: data.name, email: data.email, passwordHash, role: data.role });
}

export async function signIn(email, password) {
  const response = await request(app).post('/api/auth/login').send({ email, password });
  if (response.status !== 200) {
    throw new Error(`signIn failed: ${response.status} ${JSON.stringify(response.body)}`);
  }

  return { token: response.body.data.token, user: response.body.data.user };
}

export async function createProjectAs(adminToken, payload = {}) {
  const body = { name: 'BugBoard Web', key: 'WEB', description: 'Web platform', ...payload };
  const response = await request(app).post('/api/projects').set('Authorization', `Bearer ${adminToken}`).send(body);
  if (response.status !== 201) {
    throw new Error(`createProject failed: ${response.status} ${JSON.stringify(response.body)}`);
  }

  return response.body.data.project;
}