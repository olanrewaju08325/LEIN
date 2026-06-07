import axios from 'axios';
import { getToken } from './auth';

const api = axios.create({
  baseURL: 'http://localhost:8000',
  timeout: 4000,
});

api.interceptors.request.use((config) => {
  const protectedPostPaths = ['/incidents', '/assign', '/resolve'];
  const method = String(config.method || '').toLowerCase();
  const url = String(config.url || '').split('?')[0];
  const token = getToken();

  if (method === 'post' && protectedPostPaths.includes(url) && token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK' || !error.response) {
      console.warn('[LEIN] Backend offline - using mock data fallback');
    }
    return Promise.reject(error);
  }
);

export default api;
