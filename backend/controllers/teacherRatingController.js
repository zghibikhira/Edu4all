const TeacherRating = require('../models/teacherRating');
const User = require('../models/user');
const Course = require('../models/course');

// Créer une évaluation d'enseignant
exports.createTeacherRating = async (req, res) => {
  try {
    const {
      teacherId,
      courseId,
      overallRating,
      criteria,
      comment,
      wouldRecommend
    } = req.body;

    const studentId = req.user.id;

    // Vérifier que l'utilisateur est un étudiant
    if (req.user.role !== 'etudiant') {
      return res.status(403).json({
        success: false,
        message: 'Seuls les étudiants peuvent évaluer les enseignants'
      });
    }

    // Vérifier que l'enseignant existe
    const teacher = await User.findById(teacherId);
    if (!teacher || teacher.role !== 'enseignant') {
      return res.status(404).json({
        success: false,
        message: 'Enseignant non trouvé'
      });
    }

    // Vérifier que l'étudiant n'a pas déjà évalué cet enseignant pour ce cours
    const existingRating = await TeacherRating.findOne({
      student: studentId,
      teacher: teacherId,
      course: courseId
    });

    if (existingRating) {
      return res.status(400).json({
        success: false,
        message: 'Vous avez déjà évalué cet enseignant pour ce cours'
      });
    }

    // Créer l'évaluation
    const rating = new TeacherRating({
      student: studentId,
      teacher: teacherId,
      course: courseId,
      overallRating,
      criteria: criteria || {},
      comment,
      wouldRecommend
    });

    await rating.save();

    // Mettre à jour les statistiques de l'enseignant
    await updateTeacherStats(teacherId);

    res.status(201).json({
      success: true,
      message: 'Évaluation créée avec succès',
      data: rating
    });

  } catch (error) {
    console.error('Erreur lors de la création de l\'évaluation:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};

// Obtenir les évaluations d'un enseignant
exports.getTeacherRatings = async (req, res) => {
  try {
    const { teacherId } = req.params;
    const { page = 1, limit = 10, status = 'approved' } = req.query;

    // Vérifier que l'enseignant existe
    const teacher = await User.findById(teacherId);
    if (!teacher || teacher.role !== 'enseignant') {
      return res.status(404).json({
        success: false,
        message: 'Enseignant non trouvé'
      });
    }

    const query = { teacher: teacherId };
    if (status !== 'all') {
      query.status = status;
    }

    const ratings = await TeacherRating.find(query)
      .populate('student', 'firstName lastName avatar')
      .populate('course', 'title')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await TeacherRating.countDocuments(query);

    res.json({
      success: true,
      data: {
        ratings,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des évaluations:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};

// Obtenir les statistiques d'un enseignant
exports.getTeacherStats = async (req, res) => {
  try {
    const { teacherId } = req.params;

    // Vérifier que l'enseignant existe
    const teacher = await User.findById(teacherId);
    if (!teacher || teacher.role !== 'enseignant') {
      return res.status(404).json({
        success: false,
        message: 'Enseignant non trouvé'
      });
    }

    const stats = await TeacherRating.getTeacherStats(teacherId);

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

// Obtenir les meilleurs enseignants
exports.getTopTeachers = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const topTeachers = await TeacherRating.getTopTeachers(parseInt(limit));

    // Populate teacher information
    const teachersWithInfo = await Promise.all(
      topTeachers.map(async (teacher) => {
        const teacherInfo = await User.findById(teacher._id, 'firstName lastName avatar subjects');
        return {
          ...teacher.toObject(),
          teacher: teacherInfo
        };
      })
    );

    res.json({
      success: true,
      data: teachersWithInfo
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des meilleurs enseignants:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};

// Modérer une évaluation (admin seulement)
exports.moderateRating = async (req, res) => {
  try {
    const { ratingId } = req.params;
    const { status, moderationReason } = req.body;

    // Vérifier que l'utilisateur est admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Accès non autorisé'
      });
    }

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

    // Mettre à jour les statistiques de l'enseignant
    await updateTeacherStats(rating.teacher);

    res.json({
      success: true,
      message: 'Évaluation modérée avec succès',
      data: rating
    });

  } catch (error) {
    console.error('Erreur lors de la modération:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};

// Supprimer une évaluation (étudiant ou admin)
exports.deleteRating = async (req, res) => {
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

    // Vérifier les permissions
    if (rating.student.toString() !== userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Accès non autorisé'
      });
    }

    await TeacherRating.findByIdAndDelete(ratingId);

    // Mettre à jour les statistiques de l'enseignant
    await updateTeacherStats(rating.teacher);

    res.json({
      success: true,
      message: 'Évaluation supprimée avec succès'
    });

  } catch (error) {
    console.error('Erreur lors de la suppression:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};

// Fonction helper pour mettre à jour les statistiques d'un enseignant
async function updateTeacherStats(teacherId) {
  try {
    const stats = await TeacherRating.getTeacherStats(teacherId);
    
    // Mettre à jour le modèle User avec les nouvelles statistiques
    await User.findByIdAndUpdate(teacherId, {
      'stats.averageRating': Math.round(stats.averageRating * 10) / 10,
      'stats.totalRatings': stats.totalRatings,
      'stats.recommendationRate': Math.round(stats.recommendationRate * 100)
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour des statistiques:', error);
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
