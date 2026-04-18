// backend/models/Task.js
const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200
    },
    description: {
      type: String,
      trim: true,
      maxlength: 1000
    },
    status: {
      type: String,
      enum: ['todo', 'inprogress', 'done'],
      default: 'todo'
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium'
    },
    team: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
      required: true
    },
    assignee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reporter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    dueDate: {
      type: Date
    },
    estimatedHours: {
      type: Number,
      min: 0,
      max: 1000
    },
    actualHours: {
      type: Number,
      min: 0,
      max: 1000,
      default: 0
    },
    tags: [{
      type: String,
      trim: true,
      maxlength: 50
    }],
    attachments: [{
      filename: String,
      originalName: String,
      path: String,
      size: Number,
      mimeType: String,
      uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      uploadedAt: {
        type: Date,
        default: Date.now
      }
    }],
    comments: [{
      content: {
        type: String,
        required: true,
        trim: true,
        maxlength: 500
      },
      author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      createdAt: {
        type: Date,
        default: Date.now
      },
      updatedAt: {
        type: Date,
        default: Date.now
      }
    }],
    dependencies: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task'
    }],
    blockedBy: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task'
    }],
    completedAt: {
      type: Date
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual for days until due
taskSchema.virtual('daysUntilDue').get(function() {
  if (!this.dueDate) return null;
  const now = new Date();
  const due = new Date(this.dueDate);
  const diffTime = due - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Virtual for is overdue
taskSchema.virtual('isOverdue').get(function() {
  if (!this.dueDate) return false;
  return this.dueDate < new Date() && this.status !== 'done';
});

// Virtual for completion percentage
taskSchema.virtual('completionPercentage').get(function() {
  const statusWeights = { todo: 0, inprogress: 50, done: 100 };
  return statusWeights[this.status] || 0;
});

// Indexes for better performance
taskSchema.index({ title: 1 });
taskSchema.index({ status: 1 });
taskSchema.index({ priority: 1 });
taskSchema.index({ team: 1 });
taskSchema.index({ assignee: 1 });
taskSchema.index({ reporter: 1 });
taskSchema.index({ dueDate: 1 });
taskSchema.index({ createdBy: 1 });
taskSchema.index({ tags: 1 });

// Compound indexes
taskSchema.index({ team: 1, status: 1 });
taskSchema.index({ assignee: 1, status: 1 });
taskSchema.index({ team: 1, priority: 1 });

// Pre-save middleware
taskSchema.pre('save', function(next) {
  // Set completedAt when task is marked as done
  if (this.isModified('status') && this.status === 'done' && !this.completedAt) {
    this.completedAt = new Date();
  }
  
  // Clear completedAt when task is moved away from done status
  if (this.isModified('status') && this.status !== 'done') {
    this.completedAt = undefined;
  }
  
  next();
});

// Method to add comment
taskSchema.methods.addComment = function(content, authorId) {
  this.comments.push({
    content,
    author: authorId,
    createdAt: new Date(),
    updatedAt: new Date()
  });
  
  return this.save();
};

// Method to update comment
taskSchema.methods.updateComment = function(commentId, content) {
  const comment = this.comments.id(commentId);
  if (!comment) {
    throw new Error('Comment not found');
  }
  
  comment.content = content;
  comment.updatedAt = new Date();
  
  return this.save();
};

// Method to delete comment
taskSchema.methods.deleteComment = function(commentId) {
  this.comments.pull(commentId);
  return this.save();
};

// Method to add attachment
taskSchema.methods.addAttachment = function(attachmentData) {
  this.attachments.push({
    ...attachmentData,
    uploadedAt: new Date()
  });
  
  return this.save();
};

// Method to remove attachment
taskSchema.methods.removeAttachment = function(attachmentId) {
  this.attachments.pull(attachmentId);
  return this.save();
};

// Method to update status
taskSchema.methods.updateStatus = function(newStatus, updatedBy) {
  const validTransitions = {
    'todo': ['inprogress', 'done'],
    'inprogress': ['todo', 'done'],
    'done': ['todo', 'inprogress']
  };
  
  if (!validTransitions[this.status].includes(newStatus)) {
    throw new Error(`Invalid status transition from ${this.status} to ${newStatus}`);
  }
  
  this.status = newStatus;
  this.updatedBy = updatedBy;
  
  return this.save();
};

// Method to assign task
taskSchema.methods.assignTo = function(userId) {
  this.assignee = userId;
  return this.save();
};

// Method to check if user can access task
taskSchema.methods.canAccess = function(userId) {
  // Task creator, reporter, assignee, or team member can access
  return this.createdBy.toString() === userId.toString() ||
         this.reporter.toString() === userId.toString() ||
         (this.assignee && this.assignee.toString() === userId.toString());
};

// Static method to find tasks by team
taskSchema.statics.findByTeam = function(teamId, filters = {}) {
  const query = { team: teamId, ...filters };
  return this.find(query)
    .populate('assignee', 'name email')
    .populate('reporter', 'name email')
    .populate('createdBy', 'name email')
    .populate('comments.author', 'name email')
    .sort({ createdAt: -1 });
};

// Static method to find tasks by assignee
taskSchema.statics.findByAssignee = function(userId, filters = {}) {
  const query = { assignee: userId, ...filters };
  return this.find(query)
    .populate('team', 'name')
    .populate('reporter', 'name email')
    .populate('createdBy', 'name email')
    .sort({ dueDate: 1, createdAt: -1 });
};

// Static method to get task statistics
taskSchema.statics.getTaskStats = function(teamId) {
  return this.aggregate([
    { $match: { team: mongoose.Types.ObjectId(teamId) } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);
};

// Static method to find overdue tasks
taskSchema.statics.findOverdue = function(teamId) {
  return this.find({
    team: teamId,
    dueDate: { $lt: new Date() },
    status: { $ne: 'done' }
  })
    .populate('assignee', 'name email')
    .populate('team', 'name')
    .sort({ dueDate: 1 });
};

module.exports = mongoose.model('Task', taskSchema);
