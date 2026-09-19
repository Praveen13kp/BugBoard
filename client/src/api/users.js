import httpClient from './httpClient';

export async function apiListUsers() {
  const { data } = await httpClient.get('/users');
  return data.data;
}