import httpClient from './httpClient';

export async function apiListProjects() {
  const { data } = await httpClient.get('/projects');
  return data.data;
}

export async function apiGetProject(projectId) {
  const { data } = await httpClient.get(`/projects/${projectId}`);
  return data.data;
}

export async function apiCreateProject(payload) {
  const { data } = await httpClient.post('/projects', payload);
  return data.data;
}

export async function apiUpdateProject(projectId, payload) {
  const { data } = await httpClient.patch(`/projects/${projectId}`, payload);
  return data.data;
}

export async function apiAddMembers(projectId, memberIds) {
  const { data } = await httpClient.post(`/projects/${projectId}/members`, { members: memberIds });
  return data.data;
}

export async function apiRemoveMember(projectId, userId) {
  const { data } = await httpClient.delete(`/projects/${projectId}/members/${userId}`);
  return data.data;
}