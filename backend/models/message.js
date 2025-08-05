const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  },
  room: {
    type: String,
    default: 'general'
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  messageType: {
    type: String,
    enum: ['text', 'file', 'image', 'system'],
    default: 'text'
  },
  fileUrl: String,
  fileName: String,
  fileSize: Number,
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: Date,
  edited: {
    type: Boolean,
    default: false
  },
  editedAt: Date,
  deleted: {
    type: Boolean,
    default: false
  },
  deletedAt: Date,
  metadata: {
    type: Map,
    of: String
  }
}, {
  timestamps: true
});

// Index pour les performances
messageSchema.index({ room: 1, createdAt: -1 });
messageSchema.index({ sender: 1, receiver: 1 });
messageSchema.index({ courseId: 1, createdAt: -1 });
messageSchema.index({ createdAt: -1 });

// Méthodes d'instance
messageSchema.methods.markAsRead = function() {
  this.isRead = true;
  this.readAt = new Date();
  return this.save();
};

messageSchema.methods.editMessage = function(newContent) {
  this.content = newContent;
  this.edited = true;
  this.editedAt = new Date();
  return this.save();
};

messageSchema.methods.deleteMessage = function() {
  this.deleted = true;
  this.deletedAt = new Date();
  return this.save();
};

// Méthodes statiques
messageSchema.statics.getRoomMessages = function(room, limit = 50, offset = 0) {
  return this.find({ 
    room: room,
    deleted: false 
  })
  .populate('sender', 'name email role')
  .sort({ createdAt: -1 })
  .limit(limit)
  .skip(offset)
  .lean();
};

messageSchema.statics.getDirectMessages = function(user1Id, user2Id, limit = 50, offset = 0) {
  return this.find({
    $or: [
      { sender: user1Id, receiver: user2Id },
      { sender: user2Id, receiver: user1Id }
    ],
    deleted: false
  })
  .populate('sender', 'name email role')
  .populate('receiver', 'name email role')
  .sort({ createdAt: -1 })
  .limit(limit)
  .skip(offset)
  .lean();
};

messageSchema.statics.getCourseMessages = function(courseId, limit = 50, offset = 0) {
  return this.find({
    courseId: courseId,
    deleted: false
  })
  .populate('sender', 'name email role')
  .sort({ createdAt: -1 })
  .limit(limit)
  .skip(offset)
  .lean();
};

module.exports = mongoose.model('Message', messageSchema); 