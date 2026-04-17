// frontend/src/services/notificationService.js
import API from "./api";

// Get all notifications for current user
export const getNotifications = async (filters = {}) => {
  const res = await API.get("/notifications", { params: filters });
  return res.data;
};

// Get unread notifications
export const getUnreadNotifications = async (limit = 50) => {
  const res = await API.get("/notifications/unread", { params: { limit } });
  return res.data;
};

// Mark notification as read
export const markNotificationAsRead = async (notificationId) => {
  const res = await API.patch(`/notifications/${notificationId}/read`);
  return res.data;
};

// Mark notification as unread
export const markNotificationAsUnread = async (notificationId) => {
  const res = await API.patch(`/notifications/${notificationId}/unread`);
  return res.data;
};

// Mark all notifications as read
export const markAllNotificationsAsRead = async () => {
  const res = await API.patch("/notifications/read-all");
  return res.data;
};

// Delete notification
export const deleteNotification = async (notificationId) => {
  const res = await API.delete(`/notifications/${notificationId}`);
  return res.data;
};

// Get unread count
export const getUnreadCount = async () => {
  const res = await API.get("/notifications/unread-count");
  return res.data;
};

// Get notification statistics
export const getNotificationStats = async () => {
  const res = await API.get("/notifications/stats");
  return res.data;
};

// Search notifications
export const searchNotifications = async (searchTerm, filters = {}) => {
  const res = await API.get("/notifications/search", {
    params: { q: searchTerm, ...filters }
  });
  return res.data;
};

// Get notifications by type
export const getNotificationsByType = async (type, filters = {}) => {
  const res = await API.get(`/notifications/type/${type}`, { params: filters });
  return res.data;
};

// Get notifications by category
export const getNotificationsByCategory = async (category, filters = {}) => {
  const res = await API.get(`/notifications/category/${category}`, { params: filters });
  return res.data;
};

// Create notification (for system use)
export const createNotification = async (notificationData) => {
  const res = await API.post("/notifications", notificationData);
  return res.data;
};

// Bulk create notifications
export const createBulkNotifications = async (notificationsData) => {
  const res = await API.post("/notifications/bulk", { notifications: notificationsData });
  return res.data;
};

// Get notification preferences
export const getNotificationPreferences = async () => {
  const res = await API.get("/notifications/preferences");
  return res.data;
};

// Update notification preferences
export const updateNotificationPreferences = async (preferences) => {
  const res = await API.put("/notifications/preferences", preferences);
  return res.data;
};

// Test notification (for development)
export const testNotification = async (type) => {
  const res = await API.post("/notifications/test", { type });
  return res.data;
};
