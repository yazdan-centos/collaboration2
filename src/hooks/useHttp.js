import axios from 'axios';
import { getStoredAccessToken } from '../context/AuthContext';
import { normalizeApiError } from '../utils/apiError';

const http = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080',
  timeout: 15000,
});

http.interceptors.request.use((config) => {
  const token = getStoredAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  } else if (config.headers?.Authorization) {
    delete config.headers.Authorization;
  }
  return config;
});

http.interceptors.response.use(
  (response) => response,
  (error) => {
    const normalized = normalizeApiError(error);
    if (normalized.status === 401) window.dispatchEvent(new CustomEvent('auth:expired'));
    return Promise.reject(normalized);
  },
);

export default function useHttp() {
  return http;
}

export { http };
