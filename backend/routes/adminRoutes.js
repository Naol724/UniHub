// backend/routes/adminRoutes.js
import express from 'express';
import {
  getDashboardStats,
  getAllUsers,
  getAllHouses,
  updateUserStatus,
  updateHouseStatus,
  deleteUser,
  deleteHouse,
  getAnalytics,
  sendNotification
} from '../controllers/adminController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// All admin routes require authentication and admin role
router.use(protect);
router.use(authorize('admin'));

// Dashboard routes
router.get('/dashboard/stats', getDashboardStats);
router.get('/analytics', getAnalytics);

// User management routes
router.get('/users', getAllUsers);
router.patch('/users/:id/status', updateUserStatus);
router.delete('/users/:id', deleteUser);

// House management routes
router.get('/houses', getAllHouses);
router.patch('/houses/:id/status', updateHouseStatus);
router.delete('/houses/:id', deleteHouse);

// Notification routes
router.post('/notifications', sendNotification);

export default router;
