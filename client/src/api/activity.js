import httpClient from './httpClient';

export async function apiListActivity(issueId) {
  const { data } = await httpClient.get(`/issues/${issueId}/activity`);
  return data.data;
}