const TeacherRating = require('../models/teacherRating');
const User = require('../models/user');
const Course = require('../models/course');

const createTeacherRating = async (req, res) => {
  try {
    const { teacherId, courseId, overallRating, criteria, comment, wouldRecommend } = req.body;
    const studentId = req.user.id;

    // Check if student has already rated this teacher
    const existingRating = await TeacherRating.findOne({
      student: studentId,
      teacher: teacherId
    });

    if (existingRating) {
      return res.status(400).json({
        success: false,
        message: 'Vous avez déjà évalué cet enseignant'
      });
    }

    // Validate teacher exists and is actually a teacher
    const teacher = await User.findById(teacherId);
    if (!teacher || teacher.role !== 'enseignant') {
      return res.status(400).json({
        success: false,
        message: 'Enseignant non trouvé ou invalide'
      });
    }

    // Validate course if provided
    if (courseId) {
      const course = await Course.findById(courseId);
      if (!course) {
        return res.status(400).json({
          success: false,
          message: 'Cours non trouvé'
        });
      }
    }

    // Create the rating
    const teacherRating = new TeacherRating({
      student: studentId,
      teacher: teacherId,
      course: courseId,
      overallRating,
      criteria,
      comment,
      wouldRecommend
    });

    await teacherRating.save();

    // Update teacher stats
    await updateTeacherStats(teacherId);

    res.status(201).json({
      success: true,
      message: 'Évaluation créée avec succès',
      data: teacherRating
    });
  } catch (error) {
    console.error('Error creating teacher rating:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de l\'évaluation',
      error: error.message
    });
  }
};

const getTeacherRatings = async (req, res) => {
  try {
    const { teacherId } = req.params;
    const { page = 1, limit = 10, status = 'approved' } = req.query;

    const skip = (page - 1) * limit;

    // Build query
    const query = { teacher: teacherId };
    if (status !== 'all') {
      query.status = status;
    }

    const ratings = await TeacherRating.find(query)
      .populate('student', 'firstName lastName email')
      .populate('course', 'title')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await TeacherRating.countDocuments(query);

    res.json({
      success: true,
      data: ratings,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Error getting teacher ratings:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des évaluations',
      error: error.message
    });
  }
};

const getTeacherStats = async (req, res) => {
  try {
    const { teacherId } = req.params;

    const stats = await TeacherRating.getTeacherStats(teacherId);

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error getting teacher stats:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des statistiques',
      error: error.message
    });
  }
};

const getTopTeachers = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const topTeachers = await TeacherRating.getTopTeachers(parseInt(limit));

    res.json({
      success: true,
      data: topTeachers
    });
  } catch (error) {
    console.error('Error getting top teachers:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des meilleurs enseignants',
      error: error.message
    });
  }
};

const moderateRating = async (req, res) => {
  try {
    const { ratingId } = req.params;
    const { status, moderationReason } = req.body;

    const rating = await TeacherRating.findById(ratingId);
    if (!rating) {
      return res.status(404).json({
        success: false,
        message: 'Évaluation non trouvée'
      });
    }

    rating.status = status;
    if (moderationReason) {
      rating.moderationReason = moderationReason;
    }

    await rating.save();

    // Update teacher stats after moderation
    await updateTeacherStats(rating.teacher);

    res.json({
      success: true,
      message: 'Évaluation modérée avec succès',
      data: rating
    });
  } catch (error) {
    console.error('Error moderating rating:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la modération',
      error: error.message
    });
  }
};

const deleteRating = async (req, res) => {
  try {
    const { ratingId } = req.params;
    const userId = req.user.id;

    const rating = await TeacherRating.findById(ratingId);
    if (!rating) {
      return res.status(404).json({
        success: false,
        message: 'Évaluation non trouvée'
      });
    }

    // Check if user can delete this rating
    if (rating.student.toString() !== userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Vous n\'êtes pas autorisé à supprimer cette évaluation'
      });
    }

    await TeacherRating.findByIdAndDelete(ratingId);

    // Update teacher stats after deletion
    await updateTeacherStats(rating.teacher);

    res.json({
      success: true,
      message: 'Évaluation supprimée avec succès'
    });
  } catch (error) {
    console.error('Error deleting rating:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression',
      error: error.message
    });
  }
};

// Helper function to update teacher stats in User model
async function updateTeacherStats(teacherId) {
  try {
    const stats = await TeacherRating.getTeacherStats(teacherId);
    
    await User.findByIdAndUpdate(teacherId, {
      'teacherStats.averageRating': stats.averageRating,
      'teacherStats.totalRatings': stats.totalRatings,
      'teacherStats.ratingDistribution': stats.ratingDistribution,
      'teacherStats.recommendationRate': stats.recommendationRate,
      'teacherStats.criteriaAverages': stats.criteriaAverages
    });
  } catch (error) {
    console.error('Error updating teacher stats:', error);
  }
}

module.exports = {
  createTeacherRating,
  getTeacherRatings,
  getTeacherStats,
  getTopTeachers,
  moderateRating,
  deleteRating
};
