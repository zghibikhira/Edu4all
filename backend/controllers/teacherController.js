const User = require('../models/user');

// GET /api/teachers
exports.getAllTeachers = async (req, res) => {
  try {
    const { subject, level, name } = req.query;
    const filter = { role: 'enseignant' };

    // Filtrage par matière (subject)
    if (subject) {
      // multi-select: subject peut être une liste séparée par des virgules
      const subjects = subject.split(',').map(s => s.trim());
      filter['teacherInfo.subjects'] = { $in: subjects };
    }

    // Filtrage par niveau scolaire (level)
    if (level) {
      // multi-select: level peut être une liste séparée par des virgules
      const levels = level.split(',').map(l => l.trim());
      filter['teacherInfo.education.degree'] = { $in: levels };
    }

    // Filtrage par nom (recherche partielle, insensible à la casse)
    if (name) {
      filter.$or = [
        { firstName: { $regex: name, $options: 'i' } },
        { lastName: { $regex: name, $options: 'i' } }
      ];
    }

    const teachers = await User.find(filter)
      .select('firstName lastName email teacherInfo.avatar teacherInfo.subjects teacherInfo.education teacherInfo.rank teacherInfo.experience teacherInfo.availability');

    res.json({
      success: true,
      data: teachers
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des enseignants:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération des enseignants.'
    });
  }
}; 