const express = require('express');
const router = express.Router();
const { 
  getAllTeachers, 
  getTeacherById, 
  getAdminTeacherRanking, 
  recomputeTeacherRankings,
  getTeacherEvolution,
  getTeacherEvolutionById,
  getEvolutionStats,
  getEvolutionHistory,
  calculateEvolution,
  getEvolutionLeaderboard
} = require('../controllers/teacherController');
const teacherDashboard = require('../controllers/teacherDashboardController');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');

// GET /api/teachers
router.get('/', getAllTeachers);

// Dashboard endpoints for logged-in teacher (declare before dynamic :teacherId)
router.get('/me/dashboard/summary', authenticateToken, authorizeRoles('enseignant'), teacherDashboard.getSummary);
router.get('/me/dashboard/earnings', authenticateToken, authorizeRoles('enseignant'), teacherDashboard.getEarnings);
router.get('/me/dashboard/ratings', authenticateToken, authorizeRoles('enseignant'), teacherDashboard.getRatings);
router.get('/me/dashboard/followers', authenticateToken, authorizeRoles('enseignant'), teacherDashboard.getFollowers);
router.get('/me/dashboard/posts/engagement', authenticateToken, authorizeRoles('enseignant'), teacherDashboard.getPostsEngagement);

// Teacher Evolution endpoints (declare before dynamic :teacherId)
router.get('/evolution', authenticateToken, authorizeRoles('enseignant'), getTeacherEvolution);
router.get('/evolution/stats', authenticateToken, getEvolutionStats);
router.get('/evolution/history', authenticateToken, getEvolutionHistory);
router.post('/evolution/calculate', authenticateToken, authorizeRoles('enseignant'), calculateEvolution);
router.get('/evolution/leaderboard', authenticateToken, getEvolutionLeaderboard);

// Admin endpoints (declare before dynamic :teacherId)
router.get('/admin/ranking/list', authenticateToken, authorizeRoles('admin'), getAdminTeacherRanking);
router.post('/admin/ranking/recompute', authenticateToken, authorizeRoles('admin'), recomputeTeacherRankings);

// GET /api/teachers/:teacherId (public profile)
router.get('/:teacherId', getTeacherById);

// GET /api/teachers/:teacherId/evolution (specific teacher evolution)
router.get('/:teacherId/evolution', authenticateToken, getTeacherEvolutionById);

module.exports = router; 