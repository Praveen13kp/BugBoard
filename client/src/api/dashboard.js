import httpClient from './httpClient';

export async function apiGetStats() {
  const { data } = await httpClient.get('/dashboard');
  return data.data;
}