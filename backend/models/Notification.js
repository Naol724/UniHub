// backend/models/Notification.js
const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    type: {
      type: String,
      enum: [
        'task_assigned',
        'task_completed',
        'task_overdue',
        'team_invitation',
        'team_joined',
        'team_left',
        'new_message',
        'mention',
        'file_shared',
        'deadline_reminder',
        'project_update',
        'system_update'
      ],
      required: true
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500
    },
    data: {
      // Additional data related to the notification
      taskId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Task'
      },
      teamId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Team'
      },
      resourceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Resource'
      },
      messageId: String,
      actionUrl: String,
      actionText: String,
      metadata: mongoose.Schema.Types.Mixed
    },
    isRead: {
      type: Boolean,
      default: false
    },
    readAt: {
      type: Date
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium'
    },
    category: {
      type: String,
      enum: ['task', 'team', 'message', 'resource', 'system'],
      default: 'system'
    },
    expiresAt: {
      type: Date
    },
    isActive: {
      type: Boolean,
      default: true
    },
    isDeleted: {
      type: Boolean,
      default: false
    },
    deletedAt: {
      type: Date
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual for time ago
notificationSchema.virtual('timeAgo').get(function() {
  const now = new Date();
  const created = new Date(this.createdAt);
  const diffMs = now - created;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  
  return created.toLocaleDateString();
});

// Virtual for is expired
notificationSchema.virtual('isExpired').get(function() {
  if (!this.expiresAt) return false;
  return new Date() > this.expiresAt;
});

// Virtual for icon configuration
notificationSchema.virtual('iconConfig').get(function() {
  const iconConfigs = {
    task_assigned: { icon: 'Task Assigned', bg: '#ecfdf5', color: '#10b981' },
    task_completed: { icon: 'Task Completed', bg: '#ecfdf5', color: '#10b981' },
    task_overdue: { icon: 'Task Overdue', bg: '#fef2f2', color: '#ef4444' },
    team_invitation: { icon: 'Team Invitation', bg: '#f5f3ff', color: '#8b5cf6' },
    team_joined: { icon: 'Team Joined', bg: '#eff6ff', color: '#3b82f6' },
    team_left: { icon: 'Team Left', bg: '#fef2f2', color: '#ef4444' },
    new_message: { icon: 'New Message', bg: '#eff6ff', color: '#3b82f6' },
    mention: { icon: 'Mention', bg: '#f5f3ff', color: '#8b5cf6' },
    file_shared: { icon: 'File Shared', bg: '#fffbeb', color: '#f59e0b' },
    deadline_reminder: { icon: 'Deadline Reminder', bg: '#fef2f2', color: '#ef4444' },
    project_update: { icon: 'Project Update', bg: '#eff6ff', color: '#3b82f6' },
    system_update: { icon: 'System Update', bg: '#f3f4f6', color: '#6b7280' }
  };
  
  return iconConfigs[this.type] || iconConfigs.system_update;
});

// Indexes for better performance
notificationSchema.index({ recipient: 1 });
notificationSchema.index({ sender: 1 });
notificationSchema.index({ type: 1 });
notificationSchema.index({ isRead: 1 });
notificationSchema.index({ createdAt: -1 });
notificationSchema.index({ isDeleted: 1 });
notificationSchema.index({ priority: 1 });
notificationSchema.index({ category: 1 });

// Compound indexes
notificationSchema.index({ recipient: 1, isRead: 1 });
notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, isDeleted: 1 });
notificationSchema.index({ recipient: 1, type: 1 });

// TTL index for expired notifications
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Pre-save middleware
notificationSchema.pre('save', function(next) {
  // Set readAt when notification is marked as read
  if (this.isModified('isRead') && this.isRead && !this.readAt) {
    this.readAt = new Date();
  }
  
  // Set category based on type
  if (this.isModified('type')) {
    this.category = this.getCategoryFromType();
  }
  
  next();
});

// Method to get category from type
notificationSchema.methods.getCategoryFromType = function() {
  const categoryMap = {
    task_assigned: 'task',
    task_completed: 'task',
    task_overdue: 'task',
    team_invitation: 'team',
    team_joined: 'team',
    team_left: 'team',
    new_message: 'message',
    mention: 'message',
    file_shared: 'resource',
    deadline_reminder: 'task',
    project_update: 'system',
    system_update: 'system'
  };
  
  return categoryMap[this.type] || 'system';
};

// Method to mark as read
notificationSchema.methods.markAsRead = function() {
  this.isRead = true;
  this.readAt = new Date();
  return this.save();
};

// Method to mark as unread
notificationSchema.methods.markAsUnread = function() {
  this.isRead = false;
  this.readAt = undefined;
  return this.save();
};

// Method to soft delete
notificationSchema.methods.softDelete = function() {
  this.isDeleted = true;
  this.deletedAt = new Date();
  return this.save();
};

// Method to restore
notificationSchema.methods.restore = function() {
  this.isDeleted = false;
  this.deletedAt = undefined;
  return this.save();
};

// Static method to create notification
notificationSchema.statics.createNotification = function(notificationData) {
  const notification = new this(notificationData);
  return notification.save();
};

// Static method to find user notifications
notificationSchema.statics.findByUser = function(userId, filters = {}) {
  const query = { 
    recipient: userId, 
    isDeleted: false, 
    ...filters 
  };
  
  return this.find(query)
    .populate('sender', 'name email avatar')
    .populate('data.taskId', 'title status')
    .populate('data.teamId', 'name')
    .populate('data.resourceId', 'name')
    .sort({ createdAt: -1 });
};

// Static method to find unread notifications
notificationSchema.statics.findUnreadByUser = function(userId, limit = 50) {
  return this.find({ 
    recipient: userId, 
    isRead: false, 
    isDeleted: false 
  })
    .populate('sender', 'name email avatar')
    .populate('data.taskId', 'title status')
    .populate('data.teamId', 'name')
    .sort({ createdAt: -1 })
    .limit(limit);
};

// Static method to mark all as read for user
notificationSchema.statics.markAllAsReadForUser = function(userId) {
  return this.updateMany(
    { 
      recipient: userId, 
      isRead: false, 
      isDeleted: false 
    },
    { 
      isRead: true, 
      readAt: new Date() 
    }
  );
};

// Static method to get notification statistics
notificationSchema.statics.getNotificationStats = function(userId) {
  return this.aggregate([
    { $match: { recipient: mongoose.Types.ObjectId(userId), isDeleted: false } },
    {
      $group: {
        _id: '$type',
        total: { $sum: 1 },
        unread: { $sum: { $cond: ['$isRead', 0, 1] } }
      }
    }
  ]);
};

// Static method to get unread count
notificationSchema.statics.getUnreadCount = function(userId) {
  return this.countDocuments({ 
    recipient: userId, 
    isRead: false, 
    isDeleted: false 
  });
};

// Static method to cleanup old notifications
notificationSchema.statics.cleanupOldNotifications = function(daysOld = 30) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);
  
  return this.deleteMany({
    createdAt: { $lt: cutoffDate },
    isRead: true
  });
};

// Static method to create task notifications
notificationSchema.statics.createTaskNotification = function(type, recipientId, taskId, title, message, senderId = null) {
  return this.create({
    recipient: recipientId,
    sender: senderId,
    type: type,
    title: title,
    message: message,
    data: {
      taskId: taskId,
      actionUrl: `/tasks/${taskId}`,
      actionText: 'View Task'
    }
  });
};

// Static method to create team notifications
notificationSchema.statics.createTeamNotification = function(type, recipientId, teamId, title, message, senderId = null) {
  return this.create({
    recipient: recipientId,
    sender: senderId,
    type: type,
    title: title,
    message: message,
    data: {
      teamId: teamId,
      actionUrl: `/teams/${teamId}`,
      actionText: 'View Team'
    }
  });
};

module.exports = mongoose.model('Notification', notificationSchema);
