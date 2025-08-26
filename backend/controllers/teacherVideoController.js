const Video = require('../models/video');
const User = require('../models/user');
const cloudinary = require('cloudinary').v2;

// Upload une vidéo d'enseignant
exports.uploadTeacherVideo = async (req, res) => {
  try {
    const { title, description, subject, level, tags = [], isPublic = true } = req.body;
    const teacherId = req.user.id;

    // Vérifier que l'utilisateur est un enseignant
    if (req.user.role !== 'enseignant') {
      return res.status(403).json({
        success: false,
        message: 'Seuls les enseignants peuvent uploader des vidéos'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Aucune vidéo fournie'
      });
    }

    // Upload vers Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      resource_type: 'video',
      folder: 'edu4all/teacher-videos',
      transformation: [
        { quality: 'auto' },
        { fetch_format: 'mp4' }
      ]
    });

    // Créer la vidéo en base
    const video = new Video({
      title: title.trim(),
      description: description?.trim(),
      teacher: teacherId,
      subject: subject,
      level: level,
      videoUrl: result.secure_url,
      cloudinaryId: result.public_id,
      duration: result.duration,
      tags: tags,
      isPublic: isPublic,
      uploadDate: new Date()
    });

    await video.save();

    // Populate teacher info
    await video.populate('teacher', 'firstName lastName avatar');

    res.status(201).json({
      success: true,
      message: 'Vidéo uploadée avec succès',
      data: video
    });

  } catch (error) {
    console.error('Erreur lors de l\'upload de la vidéo:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'upload de la vidéo'
    });
  }
};

// Obtenir toutes les vidéos d'un enseignant
exports.getTeacherVideos = async (req, res) => {
  try {
    const { teacherId } = req.params;
    const { page = 1, limit = 10, subject, level } = req.query;

    const filter = { teacher: teacherId };
    
    if (subject) filter.subject = subject;
    if (level) filter.level = level;

    const videos = await Video.find(filter)
      .populate('teacher', 'firstName lastName avatar')
      .sort({ uploadDate: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Video.countDocuments(filter);

    res.json({
      success: true,
      data: {
        videos,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalVideos: total,
          hasNext: parseInt(page) * parseInt(limit) < total,
          hasPrev: parseInt(page) > 1
        }
      }
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des vidéos:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des vidéos'
    });
  }
};

// Obtenir toutes les vidéos publiques
exports.getPublicVideos = async (req, res) => {
  try {
    const { page = 1, limit = 20, subject, level, teacherId } = req.query;

    const filter = { isPublic: true };
    
    if (subject) filter.subject = subject;
    if (level) filter.level = level;
    if (teacherId) filter.teacher = teacherId;

    const videos = await Video.find(filter)
      .populate('teacher', 'firstName lastName avatar')
      .sort({ uploadDate: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Video.countDocuments(filter);

    res.json({
      success: true,
      data: {
        videos,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalVideos: total,
          hasNext: parseInt(page) * parseInt(limit) < total,
          hasPrev: parseInt(page) > 1
        }
      }
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des vidéos publiques:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des vidéos'
    });
  }
};

// Obtenir une vidéo spécifique
exports.getVideo = async (req, res) => {
  try {
    const { videoId } = req.params;

    const video = await Video.findById(videoId)
      .populate('teacher', 'firstName lastName avatar bio');

    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'Vidéo non trouvée'
      });
    }

    // Vérifier l'accès si la vidéo est privée
    if (!video.isPublic && req.user.id !== video.teacher._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Accès non autorisé'
      });
    }

    res.json({
      success: true,
      data: video
    });

  } catch (error) {
    console.error('Erreur lors de la récupération de la vidéo:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de la vidéo'
    });
  }
};

// Mettre à jour une vidéo
exports.updateVideo = async (req, res) => {
  try {
    const { videoId } = req.params;
    const { title, description, subject, level, tags, isPublic } = req.body;
    const teacherId = req.user.id;

    const video = await Video.findById(videoId);

    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'Vidéo non trouvée'
      });
    }

    if (video.teacher.toString() !== teacherId) {
      return res.status(403).json({
        success: false,
        message: 'Accès non autorisé'
      });
    }

    // Mettre à jour les champs
    if (title) video.title = title.trim();
    if (description !== undefined) video.description = description?.trim();
    if (subject) video.subject = subject;
    if (level) video.level = level;
    if (tags) video.tags = tags;
    if (isPublic !== undefined) video.isPublic = isPublic;

    await video.save();

    res.json({
      success: true,
      message: 'Vidéo mise à jour avec succès',
      data: video
    });

  } catch (error) {
    console.error('Erreur lors de la mise à jour de la vidéo:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour de la vidéo'
    });
  }
};

// Supprimer une vidéo
exports.deleteVideo = async (req, res) => {
  try {
    const { videoId } = req.params;
    const teacherId = req.user.id;

    const video = await Video.findById(videoId);

    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'Vidéo non trouvée'
      });
    }

    if (video.teacher.toString() !== teacherId) {
      return res.status(403).json({
        success: false,
        message: 'Accès non autorisé'
      });
    }

    // Supprimer de Cloudinary
    if (video.cloudinaryId) {
      await cloudinary.uploader.destroy(video.cloudinaryId, { resource_type: 'video' });
    }

    await Video.findByIdAndDelete(videoId);

    res.json({
      success: true,
      message: 'Vidéo supprimée avec succès'
    });

  } catch (error) {
    console.error('Erreur lors de la suppression de la vidéo:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression de la vidéo'
    });
  }
};
