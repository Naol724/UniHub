// backend/controllers/settingsController.js
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import Settings from '../models/Settings.js';
import User from '../models/User.js';
import fs from 'fs/promises';
import path from 'path';

// @desc    Get user's settings
// @route   GET /api/settings
// @access  Private
export const getUserSettings = asyncHandler(async (req, res) => {
  const settings = await Settings.getOrCreateSettings(req.user._id);
  
  res.status(200).json({
    success: true,
    data: settings
  });
});

// @desc    Update user's settings
// @route   PUT /api/settings
// @access  Private
export const updateUserSettings = asyncHandler(async (req, res) => {
  const settings = await Settings.getOrCreateSettings(req.user._id);
  
  const allowedSections = [
    'profile', 'privacy', 'notifications', 'appearance', 
    'chat', 'security', 'houseListings'
  ];
  
  const updates = {};
  
  // Only allow updating predefined sections
  allowedSections.forEach(section => {
    if (req.body[section]) {
      updates[section] = req.body[section];
    }
  });
  
  // Handle special cases
  if (req.body.profile) {
    // Update user's basic profile info in User model
    const user = await User.findById(req.user._id);
    if (user) {
      if (req.body.profile.firstName) user.first_name = req.body.profile.firstName;
      if (req.body.profile.lastName) user.last_name = req.body.profile.lastName;
      if (req.body.profile.phone) user.phone = req.body.profile.phone;
      await user.save();
    }
  }
  
  await settings.updateSettings(updates);
  
  res.status(200).json({
    success: true,
    message: 'Settings updated successfully',
    data: settings
  });
});

// @desc    Update profile settings
// @route   PUT /api/settings/profile
// @access  Private
export const updateProfileSettings = asyncHandler(async (req, res) => {
  const settings = await Settings.getOrCreateSettings(req.user._id);
  const user = await User.findById(req.user._id);
  
  if (!user) {
    throw new ApiError(404, 'User not found');
  }
  
  // Update user profile in User model
  const {
    firstName,
    lastName,
    bio,
    phone,
    location,
    website,
    socialLinks
  } = req.body;
  
  if (firstName) user.first_name = firstName;
  if (lastName) user.last_name = lastName;
  if (phone) user.phone = phone;
  
  await user.save();
  
  // Update settings profile
  const profileUpdates = {};
  if (bio !== undefined) profileUpdates.bio = bio;
  if (location !== undefined) profileUpdates.location = location;
  if (website !== undefined) profileUpdates.website = website;
  if (socialLinks !== undefined) profileUpdates.socialLinks = socialLinks;
  
  await settings.updateSettings({ profile: profileUpdates });
  
  res.status(200).json({
    success: true,
    message: 'Profile settings updated successfully',
    data: settings
  });
});

// @desc    Update privacy settings
// @route   PUT /api/settings/privacy
// @access  Private
export const updatePrivacySettings = asyncHandler(async (req, res) => {
  const settings = await Settings.getOrCreateSettings(req.user._id);
  
  await settings.updateSettings({ privacy: req.body });
  
  res.status(200).json({
    success: true,
    message: 'Privacy settings updated successfully',
    data: settings.privacy
  });
});

// @desc    Update notification settings
// @route   PUT /api/settings/notifications
// @access  Private
export const updateNotificationSettings = asyncHandler(async (req, res) => {
  const settings = await Settings.getOrCreateSettings(req.user._id);
  
  const allowedTypes = ['email', 'push', 'inApp'];
  const updates = {};
  
  allowedTypes.forEach(type => {
    if (req.body[type]) {
      updates[type] = req.body[type];
    }
  });
  
  await settings.updateSettings({ notifications: updates });
  
  res.status(200).json({
    success: true,
    message: 'Notification settings updated successfully',
    data: settings.notifications
  });
});

// @desc    Update appearance settings
// @route   PUT /api/settings/appearance
// @access  Private
export const updateAppearanceSettings = asyncHandler(async (req, res) => {
  const settings = await Settings.getOrCreateSettings(req.user._id);
  
  await settings.updateSettings({ appearance: req.body });
  
  res.status(200).json({
    success: true,
    message: 'Appearance settings updated successfully',
    data: settings.appearance
  });
});

// @desc    Update chat settings
// @route   PUT /api/settings/chat
// @access  Private
export const updateChatSettings = asyncHandler(async (req, res) => {
  const settings = await Settings.getOrCreateSettings(req.user._id);
  
  await settings.updateSettings({ chat: req.body });
  
  res.status(200).json({
    success: true,
    message: 'Chat settings updated successfully',
    data: settings.chat
  });
});

// @desc    Update security settings
// @route   PUT /api/settings/security
// @access  Private
export const updateSecuritySettings = asyncHandler(async (req, res) => {
  const settings = await Settings.getOrCreateSettings(req.user._id);
  
  const {
    twoFactorEnabled,
    loginAlerts,
    sessionTimeout,
    requirePasswordForSensitiveActions
  } = req.body;
  
  const securityUpdates = {};
  if (twoFactorEnabled !== undefined) securityUpdates.twoFactorEnabled = twoFactorEnabled;
  if (loginAlerts !== undefined) securityUpdates.loginAlerts = loginAlerts;
  if (sessionTimeout !== undefined) securityUpdates.sessionTimeout = sessionTimeout;
  if (requirePasswordForSensitiveActions !== undefined) {
    securityUpdates.requirePasswordForSensitiveActions = requirePasswordForSensitiveActions;
  }
  
  await settings.updateSettings({ security: securityUpdates });
  
  res.status(200).json({
    success: true,
    message: 'Security settings updated successfully',
    data: settings.security
  });
});

// @desc    Update house listing settings
// @route   PUT /api/settings/house-listings
// @access  Private
export const updateHouseListingSettings = asyncHandler(async (req, res) => {
  const settings = await Settings.getOrCreateSettings(req.user._id);
  
  await settings.updateSettings({ houseListings: req.body });
  
  res.status(200).json({
    success: true,
    message: 'House listing settings updated successfully',
    data: settings.houseListings
  });
});

// @desc    Upload avatar
// @route   POST /api/settings/avatar
// @access  Private
export const uploadAvatar = asyncHandler(async (req, res) => {
  const settings = await Settings.getOrCreateSettings(req.user._id);
  
  if (!req.file) {
    throw new ApiError(400, 'No file uploaded');
  }
  
  // Delete old avatar if exists
  if (settings.profile.avatar) {
    try {
      const oldAvatarPath = path.join(process.cwd(), 'uploads', 'avatars', settings.profile.avatar);
      await fs.unlink(oldAvatarPath);
    } catch (error) {
      console.error('Error deleting old avatar:', error);
    }
  }
  
  // Update avatar filename
  settings.profile.avatar = req.file.filename;
  await settings.save();
  
  res.status(200).json({
    success: true,
    message: 'Avatar uploaded successfully',
    data: {
      avatar: req.file.filename,
      avatarUrl: `/uploads/avatars/${req.file.filename}`
    }
  });
});

// @desc    Delete avatar
// @route   DELETE /api/settings/avatar
// @access  Private
export const deleteAvatar = asyncHandler(async (req, res) => {
  const settings = await Settings.getOrCreateSettings(req.user._id);
  
  if (settings.profile.avatar) {
    try {
      const avatarPath = path.join(process.cwd(), 'uploads', 'avatars', settings.profile.avatar);
      await fs.unlink(avatarPath);
    } catch (error) {
      console.error('Error deleting avatar:', error);
    }
    
    settings.profile.avatar = '';
    await settings.save();
  }
  
  res.status(200).json({
    success: true,
    message: 'Avatar deleted successfully'
  });
});

// @desc    Get notification preferences for specific type
// @route   GET /api/settings/notifications/:type
// @access  Private
export const getNotificationPreferences = asyncHandler(async (req, res) => {
  const { type } = req.params;
  const settings = await Settings.getOrCreateSettings(req.user._id);
  
  const preferences = settings.getNotificationPreferences(type);
  
  res.status(200).json({
    success: true,
    data: preferences
  });
});

// @desc    Check if user allows specific notification
// @route   GET /api/settings/notifications/check/:category
// @access  Private
export const checkNotificationPermission = asyncHandler(async (req, res) => {
  const { category } = req.params;
  const { type = 'inApp' } = req.query;
  
  const settings = await Settings.getOrCreateSettings(req.user._id);
  const allowed = settings.allowsNotification(category, type);
  
  res.status(200).json({
    success: true,
    data: {
      category,
      type,
      allowed
    }
  });
});

// @desc    Reset settings to defaults
// @route   POST /api/settings/reset
// @access  Private
export const resetSettings = asyncHandler(async (req, res) => {
  const { section } = req.body;
  
  // Delete existing settings
  await Settings.findOneAndDelete({ user: req.user._id });
  
  // Create new settings with defaults
  const settings = await Settings.getOrCreateSettings(req.user._id);
  
  res.status(200).json({
    success: true,
    message: `Settings${section ? ` for ${section}` : ''} reset to defaults`,
    data: settings
  });
});

// @desc    Export user data
// @route   GET /api/settings/export-data
// @access  Private
export const exportUserData = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('-passwordHash');
  const settings = await Settings.getOrCreateSettings(req.user._id);
  
  const userData = {
    profile: {
      firstName: user.first_name,
      lastName: user.last_name,
      email: user.email,
      phone: user.phone,
      createdAt: user.createdAt
    },
    settings: settings,
    exportedAt: new Date()
  };
  
  res.status(200).json({
    success: true,
    data: userData
  });
});

// @desc    Delete user account
// @route   DELETE /api/settings/delete-account
// @access  Private
export const deleteAccount = asyncHandler(async (req, res) => {
  const { password, confirmation } = req.body;
  
  if (!password) {
    throw new ApiError(400, 'Password is required');
  }
  
  if (confirmation !== 'DELETE') {
    throw new ApiError(400, 'Please type "DELETE" to confirm account deletion');
  }
  
  const user = await User.findById(req.user._id);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }
  
  // Verify password
  const bcrypt = await import('bcryptjs');
  const isPasswordValid = await bcrypt.default.compare(password, user.passwordHash);
  
  if (!isPasswordValid) {
    throw new ApiError(401, 'Invalid password');
  }
  
  // Delete user's avatar if exists
  const settings = await Settings.findOne({ user: req.user._id });
  if (settings && settings.profile.avatar) {
    try {
      const avatarPath = path.join(process.cwd(), 'uploads', 'avatars', settings.profile.avatar);
      await fs.unlink(avatarPath);
    } catch (error) {
      console.error('Error deleting avatar:', error);
    }
  }
  
  // Delete settings
  await Settings.findOneAndDelete({ user: req.user._id });
  
  // Delete user
  await User.findByIdAndDelete(req.user._id);
  
  res.status(200).json({
    success: true,
    message: 'Account deleted successfully'
  });
});
