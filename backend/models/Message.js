// backend/models/Message.js
import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000
  },
  messageType: {
    type: String,
    enum: ['text', 'image', 'file', 'location', 'contact'],
    default: 'text'
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  chatRoom: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ChatRoom',
    required: true
  },
  replyTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  attachments: [{
    filename: String,
    originalName: String,
    path: String,
    size: Number,
    mimeType: String
  }],
  isEdited: {
    type: Boolean,
    default: false
  },
  editedAt: {
    type: Date
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: {
    type: Date
  },
  readBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    readAt: {
      type: Date,
      default: Date.now
    }
  }],
  reactions: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    emoji: String,
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  metadata: {
    location: {
      latitude: Number,
      longitude: Number,
      address: String
    },
    contact: {
      name: String,
      phone: String,
      email: String
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for formatted time
messageSchema.virtual('formattedTime').get(function() {
  return this.createdAt.toLocaleTimeString();
});

// Virtual for formatted date
messageSchema.virtual('formattedDate').get(function() {
  return this.createdAt.toLocaleDateString();
});

// Indexes for better performance
messageSchema.index({ chatRoom: 1, createdAt: -1 });
messageSchema.index({ sender: 1 });
messageSchema.index({ createdAt: -1 });
messageSchema.index({ isDeleted: 1 });

// Method to mark as read by user
messageSchema.methods.markAsRead = function(userId) {
  // Check if already marked as read
  if (this.readBy.some(r => r.user.toString() === userId.toString())) {
    return this;
  }

  this.readBy.push({
    user: userId,
    readAt: new Date()
  });

  return this.save();
};

// Method to add reaction
messageSchema.methods.addReaction = function(userId, emoji) {
  // Remove existing reaction by this user if any
  this.reactions = this.reactions.filter(r => r.user.toString() !== userId.toString());
  
  // Add new reaction
  this.reactions.push({
    user: userId,
    emoji,
    addedAt: new Date()
  });

  return this.save();
};

// Method to remove reaction
messageSchema.methods.removeReaction = function(userId) {
  this.reactions = this.reactions.filter(r => r.user.toString() !== userId.toString());
  return this.save();
};

// Method to edit message
messageSchema.methods.editMessage = function(newContent) {
  this.content = newContent;
  this.isEdited = true;
  this.editedAt = new Date();
  return this.save();
};

// Method to soft delete message
messageSchema.methods.softDelete = function() {
  this.isDeleted = true;
  this.deletedAt = new Date();
  return this.save();
};

// Static method to get messages for chat room
messageSchema.statics.getChatMessages = function(chatRoomId, page = 1, limit = 50) {
  const skip = (page - 1) * limit;
  
  return this.find({
    chatRoom: chatRoomId,
    isDeleted: false
  })
  .populate('sender', 'name email')
  .populate('replyTo', 'content sender')
  .populate('reactions.user', 'name')
  .sort({ createdAt: -1 })
  .skip(skip)
  .limit(limit);
};

// Static method to get unread message count for user
messageSchema.statics.getUnreadCount = function(userId, chatRoomId) {
  return this.countDocuments({
    chatRoom: chatRoomId,
    sender: { $ne: userId },
    'readBy.user': { $ne: userId },
    isDeleted: false
  });
};

// Static method to search messages
messageSchema.statics.searchMessages = function(chatRoomId, searchTerm, page = 1, limit = 20) {
  const skip = (page - 1) * limit;
  
  return this.find({
    chatRoom: chatRoomId,
    content: { $regex: searchTerm, $options: 'i' },
    isDeleted: false
  })
  .populate('sender', 'name email')
  .sort({ createdAt: -1 })
  .skip(skip)
  .limit(limit);
};

export default mongoose.model('Message', messageSchema);
