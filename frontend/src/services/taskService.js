// frontend/src/services/taskService.js
import API from "./api";

// Get all tasks for a team
export const getTeamTasks = async (teamId, filters = {}) => {
  const res = await API.get(`/teams/${teamId}/tasks`, { params: filters });
  return res.data;
};

// Get tasks assigned to current user
export const getMyTasks = async (filters = {}) => {
  const res = await API.get("/tasks/my", { params: filters });
  return res.data;
};

// Get task by ID
export const getTaskById = async (taskId) => {
  const res = await API.get(`/tasks/${taskId}`);
  return res.data;
};

// Create new task
export const createTask = async (taskData) => {
  const res = await API.post("/tasks", taskData);
  return res.data;
};

// Update task
export const updateTask = async (taskId, taskData) => {
  const res = await API.put(`/tasks/${taskId}`, taskData);
  return res.data;
};

// Delete task
export const deleteTask = async (taskId) => {
  const res = await API.delete(`/tasks/${taskId}`);
  return res.data;
};

// Update task status
export const updateTaskStatus = async (taskId, status) => {
  const res = await API.patch(`/tasks/${taskId}/status`, { status });
  return res.data;
};

// Assign task to user
export const assignTask = async (taskId, assigneeId) => {
  const res = await API.patch(`/tasks/${taskId}/assign`, { assigneeId });
  return res.data;
};

// Add comment to task
export const addTaskComment = async (taskId, comment) => {
  const res = await API.post(`/tasks/${taskId}/comments`, { comment });
  return res.data;
};

// Update task comment
export const updateTaskComment = async (taskId, commentId, comment) => {
  const res = await API.put(`/tasks/${taskId}/comments/${commentId}`, { comment });
  return res.data;
};

// Delete task comment
export const deleteTaskComment = async (taskId, commentId) => {
  const res = await API.delete(`/tasks/${taskId}/comments/${commentId}`);
  return res.data;
};

// Add attachment to task
export const addTaskAttachment = async (taskId, formData) => {
  const res = await API.post(`/tasks/${taskId}/attachments`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return res.data;
};

// Remove attachment from task
export const removeTaskAttachment = async (taskId, attachmentId) => {
  const res = await API.delete(`/tasks/${taskId}/attachments/${attachmentId}`);
  return res.data;
};

// Get task statistics
export const getTaskStats = async (teamId) => {
  const res = await API.get(`/teams/${teamId}/tasks/stats`);
  return res.data;
};

// Get overdue tasks
export const getOverdueTasks = async (teamId) => {
  const res = await API.get(`/teams/${teamId}/tasks/overdue`);
  return res.data;
};

// Search tasks
export const searchTasks = async (teamId, searchTerm, filters = {}) => {
  const res = await API.get(`/teams/${teamId}/tasks/search`, { 
    params: { q: searchTerm, ...filters }
  });
  return res.data;
};
