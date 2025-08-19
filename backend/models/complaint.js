const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
  // Reporter information
  reporterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  // Target user (optional - for complaints against specific users)
  againstUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true
  },
  
  // Related entities (optional)
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Purchase'
  },
  sessionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Session'
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  },
  
  // Complaint details
  category: {
    type: String,
    enum: [
      'INAPPROPRIATE_BEHAVIOR',
      'HARASSMENT',
      'FRAUD',
      'COPYRIGHT_VIOLATION',
      'TECHNICAL_ISSUE',
      'PAYMENT_ISSUE',
      'QUALITY_ISSUE',
      'SPAM',
      'OTHER'
    ],
    required: true
  },
  
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000
  },
  
  // Evidence files
  evidenceFiles: [{
    filename: String,
    originalName: String,
    fileType: String,
    fileUrl: String,
    cloudinaryId: String,
    uploadedAt: { type: Date, default: Date.now },
    description: String
  }],
  
  // Status and workflow
  status: {
    type: String,
    enum: ['NEW', 'UNDER_REVIEW', 'RESOLVED', 'REJECTED', 'ESCALATED'],
    default: 'NEW',
    index: true
  },
  
  priority: {
    type: String,
    enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'],
    default: 'MEDIUM'
  },
  
  // Admin management
  adminNotes: [{
    adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    note: { type: String, required: true },
    isInternal: { type: Boolean, default: false }, // Internal notes not visible to reporter
    createdAt: { type: Date, default: Date.now }
  }],
  
  // Resolution
  resolution: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  
  resolvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  resolvedAt: Date,
  
  // Escalation
  escalatedTo: {
    type: String,
    enum: ['LEGAL', 'TECHNICAL', 'FINANCIAL', 'SUPPORT']
  },
  
  escalatedAt: Date,
  
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
complaintSchema.index({ status: 1, createdAt: -1 });
complaintSchema.index({ category: 1, status: 1 });
complaintSchema.index({ reporterId: 1, createdAt: -1 });
complaintSchema.index({ againstUserId: 1, status: 1 });
complaintSchema.index({ priority: 1, status: 1 });

// Virtual for time since creation
complaintSchema.virtual('timeSinceCreation').get(function() {
  return Date.now() - this.createdAt.getTime();
});

// Methods
complaintSchema.methods.addAdminNote = function(adminId, note, isInternal = false) {
  this.adminNotes.push({
    adminId,
    note,
    isInternal,
    createdAt: new Date()
  });
  this.updatedAt = new Date();
  return this.save();
};

complaintSchema.methods.updateStatus = function(newStatus, adminId, resolution = null) {
  this.status = newStatus;
  this.updatedAt = new Date();
  
  if (newStatus === 'RESOLVED') {
    this.resolvedBy = adminId;
    this.resolvedAt = new Date();
    if (resolution) {
      this.resolution = resolution;
    }
  }
  
  return this.save();
};

complaintSchema.methods.escalate = function(escalatedTo, adminId) {
  this.status = 'ESCALATED';
  this.escalatedTo = escalatedTo;
  this.escalatedAt = new Date();
  this.updatedAt = new Date();
  return this.save();
};

// Static methods
complaintSchema.statics.getComplaintsByStatus = function(status, options = {}) {
  const query = status ? { status } : {};
  
  return this.find(query)
    .populate('reporterId', 'firstName lastName email')
    .populate('againstUserId', 'firstName lastName email')
    .populate('resolvedBy', 'firstName lastName email')
    .sort({ createdAt: -1 })
    .limit(options.limit || 50)
    .skip(options.skip || 0);
};

complaintSchema.statics.getUserComplaints = function(userId, options = {}) {
  return this.find({ reporterId: userId })
    .populate('againstUserId', 'firstName lastName email')
    .populate('resolvedBy', 'firstName lastName email')
    .sort({ createdAt: -1 })
    .limit(options.limit || 20)
    .skip(options.skip || 0);
};

complaintSchema.statics.getComplaintsAgainstUser = function(userId, options = {}) {
  return this.find({ againstUserId: userId })
    .populate('reporterId', 'firstName lastName email')
    .populate('resolvedBy', 'firstName lastName email')
    .sort({ createdAt: -1 })
    .limit(options.limit || 20)
    .skip(options.skip || 0);
};

// Pre-save middleware
complaintSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Complaint', complaintSchema);
