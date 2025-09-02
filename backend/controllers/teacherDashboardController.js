const mongoose = require('mongoose');
const Purchase = require('../models/purchase');
const Session = require('../models/session');
const TeacherRating = require('../models/teacherRating');
const Complaint = require('../models/complaint');

function parseDate(value, fallback) {
  const d = value ? new Date(value) : null;
  return isNaN(d?.getTime()) ? fallback : d;
}

// GET /me/dashboard/summary?from&to
exports.getSummary = async (req, res) => {
  try {
    if (req.user.role !== 'enseignant') {
      return res.status(403).json({ success: false, message: 'Accès réservé aux enseignants' });
    }
    const teacherId = req.user._id;
    const now = new Date();
    const defaultFrom = new Date(now.getFullYear(), now.getMonth(), 1);
    const from = parseDate(req.query.from, defaultFrom);
    const to = parseDate(req.query.to, now);

    // Earnings and sales count (gross) via purchases joined to courses
    const earningsAgg = await Purchase.aggregate([
      { $match: { status: 'completed', purchasedAt: { $gte: from, $lte: to } } },
      { $lookup: { from: 'courses', localField: 'course', foreignField: '_id', as: 'course' } },
      { $unwind: '$course' },
      { $match: { 'course.instructor': new mongoose.Types.ObjectId(teacherId) } },
      { $group: { _id: null, totalEarnings: { $sum: '$amount' }, sales: { $sum: 1 } } }
    ]);

    const totalEarnings = earningsAgg[0]?.totalEarnings || 0;
    const sales = earningsAgg[0]?.sales || 0;

    // Upcoming sessions (next 7)
    const upcomingSessions = await Session.find({
      teacherId: teacherId,
      date: { $gte: new Date() },
      status: { $in: ['scheduled', 'ongoing'] }
    }).sort({ date: 1 }).limit(7).lean();

    // Cancellation rate (in range)
    const sessionsInRange = await Session.countDocuments({ teacherId, createdAt: { $gte: from, $lte: to } });
    const cancelledInRange = await Session.countDocuments({ teacherId, createdAt: { $gte: from, $lte: to }, status: 'cancelled' });
    const cancellationRate = sessionsInRange > 0 ? cancelledInRange / sessionsInRange : 0;

    // Ratings
    const ratingStats = await TeacherRating.aggregate([
      { $match: { teacher: new mongoose.Types.ObjectId(teacherId), status: 'approved', createdAt: { $gte: from, $lte: to } } },
      { $group: { _id: null, averageRating: { $avg: '$overallRating' }, total: { $sum: 1 } } }
    ]);
    const averageRating = ratingStats[0]?.averageRating || 0;
    const totalRatings = ratingStats[0]?.total || 0;

    // Recent reviews (last 5)
    const recentReviews = await TeacherRating.find({ teacher: teacherId, status: 'approved' })
      .populate('student', 'firstName lastName avatar')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    // Complaints against me
    const complaintCount = await Complaint.countDocuments({ againstUserId: teacherId, createdAt: { $gte: from, $lte: to } });

    // Followers and posts are not modeled yet → return zeros/empty
    const followers = { count: 0, growth: 0 };
    const posts = { mostEngaged: [] };

    return res.json({
      success: true,
      data: {
        totals: {
          earnings: totalEarnings,
          sales,
          cancellationRate,
          averageRating,
          totalRatings,
          complaintCount
    },
        upcomingSessions,
        recentReviews,
        followers,
        posts
      }
    });
  } catch (err) {
    console.error('Teacher dashboard summary error:', err);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// GET /me/dashboard/earnings?interval=week|month
exports.getEarnings = async (req, res) => {
  try {
    if (req.user.role !== 'enseignant') return res.status(403).json({ success: false, message: 'Accès réservé aux enseignants' });
    const teacherId = req.user._id;
    const interval = req.query.interval === 'week' ? 'week' : 'month';
    const now = new Date();
    const from = interval === 'week' ? new Date(now.getTime() - 7 * 86400000) : new Date(now.getFullYear(), now.getMonth(), 1);

    const data = await Purchase.aggregate([
      { $match: { status: 'completed', purchasedAt: { $gte: from, $lte: now } } },
      { $lookup: { from: 'courses', localField: 'course', foreignField: '_id', as: 'course' } },
      { $unwind: '$course' },
      { $match: { 'course.instructor': new mongoose.Types.ObjectId(teacherId) } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$purchasedAt' } }, amount: { $sum: '$amount' }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    res.json({ success: true, data });
  } catch (err) {
    console.error('Teacher earnings error:', err);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// GET /me/dashboard/ratings
exports.getRatings = async (req, res) => {
  try {
    if (req.user.role !== 'enseignant') return res.status(403).json({ success: false, message: 'Accès réservé aux enseignants' });
    const teacherId = req.user._id;

    const distribution = await TeacherRating.aggregate([
      { $match: { teacher: new mongoose.Types.ObjectId(teacherId), status: 'approved' } },
      { $group: { _id: '$overallRating', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    const average = await TeacherRating.aggregate([
      { $match: { teacher: new mongoose.Types.ObjectId(teacherId), status: 'approved' } },
      { $group: { _id: null, avg: { $avg: '$overallRating' } } }
    ]);

    res.json({ success: true, data: { distribution, average: average[0]?.avg || 0 } });
  } catch (err) {
    console.error('Teacher ratings error:', err);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// GET /me/dashboard/followers?from&to (placeholder)
exports.getFollowers = async (req, res) => {
  try {
    if (req.user.role !== 'enseignant') return res.status(403).json({ success: false, message: 'Accès réservé aux enseignants' });
    // Followers not implemented in data model
    res.json({ success: true, data: { count: 0, growth: 0, series: [] } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// GET /me/dashboard/posts/engagement (placeholder)
exports.getPostsEngagement = async (req, res) => {
  try {
    if (req.user.role !== 'enseignant') return res.status(403).json({ success: false, message: 'Accès réservé aux enseignants' });
    // Posts not implemented in data model
    res.json({ success: true, data: { mostEngaged: [], totals: { likes: 0, comments: 0, shares: 0 } } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};
























