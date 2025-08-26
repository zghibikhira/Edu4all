const Evaluation = require('../models/evaluation');
const User = require('../models/user');
const Course = require('../models/course');

// Fonction pour mettre à jour les statistiques d'un enseignant
const updateTeacherStats = async (teacherId) => {
  try {
    const stats = await Evaluation.aggregate([
      { $match: { teacher: teacherId, status: 'publié' } },
      {
        $group: {
          _id: null,
          totalEvaluations: { $sum: 1 },
          averageScore: { $avg: '$score' },
          averagePercentage: { $avg: '$percentage' }
        }
      }
    ]);

    if (stats.length > 0) {
      await User.findByIdAndUpdate(teacherId, {
        'teacherInfo.totalEvaluations': stats[0].totalEvaluations,
        'teacherInfo.averageScore': Math.round(stats[0].averageScore * 100) / 100,
        'teacherInfo.averagePercentage': Math.round(stats[0].averagePercentage * 100) / 100
      });
    }
  } catch (error) {
    console.error('Erreur lors de la mise à jour des statistiques:', error);
  }
};

// Créer une nouvelle évaluation
exports.createEvaluation = async (req, res) => {
  try {
    const {
      title,
      description,
      studentId,
      courseId,
      type,
      maxScore,
      dueDate,
      criteria
    } = req.body;

    const teacherId = req.user.id;

    // Vérifier que l'utilisateur est un enseignant
    if (req.user.role !== 'enseignant') {
      return res.status(403).json({
        success: false,
        message: 'Seuls les enseignants peuvent créer des évaluations'
      });
    }

    // Vérifier que l'étudiant existe
    const student = await User.findById(studentId);
    if (!student || student.role !== 'etudiant') {
      return res.status(404).json({
        success: false,
        message: 'Étudiant non trouvé'
      });
    }

    // Vérifier que le cours existe (si fourni)
    if (courseId) {
      const course = await Course.findById(courseId);
      if (!course) {
        return res.status(404).json({
          success: false,
          message: 'Cours non trouvé'
        });
      }
    }

    const evaluation = new Evaluation({
      title,
      description,
      student: studentId,
      teacher: teacherId,
      course: courseId,
      type,
      maxScore,
      dueDate,
      criteria: criteria || []
    });

    await evaluation.save();

    // Mettre à jour les statistiques de l'enseignant
    await updateTeacherStats(teacherId);

    res.status(201).json({
      success: true,
      message: 'Évaluation créée avec succès',
      data: evaluation
    });

  } catch (error) {
    console.error('Erreur lors de la création de l\'évaluation:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};

// Obtenir toutes les évaluations d'un étudiant
exports.getStudentEvaluations = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { status, type, courseId } = req.query;

    let query = { student: studentId };

    if (status) query.status = status;
    if (type) query.type = type;
    if (courseId) query.course = courseId;

    const evaluations = await Evaluation.find(query)
      .populate('teacher', 'firstName lastName avatar')
      .populate('course', 'title')
      .sort({ dueDate: 1 });

    res.json({
      success: true,
      data: evaluations
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des évaluations:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};

// Obtenir toutes les évaluations créées par un enseignant
exports.getTeacherEvaluations = async (req, res) => {
  try {
    const teacherId = req.user.id;
    const { status, type, studentId } = req.query;

    let query = { teacher: teacherId };

    if (status) query.status = status;
    if (type) query.type = type;
    if (studentId) query.student = studentId;

    const evaluations = await Evaluation.find(query)
      .populate('student', 'firstName lastName avatar')
      .populate('course', 'title')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: evaluations
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des évaluations:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};

// Obtenir une évaluation spécifique
exports.getEvaluation = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const evaluation = await Evaluation.findById(id)
      .populate('student', 'firstName lastName avatar email')
      .populate('teacher', 'firstName lastName avatar email')
      .populate('course', 'title description');

    if (!evaluation) {
      return res.status(404).json({
        success: false,
        message: 'Évaluation non trouvée'
      });
    }

    // Vérifier les permissions
    if (evaluation.student._id.toString() !== userId && 
        evaluation.teacher._id.toString() !== userId &&
        req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Accès non autorisé'
      });
    }

    res.json({
      success: true,
      data: evaluation
    });

  } catch (error) {
    console.error('Erreur lors de la récupération de l\'évaluation:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};

// Soumettre une évaluation (étudiant)
exports.submitEvaluation = async (req, res) => {
  try {
    const { id } = req.params;
    const studentId = req.user.id;
    const { studentComments } = req.body;

    const evaluation = await Evaluation.findById(id);

    if (!evaluation) {
      return res.status(404).json({
        success: false,
        message: 'Évaluation non trouvée'
      });
    }

    if (evaluation.student.toString() !== studentId) {
      return res.status(403).json({
        success: false,
        message: 'Accès non autorisé'
      });
    }

    if (evaluation.status !== 'en_attente') {
      return res.status(400).json({
        success: false,
        message: 'Cette évaluation a déjà été soumise'
      });
    }

    evaluation.status = 'soumis';
    evaluation.studentComments = studentComments;
    evaluation.submittedAt = new Date();

    await evaluation.save();

    res.json({
      success: true,
      message: 'Évaluation soumise avec succès',
      data: evaluation
    });

  } catch (error) {
    console.error('Erreur lors de la soumission de l\'évaluation:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};

// Corriger une évaluation (enseignant)
exports.gradeEvaluation = async (req, res) => {
  try {
    const { id } = req.params;
    const teacherId = req.user.id;
    const { score, teacherComments, criteriaScores } = req.body;

    const evaluation = await Evaluation.findById(id);

    if (!evaluation) {
      return res.status(404).json({
        success: false,
        message: 'Évaluation non trouvée'
      });
    }

    if (evaluation.teacher.toString() !== teacherId) {
      return res.status(403).json({
        success: false,
        message: 'Accès non autorisé'
      });
    }

    if (evaluation.status === 'en_attente') {
      return res.status(400).json({
        success: false,
        message: 'L\'évaluation n\'a pas encore été soumise'
      });
    }

    // Mettre à jour les scores des critères
    if (criteriaScores && Array.isArray(criteriaScores)) {
      evaluation.criteria.forEach((criterion, index) => {
        if (criteriaScores[index]) {
          criterion.points = criteriaScores[index].points;
        }
      });
    }

    // Calculer le score total basé sur les critères
    const totalCriteriaScore = evaluation.criteria.reduce((sum, criterion) => {
      return sum + (criterion.points || 0);
    }, 0);

    // Utiliser le score fourni ou le score calculé
    evaluation.score = score || totalCriteriaScore;
    evaluation.teacherComments = teacherComments;
    evaluation.status = 'corrigé';
    evaluation.gradedAt = new Date();

    await evaluation.save();

    // Mettre à jour les statistiques de l'enseignant
    await updateTeacherStats(teacherId);

    res.json({
      success: true,
      message: 'Évaluation corrigée avec succès',
      data: evaluation
    });

  } catch (error) {
    console.error('Erreur lors de la correction de l\'évaluation:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};

// Publier une évaluation (rendre visible à l'étudiant)
exports.publishEvaluation = async (req, res) => {
  try {
    const { id } = req.params;
    const teacherId = req.user.id;

    const evaluation = await Evaluation.findById(id);

    if (!evaluation) {
      return res.status(404).json({
        success: false,
        message: 'Évaluation non trouvée'
      });
    }

    if (evaluation.teacher.toString() !== teacherId) {
      return res.status(403).json({
        success: false,
        message: 'Accès non autorisé'
      });
    }

    if (evaluation.status !== 'corrigé') {
      return res.status(400).json({
        success: false,
        message: 'L\'évaluation doit être corrigée avant d\'être publiée'
      });
    }

    evaluation.status = 'publié';

    await evaluation.save();

    res.json({
      success: true,
      message: 'Évaluation publiée avec succès',
      data: evaluation
    });

  } catch (error) {
    console.error('Erreur lors de la publication de l\'évaluation:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};

// Créer une évaluation en ligne avec questions
exports.createOnlineEvaluation = async (req, res) => {
  try {
    const {
      title,
      description,
      courseId,
      type,
      maxScore,
      dueDate,
      duration, // en minutes
      questions,
      isPublic = false
    } = req.body;

    const teacherId = req.user.id;

    // Vérifier que l'utilisateur est un enseignant
    if (req.user.role !== 'enseignant') {
      return res.status(403).json({
        success: false,
        message: 'Seuls les enseignants peuvent créer des évaluations'
      });
    }

    // Vérifier que le cours existe et appartient à l'enseignant
    if (courseId) {
      const course = await Course.findById(courseId);
      if (!course || course.instructor.toString() !== teacherId) {
        return res.status(403).json({
          success: false,
          message: 'Cours non trouvé ou accès non autorisé'
        });
      }
    }

    const evaluation = new Evaluation({
      title,
      description,
      teacher: teacherId,
      course: courseId,
      type,
      maxScore,
      dueDate,
      duration,
      questions: questions || [],
      isPublic,
      status: 'en_attente'
    });

    await evaluation.save();

    res.status(201).json({
      success: true,
      message: 'Évaluation en ligne créée avec succès',
      data: evaluation
    });

  } catch (error) {
    console.error('Erreur lors de la création de l\'évaluation en ligne:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};

// Assigner une évaluation à des étudiants
exports.assignEvaluationToStudents = async (req, res) => {
  try {
    const { evaluationId, studentIds } = req.body;
    const teacherId = req.user.id;

    const evaluation = await Evaluation.findById(evaluationId);
    if (!evaluation || evaluation.teacher.toString() !== teacherId) {
      return res.status(404).json({
        success: false,
        message: 'Évaluation non trouvée ou accès non autorisé'
      });
    }

    const createdEvaluations = [];

    for (const studentId of studentIds) {
      // Vérifier que l'étudiant existe
      const student = await User.findById(studentId);
      if (!student || student.role !== 'etudiant') {
        continue;
      }

      // Créer une copie de l'évaluation pour cet étudiant
      const studentEvaluation = new Evaluation({
        title: evaluation.title,
        description: evaluation.description,
        teacher: teacherId,
        course: evaluation.course,
        type: evaluation.type,
        maxScore: evaluation.maxScore,
        dueDate: evaluation.dueDate,
        duration: evaluation.duration,
        questions: evaluation.questions,
        student: studentId,
        status: 'en_attente'
      });

      await studentEvaluation.save();
      createdEvaluations.push(studentEvaluation);
    }

    res.json({
      success: true,
      message: `${createdEvaluations.length} évaluation(s) assignée(s) avec succès`,
      data: createdEvaluations
    });

  } catch (error) {
    console.error('Erreur lors de l\'assignation des évaluations:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};

// Obtenir les statistiques d'évaluation
exports.getEvaluationStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const { period = 'month' } = req.query;

    let dateFilter = {};
    const now = new Date();

    switch (period) {
      case 'week':
        dateFilter = { $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) };
        break;
      case 'month':
        dateFilter = { $gte: new Date(now.getFullYear(), now.getMonth(), 1) };
        break;
      case 'year':
        dateFilter = { $gte: new Date(now.getFullYear(), 0, 1) };
        break;
    }

    let query = { createdAt: dateFilter };

    if (req.user.role === 'etudiant') {
      query.student = userId;
    } else if (req.user.role === 'enseignant') {
      query.teacher = userId;
    }

    const evaluations = await Evaluation.find(query);

    const stats = {
      total: evaluations.length,
      pending: evaluations.filter(e => e.status === 'en_attente').length,
      submitted: evaluations.filter(e => e.status === 'soumis').length,
      graded: evaluations.filter(e => e.status === 'corrigé').length,
      published: evaluations.filter(e => e.status === 'publié').length,
      averageScore: 0,
      averagePercentage: 0
    };

    const gradedEvaluations = evaluations.filter(e => e.score !== null);
    if (gradedEvaluations.length > 0) {
      const totalScore = gradedEvaluations.reduce((sum, e) => sum + e.score, 0);
      const totalMaxScore = gradedEvaluations.reduce((sum, e) => sum + e.maxScore, 0);
      
      stats.averageScore = totalScore / gradedEvaluations.length;
      stats.averagePercentage = (totalScore / totalMaxScore) * 100;
    }

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

// Supprimer une évaluation
exports.deleteEvaluation = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const evaluation = await Evaluation.findById(id);

    if (!evaluation) {
      return res.status(404).json({
        success: false,
        message: 'Évaluation non trouvée'
      });
    }

    if (evaluation.teacher.toString() !== userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Accès non autorisé'
      });
    }

    await Evaluation.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Évaluation supprimée avec succès'
    });

  } catch (error) {
    console.error('Erreur lors de la suppression de l\'évaluation:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
}; 