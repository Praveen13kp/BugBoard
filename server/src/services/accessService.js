import AppError from '../utils/AppError.js';
import Project from '../models/Project.js';

export function isAdmin(user) {
  return user.role === 'ADMIN';
}

export function projectsAccessibleBy(user) {
  return isAdmin(user) ? {} : { members: user.id };
}

export function ensureProjectAccess(user, project) {
  if (isAdmin(user)) return;

  const isMember = (project.members || []).some((id) => String(id) === user.id);
  if (!isMember) {
    throw new AppError('You do not have access to this project.', 403, 'PROJECT_ACCESS_DENIED');
  }
}

export async function findProjectForUser(user, projectId) {
  const project = await Project.findById(projectId);
  if (!project) {
    throw new AppError('The requested project was not found.', 404, 'PROJECT_NOT_FOUND');
  }

  ensureProjectAccess(user, project);
  return project;
}