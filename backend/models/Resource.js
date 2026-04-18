// backend/models/Resource.js
const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 255
    },
    description: {
      type: String,
      trim: true,
      maxlength: 1000
    },
    filename: {
      type: String,
      required: true
    },
    originalName: {
      type: String,
      required: true
    },
    path: {
      type: String,
      required: true
    },
    size: {
      type: Number,
      required: true
    },
    mimeType: {
      type: String,
      required: true
    },
    extension: {
      type: String,
      required: true
    },
    team: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
      required: true
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    isPublic: {
      type: Boolean,
      default: false
    },
    downloadCount: {
      type: Number,
      default: 0
    },
    tags: [{
      type: String,
      trim: true,
      maxlength: 50
    }],
    category: {
      type: String,
      enum: ['document', 'image', 'video', 'audio', 'archive', 'code', 'design', 'other'],
      default: 'other'
    },
    version: {
      type: Number,
      default: 1
    },
    parentResource: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Resource'
    },
    versions: [{
      filename: String,
      originalName: String,
      path: String,
      size: Number,
      uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      uploadedAt: {
        type: Date,
        default: Date.now
      },
      version: Number,
      changelog: String
    }],
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
    },
    deletedBy: {
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

// Virtual for formatted size
resourceSchema.virtual('formattedSize').get(function() {
  const bytes = this.size;
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
});

// Virtual for file icon
resourceSchema.virtual('fileIcon').get(function() {
  const iconMap = {
    'pdf': 'PDF',
    'doc': 'DOC',
    'docx': 'DOC',
    'xls': 'XLS',
    'xlsx': 'XLS',
    'csv': 'CSV',
    'ppt': 'PPT',
    'pptx': 'PPT',
    'txt': 'TXT',
    'md': 'MD',
    'sql': 'SQL',
    'json': 'JSON',
    'xml': 'XML',
    'html': 'HTML',
    'css': 'CSS',
    'js': 'JS',
    'jsx': 'JSX',
    'ts': 'TS',
    'tsx': 'TSX',
    'py': 'PY',
    'java': 'JAVA',
    'cpp': 'CPP',
    'c': 'C',
    'fig': 'FIG',
    'sketch': 'SKETCH',
    'psd': 'PSD',
    'ai': 'AI',
    'png': 'PNG',
    'jpg': 'JPG',
    'jpeg': 'JPG',
    'gif': 'GIF',
    'svg': 'SVG',
    'mp4': 'MP4',
    'avi': 'AVI',
    'mov': 'MOV',
    'mp3': 'MP3',
    'wav': 'WAV',
    'zip': 'ZIP',
    'rar': 'RAR',
    '7z': '7Z'
  };
  
  return iconMap[this.extension.toLowerCase()] || 'FILE';
});

// Virtual for download URL
resourceSchema.virtual('downloadUrl').get(function() {
  return `/api/resources/${this._id}/download`;
});

// Virtual for preview URL
resourceSchema.virtual('previewUrl').get(function() {
  if (this.mimeType.startsWith('image/')) {
    return `/api/resources/${this._id}/preview`;
  }
  return null;
});

// Indexes for better performance
resourceSchema.index({ name: 1 });
resourceSchema.index({ team: 1 });
resourceSchema.index({ uploadedBy: 1 });
resourceSchema.index({ mimeType: 1 });
resourceSchema.index({ category: 1 });
resourceSchema.index({ tags: 1 });
resourceSchema.index({ createdAt: -1 });
resourceSchema.index({ isDeleted: 1 });

// Compound indexes
resourceSchema.index({ team: 1, isDeleted: 1 });
resourceSchema.index({ team: 1, category: 1 });
resourceSchema.index({ uploadedBy: 1, isDeleted: 1 });

// Pre-save middleware to set category based on mime type
resourceSchema.pre('save', function(next) {
  if (this.isModified('mimeType')) {
    this.category = this.getCategoryFromMimeType();
  }
  next();
});

// Method to get category from mime type
resourceSchema.methods.getCategoryFromMimeType = function() {
  const mimeType = this.mimeType.toLowerCase();
  
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType.startsWith('audio/')) return 'audio';
  if (mimeType.includes('pdf') || mimeType.includes('document') || 
      mimeType.includes('word') || mimeType.includes('text')) return 'document';
  if (mimeType.includes('zip') || mimeType.includes('rar') || 
      mimeType.includes('archive') || mimeType.includes('tar')) return 'archive';
  if (mimeType.includes('javascript') || mimeType.includes('json') || 
      mimeType.includes('html') || mimeType.includes('css') || 
      mimeType.includes('python') || mimeType.includes('java')) return 'code';
  if (mimeType.includes('figma') || mimeType.includes('sketch') || 
      mimeType.includes('adobe') || mimeType.includes('design')) return 'design';
  
  return 'other';
};

// Method to increment download count
resourceSchema.methods.incrementDownloadCount = function() {
  this.downloadCount += 1;
  return this.save();
};

// Method to add version
resourceSchema.methods.addVersion = function(versionData) {
  this.versions.push({
    ...versionData,
    uploadedAt: new Date(),
    version: this.version + 1
  });
  
  this.version += 1;
  return this.save();
};

// Method to restore version
resourceSchema.methods.restoreVersion = function(versionId) {
  const version = this.versions.id(versionId);
  if (!version) {
    throw new Error('Version not found');
  }
  
  // Create backup of current version
  this.addVersion({
    filename: this.filename,
    originalName: this.originalName,
    path: this.path,
    size: this.size,
    uploadedBy: this.uploadedBy,
    changelog: 'Auto-backup before version restore'
  });
  
  // Restore the selected version
  this.filename = version.filename;
  this.originalName = version.originalName;
  this.path = version.path;
  this.size = version.size;
  
  return this.save();
};

// Method to soft delete
resourceSchema.methods.softDelete = function(deletedBy) {
  this.isDeleted = true;
  this.deletedAt = new Date();
  this.deletedBy = deletedBy;
  return this.save();
};

// Method to restore
resourceSchema.methods.restore = function() {
  this.isDeleted = false;
  this.deletedAt = undefined;
  this.deletedBy = undefined;
  return this.save();
};

// Method to check if user can access resource
resourceSchema.methods.canAccess = function(userId) {
  // Resource is public or user is uploader or team member
  return this.isPublic || 
         this.uploadedBy.toString() === userId.toString();
};

// Static method to find by team
resourceSchema.statics.findByTeam = function(teamId, filters = {}) {
  const query = { team: teamId, isDeleted: false, ...filters };
  return this.find(query)
    .populate('uploadedBy', 'name email')
    .populate('team', 'name')
    .sort({ createdAt: -1 });
};

// Static method to search resources
resourceSchema.statics.search = function(teamId, searchTerm, filters = {}) {
  const query = {
    team: teamId,
    isDeleted: false,
    $or: [
      { name: { $regex: searchTerm, $options: 'i' } },
      { description: { $regex: searchTerm, $options: 'i' } },
      { tags: { $in: [new RegExp(searchTerm, 'i')] } }
    ],
    ...filters
  };
  
  return this.find(query)
    .populate('uploadedBy', 'name email')
    .populate('team', 'name')
    .sort({ createdAt: -1 });
};

// Static method to get resource statistics
resourceSchema.statics.getResourceStats = function(teamId) {
  return this.aggregate([
    { $match: { team: mongoose.Types.ObjectId(teamId), isDeleted: false } },
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 },
        totalSize: { $sum: '$size' }
      }
    }
  ]);
};

// Static method to find recently uploaded
resourceSchema.statics.findRecentlyUploaded = function(teamId, limit = 10) {
  return this.find({ team: teamId, isDeleted: false })
    .populate('uploadedBy', 'name email')
    .sort({ createdAt: -1 })
    .limit(limit);
};

module.exports = mongoose.model('Resource', resourceSchema);
