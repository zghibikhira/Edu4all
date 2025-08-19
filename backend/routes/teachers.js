const express = require('express');
const router = express.Router();
const { getAllTeachers, getTeacherById } = require('../controllers/teacherController');
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

// GET /api/teachers/:teacherId (public profile)
router.get('/:teacherId', getTeacherById);

module.exports = router; 