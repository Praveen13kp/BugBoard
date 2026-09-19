import httpClient from './httpClient';

export async function apiRegister(payload) {
  const { data } = await httpClient.post('/auth/register', payload);
  return data.data;
}

export async function apiLogin(payload) {
  const { data } = await httpClient.post('/auth/login', payload);
  return data.data;
}

export async function apiGetMe() {
  const { data } = await httpClient.get('/auth/me');
  return data.data;
}