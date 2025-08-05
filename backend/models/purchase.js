const mongoose = require('mongoose');

const purchaseSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  type: {
    type: String,
    enum: ['full_course', 'pdf_only', 'video_only'],
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'EUR'
  },
  paymentMethod: {
    type: String,
    enum: ['stripe', 'paypal', 'wallet'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentIntentId: String, // Stripe
  paypalOrderId: String,   // PayPal
  transactionId: String,   // Internal transaction ID
  
  // Informations sur les fichiers achetés
  purchasedFiles: [{
    fileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course.files'
    },
    filename: String,
    originalName: String,
    fileType: String,
    fileUrl: String,
    downloadCount: {
      type: Number,
      default: 0
    },
    lastDownloaded: Date
  }],
  
  // Accès et permissions
  accessGranted: {
    type: Boolean,
    default: false
  },
  accessExpiresAt: Date, // Pour les abonnements temporaires
  
  // Métadonnées
  metadata: {
    type: Map,
    of: String
  },
  
  // Dates
  purchasedAt: {
    type: Date,
    default: Date.now
  },
  completedAt: Date,
  refundedAt: Date
}, {
  timestamps: true
});

// Index pour les performances
purchaseSchema.index({ user: 1, course: 1 });
purchaseSchema.index({ status: 1 });
purchaseSchema.index({ purchasedAt: -1 });

// Méthodes d'instance
purchaseSchema.methods.grantAccess = function() {
  this.accessGranted = true;
  this.completedAt = new Date();
  return this.save();
};

purchaseSchema.methods.revokeAccess = function() {
  this.accessGranted = false;
  return this.save();
};

purchaseSchema.methods.canDownload = function() {
  return this.accessGranted && 
         this.status === 'completed' &&
         (!this.accessExpiresAt || this.accessExpiresAt > new Date());
};

purchaseSchema.methods.incrementDownloadCount = function(fileId) {
  const file = this.purchasedFiles.find(f => f.fileId.toString() === fileId.toString());
  if (file) {
    file.downloadCount += 1;
    file.lastDownloaded = new Date();
    return this.save();
  }
  return Promise.reject(new Error('File not found in purchase'));
};

// Méthodes statiques
purchaseSchema.statics.findUserPurchases = function(userId, options = {}) {
  const query = { user: userId };
  
  if (options.status) {
    query.status = options.status;
  }
  
  if (options.courseId) {
    query.course = options.courseId;
  }
  
  return this.find(query)
    .populate('course', 'title description instructor')
    .sort({ purchasedAt: -1 })
    .limit(options.limit || 10)
    .skip(options.skip || 0);
};

purchaseSchema.statics.hasUserPurchased = function(userId, courseId, type = 'full_course') {
  return this.findOne({
    user: userId,
    course: courseId,
    type: type,
    status: 'completed',
    accessGranted: true
  });
};

module.exports = mongoose.model('Purchase', purchaseSchema); 