import axios from 'axios';
const BASE_URL = 'https://muwandb-server.onrender.com'\;
const api = axios.create({ baseURL: BASE_URL, timeout: 15000 });
export const authAPI = {
  register: (username, password, dbName) => api.post('/auth/register', { username, password, dbName }),
  login: (username, password) => api.post('/auth/login', { username, password }),
  changePassword: (username, oldPassword, newPassword, secretKey) => api.post('/auth/change-password', { username, oldPassword, newPassword, secretKey }),
  setRLS: (username, table, rule, secretKey) => api.post('/auth/rls', { username, table, rule }, { headers: { 'x-secret-key': secretKey } }),
  getRLS: (username, secretKey) => api.get('/auth/rls', { params: { username }, headers: { 'x-secret-key': secretKey } }),
};
export const queryAPI = {
  raw: (mql, apiKey) => api.post('/query/raw', { query: mql }, { headers: { 'x-api-key': apiKey } }),
};
export default api;
