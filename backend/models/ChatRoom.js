// backend/models/ChatRoom.js
import mongoose from 'mongoose';

const chatRoomSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  type: {
    type: String,
    enum: ['direct', 'group', 'service'],
    required: true
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500
  },
  participants: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    role: {
      type: String,
      enum: ['admin', 'member'],
      default: 'member'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    lastReadAt: {
      type: Date,
      default: Date.now
    }
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  lastMessageAt: {
    type: Date
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isArchived: {
    type: Boolean,
    default: false
  },
  metadata: {
    houseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'House'
    },
    serviceType: {
      type: String,
      enum: ['house_inquiry', 'general_support', 'property_consultation']
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for unread message count
chatRoomSchema.virtual('unreadCount').get(function() {
  // This would be calculated dynamically based on user's lastReadAt
  return 0; // Placeholder
});

// Virtual for participant count
chatRoomSchema.virtual('participantCount').get(function() {
  return this.participants.length;
});

// Indexes for better performance
chatRoomSchema.index({ participants: 1 });
chatRoomSchema.index({ createdBy: 1 });
chatRoomSchema.index({ type: 1 });
chatRoomSchema.index({ isActive: 1 });
chatRoomSchema.index({ lastMessageAt: -1 });

// Method to add participant
chatRoomSchema.methods.addParticipant = function(userId, role = 'member') {
  // Check if user is already a participant
  if (this.participants.some(p => p.user.toString() === userId.toString())) {
    throw new Error('User is already a participant');
  }

  this.participants.push({
    user: userId,
    role,
    joinedAt: new Date(),
    lastReadAt: new Date()
  });

  return this.save();
};

// Method to remove participant
chatRoomSchema.methods.removeParticipant = function(userId) {
  this.participants = this.participants.filter(
    p => p.user.toString() !== userId.toString()
  );
  return this.save();
};

// Method to update last read time
chatRoomSchema.methods.updateLastRead = function(userId) {
  const participant = this.participants.find(p => p.user.toString() === userId.toString());
  if (participant) {
    participant.lastReadAt = new Date();
  }
  return this.save();
};

// Method to check if user is participant
chatRoomSchema.methods.isParticipant = function(userId) {
  return this.participants.some(p => p.user.toString() === userId.toString());
};

// Static method to find rooms for user
chatRoomSchema.statics.findForUser = function(userId, filters = {}) {
  return this.find({
    'participants.user': userId,
    isActive: true,
    ...filters
  })
  .populate('participants.user', 'name email')
  .populate('createdBy', 'name email')
  .populate('lastMessage')
  .sort({ lastMessageAt: -1 });
};

// Static method to find direct chat between two users
chatRoomSchema.statics.findDirectChat = function(user1Id, user2Id) {
  return this.findOne({
    type: 'direct',
    'participants.user': { $all: [user1Id, user2Id] },
    isActive: true
  })
  .populate('participants.user', 'name email')
  .populate('lastMessage');
};

// Static method to create direct chat
chatRoomSchema.statics.createDirectChat = function(user1Id, user2Id) {
  return this.create({
    name: 'Direct Chat',
    type: 'direct',
    participants: [
      { user: user1Id, role: 'member' },
      { user: user2Id, role: 'member' }
    ],
    createdBy: user1Id
  });
};

export default mongoose.model('ChatRoom', chatRoomSchema);
