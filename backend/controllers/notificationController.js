import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import Notification from '../models/Notification.js';

const userIdOf = (req) => req.user.id || req.user._id;

const getUserNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ recipient: userIdOf(req) })
    .sort({ createdAt: -1 });

  res.status(200).json({ success: true, data: notifications });
});

const getUnreadCount = asyncHandler(async (req, res) => {
  const count = await Notification.countDocuments({
    recipient: userIdOf(req),
    isRead: false,
  });
  res.status(200).json({ success: true, count });
});

const markAsRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findById(req.params.id);
  if (!notification) throw new ApiError(404, 'Notification not found');
  if (notification.recipient.toString() !== userIdOf(req).toString()) {
    throw new ApiError(403, 'Access denied. You can only modify your own notifications');
  }
  notification.isRead = true;
  await notification.save();
  res.status(200).json({ success: true, message: 'Notification marked as read', data: notification });
});

const markAllAsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany(
    { recipient: userIdOf(req), isRead: false },
    { isRead: true }
  );
  res.status(200).json({ success: true, message: 'All notifications marked as read' });
});

const deleteNotification = asyncHandler(async (req, res) => {
  const notification = await Notification.findById(req.params.id);
  if (!notification) throw new ApiError(404, 'Notification not found');
  if (notification.recipient.toString() !== userIdOf(req).toString()) {
    throw new ApiError(403, 'Access denied. You can only delete your own notifications');
  }
  await Notification.findByIdAndDelete(req.params.id);
  res.status(200).json({ success: true, message: 'Notification deleted successfully' });
});

export {
  getUserNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
};
