// backend/controllers/adminController.js
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import User from '../models/User.js';
import House from '../models/House.js';
import Team from '../models/Team.js';
import Task from '../models/Task.js';
import Notification from '../models/Notification.js';

// @desc    Get admin dashboard statistics
// @route   GET /api/admin/dashboard/stats
// @access  Private (admin only)
export const getDashboardStats = asyncHandler(async (req, res) => {
  // Get total counts
  const totalUsers = await User.countDocuments({ role: 'user' });
  const totalHouses = await House.countDocuments();
  const activeHouses = await House.countDocuments({ isActive: true, status: 'available' });
  const totalTeams = await Team.countDocuments();
  const totalTasks = await Task.countDocuments();
  const completedTasks = await Task.countDocuments({ status: 'done' });

  // Get recent activity
  const recentHouses = await House.find()
    .populate('postedBy', 'name email')
    .sort({ createdAt: -1 })
    .limit(5);

  const recentUsers = await User.find({ role: 'user' })
    .sort({ createdAt: -1 })
    .limit(5);

  // Get house statistics by type
  const housesByType = await House.aggregate([
    { $match: { isActive: true } },
    { $group: { _id: '$propertyType', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);

  // Get house statistics by listing type
  const housesByListingType = await House.aggregate([
    { $match: { isActive: true } },
    { $group: { _id: '$listingType', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);

  // Get monthly house postings (last 6 months)
  const monthlyHousePostings = await House.aggregate([
    {
      $match: {
        createdAt: {
          $gte: new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000)
        }
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' }
        },
        count: { $sum: 1 }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } }
  ]);

  res.status(200).json({
    success: true,
    data: {
      counts: {
        totalUsers,
        totalHouses,
        activeHouses,
        totalTeams,
        totalTasks,
        completedTasks
      },
      recentActivity: {
        recentHouses,
        recentUsers
      },
      statistics: {
        housesByType,
        housesByListingType,
        monthlyHousePostings
      }
    }
  });
});

// @desc    Get all users (admin view)
// @route   GET /api/admin/users
// @access  Private (admin only)
export const getAllUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, search, role, status } = req.query;

  const query = {};

  // Add filters
  if (role) query.role = role;
  if (status === 'active') query.isActive = true;
  if (status === 'inactive') query.isActive = false;

  // Search filter
  if (search) {
    query.$or = [
      { first_name: { $regex: search, $options: 'i' } },
      { last_name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const users = await User.find(query)
    .select('-password')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await User.countDocuments(query);

  res.status(200).json({
    success: true,
    data: users,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit))
    }
  });
});

// @desc    Get all house listings (admin view)
// @route   GET /api/admin/houses
// @access  Private (admin only)
export const getAllHouses = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, search, status, listingType, propertyType, postedBy } = req.query;

  const query = {};

  // Add filters
  if (status) query.status = status;
  if (listingType) query.listingType = listingType;
  if (propertyType) query.propertyType = propertyType;
  if (postedBy) query.postedBy = postedBy;

  // Search filter
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { 'address.city': { $regex: search, $options: 'i' } },
      { 'address.state': { $regex: search, $options: 'i' } }
    ];
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const houses = await House.find(query)
    .populate('postedBy', 'name email phone')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await House.countDocuments(query);

  res.status(200).json({
    success: true,
    data: houses,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit))
    }
  });
});

// @desc    Update user status (activate/deactivate)
// @route   PATCH /api/admin/users/:id/status
// @access  Private (admin only)
export const updateUserStatus = asyncHandler(async (req, res) => {
  const { isActive } = req.body;

  if (typeof isActive !== 'boolean') {
    throw new ApiError(400, 'isActive must be a boolean value');
  }

  const user = await User.findById(req.params.id);

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  // Prevent admin from deactivating themselves
  if (user._id.toString() === req.user._id.toString()) {
    throw new ApiError(400, 'You cannot deactivate your own account');
  }

  user.isActive = isActive;
  await user.save();

  res.status(200).json({
    success: true,
    message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
    data: user
  });
});

// @desc    Update house status
// @route   PATCH /api/admin/houses/:id/status
// @access  Private (admin only)
export const updateHouseStatus = asyncHandler(async (req, res) => {
  const { status, isActive } = req.body;

  const house = await House.findById(req.params.id);

  if (!house) {
    throw new ApiError(404, 'House listing not found');
  }

  if (status !== undefined) {
    if (!['available', 'rented', 'sold', 'under_contract', 'pending'].includes(status)) {
      throw new ApiError(400, 'Invalid status value');
    }
    house.status = status;
  }

  if (isActive !== undefined) {
    if (typeof isActive !== 'boolean') {
      throw new ApiError(400, 'isActive must be a boolean value');
    }
    house.isActive = isActive;
  }

  await house.save();

  res.status(200).json({
    success: true,
    message: 'House listing updated successfully',
    data: house
  });
});

// @desc    Delete user (admin only)
// @route   DELETE /api/admin/users/:id
// @access  Private (admin only)
export const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  // Prevent admin from deleting themselves
  if (user._id.toString() === req.user._id.toString()) {
    throw new ApiError(400, 'You cannot delete your own account');
  }

  // Check if user has house listings
  const houseCount = await House.countDocuments({ postedBy: user._id });
  if (houseCount > 0) {
    throw new ApiError(400, 'Cannot delete user with active house listings. Please transfer or delete listings first.');
  }

  await User.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: 'User deleted successfully'
  });
});

// @desc    Delete house listing (admin only)
// @route   DELETE /api/admin/houses/:id
// @access  Private (admin only)
export const deleteHouse = asyncHandler(async (req, res) => {
  const house = await House.findById(req.params.id);

  if (!house) {
    throw new ApiError(404, 'House listing not found');
  }

  // Delete images from disk
  const fs = await import('fs/promises');
  for (const image of house.images) {
    try {
      await fs.unlink(image.path);
    } catch (error) {
      console.error('Error deleting image:', error);
    }
  }

  await House.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: 'House listing deleted successfully'
  });
});

// @desc    Get system logs/analytics
// @route   GET /api/admin/analytics
// @access  Private (admin only)
export const getAnalytics = asyncHandler(async (req, res) => {
  const { period = '30' } = req.query;
  const days = parseInt(period);
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  // User registration trends
  const userRegistrations = await User.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' }
        },
        count: { $sum: 1 }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
  ]);

  // House posting trends
  const housePostings = await House.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' }
        },
        count: { $sum: 1 }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
  ]);

  // Popular property types
  const popularPropertyTypes = await House.aggregate([
    { $match: { isActive: true } },
    { $group: { _id: '$propertyType', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 10 }
  ]);

  // Popular locations
  const popularLocations = await House.aggregate([
    { $match: { isActive: true } },
    { $group: { _id: '$address.city', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 10 }
  ]);

  // Average house prices by type
  const averagePrices = await House.aggregate([
    { $match: { isActive: true } },
    { $group: { _id: '$propertyType', avgPrice: { $avg: '$price' } } },
    { $sort: { avgPrice: 1 } }
  ]);

  res.status(200).json({
    success: true,
    data: {
      userRegistrations,
      housePostings,
      popularPropertyTypes,
      popularLocations,
      averagePrices
    }
  });
});

// @desc    Send notification to users
// @route   POST /api/admin/notifications
// @access  Private (admin only)
export const sendNotification = asyncHandler(async (req, res) => {
  const { title, message, recipients, type = 'system' } = req.body;

  if (!title || !message) {
    throw new ApiError(400, 'Title and message are required');
  }

  let recipientUsers = [];

  if (recipients === 'all') {
    // Send to all users
    recipientUsers = await User.find({ role: 'user', isActive: true }).select('_id');
  } else if (Array.isArray(recipients)) {
    // Send to specific users
    recipientUsers = await User.find({ _id: { $in: recipients }, isActive: true }).select('_id');
  } else {
    throw new ApiError(400, 'Invalid recipients format');
  }

  // Create notifications
  const notifications = recipientUsers.map(user => ({
    recipient: user._id,
    sender: req.user._id,
    type,
    title,
    message
  }));

  await Notification.insertMany(notifications);

  res.status(200).json({
    success: true,
    message: `Notification sent to ${recipientUsers.length} users`
  });
});
