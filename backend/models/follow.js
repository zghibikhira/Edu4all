const mongoose = require('mongoose');

const followSchema = new mongoose.Schema({
  // Follower (student)
  followerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Teacher being followed
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Metadata
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Ensure unique follow relationship
followSchema.index({ followerId: 1, teacherId: 1 }, { unique: true });

// Indexes for efficient queries
followSchema.index({ teacherId: 1, createdAt: -1 });
followSchema.index({ followerId: 1, createdAt: -1 });

// Static methods
followSchema.statics.getFollowersCount = async function(teacherId) {
  return await this.countDocuments({ teacherId });
};

followSchema.statics.getFollowingCount = async function(followerId) {
  return await this.countDocuments({ followerId });
};

followSchema.statics.isFollowing = async function(followerId, teacherId) {
  const follow = await this.findOne({ followerId, teacherId });
  return !!follow;
};

followSchema.statics.getFollowers = async function(teacherId, options = {}) {
  const { page = 1, limit = 20 } = options;
  const skip = (page - 1) * limit;
  
  const followers = await this.find({ teacherId })
    .populate('followerId', 'firstName lastName avatar role email')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));
    
  const total = await this.countDocuments({ teacherId });
  const pages = Math.ceil(total / limit);
  
  return {
    followers,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages,
      hasNext: parseInt(page) < pages
    }
  };
};

followSchema.statics.getFollowing = async function(followerId, options = {}) {
  const { page = 1, limit = 20 } = options;
  const skip = (page - 1) * limit;
  
  const following = await this.find({ followerId })
    .populate('teacherId', 'firstName lastName avatar role email teacherInfo')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));
    
  const total = await this.countDocuments({ followerId });
  const pages = Math.ceil(total / limit);
  
  return {
    following,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages,
      hasNext: parseInt(page) < pages
    }
  };
};

module.exports = mongoose.model('Follow', followSchema);
