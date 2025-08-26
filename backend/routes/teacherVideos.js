const express = require('express');
const router = express.Router();

// Import des contrôleurs
const {
  uploadTeacherVideo,
  getTeacherVideos,
  getPublicVideos,
  getVideo,
  updateVideo,
  deleteVideo
} = require('../controllers/teacherVideoController');

// Import des middlewares
const {
  authenticateToken,
  authorizeRoles
} = require('../middleware/authMiddleware');

// Import des middlewares d'upload
const { uploadVideo } = require('../config/cloudinary');

// Routes publiques
router.get('/public', getPublicVideos);
router.get('/:videoId', getVideo);

// Routes protégées pour les enseignants
router.post('/upload', 
  authenticateToken, 
  authorizeRoles('enseignant'), 
  uploadVideo.single('video'), 
  uploadTeacherVideo
);

router.get('/teacher/:teacherId', getTeacherVideos);

router.put('/:videoId', 
  authenticateToken, 
  authorizeRoles('enseignant'), 
  updateVideo
);

router.delete('/:videoId', 
  authenticateToken, 
  authorizeRoles('enseignant'), 
  deleteVideo
);

module.exports = router;
