// frontend/src/services/api.js
// Public-first API client — no forced redirects to login on 401.
// Token is attached when present; missing token just means the request
// goes out unauthenticated (public endpoints still work fine).
import axios from 'axios';
import { getLocal } from '../utils/storage';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// Attach token when available — silently skip when not logged in
API.interceptors.request.use((config) => {
  const token = getLocal('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Do NOT redirect on 401 — let the caller handle it
API.interceptors.response.use(
  (res) => res,
  (err) => Promise.reject(err)
);

export default API;
