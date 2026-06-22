import axios from 'axios';

const BASE_URL = 'https://muwandb-server-production.up.railway.app';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
});

export const authAPI = {
  register: (username, password, dbName) =>
    api.post('/auth/register', { username, password, dbName }),
  login: (username, password) =>
    api.post('/auth/login', { username, password }),
  refreshKeys: (username, password) =>
    api.post('/auth/refresh-keys', { username, password }, { headers: { 'x-source': 'app' } }),
  changePassword: (username, oldPassword, newPassword, secretKey) =>
    api.post('/auth/change-password', { username, oldPassword, newPassword, secretKey }),
  setRLS: (username, table, rule, secretKey) =>
    api.post('/auth/rls', { username, table, rule }, { headers: { 'x-secret-key': secretKey } }),
  getRLS: (username, secretKey) =>
    api.get('/auth/rls', { params: { username }, headers: { 'x-secret-key': secretKey } }),
  deleteAccount: (username, password) =>
    api.delete('/auth/delete', { data: { username, password } }),
};

export const queryAPI = {
  raw: (mql, apiKey, dbPassword) =>
    api.post('/query/raw', { query: mql, dbPassword }, { headers: { 'x-api-key': apiKey } }),
};

export default api;
