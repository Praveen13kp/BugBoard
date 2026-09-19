import httpClient from './httpClient';

export async function apiListIssues(params = {}) {
  const { data } = await httpClient.get('/issues', { params });
  return data.data;
}

export async function apiGetIssue(issueId) {
  const { data } = await httpClient.get(`/issues/${issueId}`);
  return data.data;
}

export async function apiCreateIssue(payload) {
  const { data } = await httpClient.post('/issues', payload);
  return data.data;
}

export async function apiUpdateIssue(issueId, payload) {
  const { data } = await httpClient.patch(`/issues/${issueId}`, payload);
  return data.data;
}

export async function apiChangeStatus(issueId, status) {
  const { data } = await httpClient.patch(`/issues/${issueId}/status`, { status });
  return data.data;
}

export async function apiChangeAssignee(issueId, assignee) {
  const { data } = await httpClient.patch(`/issues/${issueId}/assignee`, { assignee });
  return data.data;
}