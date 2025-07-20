const express = require('express');
const router = express.Router();

// Import des contrôleurs
const {
  register,
  login,
  getProfile,
  updateProfile,
  logout,
  forgotPassword,
  resetPassword,
  getGlobalStats
} = require('../controllers/authController');
const teacherController = require('../controllers/teacherController');

// Import des middlewares
const {
  authenticateToken,
  authorizeRoles,
  requireVerification,
  loginLimiter,
  registerLimiter
} = require('../middleware/authMiddleware');

// Routes publiques
router.post('/register', registerLimiter, register);
router.post('/login', loginLimiter, login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/stats', getGlobalStats);

// Liste publique des enseignants
router.get('/teachers', teacherController.getAllTeachers);

// Routes protégées
router.get('/profile', authenticateToken, getProfile);
router.put('/profile', authenticateToken, updateProfile);
router.post('/logout', authenticateToken, logout);

// Routes pour les enseignants uniquement
router.get('/teacher/profile', authenticateToken, authorizeRoles('enseignant'), getProfile);
router.put('/teacher/profile', authenticateToken, authorizeRoles('enseignant'), updateProfile);

// Routes pour les étudiants uniquement
router.get('/student/profile', authenticateToken, authorizeRoles('etudiant'), getProfile);
router.put('/student/profile', authenticateToken, authorizeRoles('etudiant'), updateProfile);

// Routes pour les administrateurs
router.get('/admin/stats', authenticateToken, authorizeRoles('admin'), getGlobalStats);

module.exports = router;
