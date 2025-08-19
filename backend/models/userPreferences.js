const mongoose = require('mongoose');

const userPreferencesSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true
  },
  notifications: {
    emailOn: {
      SESSION_BOOKED: { type: Boolean, default: true },
      SESSION_UPDATED: { type: Boolean, default: true },
      SESSION_CANCELLED: { type: Boolean, default: true },
      SESSION_REMINDER: { type: Boolean, default: true },
      PAYMENT_CONFIRMED: { type: Boolean, default: true },
      PAYMENT_FAILED: { type: Boolean, default: true },
      PAYMENT_REFUNDED: { type: Boolean, default: true },
      COMPLAINT_STATUS_CHANGED: { type: Boolean, default: true },
      FOLLOW_ADDED: { type: Boolean, default: false },
      COMMENT_ADDED: { type: Boolean, default: false },
      EVALUATION_SUBMITTED: { type: Boolean, default: true },
      EVALUATION_GRADED: { type: Boolean, default: true },
      COURSE_PURCHASED: { type: Boolean, default: true },
      COURSE_COMPLETED: { type: Boolean, default: false },
      COMPLAINT_STATUS_CHANGED: { type: Boolean, default: true },
      COMPLAINT_SUBMITTED: { type: Boolean, default: true },
      COMPLAINT_ESCALATED: { type: Boolean, default: true },
      MODERATION_ACTION: { type: Boolean, default: true },
      MODERATION_ACTION_REVOKED: { type: Boolean, default: true },
      SYSTEM_ANNOUNCEMENT: { type: Boolean, default: true }
    },
    smsOn: {
      SESSION_BOOKED: { type: Boolean, default: false },
      SESSION_UPDATED: { type: Boolean, default: false },
      SESSION_CANCELLED: { type: Boolean, default: true },
      SESSION_REMINDER: { type: Boolean, default: true },
      PAYMENT_CONFIRMED: { type: Boolean, default: false },
      PAYMENT_FAILED: { type: Boolean, default: true },
      PAYMENT_REFUNDED: { type: Boolean, default: false },
      COMPLAINT_STATUS_CHANGED: { type: Boolean, default: true },
      FOLLOW_ADDED: { type: Boolean, default: false },
      COMMENT_ADDED: { type: Boolean, default: false },
      EVALUATION_SUBMITTED: { type: Boolean, default: false },
      EVALUATION_GRADED: { type: Boolean, default: false },
      COURSE_PURCHASED: { type: Boolean, default: false },
      COURSE_COMPLETED: { type: Boolean, default: false },
      COMPLAINT_STATUS_CHANGED: { type: Boolean, default: true },
      COMPLAINT_SUBMITTED: { type: Boolean, default: false },
      COMPLAINT_ESCALATED: { type: Boolean, default: true },
      MODERATION_ACTION: { type: Boolean, default: true },
      MODERATION_ACTION_REVOKED: { type: Boolean, default: true },
      SYSTEM_ANNOUNCEMENT: { type: Boolean, default: false }
    },
    inAppOn: {
      SESSION_BOOKED: { type: Boolean, default: true },
      SESSION_UPDATED: { type: Boolean, default: true },
      SESSION_CANCELLED: { type: Boolean, default: true },
      SESSION_REMINDER: { type: Boolean, default: true },
      PAYMENT_CONFIRMED: { type: Boolean, default: true },
      PAYMENT_FAILED: { type: Boolean, default: true },
      PAYMENT_REFUNDED: { type: Boolean, default: true },
      COMPLAINT_STATUS_CHANGED: { type: Boolean, default: true },
      FOLLOW_ADDED: { type: Boolean, default: true },
      COMMENT_ADDED: { type: Boolean, default: true },
      EVALUATION_SUBMITTED: { type: Boolean, default: true },
      EVALUATION_GRADED: { type: Boolean, default: true },
      COURSE_PURCHASED: { type: Boolean, default: true },
      COURSE_COMPLETED: { type: Boolean, default: true },
      COMPLAINT_STATUS_CHANGED: { type: Boolean, default: true },
      COMPLAINT_SUBMITTED: { type: Boolean, default: true },
      COMPLAINT_ESCALATED: { type: Boolean, default: true },
      MODERATION_ACTION: { type: Boolean, default: true },
      MODERATION_ACTION_REVOKED: { type: Boolean, default: true },
      SYSTEM_ANNOUNCEMENT: { type: Boolean, default: true }
    }
  },
  general: {
    language: {
      type: String,
      enum: ['fr', 'en', 'ar'],
      default: 'fr'
    },
    timezone: {
      type: String,
      default: 'Europe/Paris'
    },
    theme: {
      type: String,
      enum: ['light', 'dark', 'auto'],
      default: 'auto'
    }
  },
  privacy: {
    showOnlineStatus: { type: Boolean, default: true },
    showLastSeen: { type: Boolean, default: true },
    allowDirectMessages: { type: Boolean, default: true },
    allowCourseInvites: { type: Boolean, default: true }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes
userPreferencesSchema.index({ userId: 1 });

// Methods
userPreferencesSchema.methods.updateNotificationPreferences = function(type, channel, enabled) {
  if (this.notifications[channel] && this.notifications[channel][type] !== undefined) {
    this.notifications[channel][type] = enabled;
    this.updatedAt = new Date();
    return this.save();
  }
  throw new Error(`Invalid notification type or channel: ${type}, ${channel}`);
};

userPreferencesSchema.methods.getChannelPreference = function(type, channel) {
  return this.notifications[channel]?.[type] ?? false;
};

userPreferencesSchema.methods.getAllChannelPreferences = function(type) {
  return {
    email: this.notifications.emailOn[type] ?? false,
    sms: this.notifications.smsOn[type] ?? false,
    inApp: this.notifications.inAppOn[type] ?? false
  };
};

// Static methods
userPreferencesSchema.statics.getOrCreatePreferences = async function(userId) {
  let preferences = await this.findOne({ userId });
  
  if (!preferences) {
    preferences = new this({ userId });
    await preferences.save();
  }
  
  return preferences;
};

userPreferencesSchema.statics.updatePreferences = async function(userId, updates) {
  const preferences = await this.findOneAndUpdate(
    { userId },
    { $set: updates, updatedAt: new Date() },
    { new: true, upsert: true }
  );
  
  return preferences;
};

// Pre-save middleware
userPreferencesSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('UserPreferences', userPreferencesSchema);
