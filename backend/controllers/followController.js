const Follow = require('../models/follow');
const User = require('../models/user');
const Notification = require('../models/notification');

// Follow a teacher
const followTeacher = async (req, res) => {
  try {
    const { teacherId } = req.params;
    const studentId = req.user.id;

    // Validate that the user is a student
    if (req.user.role !== 'etudiant') {
      return res.status(403).json({
        success: false,
        message: 'Seuls les étudiants peuvent suivre des enseignants'
      });
    }

    // Check if teacher exists and is actually a teacher
    const teacher = await User.findById(teacherId);
    if (!teacher || teacher.role !== 'enseignant') {
      return res.status(404).json({
        success: false,
        message: 'Enseignant non trouvé'
      });
    }

    // Prevent self-following
    if (studentId === teacherId) {
      return res.status(400).json({
        success: false,
        message: 'Vous ne pouvez pas vous suivre vous-même'
      });
    }

    // Check if already following
    const existingFollow = await Follow.findOne({ followerId: studentId, teacherId });
    if (existingFollow) {
      return res.status(400).json({
        success: false,
        message: 'Vous suivez déjà cet enseignant'
      });
    }

    // Create follow relationship
    const follow = new Follow({
      followerId: studentId,
      teacherId: teacherId
    });

    await follow.save();

    // Update teacher's follower count
    await User.findByIdAndUpdate(teacherId, {
      $inc: { 'teacherInfo.followersCount': 1 }
    });

    // Send notification to teacher
    const notification = new Notification({
      recipient: teacherId,
      sender: studentId,
      type: 'follow',
      title: 'Nouveau follower',
      message: `${req.user.firstName} ${req.user.lastName} a commencé à vous suivre`,
      data: {
        followerId: studentId,
        followerName: `${req.user.firstName} ${req.user.lastName}`
      }
    });

    await notification.save();

    // Get updated follower count
    const followersCount = await Follow.getFollowersCount(teacherId);

    res.status(201).json({
      success: true,
      message: 'Vous suivez maintenant cet enseignant',
      data: {
        follow,
        followersCount
      }
    });

  } catch (error) {
    console.error('Error following teacher:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du suivi de l\'enseignant',
      error: error.message
    });
  }
};

// Unfollow a teacher
const unfollowTeacher = async (req, res) => {
  try {
    const { teacherId } = req.params;
    const studentId = req.user.id;

    // Validate that the user is a student
    if (req.user.role !== 'etudiant') {
      return res.status(403).json({
        success: false,
        message: 'Seuls les étudiants peuvent ne plus suivre des enseignants'
      });
    }

    // Check if follow relationship exists
    const follow = await Follow.findOne({ followerId: studentId, teacherId });
    if (!follow) {
      return res.status(404).json({
        success: false,
        message: 'Vous ne suivez pas cet enseignant'
      });
    }

    // Remove follow relationship
    await Follow.findByIdAndDelete(follow._id);

    // Update teacher's follower count
    await User.findByIdAndUpdate(teacherId, {
      $inc: { 'teacherInfo.followersCount': -1 }
    });

    // Get updated follower count
    const followersCount = await Follow.getFollowersCount(teacherId);

    res.json({
      success: true,
      message: 'Vous ne suivez plus cet enseignant',
      data: {
        followersCount
      }
    });

  } catch (error) {
    console.error('Error unfollowing teacher:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression du suivi',
      error: error.message
    });
  }
};

// Get teacher's followers
const getTeacherFollowers = async (req, res) => {
  try {
    const { teacherId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    // Check if teacher exists
    const teacher = await User.findById(teacherId);
    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: 'Enseignant non trouvé'
      });
    }

    const result = await Follow.getFollowers(teacherId, { page, limit });

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Error getting teacher followers:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des followers',
      error: error.message
    });
  }
};

// Get user's following list
const getUserFollowing = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20 } = req.query;

    const result = await Follow.getFollowing(userId, { page, limit });

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Error getting user following:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des enseignants suivis',
      error: error.message
    });
  }
};

// Check if user is following a teacher
const checkFollowStatus = async (req, res) => {
  try {
    const { teacherId } = req.params;
    const studentId = req.user.id;

    const isFollowing = await Follow.isFollowing(studentId, teacherId);

    res.json({
      success: true,
      data: {
        isFollowing
      }
    });

  } catch (error) {
    console.error('Error checking follow status:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la vérification du statut de suivi',
      error: error.message
    });
  }
};

// Get follow statistics for a teacher
const getTeacherFollowStats = async (req, res) => {
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

    const followersCount = await Follow.getFollowersCount(teacherId);

    res.json({
      success: true,
      data: {
        followersCount,
        teacherId
      }
    });

  } catch (error) {
    console.error('Error getting teacher follow stats:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des statistiques de suivi',
      error: error.message
    });
  }
};

module.exports = {
  followTeacher,
  unfollowTeacher,
  getTeacherFollowers,
  getUserFollowing,
  checkFollowStatus,
  getTeacherFollowStats
};
