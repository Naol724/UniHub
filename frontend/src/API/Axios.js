// frontend/src/API/Axios.js
import axios from "axios";
import { getLocal, removeLocal } from "../utils/storage";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const API = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor - Add token to all requests
API.interceptors.request.use(
  (config) => {
    // Get token from localStorage using the standard key
    const token = getLocal("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - Handle unauthorized responses
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear tokens and redirect to login
      removeLocal("token");
      removeLocal("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Team APIs
export const teamAPI = {
  createTeam: (data) => API.post("/teams", data),
  getTeams: (userID) => API.get(`/teams?userID=${userID}`),
  getTeamById: (teamId) => API.get(`/teams/${teamId}`),
  updateTeam: (teamId, data) => API.put(`/teams/${teamId}`, data),
  deleteTeam: (teamId, data) => API.delete(`/teams/${teamId}`, { data }),
  addMember: (teamId, data) => API.post(`/teams/${teamId}/members`, data),
  removeMember: (teamId, memberId, data) => API.delete(`/teams/${teamId}/members/${memberId}`, { data }),
  getTeamMembers: (teamId) => API.get(`/teams/${teamId}/members`),
  updateMemberRole: (teamId, memberId, data) => API.put(`/teams/${teamId}/members/${memberId}/role`, data),
  getTeamChatRoom: (teamId) => API.get(`/teams/${teamId}/chat-room`),
  getTeamMessages: (teamId, limit = 100) => API.get(`/teams/${teamId}/messages?limit=${limit}`),
};

// Task APIs
export const taskAPI = {
  createTask: (data) => API.post("/tasks", data),
  getTasks: (userID) => API.get(`/tasks${userID ? `?userID=${userID}` : ''}`),
  getTaskById: (taskId) => API.get(`/tasks/${taskId}`),
  updateTask: (taskId, data) => API.put(`/tasks/${taskId}`, data),
  deleteTask: (taskId) => API.delete(`/tasks/${taskId}`),
  getTeamTasks: (teamId) => API.get(`/tasks/team/${teamId}`),
  getUserTasks: (userId) => API.get(`/tasks/user/${userId}`)
};

// User APIs
export const userAPI = {
  register: (data) => API.post("/auth/user/register", data),
  login: (data) => API.post("/auth/user/login", data),
  getProfile: (userId) => API.get(`/auth/profile/${userId}`),
  updateProfile: (userId, data) => API.put(`/auth/profile/${userId}`, data),
  getAllUsers: () => API.get("/auth/users"),
  searchUsers: (search) => API.get(`/auth/users/search?search=${search}`),
};

// Admin APIs
export const adminAPI = {
  login: (data) => API.post("/admin/login", data),
  register: (data) => API.post("/admin/register", data),
  getProfile: () => API.get("/admin/profile"),
  updateProfile: (data) => API.put("/admin/profile", data),
  getAllAdmins: () => API.get("/admin/all"),
  updateAdminRole: (adminId, data) => API.put(`/admin/${adminId}/role`, data),
  deleteAdmin: (adminId) => API.delete(`/admin/${adminId}`),
  changePassword: (data) => API.post("/admin/change-password", data),
};

export default API;
