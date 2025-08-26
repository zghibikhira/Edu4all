const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/authMiddleware');
const {
  getCoursePdf,
  checkCourseAccess,
  downloadCourseFile
} = require('../controllers/contentController');

// Routes protégées (authentification requise)
router.use(authenticateToken);

// Vérifier l'accès à un cours
router.get('/course/:courseId/access', checkCourseAccess);

// Obtenir les PDFs d'un cours acheté
router.get('/course/:courseId/pdf', getCoursePdf);

// Télécharger un fichier spécifique d'un cours
router.post('/course/:courseId/download/:fileId', downloadCourseFile);

module.exports = router;
