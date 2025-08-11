const express = require('express');
const router = express.Router();
const teacherRatingController = require('../controllers/teacherRatingController');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');

// Routes pour les étudiants
router.post('/', authenticateToken, authorizeRoles('etudiant'), teacherRatingController.createTeacherRating);
router.get('/teacher/:teacherId', authenticateToken, teacherRatingController.getTeacherRatings);
router.get('/teacher/:teacherId/stats', authenticateToken, teacherRatingController.getTeacherStats);

// Routes publiques
router.get('/top', teacherRatingController.getTopTeachers);

// Routes pour les admins
router.patch('/:ratingId/moderate', authenticateToken, authorizeRoles('admin'), teacherRatingController.moderateRating);
router.delete('/:ratingId', authenticateToken, teacherRatingController.deleteRating);

module.exports = router;
