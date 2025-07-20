const Course = require('../models/course');
const User = require('../models/user');
const Evaluation = require('../models/evaluation');

// Créer un nouveau cours
exports.createCourse = async (req, res) => {
  try {
    const {
      title,
      description,
      shortDescription,
      category,
      subjects,
      level,
      content,
      settings,
      tags
    } = req.body;

    const instructorId = req.user.id;

    // Vérifier que l'utilisateur est un enseignant
    if (req.user.role !== 'enseignant') {
      return res.status(403).json({
        success: false,
        message: 'Seuls les enseignants peuvent créer des cours'
      });
    }

    const course = new Course({
      title,
      description,
      shortDescription,
      instructor: instructorId,
      category,
      subjects,
      level,
      content,
      settings,
      tags
    });

    await course.save();

    res.status(201).json({
      success: true,
      message: 'Cours créé avec succès',
      data: course
    });

  } catch (error) {
    console.error('Erreur lors de la création du cours:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};

// Obtenir tous les cours
exports.getAllCourses = async (req, res) => {
  try {
    const {
      category,
      subject,
      level,
      instructor,
      status = 'actif',
      page = 1,
      limit = 10,
      sort = 'createdAt',
      order = 'desc'
    } = req.query;

    let query = { status };

    if (category) query.category = category;
    if (subject) query.subjects = { $in: [subject] };
    if (level) query.level = level;
    if (instructor) query.instructor = instructor;

    const sortOptions = {};
    sortOptions[sort] = order === 'desc' ? -1 : 1;

    const courses = await Course.find(query)
      .populate('instructor', 'firstName lastName avatar rating rank')
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Course.countDocuments(query);

    res.json({
      success: true,
      data: {
        courses,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        total
      }
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des cours:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};

// Obtenir les cours d'un instructeur
exports.getInstructorCourses = async (req, res) => {
  try {
    const instructorId = req.user.id;
    const { status, page = 1, limit = 10 } = req.query;

    let query = { instructor: instructorId };
    if (status) query.status = status;

    const courses = await Course.find(query)
      .populate('instructor', 'firstName lastName avatar')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Course.countDocuments(query);

    res.json({
      success: true,
      data: {
        courses,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        total
      }
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des cours:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};

// Obtenir un cours spécifique
exports.getCourse = async (req, res) => {
  try {
    const { id } = req.params;

    const course = await Course.findById(id)
      .populate('instructor', 'firstName lastName avatar rating rank experience education')
      .populate('evaluations.evaluationId', 'title maxScore');

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Cours non trouvé'
      });
    }

    // Incrémenter le nombre de vues
    course.stats.totalViews += 1;
    await course.save();

    res.json({
      success: true,
      data: course
    });

  } catch (error) {
    console.error('Erreur lors de la récupération du cours:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};

// Mettre à jour un cours
exports.updateCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const instructorId = req.user.id;
    const updateData = req.body;

    const course = await Course.findById(id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Cours non trouvé'
      });
    }

    if (course.instructor.toString() !== instructorId) {
      return res.status(403).json({
        success: false,
        message: 'Accès non autorisé'
      });
    }

    // Mettre à jour le cours
    Object.keys(updateData).forEach(key => {
      if (key !== '_id' && key !== 'instructor' && key !== 'stats') {
        course[key] = updateData[key];
      }
    });

    course.updatedAt = new Date();
    await course.save();

    res.json({
      success: true,
      message: 'Cours mis à jour avec succès',
      data: course
    });

  } catch (error) {
    console.error('Erreur lors de la mise à jour du cours:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};

// Supprimer un cours
exports.deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const instructorId = req.user.id;

    const course = await Course.findById(id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Cours non trouvé'
      });
    }

    if (course.instructor.toString() !== instructorId) {
      return res.status(403).json({
        success: false,
        message: 'Accès non autorisé'
      });
    }

    await Course.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Cours supprimé avec succès'
    });

  } catch (error) {
    console.error('Erreur lors de la suppression du cours:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};

// Publier un cours
exports.publishCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const instructorId = req.user.id;

    const course = await Course.findById(id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Cours non trouvé'
      });
    }

    if (course.instructor.toString() !== instructorId) {
      return res.status(403).json({
        success: false,
        message: 'Accès non autorisé'
      });
    }

    course.status = 'actif';
    await course.save();

    res.json({
      success: true,
      message: 'Cours publié avec succès',
      data: course
    });

  } catch (error) {
    console.error('Erreur lors de la publication du cours:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};

// Ajouter une leçon au cours
exports.addLesson = async (req, res) => {
  try {
    const { id } = req.params;
    const instructorId = req.user.id;
    const { title, description, duration, videoUrl, documents } = req.body;

    const course = await Course.findById(id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Cours non trouvé'
      });
    }

    if (course.instructor.toString() !== instructorId) {
      return res.status(403).json({
        success: false,
        message: 'Accès non autorisé'
      });
    }

    const lesson = {
      title,
      description,
      duration,
      videoUrl,
      documents: documents || [],
      order: course.content.lessons.length + 1
    };

    course.content.lessons.push(lesson);
    await course.save();

    res.json({
      success: true,
      message: 'Leçon ajoutée avec succès',
      data: lesson
    });

  } catch (error) {
    console.error('Erreur lors de l\'ajout de la leçon:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};

// Mettre à jour une leçon
exports.updateLesson = async (req, res) => {
  try {
    const { id, lessonIndex } = req.params;
    const instructorId = req.user.id;
    const updateData = req.body;

    const course = await Course.findById(id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Cours non trouvé'
      });
    }

    if (course.instructor.toString() !== instructorId) {
      return res.status(403).json({
        success: false,
        message: 'Accès non autorisé'
      });
    }

    if (!course.content.lessons[lessonIndex]) {
      return res.status(404).json({
        success: false,
        message: 'Leçon non trouvée'
      });
    }

    // Mettre à jour la leçon
    Object.keys(updateData).forEach(key => {
      if (key !== '_id') {
        course.content.lessons[lessonIndex][key] = updateData[key];
      }
    });

    await course.save();

    res.json({
      success: true,
      message: 'Leçon mise à jour avec succès',
      data: course.content.lessons[lessonIndex]
    });

  } catch (error) {
    console.error('Erreur lors de la mise à jour de la leçon:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};

// Supprimer une leçon
exports.deleteLesson = async (req, res) => {
  try {
    const { id, lessonIndex } = req.params;
    const instructorId = req.user.id;

    const course = await Course.findById(id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Cours non trouvé'
      });
    }

    if (course.instructor.toString() !== instructorId) {
      return res.status(403).json({
        success: false,
        message: 'Accès non autorisé'
      });
    }

    if (!course.content.lessons[lessonIndex]) {
      return res.status(404).json({
        success: false,
        message: 'Leçon non trouvée'
      });
    }

    course.content.lessons.splice(lessonIndex, 1);
    
    // Réorganiser l'ordre des leçons
    course.content.lessons.forEach((lesson, index) => {
      lesson.order = index + 1;
    });

    await course.save();

    res.json({
      success: true,
      message: 'Leçon supprimée avec succès'
    });

  } catch (error) {
    console.error('Erreur lors de la suppression de la leçon:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};

// Rechercher des cours
exports.searchCourses = async (req, res) => {
  try {
    const { q, category, subject, level, instructor, page = 1, limit = 10 } = req.query;

    let query = { status: 'actif' };

    if (q) {
      query.$text = { $search: q };
    }
    if (category) query.category = category;
    if (subject) query.subjects = { $in: [subject] };
    if (level) query.level = level;
    if (instructor) query.instructor = instructor;

    const courses = await Course.find(query)
      .populate('instructor', 'firstName lastName avatar rating rank')
      .sort({ score: { $meta: 'textScore' } })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Course.countDocuments(query);

    res.json({
      success: true,
      data: {
        courses,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        total
      }
    });

  } catch (error) {
    console.error('Erreur lors de la recherche de cours:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};

// Obtenir les statistiques d'un cours
exports.getCourseStats = async (req, res) => {
  try {
    const { id } = req.params;
    const instructorId = req.user.id;

    const course = await Course.findById(id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Cours non trouvé'
      });
    }

    if (course.instructor.toString() !== instructorId) {
      return res.status(403).json({
        success: false,
        message: 'Accès non autorisé'
      });
    }

    // Obtenir les évaluations du cours
    const evaluations = await Evaluation.find({ course: id });
    
    const stats = {
      ...course.stats,
      totalEvaluations: evaluations.length,
      completedEvaluations: evaluations.filter(e => e.status === 'publié').length,
      averageEvaluationScore: 0
    };

    const completedEvaluations = evaluations.filter(e => e.score !== null);
    if (completedEvaluations.length > 0) {
      const totalScore = completedEvaluations.reduce((sum, e) => sum + e.score, 0);
      stats.averageEvaluationScore = totalScore / completedEvaluations.length;
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