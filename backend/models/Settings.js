// backend/models/Settings.js
import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  
  // Profile Settings
  profile: {
    firstName: {
      type: String,
      trim: true,
      maxlength: 50
    },
    lastName: {
      type: String,
      trim: true,
      maxlength: 50
    },
    bio: {
      type: String,
      trim: true,
      maxlength: 500
    },
    avatar: {
      type: String,
      default: ''
    },
    phone: {
      type: String,
      trim: true
    },
    location: {
      city: String,
      state: String,
      country: String
    },
    website: {
      type: String,
      trim: true
    },
    socialLinks: {
      linkedin: String,
      github: String,
      twitter: String,
      facebook: String
    }
  },

  // Privacy Settings
  privacy: {
    profileVisibility: {
      type: String,
      enum: ['public', 'friends', 'private'],
      default: 'public'
    },
    showEmail: {
      type: Boolean,
      default: false
    },
    showPhone: {
      type: Boolean,
      default: false
    },
    allowDirectMessages: {
      type: Boolean,
      default: true
    },
    allowFriendRequests: {
      type: Boolean,
      default: true
    },
    showOnlineStatus: {
      type: Boolean,
      default: true
    },
    allowSearchByEmail: {
      type: Boolean,
      default: true
    },
    allowSearchByPhone: {
      type: Boolean,
      default: false
    }
  },

  // Notification Settings
  notifications: {
    email: {
      newMessages: {
        type: Boolean,
        default: true
      },
      friendRequests: {
        type: Boolean,
      default: true
      },
      teamInvitations: {
        type: Boolean,
        default: true
      },
      taskAssignments: {
        type: Boolean,
        default: true
      },
      houseInquiries: {
        type: Boolean,
        default: true
      },
      systemUpdates: {
        type: Boolean,
        default: false
      }
    },
    push: {
      newMessages: {
        type: Boolean,
        default: true
      },
      friendRequests: {
        type: Boolean,
        default: true
      },
      teamInvitations: {
        type: Boolean,
        default: true
      },
      taskAssignments: {
        type: Boolean,
        default: true
      },
      houseInquiries: {
        type: Boolean,
        default: true
      },
      systemUpdates: {
        type: Boolean,
        default: false
      }
    },
    inApp: {
      newMessages: {
        type: Boolean,
        default: true
      },
      friendRequests: {
        type: Boolean,
        default: true
      },
      teamInvitations: {
        type: Boolean,
        default: true
      },
      taskAssignments: {
        type: Boolean,
        default: true
      },
      houseInquiries: {
        type: Boolean,
        default: true
      },
      systemUpdates: {
        type: Boolean,
        default: true
      }
    }
  },

  // Appearance Settings
  appearance: {
    theme: {
      type: String,
      enum: ['light', 'dark', 'auto'],
      default: 'light'
    },
    language: {
      type: String,
      enum: ['en', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'zh', 'ja', 'ko'],
      default: 'en'
    },
    timezone: {
      type: String,
      default: 'UTC'
    },
    dateFormat: {
      type: String,
      enum: ['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD'],
      default: 'MM/DD/YYYY'
    },
    timeFormat: {
      type: String,
      enum: ['12h', '24h'],
      default: '12h'
    }
  },

  // Chat Settings
  chat: {
    soundEnabled: {
      type: Boolean,
      default: true
    },
    desktopNotifications: {
      type: Boolean,
      default: true
    },
    showPreview: {
      type: Boolean,
      default: true
    },
    enterToSend: {
      type: Boolean,
      default: false
    },
    showOnlineUsers: {
      type: Boolean,
      default: true
    },
    autoStartVideo: {
      type: Boolean,
      default: false
    },
    autoStartAudio: {
      type: Boolean,
      default: false
    }
  },

  // Security Settings
  security: {
    twoFactorEnabled: {
      type: Boolean,
      default: false
    },
    twoFactorSecret: {
      type: String,
      default: ''
    },
    backupCodes: [{
      code: String,
      used: {
        type: Boolean,
        default: false
      },
      createdAt: {
        type: Date,
        default: Date.now
      }
    }],
    loginAlerts: {
      type: Boolean,
      default: true
    },
    sessionTimeout: {
      type: Number,
      default: 24, // hours
      min: 1,
      max: 168
    },
    requirePasswordForSensitiveActions: {
      type: Boolean,
      default: true
    }
  },

  // House Listing Settings
  houseListings: {
    defaultCurrency: {
      type: String,
      enum: ['USD', 'EUR', 'GBP', 'ETB', 'CAD', 'AUD'],
      default: 'USD'
    },
    defaultAreaUnit: {
      type: String,
      enum: ['sqft', 'sqm', 'sqyrd'],
      default: 'sqft'
    },
    autoSaveDrafts: {
      type: Boolean,
      default: true
    },
    showContactInfo: {
      type: Boolean,
      default: true
    },
    allowInquiries: {
      type: Boolean,
      default: true
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
settingsSchema.index({ user: 1 });

// Method to update settings
settingsSchema.methods.updateSettings = function(updates) {
  Object.keys(updates).forEach(key => {
    if (updates[key] !== undefined) {
      if (typeof updates[key] === 'object' && !Array.isArray(updates[key])) {
        this[key] = { ...this[key], ...updates[key] };
      } else {
        this[key] = updates[key];
      }
    }
  });
  return this.save();
};

// Method to get user's notification preferences
settingsSchema.methods.getNotificationPreferences = function(type) {
  if (type === 'email') return this.notifications.email;
  if (type === 'push') return this.notifications.push;
  if (type === 'inApp') return this.notifications.inApp;
  return this.notifications;
};

// Method to check if user allows specific notification
settingsSchema.methods.allowsNotification = function(category, type = 'inApp') {
  return this.notifications[type] && this.notifications[type][category] === true;
};

// Static method to get or create settings for user
settingsSchema.statics.getOrCreateSettings = async function(userId) {
  let settings = await this.findOne({ user: userId });
  
  if (!settings) {
    settings = await this.create({ user: userId });
  }
  
  return settings;
};

export default mongoose.model('Settings', settingsSchema);
