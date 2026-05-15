import axios from 'axios';
import { getApiBaseUrl } from './config/runtime.js';

const api = axios.create({
  baseURL: getApiBaseUrl(),
  withCredentials: true,
});

// Add a request interceptor to attach the JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (err) => Promise.reject(err));

export default api;