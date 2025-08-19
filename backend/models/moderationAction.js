const mongoose = require('mongoose');

const moderationActionSchema = new mongoose.Schema({
  // Admin who performed the action
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  // Action type
  type: {
    type: String,
    enum: ['WARN', 'BAN', 'UNBAN', 'NOTE', 'SUSPEND', 'RESTRICT'],
    required: true
  },
  
  // Target user
  targetUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  // Related complaint (optional)
  complaintId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Complaint',
    index: true
  },
  
  // Action details
  reason: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  
  // Duration for temporary actions
  duration: {
    type: Number, // in hours, 0 for permanent
    default: 0
  },
  
  // Additional metadata
  metadata: {
    type: Map,
    of: String
  },
  
  // Status
  status: {
    type: String,
    enum: ['ACTIVE', 'EXPIRED', 'REVOKED'],
    default: 'ACTIVE'
  },
  
  // Expiration
  expiresAt: Date,
  
  // Revocation
  revokedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  revokedAt: Date,
  
  revokedReason: String,
  
  // Timestamps
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
moderationActionSchema.index({ targetUserId: 1, status: 1 });
moderationActionSchema.index({ type: 1, createdAt: -1 });
moderationActionSchema.index({ adminId: 1, createdAt: -1 });
moderationActionSchema.index({ complaintId: 1 });
moderationActionSchema.index({ expiresAt: 1 });

// Virtual for checking if action is expired
moderationActionSchema.virtual('isExpired').get(function() {
  if (this.duration === 0) return false; // Permanent action
  return this.expiresAt && this.expiresAt < new Date();
});

// Virtual for checking if action is active
moderationActionSchema.virtual('isActive').get(function() {
  return this.status === 'ACTIVE' && !this.isExpired;
});

// Methods
moderationActionSchema.methods.revoke = function(revokedBy, reason) {
  this.status = 'REVOKED';
  this.revokedBy = revokedBy;
  this.revokedAt = new Date();
  this.revokedReason = reason;
  this.updatedAt = new Date();
  return this.save();
};

moderationActionSchema.methods.expire = function() {
  this.status = 'EXPIRED';
  this.updatedAt = new Date();
  return this.save();
};

// Static methods
moderationActionSchema.statics.getActiveActionsForUser = function(userId) {
  return this.find({
    targetUserId: userId,
    status: 'ACTIVE',
    $or: [
      { duration: 0 }, // Permanent actions
      { expiresAt: { $gt: new Date() } } // Non-expired temporary actions
    ]
  }).populate('adminId', 'firstName lastName email');
};

moderationActionSchema.statics.getUserActionHistory = function(userId, options = {}) {
  return this.find({ targetUserId: userId })
    .populate('adminId', 'firstName lastName email')
    .populate('revokedBy', 'firstName lastName email')
    .populate('complaintId', 'title category')
    .sort({ createdAt: -1 })
    .limit(options.limit || 50)
    .skip(options.skip || 0);
};

moderationActionSchema.statics.getActionsByType = function(type, options = {}) {
  return this.find({ type })
    .populate('adminId', 'firstName lastName email')
    .populate('targetUserId', 'firstName lastName email')
    .populate('complaintId', 'title category')
    .sort({ createdAt: -1 })
    .limit(options.limit || 50)
    .skip(options.skip || 0);
};

// Pre-save middleware to set expiration date
moderationActionSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  
  // Set expiration date for temporary actions
  if (this.duration > 0 && !this.expiresAt) {
    this.expiresAt = new Date(Date.now() + this.duration * 60 * 60 * 1000);
  }
  
  next();
});

module.exports = mongoose.model('ModerationAction', moderationActionSchema);
