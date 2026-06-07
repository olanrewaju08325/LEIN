import axios from 'axios';
import { getToken } from './auth';

const api = axios.create({
  baseURL: 'http://localhost:8000',
  timeout: 4000,
});

api.interceptors.request.use((config) => {
  const token = getToken();

  if (token) {
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

export async function getMyIncidents() {
  const response = await api.get('/incidents/my');
  return response.data;
}

export async function getIncidentStatus(incidentId) {
  const response = await api.get(`/incidents/${incidentId}/status`);
  return response.data;
}

export async function trackIncident(incidentId) {
  const response = await api.post(`/incidents/${incidentId}/track`);
  return response.data;
}

export default api;
