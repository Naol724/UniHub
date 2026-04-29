// backend/routes/settingsRoutes.js
import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import {
  getUserSettings,
  updateUserSettings,
  updateProfileSettings,
  updatePrivacySettings,
  updateNotificationSettings,
  updateAppearanceSettings,
  updateChatSettings,
  updateSecuritySettings,
  updateHouseListingSettings,
  uploadAvatar,
  deleteAvatar,
  getNotificationPreferences,
  checkNotificationPermission,
  resetSettings,
  exportUserData,
  deleteAccount
} from '../controllers/settingsController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Configure multer for avatar uploads
const uploadsDir = path.join(process.cwd(), 'uploads', 'avatars');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'avatar-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Accept only image files
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB limit
    files: 1 // Only one file
  }
});

// All settings routes require authentication
router.use(protect);

// General settings routes
router.get('/', getUserSettings);
router.put('/', updateUserSettings);

// Profile settings
router.put('/profile', updateProfileSettings);
router.post('/avatar', upload.single('avatar'), uploadAvatar);
router.delete('/avatar', deleteAvatar);

// Privacy settings
router.put('/privacy', updatePrivacySettings);

// Notification settings
router.put('/notifications', updateNotificationSettings);
router.get('/notifications/:type', getNotificationPreferences);
router.get('/notifications/check/:category', checkNotificationPermission);

// Appearance settings
router.put('/appearance', updateAppearanceSettings);

// Chat settings
router.put('/chat', updateChatSettings);

// Security settings
router.put('/security', updateSecuritySettings);

// House listing settings
router.put('/house-listings', updateHouseListingSettings);

// Data management
router.post('/reset', resetSettings);
router.get('/export-data', exportUserData);
router.delete('/delete-account', deleteAccount);

export default router;
