const express = require('express');
const router = express.Router();

// Import des contrôleurs
const {
  uploadPDF,
  uploadVideo,
  uploadAvatar,
  uploadFile,
  uploadCourseMaterial,
  uploadEvaluationFile,
  deleteFile,
  getFileInfo,
  handleUploadError,
  videoUploadMiddleware
} = require('../controllers/fileController');

const Video = require('../models/video');

// Import des middlewares
const {
  authenticateToken,
  authorizeRoles
} = require('../middleware/authMiddleware');

// Import des middlewares d'upload
const { 
  uploadPDF: uploadPDFMiddleware, 
  uploadVideo: uploadVideoMiddleware, 
  uploadAvatar: uploadAvatarMiddleware,
  uploadEvidence
} = require('../config/cloudinary');

// Routes protégées pour l'upload de fichiers
router.post('/upload/pdf', authenticateToken, uploadPDFMiddleware.single('pdf'), uploadPDF);
router.post('/upload/video', authenticateToken, uploadVideoMiddleware.single('video'), uploadVideo);
router.post('/upload/avatar', authenticateToken, uploadAvatarMiddleware.single('avatar'), uploadAvatar);
router.post('/upload/file', authenticateToken, uploadEvidence.single('file'), uploadFile);
router.post('/upload/course-material', authenticateToken, uploadEvidence.single('file'), uploadCourseMaterial);
router.post('/upload/evaluation-file', authenticateToken, uploadEvidence.single('file'), uploadEvaluationFile);

// Video upload route (teacher only)
router.post('/videos/upload', authenticateToken, authorizeRoles('enseignant'), videoUploadMiddleware, uploadVideo);

// Get all videos
router.get('/videos', async (req, res) => {
  try {
    const videos = await Video.find().populate('teacher', 'firstName lastName email');
    res.json(videos);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Routes pour la gestion des fichiers
router.get('/info/:publicId', authenticateToken, getFileInfo);
router.delete('/:publicId', authenticateToken, deleteFile);

// Middleware pour gérer les erreurs d'upload
router.use(handleUploadError);

module.exports = router; 