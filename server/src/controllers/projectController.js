import asyncHandler from '../utils/asyncHandler.js';
import { serializeProject } from '../utils/serializers.js';
import * as projectService from '../services/projectService.js';
import {
  validateAddMembers,
  validateCreateProject,
  validateUpdateProject,
} from '../validators/projectValidator.js';

export const listProjects = asyncHandler(async (request, response) => {
  const projects = await projectService.listProjectsForUser(request.user);
  response.json({ success: true, data: { projects: projects.map(serializeProject) } });
});

export const getProject = asyncHandler(async (request, response) => {
  const project = await projectService.getProjectForUser(request.user, request.params.projectId);
  response.json({ success: true, data: { project: serializeProject(project) } });
});

export const createProject = asyncHandler(async (request, response) => {
  const input = validateCreateProject(request.body);
  const project = await projectService.createProject(request.user, input);
  response.status(201).json({ success: true, data: { project: serializeProject(project) } });
});

export const updateProject = asyncHandler(async (request, response) => {
  const updates = validateUpdateProject(request.body);
  const project = await projectService.updateProject(request.user, request.params.projectId, updates);
  response.json({ success: true, data: { project: serializeProject(project) } });
});

export const addMembers = asyncHandler(async (request, response) => {
  const memberIds = validateAddMembers(request.body);
  const project = await projectService.addProjectMembers(request.user, request.params.projectId, memberIds);
  response.json({ success: true, data: { project: serializeProject(project) } });
});

export const removeMember = asyncHandler(async (request, response) => {
  const project = await projectService.removeProjectMember(
    request.user,
    request.params.projectId,
    request.params.userId,
  );
  response.json({ success: true, data: { project: serializeProject(project) } });
});