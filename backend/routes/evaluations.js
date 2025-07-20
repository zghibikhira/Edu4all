const express = require('express');
const router = express.Router();

// Import des contrôleurs
const {
  createEvaluation,
  getTeacherEvaluations,
  getStudentEvaluations,
  getEvaluation,
  submitEvaluation,
  gradeEvaluation,
  publishEvaluation,
  createOnlineEvaluation,
  assignEvaluationToStudents,
  getEvaluationStats,
  deleteEvaluation
} = require('../controllers/evaluationController');

// Import des middlewares
const {
  authenticateToken,
  authorizeRoles
} = require('../middleware/authMiddleware');

// Routes pour les enseignants
router.post('/', authenticateToken, authorizeRoles('enseignant'), createEvaluation);
router.post('/online', authenticateToken, authorizeRoles('enseignant'), createOnlineEvaluation);
router.post('/assign', authenticateToken, authorizeRoles('enseignant'), assignEvaluationToStudents);
router.get('/teacher', authenticateToken, authorizeRoles('enseignant'), getTeacherEvaluations);
router.get('/teacher/:id', authenticateToken, authorizeRoles('enseignant'), getEvaluation);
router.put('/:id/grade', authenticateToken, authorizeRoles('enseignant'), gradeEvaluation);
router.put('/:id/publish', authenticateToken, authorizeRoles('enseignant'), publishEvaluation);
router.delete('/:id', authenticateToken, authorizeRoles('enseignant'), deleteEvaluation);

// Routes pour les étudiants
router.get('/student', authenticateToken, authorizeRoles('etudiant'), getStudentEvaluations);
router.get('/student/:id', authenticateToken, authorizeRoles('etudiant'), getEvaluation);
router.put('/:id/submit', authenticateToken, authorizeRoles('etudiant'), submitEvaluation);

// Routes pour les statistiques
router.get('/stats', authenticateToken, getEvaluationStats);

// Route générale pour obtenir une évaluation (accessible aux deux rôles)
router.get('/:id', authenticateToken, getEvaluation);

module.exports = router; 