// frontend/src/API/Axios.js
// Legacy Axios instance kept for admin panel compatibility.
// No forced redirects on 401 for normal user paths.
import axios from 'axios';
import { getLocal } from '../utils/storage';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const API = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

API.interceptors.request.use((config) => {
  const adminToken = localStorage.getItem('UniHub-Admin-Token');
  const userToken = getLocal('token');
  if (adminToken) config.headers.Authorization = adminToken;
  else if (userToken) config.headers.Authorization = `Bearer ${userToken}`;
  return config;
});

API.interceptors.response.use(
  (res) => res,
  (err) => {
    // Only redirect admin paths on 401 — never redirect normal users
    if (err.response?.status === 401 && window.location.pathname.startsWith('/admin')) {
      localStorage.removeItem('UniHub-Admin-Token');
      localStorage.removeItem('UniHub-Admin');
      window.location.href = '/admin/login';
    }
    return Promise.reject(err);
  }
);

// Named API helpers (kept for backward compatibility)
export const teamAPI = {
  createTeam: (data) => API.post('/teams', data),
  getTeams: (userID) => API.get(`/teams${userID ? `?userID=${userID}` : ''}`),
  getTeamById: (id) => API.get(`/teams/${id}`),
  updateTeam: (id, data) => API.put(`/teams/${id}`, data),
  deleteTeam: (id, data) => API.delete(`/teams/${id}`, { data }),
  addMember: (id, data) => API.post(`/teams/${id}/members`, data),
  removeMember: (id, memberId, data) => API.delete(`/teams/${id}/members/${memberId}`, { data }),
  getTeamMembers: (id) => API.get(`/teams/${id}/members`),
  updateMemberRole: (id, memberId, data) => API.put(`/teams/${id}/members/${memberId}/role`, data),
  getTeamChatRoom: (id) => API.get(`/teams/${id}/chat-room`),
  getTeamMessages: (id, limit = 100) => API.get(`/teams/${id}/messages?limit=${limit}`),
};

export const taskAPI = {
  createTask: (data) => API.post('/tasks', data),
  getTasks: (userID) => API.get(`/tasks${userID ? `?userID=${userID}` : ''}`),
  getTaskById: (id) => API.get(`/tasks/${id}`),
  updateTask: (id, data) => API.put(`/tasks/${id}`, data),
  deleteTask: (id) => API.delete(`/tasks/${id}`),
  getTeamTasks: (teamId) => API.get(`/tasks/team/${teamId}`),
  getUserTasks: (userId) => API.get(`/tasks/user/${userId}`),
};

export const userAPI = {
  register: (data) => API.post('/user/register', data),
  login: (data) => API.post('/user/login', data),
  getProfile: (userId) => API.get(`/user/profile/${userId}`),
  updateProfile: (userId, data) => API.put(`/user/profile/${userId}`, data),
  getAllUsers: () => API.get('/users'),
  searchUsers: (search) => API.get(`/users/search?search=${search}`),
};

export const adminAPI = {
  login: (data) => API.post('/admin/login', data),
  register: (data) => API.post('/admin/register', data),
  getProfile: () => API.get('/admin/profile'),
  updateProfile: (data) => API.put('/admin/profile', data),
  getAllAdmins: () => API.get('/admin/all'),
  updateAdminRole: (id, data) => API.put(`/admin/${id}/role`, data),
  deleteAdmin: (id) => API.delete(`/admin/${id}`),
  changePassword: (data) => API.post('/admin/change-password', data),
};

export default API;
