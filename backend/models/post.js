const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  // Teacher who created the post
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Post content
  text: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000
  },
  
  // Media attachments (images, videos, documents)
  media: [{
    type: {
      type: String,
      enum: ['image', 'video', 'document'],
      required: true
    },
    url: {
      type: String,
      required: true
    },
    filename: String,
    size: Number,
    mimeType: String
  }],
  
  // Post visibility
  visibility: {
    type: String,
    enum: ['public', 'followers', 'private'],
    default: 'public'
  },
  
  // Engagement metrics
  engagement: {
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    shares: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    commentsCount: { type: Number, default: 0 },
    viewsCount: { type: Number, default: 0 }
  },
  
  // Moderation status
  status: {
    type: String,
    enum: ['active', 'hidden', 'deleted', 'flagged'],
    default: 'active'
  },
  
  // Moderation metadata
  moderationReason: String,
  moderatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  moderatedAt: Date,
  
  // Tags for categorization
  tags: [String],
  
  // Metadata
  isEdited: { type: Boolean, default: false },
  editedAt: Date,
  editHistory: [{
    text: String,
    editedAt: Date
  }],
  
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

// Indexes for efficient queries
postSchema.index({ teacherId: 1, createdAt: -1 });
postSchema.index({ status: 1 });
postSchema.index({ visibility: 1 });
postSchema.index({ tags: 1 });
postSchema.index({ text: 'text' });

// Instance methods
postSchema.methods.addLike = function(userId) {
  if (!this.engagement.likes.includes(userId)) {
    this.engagement.likes.push(userId);
  }
};

postSchema.methods.removeLike = function(userId) {
  this.engagement.likes = this.engagement.likes.filter(id => id.toString() !== userId.toString());
};

postSchema.methods.addShare = function(userId) {
  if (!this.engagement.shares.includes(userId)) {
    this.engagement.shares.push(userId);
  }
};

postSchema.methods.incrementViews = function() {
  this.engagement.viewsCount += 1;
};

postSchema.methods.incrementComments = function() {
  this.engagement.commentsCount += 1;
};

postSchema.methods.decrementComments = function() {
  this.engagement.commentsCount = Math.max(0, this.engagement.commentsCount - 1);
};

postSchema.methods.editPost = function(newText) {
  // Save edit history
  this.editHistory.push({
    text: this.text,
    editedAt: new Date()
  });
  
  this.text = newText;
  this.isEdited = true;
  this.editedAt = new Date();
};

// Static methods
postSchema.statics.getTeacherPosts = async function(teacherId, options = {}) {
  const { 
    page = 1, 
    limit = 10, 
    status = 'active',
    visibility = 'public'
  } = options;
  
  const skip = (page - 1) * limit;
  
  const query = { teacherId, status };
  if (visibility !== 'all') {
    query.visibility = visibility;
  }
  
  const posts = await this.find(query)
    .populate('teacherId', 'firstName lastName avatar role')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));
    
  const total = await this.countDocuments(query);
  const pages = Math.ceil(total / limit);
  
  return {
    posts,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages,
      hasNext: parseInt(page) < pages
    }
  };
};

postSchema.statics.getFeedPosts = async function(userId, followingIds, options = {}) {
  const { page = 1, limit = 10 } = options;
  const skip = (page - 1) * limit;
  
  // Get posts from followed teachers and public posts
  const query = {
    status: 'active',
    $or: [
      { teacherId: { $in: followingIds } },
      { visibility: 'public' }
    ]
  };
  
  const posts = await this.find(query)
    .populate('teacherId', 'firstName lastName avatar role')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));
    
  const total = await this.countDocuments(query);
  const pages = Math.ceil(total / limit);
  
  return {
    posts,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages,
      hasNext: parseInt(page) < pages
    }
  };
};

postSchema.statics.getPostStats = async function(teacherId) {
  const stats = await this.aggregate([
    { $match: { teacherId: mongoose.Types.ObjectId(teacherId), status: 'active' } },
    {
      $group: {
        _id: null,
        totalPosts: { $sum: 1 },
        totalLikes: { $sum: { $size: '$engagement.likes' } },
        totalShares: { $sum: { $size: '$engagement.shares' } },
        totalComments: { $sum: '$engagement.commentsCount' },
        totalViews: { $sum: '$engagement.viewsCount' }
      }
    }
  ]);
  
  return stats[0] || {
    totalPosts: 0,
    totalLikes: 0,
    totalShares: 0,
    totalComments: 0,
    totalViews: 0
  };
};

// Middleware pre-save
postSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Post', postSchema);
