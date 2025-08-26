const User = require('../models/user');
const TeacherRating = require('../models/teacherRating');
const Session = require('../models/session');
const Purchase = require('../models/purchase');
const Course = require('../models/course');
const Complaint = require('../models/complaint');
const TeacherEvolution = require('../models/teacherEvolution');
const mongoose = require('mongoose');

// GET /api/teachers
exports.getAllTeachers = async (req, res) => {
  try {
    const { subject, level, name, language, available, rank, page = 1, limit = 20 } = req.query;
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

    // Filtrage par langues parlées
    if (language) {
      const languages = language.split(',').map(l => l.trim());
      filter['teacherInfo.languages'] = { $in: languages };
    }

    // Filtrage par disponibilité (booléen ou créneau simple)
    if (available === 'true') {
      filter['teacherInfo.availability'] = { $exists: true, $ne: [] };
    }

    // Filtrage par rang (Prof/Superprof/Hyperprof)
    if (rank) {
      const ranks = rank.split(',').map(r => r.trim());
      filter['teacherInfo.rank'] = { $in: ranks };
    }

    const numericLimit = Math.max(1, Math.min(parseInt(limit, 10) || 20, 100));
    const numericPage = Math.max(1, parseInt(page, 10) || 1);

    const [teachers, total] = await Promise.all([
      User.find(filter)
        .select('firstName lastName email teacherInfo.avatar teacherInfo.subjects teacherInfo.education teacherInfo.rank teacherInfo.rankTier teacherInfo.rankingScore teacherInfo.metrics teacherInfo.experience teacherInfo.availability teacherInfo.languages')
        .sort({ 'teacherInfo.rankingScore': -1, createdAt: -1 })
        .skip((numericPage - 1) * numericLimit)
        .limit(numericLimit),
      User.countDocuments(filter)
    ]);

    res.json({
      success: true,
      data: teachers,
      pagination: {
        page: numericPage,
        limit: numericLimit,
        total,
        pages: Math.ceil(total / numericLimit)
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des enseignants:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération des enseignants.'
    });
  }
}; 

// GET /api/teachers/:teacherId
// Returns public teacher profile information
exports.getTeacherById = async (req, res) => {
  try {
    const { teacherId } = req.params;

    // Find user by id (most profiles will be teachers, but don’t hard-fail on role)
    const teacher = await User.findById(teacherId)
      .select(
        'firstName lastName email avatar bio role teacherInfo.subjects teacherInfo.education teacherInfo.experience teacherInfo.rating teacherInfo.totalReviews teacherInfo.followersCount teacherInfo.postsCount teacherInfo.rank teacherInfo.rankTier teacherInfo.rankingScore teacherInfo.metrics teacherInfo.availability'
      );

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: 'Enseignant non trouvé'
      });
    }

    res.json({
      success: true,
      data: teacher
    });
  } catch (error) {
    console.error('Erreur lors de la récupération du profil enseignant:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération du profil enseignant.'
    });
  }
};

// GET /api/teachers/admin/ranking?from&to&limit&sortBy&order
// Admin endpoint to view dynamic teacher ranking and metrics
exports.getAdminTeacherRanking = async (req, res) => {
  try {
    const { from, to, limit = 50, sortBy = 'averageRating', order = 'desc' } = req.query;

    const fromDate = from ? new Date(from) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const toDate = to ? new Date(to) : new Date();

    // 1) Base: all teachers
    const teachers = await User.find({ role: 'enseignant' })
      .select('_id firstName lastName teacherInfo.rank teacherInfo.rankTier teacherInfo.rankingScore teacherInfo.metrics teacherInfo.experience stats.totalStudents')
      .lean();

    const teacherIds = teachers.map(t => t._id);

    if (teacherIds.length === 0) {
      return res.json({ success: true, data: [] });
    }

    // 2) Ratings (approved only)
    const ratingsAgg = await TeacherRating.aggregate([
      { $match: { teacher: { $in: teacherIds }, status: 'approved' } },
      { $group: { _id: '$teacher', averageRating: { $avg: '$overallRating' }, totalReviews: { $sum: 1 } } }
    ]);
    const teacherIdToRatings = new Map(ratingsAgg.map(r => [String(r._id), { averageRating: r.averageRating || 0, totalReviews: r.totalReviews || 0 }]));

    // 3) Sessions (in range)
    const sessionsAgg = await Session.aggregate([
      { $match: { teacherId: { $in: teacherIds }, createdAt: { $gte: fromDate, $lte: toDate } } },
      {
        $group: {
          _id: '$teacherId',
          totalSessions: { $sum: 1 },
          finished: { $sum: { $cond: [{ $eq: ['$status', 'finished'] }, 1, 0] } },
          cancelled: { $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] } }
        }
      }
    ]);
    const teacherIdToSessions = new Map(
      sessionsAgg.map(s => [String(s._id), { totalSessions: s.totalSessions || 0, finished: s.finished || 0, cancelled: s.cancelled || 0 }])
    );

    // 4) Complaints against teacher (in range)
    const complaintsAgg = await Complaint.aggregate([
      { $match: { againstUserId: { $in: teacherIds }, createdAt: { $gte: fromDate, $lte: toDate } } },
      { $group: { _id: '$againstUserId', complaintsCount: { $sum: 1 } } }
    ]);
    const teacherIdToComplaints = new Map(complaintsAgg.map(c => [String(c._id), c.complaintsCount || 0]));

    // 5) Revenue by teacher via purchases joined to courses (completed only, in range)
    const revenueAgg = await Purchase.aggregate([
      { $match: { status: 'completed', purchasedAt: { $gte: fromDate, $lte: toDate } } },
      { $lookup: { from: 'courses', localField: 'course', foreignField: '_id', as: 'course' } },
      { $unwind: '$course' },
      { $match: { 'course.instructor': { $in: teacherIds } } },
      { $group: { _id: '$course.instructor', revenue: { $sum: '$amount' } } }
    ]);
    const teacherIdToRevenue = new Map(revenueAgg.map(r => [String(r._id), r.revenue || 0]));

    // Merge metrics per teacher
    const rows = teachers.map(t => {
      const key = String(t._id);
      const r = teacherIdToRatings.get(key) || { averageRating: 0, totalReviews: 0 };
      const s = teacherIdToSessions.get(key) || { totalSessions: 0, finished: 0, cancelled: 0 };
      const complaintsCount = teacherIdToComplaints.get(key) || 0;
      const revenue = teacherIdToRevenue.get(key) || 0;

      const cancellationRate = s.totalSessions > 0 ? s.cancelled / s.totalSessions : 0;
      const disputeRate = s.totalSessions > 0 ? complaintsCount / s.totalSessions : 0;

      return {
        teacherId: t._id,
        name: `${t.firstName} ${t.lastName}`.trim(),
        rank: t.teacherInfo?.rank || 'Prof',
        rankTier: t.teacherInfo?.rankTier || 'PROF',
        rankingScore: t.teacherInfo?.rankingScore || 0,
        experience: t.teacherInfo?.experience || 0,
        averageRating: Math.round((r.averageRating || 0) * 10) / 10,
        totalReviews: r.totalReviews || 0,
        sessionsCompleted: s.finished || 0,
        cancellationRate,
        disputeRate,
        revenue,
        metrics: {
          avgRating: Math.round((r.averageRating || 0) * 10) / 10,
          reviewsCount: r.totalReviews || 0,
          sessionsCompleted: s.finished || 0,
          cancellationRate,
          disputeRate,
          revenueTotal: revenue
        }
      };
    });

    // Sort
    const sortDir = order === 'asc' ? 1 : -1;
    rows.sort((a, b) => {
      if (a[sortBy] === b[sortBy]) return 0;
      return a[sortBy] > b[sortBy] ? sortDir : -1 * sortDir;
    });

    res.json({ success: true, data: rows.slice(0, parseInt(limit)) });
  } catch (error) {
    console.error('Erreur lors du calcul du classement enseignants:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// POST /api/teachers/admin/recompute-ranking
// Recomputes and updates teacherInfo.rank for all teachers based on metrics
exports.recomputeTeacherRankings = async (req, res) => {
  try {
    // Reuse metrics without date restriction for rank stability (last 180 days for robustness)
    const fromDate = new Date(Date.now() - 180 * 24 * 60 * 60 * 1000);
    const toDate = new Date();

    const teachers = await User.find({ role: 'enseignant' })
      .select('_id teacherInfo.experience teacherInfo.rank')
      .lean();
    const teacherIds = teachers.map(t => t._id);

    if (teacherIds.length === 0) {
      return res.json({ success: true, data: { updated: 0 } });
    }

    const ratingsAgg = await TeacherRating.aggregate([
      { $match: { teacher: { $in: teacherIds }, status: 'approved' } },
      { $group: { _id: '$teacher', averageRating: { $avg: '$overallRating' }, totalReviews: { $sum: 1 } } }
    ]);
    const teacherIdToRatings = new Map(ratingsAgg.map(r => [String(r._id), { averageRating: r.averageRating || 0, totalReviews: r.totalReviews || 0 }]));

    const revenueAgg = await Purchase.aggregate([
      { $match: { status: 'completed', purchasedAt: { $gte: fromDate, $lte: toDate } } },
      { $lookup: { from: 'courses', localField: 'course', foreignField: '_id', as: 'course' } },
      { $unwind: '$course' },
      { $match: { 'course.instructor': { $in: teacherIds } } },
      { $group: { _id: '$course.instructor', revenue: { $sum: '$amount' } } }
    ]);
    const teacherIdToRevenue = new Map(revenueAgg.map(r => [String(r._id), r.revenue || 0]));

    // Sessions for completion/cancellation rates
    const sessionsAgg = await Session.aggregate([
      { $match: { teacherId: { $in: teacherIds }, createdAt: { $gte: fromDate, $lte: toDate } } },
      {
        $group: {
          _id: '$teacherId',
          total: { $sum: 1 },
          completed: { $sum: { $cond: [{ $eq: ['$status', 'finished'] }, 1, 0] } },
          cancelled: { $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] } }
        }
      }
    ]);
    const teacherIdToSessions = new Map(sessionsAgg.map(s => [String(s._id), s]));

    // Disputes (complaints) against teacher
    const complaintsAgg = await Complaint.aggregate([
      { $match: { againstUserId: { $in: teacherIds }, createdAt: { $gte: fromDate, $lte: toDate } } },
      { $group: { _id: '$againstUserId', disputes: { $sum: 1 } } }
    ]);
    const teacherIdToDisputes = new Map(complaintsAgg.map(c => [String(c._id), c.disputes || 0]));

    let updated = 0;
    const bulk = User.collection.initializeUnorderedBulkOp();

    // Weights for rankingScore
    const w1 = 30; // avgRating weight
    const w2 = 8;  // log(reviewsCount+1)
    const w3 = 0.5; // sessionsCompleted
    const w4 = 25; // cancellationRate penalty
    const w5 = 25; // disputeRate penalty
    const w6 = 6;  // log(revenueTotal+1)

    teachers.forEach(t => {
      const key = String(t._id);
      const r = teacherIdToRatings.get(key) || { averageRating: 0, totalReviews: 0 };
      const revenue = teacherIdToRevenue.get(key) || 0;
      const s = teacherIdToSessions.get(key) || { total: 0, completed: 0, cancelled: 0 };
      const disputes = teacherIdToDisputes.get(key) || 0;

      const completed = s.completed || 0;
      const cancelled = s.cancelled || 0;
      const denomCancel = completed + cancelled;
      const cancellationRate = denomCancel > 0 ? cancelled / denomCancel : 0;
      const disputeRate = completed > 0 ? disputes / completed : 0;

      // rankingScore per formula
      const avgRating = r.averageRating || 0;
      const reviewsCount = r.totalReviews || 0;
      const sessionsCompleted = completed;
      const revenueTotal = revenue;

      const rankingScore = (
        w1 * avgRating +
        w2 * Math.log(reviewsCount + 1) +
        w3 * sessionsCompleted -
        w4 * cancellationRate -
        w5 * disputeRate +
        w6 * Math.log(revenueTotal + 1)
      );

      // Map tiers
      let rankTier = 'PROF';
      let newRank = 'Prof';
      if (rankingScore >= 80 && avgRating >= 4.7) {
        rankTier = 'HYPERPROF';
        newRank = 'Hyperprof';
      } else if (rankingScore >= 60 && avgRating >= 4.3) {
        rankTier = 'SUPERPROF';
        newRank = 'Superprof';
      }

      const update = {
        'teacherInfo.rank': newRank,
        'teacherInfo.rankTier': rankTier,
        'teacherInfo.rankingScore': Math.round(rankingScore * 100) / 100,
        'teacherInfo.metrics.avgRating': Math.round(avgRating * 10) / 10,
        'teacherInfo.metrics.reviewsCount': reviewsCount,
        'teacherInfo.metrics.sessionsCompleted': sessionsCompleted,
        'teacherInfo.metrics.cancellationRate': Math.round(cancellationRate * 10000) / 10000,
        'teacherInfo.metrics.disputeRate': Math.round(disputeRate * 10000) / 10000,
        'teacherInfo.metrics.revenueTotal': Math.round(revenueTotal * 100) / 100
      };

      bulk.find({ _id: new mongoose.Types.ObjectId(t._id) }).updateOne({ $set: update });
      updated += 1;
    });

    if (updated > 0) await bulk.execute();

    res.json({ success: true, data: { updated } });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du rang des enseignants:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// ===== TEACHER EVOLUTION ROUTES =====

// GET /api/teachers/evolution
// Get teacher evolution data for current user
exports.getTeacherEvolution = async (req, res) => {
  try {
    const { period = 'monthly', limit = 12 } = req.query;
    const teacherId = req.user.id;

    const evolution = await TeacherEvolution.getTeacherEvolution(teacherId, period, parseInt(limit));

    res.json({
      success: true,
      data: evolution
    });
  } catch (error) {
    console.error('Error getting teacher evolution:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de l\'évolution'
    });
  }
};

// GET /api/teachers/:teacherId/evolution
// Get specific teacher evolution (admin or self)
exports.getTeacherEvolutionById = async (req, res) => {
  try {
    const { teacherId } = req.params;
    const { period = 'monthly', limit = 12 } = req.query;

    // Check if user can access this teacher's evolution
    if (req.user.role !== 'admin' && req.user.id !== teacherId) {
      return res.status(403).json({
        success: false,
        message: 'Accès non autorisé'
      });
    }

    const evolution = await TeacherEvolution.getTeacherEvolution(teacherId, period, parseInt(limit));

    res.json({
      success: true,
      data: evolution
    });
  } catch (error) {
    console.error('Error getting teacher evolution by ID:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de l\'évolution'
    });
  }
};

// GET /api/teachers/evolution/stats
// Get evolution statistics
exports.getEvolutionStats = async (req, res) => {
  try {
    const stats = await TeacherEvolution.getEvolutionStats();

    res.json({
      success: true,
      data: {
        totalTeachers: stats.totalTeachers.length,
        averageEvolutionScore: Math.round(stats.averageEvolutionScore * 100) / 100,
        totalAchievements: stats.totalAchievements,
        totalGoals: stats.totalGoals
      }
    });
  } catch (error) {
    console.error('Error getting evolution stats:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des statistiques'
    });
  }
};

// GET /api/teachers/evolution/history
// Get evolution history for all teachers
exports.getEvolutionHistory = async (req, res) => {
  try {
    const { period = 'monthly', limit = 50 } = req.query;

    const history = await TeacherEvolution.find({ period })
      .sort({ periodStart: -1, evolutionScore: -1 })
      .limit(parseInt(limit))
      .populate('teacherId', 'firstName lastName email avatar teacherInfo.rank');

    res.json({
      success: true,
      data: history
    });
  } catch (error) {
    console.error('Error getting evolution history:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de l\'historique'
    });
  }
};

// POST /api/teachers/evolution/calculate
// Calculate evolution metrics for a teacher
exports.calculateEvolution = async (req, res) => {
  try {
    const { teacherId, period = 'monthly' } = req.body;
    const currentPeriod = TeacherEvolution.getCurrentPeriod(period);

    // Get teacher data
    const teacher = await User.findById(teacherId);
    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: 'Enseignant non trouvé'
      });
    }

    // Calculate metrics for the period
    const metrics = await calculateTeacherMetrics(teacherId, currentPeriod.start, currentPeriod.end);

    // Create or update evolution record
    let evolution = await TeacherEvolution.findOne({
      teacherId,
      period,
      periodStart: currentPeriod.start,
      periodEnd: currentPeriod.end
    });

    if (evolution) {
      evolution.metrics = metrics;
      await evolution.save();
    } else {
      evolution = new TeacherEvolution({
        teacherId,
        period,
        periodStart: currentPeriod.start,
        periodEnd: currentPeriod.end,
        metrics
      });
      await evolution.save();
    }

    res.json({
      success: true,
      data: evolution
    });
  } catch (error) {
    console.error('Error calculating evolution:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du calcul de l\'évolution'
    });
  }
};

// GET /api/teachers/evolution/leaderboard
// Get evolution leaderboard
exports.getEvolutionLeaderboard = async (req, res) => {
  try {
    const { period = 'monthly', limit = 50 } = req.query;

    const leaderboard = await TeacherEvolution.getEvolutionLeaderboard(period, parseInt(limit));

    res.json({
      success: true,
      data: leaderboard
    });
  } catch (error) {
    console.error('Error getting evolution leaderboard:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du classement'
    });
  }
};

// Helper function to calculate teacher metrics
async function calculateTeacherMetrics(teacherId, startDate, endDate) {
  // Get ratings
  const ratings = await TeacherRating.find({
    teacher: teacherId,
    status: 'approved',
    createdAt: { $gte: startDate, $lte: endDate }
  });

  const averageRating = ratings.length > 0 
    ? ratings.reduce((sum, r) => sum + r.overallRating, 0) / ratings.length 
    : 0;

  // Get sessions
  const sessions = await Session.find({
    teacherId,
    createdAt: { $gte: startDate, $lte: endDate }
  });

  const totalSessions = sessions.length;
  const completedSessions = sessions.filter(s => s.status === 'finished').length;
  const cancelledSessions = sessions.filter(s => s.status === 'cancelled').length;
  const sessionCompletion = totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0;

  // Get revenue
  const purchases = await Purchase.aggregate([
    { $match: { status: 'completed', purchasedAt: { $gte: startDate, $lte: endDate } } },
    { $lookup: { from: 'courses', localField: 'course', foreignField: '_id', as: 'course' } },
    { $unwind: '$course' },
    { $match: { 'course.instructor': new mongoose.Types.ObjectId(teacherId) } },
    { $group: { _id: null, totalRevenue: { $sum: '$amount' } } }
  ]);

  const totalRevenue = purchases.length > 0 ? purchases[0].totalRevenue : 0;

  // Get students
  const uniqueStudents = new Set();
  sessions.forEach(session => {
    session.students.forEach(student => uniqueStudents.add(student.toString()));
  });

  return {
    ratingImprovement: Math.max(0, averageRating - 3) * 20, // 0-100 scale
    averageRating,
    totalRatings: ratings.length,
    studentGrowth: uniqueStudents.size * 5, // 0-100 scale
    totalStudents: uniqueStudents.size,
    newStudents: uniqueStudents.size, // Simplified for now
    revenueGrowth: Math.min(totalRevenue / 100, 100), // 0-100 scale
    totalRevenue,
    averageRevenuePerSession: totalSessions > 0 ? totalRevenue / totalSessions : 0,
    sessionCompletion,
    totalSessions,
    completedSessions,
    cancelledSessions,
    cancellationRate: totalSessions > 0 ? cancelledSessions / totalSessions : 0,
    skillDevelopment: [], // To be implemented based on course categories
    engagementRate: sessionCompletion, // Simplified for now
    responseTime: 24, // Default 24 hours
    studentRetention: 80 // Default 80%
  };
}