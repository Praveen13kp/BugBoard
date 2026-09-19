import Project from '../models/Project.js';
import User from '../models/User.js';
import AppError from '../utils/AppError.js';
import { findProjectForUser, projectsAccessibleBy } from './accessService.js';

const MEMBER_USER_FIELDS = 'name email role';

async function resolveValidMemberIds(memberIds) {
  if (!memberIds.length) return [];

  const users = await User.find({ _id: { $in: memberIds } }).select('_id');
  const found = new Set(users.map((user) => String(user._id)));
  const missing = memberIds.filter((id) => !found.has(id));

  if (missing.length) {
    throw new AppError('One or more member identifiers do not match any user.', 422, 'INVALID_MEMBER');
  }

  return memberIds;
}

function populateQuery(query) {
  return query.populate('members', MEMBER_USER_FIELDS).populate('createdBy', MEMBER_USER_FIELDS);
}

async function populateDocument(document) {
  await document.populate('members', MEMBER_USER_FIELDS);
  await document.populate('createdBy', MEMBER_USER_FIELDS);
  return document;
}

export async function listProjectsForUser(user) {
  return populateQuery(Project.find(projectsAccessibleBy(user)).sort({ createdAt: -1 }));
}

export async function createProject(user, { name, key, description, memberIds }) {
  const existing = await Project.findOne({ key });
  if (existing) {
    throw new AppError('A project with this key already exists.', 409, 'PROJECT_KEY_IN_USE');
  }

  const validMemberIds = await resolveValidMemberIds(memberIds);
  const members = [...new Set([user.id, ...validMemberIds])];
  const created = await Project.create({ name, key, description, members, createdBy: user.id });
  return populateDocument(created);
}

export async function getProjectForUser(user, projectId) {
  const project = await findProjectForUser(user, projectId);
  return populateQuery(Project.findById(project._id));
}

export async function updateProject(user, projectId, updates) {
  const project = await findProjectForUser(user, projectId);

  if (updates.name !== undefined) project.name = updates.name;
  if (updates.description !== undefined) project.description = updates.description;
  if (updates.key !== undefined) {
    const duplicate = await Project.findOne({ key: updates.key, _id: { $ne: project._id } });
    if (duplicate) {
      throw new AppError('A project with this key already exists.', 409, 'PROJECT_KEY_IN_USE');
    }
    project.key = updates.key;
  }

  await project.save();
  return populateQuery(Project.findById(project._id));
}

export async function addProjectMembers(user, projectId, memberIds) {
  const project = await findProjectForUser(user, projectId);
  const validMemberIds = await resolveValidMemberIds(memberIds);

  const added = [];
  const already = [];

  for (const memberId of validMemberIds) {
    if (project.members.some((id) => String(id) === memberId)) {
      already.push(memberId);
    } else {
      project.members.push(memberId);
      added.push(memberId);
    }
  }

  if (added.length) await project.save();
  return populateQuery(Project.findById(project._id));
}

export async function removeProjectMember(user, projectId, userId) {
  const project = await findProjectForUser(user, projectId);

  if (!project.members.some((id) => String(id) === String(userId))) {
    throw new AppError('The specified user is not a member of this project.', 404, 'MEMBER_NOT_FOUND');
  }

  project.members = project.members.filter((id) => String(id) !== String(userId));
  await project.save();
  return populateQuery(Project.findById(project._id));
}