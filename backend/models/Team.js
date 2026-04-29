// backend/models/Team.js
import mongoose from 'mongoose';

const teamSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500
    },
    icon: {
      type: String,
      default: 'TM',
      maxlength: 5
    },
    color: {
      type: String,
      default: '#3b82f6',
      match: [/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Invalid color format']
    },
    leader: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    members: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      role: {
        type: String,
        enum: ['leader', 'member'],
        default: 'member'
      },
      joinedAt: {
        type: Date,
        default: Date.now
      }
    }],
    inviteCode: {
      type: String,
      unique: true,
      required: true
    },
    isActive: {
      type: Boolean,
      default: true
    },
    tasks: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task'
    }],
    resources: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Resource'
    }],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual for member count
teamSchema.virtual('memberCount').get(function() {
  return this.members.length;
});

// Virtual for task count
teamSchema.virtual('taskCount').get(function() {
  return this.tasks.length;
});

// Virtual for completed tasks count
teamSchema.virtual('completedTaskCount').get(function() {
  // This would be populated when we populate tasks
  return this.tasks.filter(task => task.status === 'done').length;
});

// Indexes for better performance
teamSchema.index({ name: 1 });
teamSchema.index({ leader: 1 });
teamSchema.index({ 'members.user': 1 });
teamSchema.index({ createdBy: 1 });

// Pre-save middleware to generate invite code
teamSchema.pre('save', function(next) {
  if (this.isNew && !this.inviteCode) {
    this.inviteCode = this.generateInviteCode();
  }
  next();
});

// Method to generate invite code
teamSchema.methods.generateInviteCode = function() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

// Method to add member
teamSchema.methods.addMember = function(userId, role = 'member') {
  // Check if user is already a member
  const existingMember = this.members.find(member => 
    member.user.toString() === userId.toString()
  );
  
  if (existingMember) {
    throw new Error('User is already a member of this team');
  }
  
  this.members.push({
    user: userId,
    role: role,
    joinedAt: new Date()
  });
  
  return this.save();
};

// Method to remove member
teamSchema.methods.removeMember = function(userId) {
  // Cannot remove the leader
  if (this.leader.toString() === userId.toString()) {
    throw new Error('Cannot remove team leader');
  }
  
  this.members = this.members.filter(member => 
    member.user.toString() !== userId.toString()
  );
  
  return this.save();
};

// Method to update member role
teamSchema.methods.updateMemberRole = function(userId, newRole) {
  const member = this.members.find(member => 
    member.user.toString() === userId.toString()
  );
  
  if (!member) {
    throw new Error('User is not a member of this team');
  }
  
  member.role = newRole;
  return this.save();
};

// Method to check if user is member
teamSchema.methods.isMember = function(userId) {
  return this.members.some(member => 
    member.user.toString() === userId.toString()
  );
};

// Method to check if user is leader
teamSchema.methods.isLeader = function(userId) {
  return this.leader.toString() === userId.toString();
};

// Static method to find teams by user
teamSchema.statics.findByUser = function(userId) {
  return this.find({
    $or: [
      { leader: userId },
      { 'members.user': userId }
    ]
  }).populate('leader', 'name email')
    .populate('members.user', 'name email')
    .sort({ createdAt: -1 });
};

// Static method to find team by invite code
teamSchema.statics.findByInviteCode = function(inviteCode) {
  return this.findOne({ inviteCode, isActive: true })
    .populate('leader', 'name email')
    .populate('members.user', 'name email');
};

export default mongoose.model('Team', teamSchema);
