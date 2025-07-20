const express = require('express');
const router = express.Router();

// Import des contrôleurs
const {
  createCourse,
  getAllCourses,
  getInstructorCourses,
  getCourse,
  updateCourse,
  deleteCourse,
  publishCourse,
  addLesson,
  updateLesson,
  deleteLesson,
  searchCourses,
  getCourseStats
} = require('../controllers/courseController');

// Import des middlewares
const {
  authenticateToken,
  authorizeRoles
} = require('../middleware/authMiddleware');

// Routes publiques
router.get('/', getAllCourses);
router.get('/search', searchCourses);
router.get('/:id', getCourse);

// Routes protégées pour les instructeurs
router.post('/', authenticateToken, authorizeRoles('enseignant'), createCourse);
router.get('/instructor/me', authenticateToken, authorizeRoles('enseignant'), getInstructorCourses);
router.put('/:id', authenticateToken, authorizeRoles('enseignant'), updateCourse);
router.delete('/:id', authenticateToken, authorizeRoles('enseignant'), deleteCourse);
router.put('/:id/publish', authenticateToken, authorizeRoles('enseignant'), publishCourse);

// Routes pour la gestion des leçons
router.post('/:id/lessons', authenticateToken, authorizeRoles('enseignant'), addLesson);
router.put('/:id/lessons/:lessonIndex', authenticateToken, authorizeRoles('enseignant'), updateLesson);
router.delete('/:id/lessons/:lessonIndex', authenticateToken, authorizeRoles('enseignant'), deleteLesson);

// Routes pour les statistiques
router.get('/:id/stats', authenticateToken, authorizeRoles('enseignant'), getCourseStats);

module.exports = router; 