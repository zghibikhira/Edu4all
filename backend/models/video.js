const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  subject: {
    type: String,
    required: true
  },
  level: {
    type: String,
    required: true,
    enum: ['debutant', 'intermediaire', 'avance', 'primaire', 'college', 'lycee', 'superieur']
  },
  videoUrl: {
    type: String,
    required: true
  },
  cloudinaryId: {
    type: String
  },
  duration: {
    type: Number // en secondes
  },
  tags: [{
    type: String,
    trim: true
  }],
  isPublic: {
    type: Boolean,
    default: true
  },
  views: {
    type: Number,
    default: 0
  },
  likes: {
    type: Number,
    default: 0
  },
  uploadDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['processing', 'ready', 'error'],
    default: 'ready'
  }
}, {
  timestamps: true
});

// Index pour les recherches
videoSchema.index({ teacher: 1, uploadDate: -1 });
videoSchema.index({ subject: 1, level: 1 });
videoSchema.index({ isPublic: 1, uploadDate: -1 });
videoSchema.index({ tags: 1 });

module.exports = mongoose.model('Video', videoSchema); 