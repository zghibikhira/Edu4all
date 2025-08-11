const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  // Relations
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Contenu du commentaire
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000
  },
  
  // Type de commentaire
  type: {
    type: String,
    enum: ['course', 'session', 'general', 'question', 'answer'],
    default: 'general'
  },
  
  // Référence à l'entité commentée
  entityType: {
    type: String,
    enum: ['course', 'session', 'user', 'general'],
    required: true
  },
  entityId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  
  // Commentaire parent (pour les réponses)
  parentComment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment',
    default: null
  },
  
  // Réponses à ce commentaire
  replies: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment'
  }],
  
  // Réactions (likes, dislikes)
  reactions: {
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    dislikes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    helpful: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
  },
  
  // Statut de modération
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'flagged'],
    default: 'pending'
  },
  
  // Raison du rejet ou du signalement
  moderationReason: {
    type: String,
    trim: true
  },
  
  // Métadonnées
  isEdited: {
    type: Boolean,
    default: false
  },
  editedAt: Date,
  editHistory: [{
    content: String,
    editedAt: Date
  }],
  
  // Visibilité
  isPublic: {
    type: Boolean,
    default: true
  },
  
  // Tags pour catégorisation
  tags: [String],
  
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

// Index pour les recherches
commentSchema.index({ entityType: 1, entityId: 1 });
commentSchema.index({ author: 1 });
commentSchema.index({ parentComment: 1 });
commentSchema.index({ status: 1 });
commentSchema.index({ createdAt: -1 });
commentSchema.index({ content: 'text' });

// Méthodes d'instance
commentSchema.methods.addReaction = function(userId, reactionType) {
  if (reactionType === 'like') {
    if (this.reactions.likes.includes(userId)) {
      this.reactions.likes = this.reactions.likes.filter(id => id.toString() !== userId.toString());
    } else {
      this.reactions.likes.push(userId);
      this.reactions.dislikes = this.reactions.dislikes.filter(id => id.toString() !== userId.toString());
    }
  } else if (reactionType === 'dislike') {
    if (this.reactions.dislikes.includes(userId)) {
      this.reactions.dislikes = this.reactions.dislikes.filter(id => id.toString() !== userId.toString());
    } else {
      this.reactions.dislikes.push(userId);
      this.reactions.likes = this.reactions.likes.filter(id => id.toString() !== userId.toString());
    }
  } else if (reactionType === 'helpful') {
    if (this.reactions.helpful.includes(userId)) {
      this.reactions.helpful = this.reactions.helpful.filter(id => id.toString() !== userId.toString());
    } else {
      this.reactions.helpful.push(userId);
    }
  }
};

commentSchema.methods.editContent = function(newContent) {
  // Sauvegarder l'ancien contenu dans l'historique
  this.editHistory.push({
    content: this.content,
    editedAt: new Date()
  });
  
  this.content = newContent;
  this.isEdited = true;
  this.editedAt = new Date();
};

commentSchema.methods.getReactionCount = function() {
  return {
    likes: this.reactions.likes.length,
    dislikes: this.reactions.dislikes.length,
    helpful: this.reactions.helpful.length
  };
};

// Méthodes statiques
commentSchema.statics.getCommentsForEntity = async function(entityType, entityId, options = {}) {
  const {
    page = 1,
    limit = 20,
    sortBy = 'createdAt',
    sortOrder = 'desc',
    includeReplies = false,
    status = 'approved'
  } = options;
  
  const query = {
    entityType,
    entityId,
    status,
    parentComment: null // Seulement les commentaires principaux
  };
  
  const sort = {};
  sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
  
  const comments = await this.find(query)
    .populate('author', 'firstName lastName avatar role')
    .sort(sort)
    .skip((page - 1) * limit)
    .limit(limit);
  
  if (includeReplies) {
    // Populate replies for each comment
    for (let comment of comments) {
      comment.replies = await this.find({ parentComment: comment._id, status: 'approved' })
        .populate('author', 'firstName lastName avatar role')
        .sort({ createdAt: 1 });
    }
  }
  
  const total = await this.countDocuments(query);
  
  return {
    comments,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  };
};

commentSchema.statics.getCommentStats = async function(entityType, entityId) {
  const stats = await this.aggregate([
    { $match: { entityType, entityId, status: 'approved' } },
    {
      $group: {
        _id: null,
        totalComments: { $sum: 1 },
        totalReplies: { $sum: { $size: '$replies' } },
        totalLikes: { $sum: { $size: '$reactions.likes' } },
        totalDislikes: { $sum: { $size: '$reactions.dislikes' } },
        totalHelpful: { $sum: { $size: '$reactions.helpful' } }
      }
    }
  ]);
  
  return stats[0] || {
    totalComments: 0,
    totalReplies: 0,
    totalLikes: 0,
    totalDislikes: 0,
    totalHelpful: 0
  };
};

// Middleware pre-save
commentSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Comment', commentSchema);
