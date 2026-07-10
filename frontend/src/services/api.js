// frontend/src/services/api.js
import axios from 'axios';
import { getLocal } from '../utils/storage';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

API.interceptors.request.use((config) => {
  let token = getLocal('token');
  if (token) {
    // Avoid "Bearer Bearer <jwt>" if a prefixed token was stored
    if (typeof token === 'string' && token.startsWith('Bearer ')) {
      token = token.slice(7).trim();
    }
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

API.interceptors.response.use(
  (res) => res,
  (err) => Promise.reject(err)
);

export default API;
