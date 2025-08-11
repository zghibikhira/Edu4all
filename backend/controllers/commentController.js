const Comment = require('../models/comment');
const User = require('../models/user');

// Créer un commentaire
exports.createComment = async (req, res) => {
  try {
    const {
      content,
      type,
      entityType,
      entityId,
      parentComment,
      tags
    } = req.body;

    const authorId = req.user.id;

    // Validation des données
    if (!content || !entityType || !entityId) {
      return res.status(400).json({
        success: false,
        message: 'Contenu, type d\'entité et ID d\'entité sont requis'
      });
    }

    // Vérifier que l'utilisateur existe
    const author = await User.findById(authorId);
    if (!author) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    // Vérifier le commentaire parent si fourni
    if (parentComment) {
      const parent = await Comment.findById(parentComment);
      if (!parent) {
        return res.status(404).json({
          success: false,
          message: 'Commentaire parent non trouvé'
        });
      }
    }

    // Créer le commentaire
    const comment = new Comment({
      author: authorId,
      content,
      type: type || 'general',
      entityType,
      entityId,
      parentComment: parentComment || null,
      tags: tags || []
    });

    await comment.save();

    // Si c'est une réponse, mettre à jour le commentaire parent
    if (parentComment) {
      await Comment.findByIdAndUpdate(parentComment, {
        $push: { replies: comment._id }
      });
    }

    // Populate author info pour la réponse
    await comment.populate('author', 'firstName lastName avatar role');

    res.status(201).json({
      success: true,
      message: 'Commentaire créé avec succès',
      data: comment
    });

  } catch (error) {
    console.error('Erreur lors de la création du commentaire:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};

// Obtenir les commentaires pour une entité
exports.getComments = async (req, res) => {
  try {
    const { entityType, entityId } = req.params;
    const {
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      includeReplies = false,
      status = 'approved'
    } = req.query;

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sortBy,
      sortOrder,
      includeReplies: includeReplies === 'true',
      status
    };

    const result = await Comment.getCommentsForEntity(entityType, entityId, options);

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des commentaires:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};

// Obtenir un commentaire spécifique
exports.getComment = async (req, res) => {
  try {
    const { commentId } = req.params;

    const comment = await Comment.findById(commentId)
      .populate('author', 'firstName lastName avatar role')
      .populate('replies')
      .populate({
        path: 'replies',
        populate: {
          path: 'author',
          select: 'firstName lastName avatar role'
        }
      });

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Commentaire non trouvé'
      });
    }

    res.json({
      success: true,
      data: comment
    });

  } catch (error) {
    console.error('Erreur lors de la récupération du commentaire:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};

// Mettre à jour un commentaire
exports.updateComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { content, tags } = req.body;
    const userId = req.user.id;

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Commentaire non trouvé'
      });
    }

    // Vérifier les permissions
    if (comment.author.toString() !== userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Accès non autorisé'
      });
    }

    // Mettre à jour le contenu
    comment.editContent(content);
    if (tags) {
      comment.tags = tags;
    }

    await comment.save();

    // Populate author info
    await comment.populate('author', 'firstName lastName avatar role');

    res.json({
      success: true,
      message: 'Commentaire mis à jour avec succès',
      data: comment
    });

  } catch (error) {
    console.error('Erreur lors de la mise à jour du commentaire:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};

// Supprimer un commentaire
exports.deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user.id;

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Commentaire non trouvé'
      });
    }

    // Vérifier les permissions
    if (comment.author.toString() !== userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Accès non autorisé'
      });
    }

    // Si c'est une réponse, la retirer du commentaire parent
    if (comment.parentComment) {
      await Comment.findByIdAndUpdate(comment.parentComment, {
        $pull: { replies: commentId }
      });
    }

    // Supprimer le commentaire et toutes ses réponses
    await Comment.deleteMany({
      $or: [
        { _id: commentId },
        { parentComment: commentId }
      ]
    });

    res.json({
      success: true,
      message: 'Commentaire supprimé avec succès'
    });

  } catch (error) {
    console.error('Erreur lors de la suppression du commentaire:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};

// Ajouter une réaction à un commentaire
exports.addReaction = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { reactionType } = req.body;
    const userId = req.user.id;

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Commentaire non trouvé'
      });
    }

    // Ajouter la réaction
    comment.addReaction(userId, reactionType);
    await comment.save();

    const reactionCounts = comment.getReactionCount();

    res.json({
      success: true,
      message: 'Réaction ajoutée avec succès',
      data: {
        reactionCounts,
        userReactions: {
          liked: comment.reactions.likes.includes(userId),
          disliked: comment.reactions.dislikes.includes(userId),
          helpful: comment.reactions.helpful.includes(userId)
        }
      }
    });

  } catch (error) {
    console.error('Erreur lors de l\'ajout de la réaction:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};

// Signaler un commentaire
exports.flagComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { reason } = req.body;
    const userId = req.user.id;

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Commentaire non trouvé'
      });
    }

    // Marquer le commentaire comme signalé
    comment.status = 'flagged';
    comment.moderationReason = reason;
    await comment.save();

    res.json({
      success: true,
      message: 'Commentaire signalé avec succès'
    });

  } catch (error) {
    console.error('Erreur lors du signalement:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};

// Modérer un commentaire (admin seulement)
exports.moderateComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { status, moderationReason } = req.body;

    // Vérifier que l'utilisateur est admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Accès non autorisé'
      });
    }

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Commentaire non trouvé'
      });
    }

    comment.status = status;
    if (moderationReason) {
      comment.moderationReason = moderationReason;
    }

    await comment.save();

    res.json({
      success: true,
      message: 'Commentaire modéré avec succès',
      data: comment
    });

  } catch (error) {
    console.error('Erreur lors de la modération:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};

// Obtenir les statistiques des commentaires
exports.getCommentStats = async (req, res) => {
  try {
    const { entityType, entityId } = req.params;

    const stats = await Comment.getCommentStats(entityType, entityId);

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};

// Rechercher des commentaires
exports.searchComments = async (req, res) => {
  try {
    const { q, entityType, authorId, status = 'approved' } = req.query;
    const { page = 1, limit = 20 } = req.query;

    let query = { status };

    if (q) {
      query.$text = { $search: q };
    }

    if (entityType) {
      query.entityType = entityType;
    }

    if (authorId) {
      query.author = authorId;
    }

    const comments = await Comment.find(query)
      .populate('author', 'firstName lastName avatar role')
      .sort({ score: { $meta: 'textScore' } })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Comment.countDocuments(query);

    res.json({
      success: true,
      data: {
        comments,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Erreur lors de la recherche:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};

module.exports = {
  createComment,
  getComments,
  getComment,
  updateComment,
  deleteComment,
  addReaction,
  flagComment,
  moderateComment,
  getCommentStats,
  searchComments
};
