const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: [
      'SESSION_BOOKED',
      'SESSION_UPDATED', 
      'SESSION_CANCELLED',
      'SESSION_REMINDER',
      'PAYMENT_CONFIRMED',
      'PAYMENT_FAILED',
      'PAYMENT_REFUNDED',
      'COMPLAINT_STATUS_CHANGED',
      'COMPLAINT_SUBMITTED',
      'COMPLAINT_ESCALATED',
      'MODERATION_ACTION',
      'MODERATION_ACTION_REVOKED',
      'FOLLOW_ADDED',
      'COMMENT_ADDED',
      'EVALUATION_SUBMITTED',
      'EVALUATION_GRADED',
      'COURSE_PURCHASED',
      'COURSE_COMPLETED',
      'SYSTEM_ANNOUNCEMENT'
    ],
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  body: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  link: {
    type: String,
    trim: true,
    maxlength: 500
  },
  channels: {
    inApp: {
      type: Boolean,
      default: true
    },
    email: {
      type: Boolean,
      default: false
    },
    sms: {
      type: Boolean,
      default: false
    }
  },
  metadata: {
    entityType: String, // 'session', 'course', 'payment', 'user', etc.
    entityId: mongoose.Schema.Types.ObjectId,
    amount: Number,
    currency: String,
    sessionDate: Date,
    courseTitle: String,
    teacherName: String,
    studentName: String
  },
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal'
  },
  readAt: Date,
  deliveredAt: Date,
  expiresAt: Date,
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for performance
notificationSchema.index({ userId: 1, readAt: 1 });
notificationSchema.index({ userId: 1, type: 1 });
notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ type: 1, createdAt: -1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Virtual for unread status
notificationSchema.virtual('isUnread').get(function() {
  return !this.readAt;
});

// Virtual for delivery status
notificationSchema.virtual('isDelivered').get(function() {
  return !!this.deliveredAt;
});

// Methods
notificationSchema.methods.markAsRead = function() {
  this.readAt = new Date();
  return this.save();
};

notificationSchema.methods.markAsDelivered = function() {
  this.deliveredAt = new Date();
  return this.save();
};

// Static methods
notificationSchema.statics.getUnreadCount = async function(userId) {
  return this.countDocuments({ userId, readAt: null });
};

notificationSchema.statics.getUserNotifications = async function(userId, options = {}) {
  const {
    page = 1,
    limit = 20,
    unreadOnly = false,
    type = null,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = options;

  const skip = (page - 1) * limit;
  const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

  let query = { userId };
  
  if (unreadOnly) {
    query.readAt = null;
  }
  
  if (type) {
    query.type = type;
  }

  const notifications = await this.find(query)
    .sort(sort)
    .skip(skip)
    .limit(limit)
    .populate('userId', 'firstName lastName email avatar');

  const total = await this.countDocuments(query);

  return {
    notifications,
    pagination: {
      current: page,
      total: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrev: page > 1,
      totalCount: total
    }
  };
};

notificationSchema.statics.createNotification = async function(notificationData) {
  const notification = new this(notificationData);
  await notification.save();
  return notification;
};

notificationSchema.statics.createBulkNotifications = async function(notificationsData) {
  return this.insertMany(notificationsData);
};

// Pre-save middleware
notificationSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  
  // Set default expiration (30 days from creation)
  if (!this.expiresAt) {
    this.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  }
  
  next();
});

module.exports = mongoose.model('Notification', notificationSchema);
