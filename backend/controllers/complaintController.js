const Complaint = require('../models/complaint');
const ModerationAction = require('../models/moderationAction');
const User = require('../models/user');
const notificationService = require('../services/notificationService');
const { cloudinary } = require('../config/cloudinary');

// Create a new complaint
exports.createComplaint = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      againstUserId,
      orderId,
      sessionId,
      courseId,
      evidenceFiles
    } = req.body;

    const reporterId = req.user.id;

    // Validation
    if (!title || !description || !category) {
      return res.status(400).json({
        success: false,
        message: 'Titre, description et catégorie sont requis'
      });
    }

    // Create complaint
    const complaint = new Complaint({
      reporterId,
      title,
      description,
      category,
      againstUserId,
      orderId,
      sessionId,
      courseId,
      evidenceFiles: evidenceFiles || []
    });

    // Map uploaded files (if any)
    if (req.files && Array.isArray(req.files) && req.files.length > 0) {
      complaint.evidenceFiles = (
        complaint.evidenceFiles || []
      ).concat(
        req.files.map(f => ({
          filename: f.filename || f.public_id || f.originalname,
          originalName: f.originalname,
          fileType: f.mimetype,
          fileUrl: f.path, // Cloudinary url
          cloudinaryId: f.filename || f.public_id,
          uploadedAt: new Date()
        }))
      );
    }

    await complaint.save();

    // Populate user info for response
    await complaint.populate('reporterId', 'firstName lastName email');
    if (againstUserId) {
      await complaint.populate('againstUserId', 'firstName lastName email');
    }

    // Send notification to admins about new complaint
    try {
      const admins = await User.find({ role: 'admin', isActive: true }).select('_id');
      await Promise.all(
        admins.map(admin => notificationService.createAndSendNotification({
          userId: admin._id,
          type: 'COMPLAINT_SUBMITTED',
          title: 'Nouvelle plainte soumise',
          body: `Une nouvelle plainte "${title}" a été soumise par ${req.user.firstName} ${req.user.lastName}`,
          link: `/admin/complaints/${complaint._id}`,
          metadata: {
            entityType: 'complaint',
            entityId: complaint._id,
            category: complaint.category,
            reporterName: `${req.user.firstName} ${req.user.lastName}`
          }
        }))
      );
    } catch (notifError) {
      console.error('Error sending notification:', notifError);
    }

    res.status(201).json({
      success: true,
      message: 'Plainte soumise avec succès',
      data: complaint
    });

  } catch (error) {
    console.error('Error creating complaint:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de la plainte'
    });
  }
};

// Get user's complaints
exports.getUserComplaints = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20, status } = req.query;

    let query = { reporterId: userId };
    if (status) {
      query.status = status;
    }

    const complaints = await Complaint.find(query)
      .populate('againstUserId', 'firstName lastName email')
      .populate('resolvedBy', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Complaint.countDocuments(query);

    res.json({
      success: true,
      data: {
        complaints,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });

  } catch (error) {
    console.error('Error fetching user complaints:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des plaintes'
    });
  }
};

// Get complaint by ID (for user)
exports.getComplaintById = async (req, res) => {
  try {
    const { complaintId } = req.params;
    const userId = req.user.id;

    const complaint = await Complaint.findById(complaintId)
      .populate('reporterId', 'firstName lastName email')
      .populate('againstUserId', 'firstName lastName email')
      .populate('resolvedBy', 'firstName lastName email')
      .populate('adminNotes.adminId', 'firstName lastName email');

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Plainte non trouvée'
      });
    }

    // Check if user is authorized to view this complaint
    if (complaint.reporterId._id.toString() !== userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Accès non autorisé'
      });
    }

    // Filter admin notes - only show non-internal notes to non-admins
    if (req.user.role !== 'admin') {
      complaint.adminNotes = complaint.adminNotes.filter(note => !note.isInternal);
      // Hide evidence file URLs from non-admins (privacy)
      if (complaint.evidenceFiles && complaint.evidenceFiles.length > 0) {
        complaint.evidenceFiles = complaint.evidenceFiles.map(f => ({
          originalName: f.originalName,
          fileType: f.fileType,
          uploadedAt: f.uploadedAt,
          description: f.description
        }));
      }
    }

    res.json({
      success: true,
      data: complaint
    });

  } catch (error) {
    console.error('Error fetching complaint:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de la plainte'
    });
  }
};

// Admin: Get all complaints with filters
exports.getAdminComplaints = async (req, res) => {
  try {
    const {
      status,
      category,
      priority,
      page = 1,
      limit = 50,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build query
    let query = {};
    if (status) query.status = status;
    if (category) query.category = category;
    if (priority) query.priority = priority;

    // Build sort
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const complaints = await Complaint.find(query)
      .populate('reporterId', 'firstName lastName email')
      .populate('againstUserId', 'firstName lastName email')
      .populate('resolvedBy', 'firstName lastName email')
      .sort(sort)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Complaint.countDocuments(query);

    res.json({
      success: true,
      data: {
        complaints,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });

  } catch (error) {
    console.error('Error fetching admin complaints:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des plaintes'
    });
  }
};

// Admin: Update complaint status and add notes
exports.updateComplaint = async (req, res) => {
  try {
    const { complaintId } = req.params;
    const { status, resolution, note, isInternal = false, priority } = req.body;
    const adminId = req.user.id;

    const complaint = await Complaint.findById(complaintId)
      .populate('reporterId', 'firstName lastName email');

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Plainte non trouvée'
      });
    }

    // Update status if provided
    if (status && status !== complaint.status) {
      await complaint.updateStatus(status, adminId, resolution);
    }

    // Update priority if provided
    if (priority && priority !== complaint.priority) {
      complaint.priority = priority;
    }

    // Add admin note if provided
    if (note) {
      await complaint.addAdminNote(adminId, note, isInternal);
    }

    await complaint.save();

    // Send notification to reporter about status change
    try {
      await notificationService.createAndSendNotification({
        userId: complaint.reporterId._id,
        type: 'COMPLAINT_STATUS_CHANGED',
        title: 'Statut de votre plainte mis à jour',
        body: `Votre plainte "${complaint.title}" a été mise à jour vers le statut: ${status}`,
        link: `/complaints/${complaint._id}`,
        metadata: {
          entityType: 'complaint',
          entityId: complaint._id,
          status: status,
          category: complaint.category
        }
      });
    } catch (notifError) {
      console.error('Error sending notification:', notifError);
    }

    // Populate updated complaint
    await complaint.populate('reporterId', 'firstName lastName email');
    await complaint.populate('againstUserId', 'firstName lastName email');
    await complaint.populate('resolvedBy', 'firstName lastName email');
    await complaint.populate('adminNotes.adminId', 'firstName lastName email');

    res.json({
      success: true,
      message: 'Plainte mise à jour avec succès',
      data: complaint
    });

  } catch (error) {
    console.error('Error updating complaint:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour de la plainte'
    });
  }
};

// Admin: Escalate complaint
exports.escalateComplaint = async (req, res) => {
  try {
    const { complaintId } = req.params;
    const { escalatedTo } = req.body;
    const adminId = req.user.id;

    const complaint = await Complaint.findById(complaintId);

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Plainte non trouvée'
      });
    }

    await complaint.escalate(escalatedTo, adminId);

    // Send notification to reporter
    try {
      await notificationService.createAndSendNotification({
        userId: complaint.reporterId,
        type: 'COMPLAINT_ESCALATED',
        title: 'Plainte escaladée',
        body: `Votre plainte "${complaint.title}" a été escaladée vers ${escalatedTo}`,
        link: `/complaints/${complaint._id}`,
        metadata: {
          entityType: 'complaint',
          entityId: complaint._id,
          escalatedTo: escalatedTo
        }
      });
    } catch (notifError) {
      console.error('Error sending notification:', notifError);
    }

    res.json({
      success: true,
      message: 'Plainte escaladée avec succès',
      data: complaint
    });

  } catch (error) {
    console.error('Error escalating complaint:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'escalade de la plainte'
    });
  }
};

// Get complaint statistics
exports.getComplaintStats = async (req, res) => {
  try {
    const stats = await Complaint.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const categoryStats = await Complaint.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      }
    ]);

    const priorityStats = await Complaint.aggregate([
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 }
        }
      }
    ]);

    // Convert to object format
    const statusStats = {};
    stats.forEach(stat => {
      statusStats[stat._id] = stat.count;
    });

    const categoryStatsObj = {};
    categoryStats.forEach(stat => {
      categoryStatsObj[stat._id] = stat.count;
    });

    const priorityStatsObj = {};
    priorityStats.forEach(stat => {
      priorityStatsObj[stat._id] = stat.count;
    });

    res.json({
      success: true,
      data: {
        status: statusStats,
        category: categoryStatsObj,
        priority: priorityStatsObj
      }
    });

  } catch (error) {
    console.error('Error fetching complaint stats:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des statistiques'
    });
  }
};

// Admin: Generate a short-lived signed URL for evidence file access
exports.getEvidenceSignedUrl = async (req, res) => {
  try {
    const { complaintId, index } = req.params;
    const evidenceIndex = parseInt(index, 10);

    const complaint = await Complaint.findById(complaintId);
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Plainte non trouvée' });
    }

    if (!complaint.evidenceFiles || !complaint.evidenceFiles[evidenceIndex]) {
      return res.status(404).json({ success: false, message: 'Fichier de preuve non trouvé' });
    }

    const file = complaint.evidenceFiles[evidenceIndex];
    const publicId = file.cloudinaryId;
    const mime = file.fileType || '';

    // Determine resource type
    const resourceType = mime.startsWith('video/') ? 'video' : (mime.startsWith('image/') ? 'image' : 'raw');

    // Expire in 5 minutes
    const expiresAt = Math.floor(Date.now() / 1000) + 5 * 60;

    let url;
    if (resourceType === 'raw') {
      // For raw (e.g., PDF)
      const format = (file.originalName && file.originalName.split('.').pop()) || 'pdf';
      url = cloudinary.utils.private_download_url(publicId, format, { expires_at: expiresAt, resource_type: 'raw', type: 'authenticated' });
    } else {
      // For images/videos
      url = cloudinary.url(publicId, {
        resource_type: resourceType,
        type: 'authenticated',
        sign_url: true,
        expires_at: expiresAt
      });
    }

    return res.json({ success: true, data: { url, expiresAt } });
  } catch (error) {
    console.error('Error generating signed url:', error);
    return res.status(500).json({ success: false, message: 'Erreur lors de la génération du lien sécurisé' });
  }
};
