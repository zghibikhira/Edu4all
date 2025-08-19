const mongoose = require('mongoose');

const deliveryLogSchema = new mongoose.Schema({
  notificationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Notification',
    required: true,
    index: true
  },
  channel: {
    type: String,
    enum: ['email', 'sms', 'inApp'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'sent', 'delivered', 'failed', 'bounced'],
    default: 'pending'
  },
  providerId: {
    type: String,
    trim: true
  },
  providerResponse: {
    type: mongoose.Schema.Types.Mixed
  },
  error: {
    code: String,
    message: String,
    details: mongoose.Schema.Types.Mixed
  },
  attempts: {
    type: Number,
    default: 0
  },
  maxAttempts: {
    type: Number,
    default: 3
  },
  nextRetryAt: Date,
  sentAt: Date,
  deliveredAt: Date,
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
deliveryLogSchema.index({ notificationId: 1, channel: 1 });
deliveryLogSchema.index({ status: 1, nextRetryAt: 1 });
deliveryLogSchema.index({ channel: 1, status: 1 });
deliveryLogSchema.index({ createdAt: -1 });

// Methods
deliveryLogSchema.methods.markAsSent = function(providerId, providerResponse) {
  this.status = 'sent';
  this.providerId = providerId;
  this.providerResponse = providerResponse;
  this.sentAt = new Date();
  this.updatedAt = new Date();
  return this.save();
};

deliveryLogSchema.methods.markAsDelivered = function() {
  this.status = 'delivered';
  this.deliveredAt = new Date();
  this.updatedAt = new Date();
  return this.save();
};

deliveryLogSchema.methods.markAsFailed = function(error, providerResponse) {
  this.status = 'failed';
  this.error = error;
  this.providerResponse = providerResponse;
  this.attempts += 1;
  this.updatedAt = new Date();
  
  // Set next retry if attempts < maxAttempts
  if (this.attempts < this.maxAttempts) {
    // Exponential backoff: 1min, 5min, 15min
    const backoffMinutes = Math.pow(3, this.attempts);
    this.nextRetryAt = new Date(Date.now() + backoffMinutes * 60 * 1000);
  }
  
  return this.save();
};

deliveryLogSchema.methods.canRetry = function() {
  return this.status === 'failed' && this.attempts < this.maxAttempts;
};

deliveryLogSchema.methods.shouldRetry = function() {
  return this.canRetry() && this.nextRetryAt && new Date() >= this.nextRetryAt;
};

// Static methods
deliveryLogSchema.statics.getFailedDeliveries = async function(channel, limit = 100) {
  return this.find({
    channel,
    status: 'failed',
    attempts: { $lt: '$maxAttempts' },
    $or: [
      { nextRetryAt: { $lte: new Date() } },
      { nextRetryAt: { $exists: false } }
    ]
  })
  .sort({ nextRetryAt: 1 })
  .limit(limit)
  .populate('notificationId');
};

deliveryLogSchema.statics.getDeliveryStats = async function(channel, timeRange = '24h') {
  const now = new Date();
  let startDate;
  
  switch (timeRange) {
    case '1h':
      startDate = new Date(now.getTime() - 60 * 60 * 1000);
      break;
    case '24h':
      startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      break;
    case '7d':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case '30d':
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    default:
      startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  }
  
  const stats = await this.aggregate([
    {
      $match: {
        channel,
        createdAt: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);
  
  const result = {
    total: 0,
    sent: 0,
    delivered: 0,
    failed: 0,
    pending: 0
  };
  
  stats.forEach(stat => {
    result[stat._id] = stat.count;
    result.total += stat.count;
  });
  
  return result;
};

// Pre-save middleware
deliveryLogSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('DeliveryLog', deliveryLogSchema);
