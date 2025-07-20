const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const path = require('path');
const User = require('../models/user');
const Course = require('../models/course');
const Evaluation = require('../models/evaluation');
const Video = require('../models/video');

// Configuration Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Multer storage config for videos
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/videos/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  },
});

const videoUpload = multer({
  storage: storage,
  limits: { fileSize: 1000 * 1024 * 1024 }, // 1GB limit
  fileFilter: function (req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext !== '.mp4' && ext !== '.mov' && ext !== '.avi' && ext !== '.mkv') {
      return cb(new Error('Only video files are allowed!'));
    }
    cb(null, true);
  },
});

// Upload PDF
exports.uploadPDF = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Aucun fichier PDF fourni'
      });
    }

    // Upload vers Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      resource_type: 'raw',
      folder: 'edu4all/pdfs',
      allowed_formats: ['pdf'],
      transformation: [
        { quality: 'auto' }
      ]
    });

    res.json({
      success: true,
      message: 'PDF uploadé avec succès',
      data: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        fileUrl: result.secure_url,
        cloudinaryId: result.public_id,
        fileType: 'pdf',
        size: result.bytes
      }
    });

  } catch (error) {
    console.error('Erreur lors de l\'upload PDF:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'upload du fichier'
    });
  }
};

// Video upload controller
exports.uploadVideo = async (req, res) => {
  try {
    const { title, description, subject, level } = req.body;
    const teacher = req.user._id; // assuming auth middleware sets req.user
    if (!req.file) {
      return res.status(400).json({ message: 'No video file uploaded.' });
    }
    const videoUrl = `/uploads/videos/${req.file.filename}`;
    const video = new Video({
      title,
      description,
      teacher,
      subject,
      level,
      videoUrl,
    });
    await video.save();
    res.status(201).json({ message: 'Video uploaded successfully', video });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.videoUploadMiddleware = videoUpload.single('video');

// Upload Avatar
exports.uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Aucune image fournie'
      });
    }

    // Upload vers Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'edu4all/avatars',
      allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
      transformation: [
        { width: 300, height: 300, crop: 'fill', gravity: 'face' },
        { quality: 'auto' }
      ]
    });

    res.json({
      success: true,
      message: 'Avatar uploadé avec succès',
      data: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        fileUrl: result.secure_url,
        cloudinaryId: result.public_id,
        fileType: 'image',
        size: result.bytes,
        width: result.width,
        height: result.height
      }
    });

  } catch (error) {
    console.error('Erreur lors de l\'upload avatar:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'upload de l\'avatar'
    });
  }
};

// Supprimer un fichier
exports.deleteFile = async (req, res) => {
  try {
    const { publicId } = req.params;

    if (!publicId) {
      return res.status(400).json({
        success: false,
        message: 'ID du fichier requis'
      });
    }

    const result = await cloudinary.uploader.destroy(publicId);

    if (result.result === 'ok') {
      res.json({
        success: true,
        message: 'Fichier supprimé avec succès'
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Erreur lors de la suppression du fichier'
      });
    }

  } catch (error) {
    console.error('Erreur lors de la suppression du fichier:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};

// Obtenir les informations d'un fichier
exports.getFileInfo = async (req, res) => {
  try {
    const { publicId } = req.params;

    if (!publicId) {
      return res.status(400).json({
        success: false,
        message: 'ID du fichier requis'
      });
    }

    const result = await cloudinary.api.resource(publicId);

    res.json({
      success: true,
      data: {
        publicId: result.public_id,
        url: result.secure_url,
        format: result.format,
        size: result.bytes,
        width: result.width,
        height: result.height,
        createdAt: result.created_at
      }
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des infos du fichier:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};

// Upload de fichiers génériques
exports.uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Aucun fichier fourni'
      });
    }

    const fileType = req.file.mimetype.split('/')[0];
    let resourceType = 'auto';
    let folder = 'edu4all/files';

    if (fileType === 'video') {
      resourceType = 'video';
      folder = 'edu4all/videos';
    } else if (fileType === 'image') {
      resourceType = 'image';
      folder = 'edu4all/images';
    } else if (req.file.mimetype === 'application/pdf') {
      resourceType = 'raw';
      folder = 'edu4all/pdfs';
    }

    // Upload vers Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      resource_type: resourceType,
      folder: folder,
      transformation: [
        { quality: 'auto' }
      ]
    });

    res.json({
      success: true,
      message: 'Fichier uploadé avec succès',
      data: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        fileUrl: result.secure_url,
        cloudinaryId: result.public_id,
        fileType: fileType,
        mimeType: req.file.mimetype,
        size: result.bytes
      }
    });

  } catch (error) {
    console.error('Erreur lors de l\'upload de fichier:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'upload du fichier'
    });
  }
};

// Upload de matériel de cours
exports.uploadCourseMaterial = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Aucun fichier fourni'
      });
    }

    const { courseId, description, isPublic = false } = req.body;
    const userId = req.user.id;

    if (!courseId) {
      return res.status(400).json({
        success: false,
        message: 'ID du cours requis'
      });
    }

    // Vérifier que l'utilisateur est l'instructeur du cours
    const course = await Course.findById(courseId);
    if (!course || course.instructor.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Accès non autorisé'
      });
    }

    const fileType = req.file.mimetype.split('/')[0];
    let resourceType = 'auto';
    let folder = 'edu4all/course-materials';

    if (fileType === 'video') {
      resourceType = 'video';
    } else if (req.file.mimetype === 'application/pdf') {
      resourceType = 'raw';
    }

    // Upload vers Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      resource_type: resourceType,
      folder: folder,
      transformation: [
        { quality: 'auto' }
      ]
    });

    // Ajouter le fichier au cours
    const fileData = {
      filename: req.file.filename,
      originalName: req.file.originalname,
      fileType: fileType,
      fileUrl: result.secure_url,
      cloudinaryId: result.public_id,
      uploadedAt: new Date(),
      description: description || '',
      isPublic: isPublic
    };

    course.files.push(fileData);
    await course.save();

    res.json({
      success: true,
      message: 'Matériel de cours uploadé avec succès',
      data: fileData
    });

  } catch (error) {
    console.error('Erreur lors de l\'upload du matériel de cours:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'upload du matériel de cours'
    });
  }
};

// Upload de fichiers pour évaluation
exports.uploadEvaluationFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Aucun fichier fourni'
      });
    }

    const { evaluationId } = req.body;
    const userId = req.user.id;

    if (!evaluationId) {
      return res.status(400).json({
        success: false,
        message: 'ID de l\'évaluation requis'
      });
    }

    // Vérifier que l'utilisateur est l'étudiant assigné à cette évaluation
    const evaluation = await Evaluation.findById(evaluationId);
    if (!evaluation || evaluation.student.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Accès non autorisé'
      });
    }

    const fileType = req.file.mimetype.split('/')[0];
    let resourceType = 'auto';
    let folder = 'edu4all/evaluation-files';

    if (fileType === 'video') {
      resourceType = 'video';
    } else if (req.file.mimetype === 'application/pdf') {
      resourceType = 'raw';
    }

    // Upload vers Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      resource_type: resourceType,
      folder: folder,
      transformation: [
        { quality: 'auto' }
      ]
    });

    // Ajouter le fichier à l'évaluation
    const fileData = {
      filename: req.file.filename,
      originalName: req.file.originalname,
      fileType: fileType,
      url: result.secure_url,
      cloudinaryId: result.public_id,
      uploadedAt: new Date()
    };

    evaluation.submittedFiles.push(fileData);
    await evaluation.save();

    res.json({
      success: true,
      message: 'Fichier d\'évaluation uploadé avec succès',
      data: fileData
    });

  } catch (error) {
    console.error('Erreur lors de l\'upload du fichier d\'évaluation:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'upload du fichier d\'évaluation'
    });
  }
};

// Middleware pour gérer les erreurs d'upload
exports.handleUploadError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'Fichier trop volumineux'
      });
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        message: 'Type de fichier non autorisé'
      });
    }
  }

  if (error.message) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }

  next(error);
}; 