const express = require('express');
const {
  getUserNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification
} = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// All routes require authentication
router.use(protect);

// Notification routes
router.get('/', getUserNotifications); // Get all notifications for current user
router.get('/unread-count', getUnreadCount); // Get unread notifications count
router.patch('/:id/read', markAsRead); // Mark single notification as read
router.patch('/read-all', markAllAsRead); // Mark all notifications as read
router.delete('/:id', deleteNotification); // Delete a notification

module.exports = router;