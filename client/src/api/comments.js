import httpClient from './httpClient';

export async function apiListComments(issueId) {
  const { data } = await httpClient.get(`/issues/${issueId}/comments`);
  return data.data;
}

export async function apiAddComment(issueId, content) {
  const { data } = await httpClient.post(`/issues/${issueId}/comments`, { content });
  return data.data;
}