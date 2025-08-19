const Post = require('../models/post');
const User = require('../models/user');
const Follow = require('../models/follow');
const Notification = require('../models/notification');

// Create a new post
const createPost = async (req, res) => {
  try {
    const { text, visibility = 'public', tags = [], media = [] } = req.body;
    const teacherId = req.user.id;

    // Validate that the user is a teacher
    if (req.user.role !== 'enseignant') {
      return res.status(403).json({
        success: false,
        message: 'Seuls les enseignants peuvent créer des posts'
      });
    }

    // Validate required fields
    if (!text || text.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Le contenu du post est requis'
      });
    }

    if (text.length > 2000) {
      return res.status(400).json({
        success: false,
        message: 'Le contenu du post ne peut pas dépasser 2000 caractères'
      });
    }

    // Create the post
    const post = new Post({
      teacherId,
      text: text.trim(),
      visibility,
      tags,
      media
    });

    await post.save();

    // Update teacher's post count
    await User.findByIdAndUpdate(teacherId, {
      $inc: { 'teacherInfo.postsCount': 1 }
    });

    // Populate teacher info
    await post.populate('teacherId', 'firstName lastName avatar role');

    // Send notifications to followers if post is public or followers-only
    if (visibility === 'public' || visibility === 'followers') {
      const followers = await Follow.find({ teacherId });
      
      const notifications = followers.map(follow => ({
        recipient: follow.followerId,
        sender: teacherId,
        type: 'new_post',
        title: 'Nouveau post',
        message: `${req.user.firstName} ${req.user.lastName} a publié un nouveau post`,
        data: {
          postId: post._id,
          teacherName: `${req.user.firstName} ${req.user.lastName}`,
          postPreview: text.substring(0, 100) + (text.length > 100 ? '...' : '')
        }
      }));

      if (notifications.length > 0) {
        await Notification.insertMany(notifications);
      }
    }

    res.status(201).json({
      success: true,
      message: 'Post créé avec succès',
      data: post
    });

  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création du post',
      error: error.message
    });
  }
};

// Get teacher's posts
const getTeacherPosts = async (req, res) => {
  try {
    const { teacherId } = req.params;
    const { page = 1, limit = 10, visibility = 'public' } = req.query;
    const userId = req.user?.id;

    // Check if teacher exists
    const teacher = await User.findById(teacherId);
    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: 'Enseignant non trouvé'
      });
    }

    // Determine visibility filter
    let visibilityFilter = visibility;
    if (userId && userId === teacherId) {
      // Teacher can see all their own posts
      visibilityFilter = 'all';
    } else if (userId) {
      // Check if user is following the teacher
      const isFollowing = await Follow.isFollowing(userId, teacherId);
      if (isFollowing) {
        visibilityFilter = 'all'; // Followers can see public and followers-only posts
      }
    }

    const result = await Post.getTeacherPosts(teacherId, {
      page,
      limit,
      visibility: visibilityFilter
    });

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Error getting teacher posts:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des posts',
      error: error.message
    });
  }
};

// Get user's feed (posts from followed teachers)
const getFeedPosts = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10 } = req.query;

    // Get user's following list
    const following = await Follow.find({ followerId: userId });
    const followingIds = following.map(f => f.teacherId);

    const result = await Post.getFeedPosts(userId, followingIds, { page, limit });

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Error getting feed posts:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du feed',
      error: error.message
    });
  }
};

// Get a specific post
const getPost = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user?.id;

    const post = await Post.findById(postId)
      .populate('teacherId', 'firstName lastName avatar role');

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post non trouvé'
      });
    }

    // Check visibility permissions
    if (post.visibility === 'private' && userId !== post.teacherId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Accès non autorisé à ce post'
      });
    }

    if (post.visibility === 'followers' && userId !== post.teacherId.toString()) {
      if (!userId) {
        return res.status(403).json({
          success: false,
          message: 'Connexion requise pour voir ce post'
        });
      }
      
      const isFollowing = await Follow.isFollowing(userId, post.teacherId);
      if (!isFollowing) {
        return res.status(403).json({
          success: false,
          message: 'Vous devez suivre cet enseignant pour voir ce post'
        });
      }
    }

    // Increment view count
    post.incrementViews();
    await post.save();

    res.json({
      success: true,
      data: post
    });

  } catch (error) {
    console.error('Error getting post:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du post',
      error: error.message
    });
  }
};

// Update a post
const updatePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const { text, visibility, tags } = req.body;
    const teacherId = req.user.id;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post non trouvé'
      });
    }

    // Check if user owns the post
    if (post.teacherId.toString() !== teacherId) {
      return res.status(403).json({
        success: false,
        message: 'Vous ne pouvez modifier que vos propres posts'
      });
    }

    // Update post
    if (text) {
      post.editPost(text);
    }
    if (visibility) {
      post.visibility = visibility;
    }
    if (tags) {
      post.tags = tags;
    }

    await post.save();
    await post.populate('teacherId', 'firstName lastName avatar role');

    res.json({
      success: true,
      message: 'Post mis à jour avec succès',
      data: post
    });

  } catch (error) {
    console.error('Error updating post:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du post',
      error: error.message
    });
  }
};

// Delete a post
const deletePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const teacherId = req.user.id;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post non trouvé'
      });
    }

    // Check if user owns the post or is admin
    if (post.teacherId.toString() !== teacherId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Vous ne pouvez supprimer que vos propres posts'
      });
    }

    // Soft delete by setting status to deleted
    post.status = 'deleted';
    await post.save();

    // Update teacher's post count
    await User.findByIdAndUpdate(teacherId, {
      $inc: { 'teacherInfo.postsCount': -1 }
    });

    res.json({
      success: true,
      message: 'Post supprimé avec succès'
    });

  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression du post',
      error: error.message
    });
  }
};

// Like/unlike a post
const toggleLike = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.id;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post non trouvé'
      });
    }

    // Check if user has already liked the post
    const hasLiked = post.engagement.likes.includes(userId);

    if (hasLiked) {
      post.removeLike(userId);
    } else {
      post.addLike(userId);
    }

    await post.save();

    res.json({
      success: true,
      message: hasLiked ? 'Like retiré' : 'Post liké',
      data: {
        likesCount: post.engagement.likes.length,
        hasLiked: !hasLiked
      }
    });

  } catch (error) {
    console.error('Error toggling like:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du like/unlike',
      error: error.message
    });
  }
};

// Share a post
const sharePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.id;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post non trouvé'
      });
    }

    post.addShare(userId);
    await post.save();

    res.json({
      success: true,
      message: 'Post partagé avec succès',
      data: {
        sharesCount: post.engagement.shares.length
      }
    });

  } catch (error) {
    console.error('Error sharing post:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du partage',
      error: error.message
    });
  }
};

// Get post statistics
const getPostStats = async (req, res) => {
  try {
    const { teacherId } = req.params;

    // Check if teacher exists
    const teacher = await User.findById(teacherId);
    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: 'Enseignant non trouvé'
      });
    }

    const stats = await Post.getPostStats(teacherId);

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Error getting post stats:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des statistiques',
      error: error.message
    });
  }
};

// Report a post
const reportPost = async (req, res) => {
  try {
    const { postId } = req.params;
    const { reason } = req.body;
    const userId = req.user.id;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post non trouvé'
      });
    }

    // Mark post as flagged
    post.status = 'flagged';
    post.moderationReason = reason;
    await post.save();

    res.json({
      success: true,
      message: 'Post signalé avec succès'
    });

  } catch (error) {
    console.error('Error reporting post:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du signalement',
      error: error.message
    });
  }
};

module.exports = {
  createPost,
  getTeacherPosts,
  getFeedPosts,
  getPost,
  updatePost,
  deletePost,
  toggleLike,
  sharePost,
  getPostStats,
  reportPost
};
