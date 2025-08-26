const ModerationAction = require('../models/moderationAction');
const User = require('../models/user');
const Complaint = require('../models/complaint');
const notificationService = require('../services/notificationService');

// Create a moderation action (ban, warn, etc.)
exports.createModerationAction = async (req, res) => {
  try {
    const {
      type,
      targetUserId,
      reason,
      duration = 0, // 0 for permanent
      complaintId,
      metadata
    } = req.body;

    const adminId = req.user.id;

    // Validation
    if (!type || !targetUserId || !reason) {
      return res.status(400).json({
        success: false,
        message: 'Type, utilisateur cible et raison sont requis'
      });
    }

    // Check if target user exists
    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur cible non trouvé'
      });
    }

    // Check if complaint exists if provided
    if (complaintId) {
      const complaint = await Complaint.findById(complaintId);
      if (!complaint) {
        return res.status(404).json({
          success: false,
          message: 'Plainte non trouvée'
        });
      }
    }

    // Create moderation action
    const moderationAction = new ModerationAction({
      adminId,
      type,
      targetUserId,
      reason,
      duration,
      complaintId,
      metadata: metadata || {}
    });

    await moderationAction.save();

    // Update user status based on action type
    if (type === 'BAN') {
      targetUser.isActive = false;
      targetUser.status = 'BANNED';
      targetUser.bannedAt = new Date();
      targetUser.bannedBy = adminId;
      targetUser.banReason = reason;
      targetUser.ban = {
        reason,
        byAdminId: adminId,
        createdAt: new Date(),
        expiresAt: duration > 0 ? new Date(Date.now() + duration * 60 * 60 * 1000) : null
      };
      await targetUser.save();

      // Auto-cancel future sessions and notify participants (best effort)
      try {
        const Session = require('../models/session');
        const notificationService = require('../services/notificationService');
        const futureSessions = await Session.find({
          $or: [
            { teacherId: targetUserId },
            { students: targetUserId },
            { enrolledStudents: targetUserId }
          ],
          date: { $gte: new Date() },
          status: { $in: ['scheduled', 'ongoing'] }
        }).lean();

        for (const s of futureSessions) {
          await Session.updateOne({ _id: s._id }, { $set: { status: 'cancelled', cancellationReason: 'User banned by admin' } });
          const recipients = [
            ...(s.enrolledStudents || []).map(id => ({ userId: id, studentName: '' })),
            ...(s.students || []).map(id => ({ userId: id, studentName: '' })),
            { userId: s.teacherId, studentName: '' }
          ].filter(r => String(r.userId) !== String(targetUserId));

          await notificationService.createSessionNotification('SESSION_CANCELLED', s, recipients);
        }
      } catch (e) {
        console.error('Error auto-cancelling sessions on BAN:', e);
      }
    } else if (type === 'SUSPEND') {
      targetUser.isActive = false;
      targetUser.suspendedAt = new Date();
      targetUser.suspendedBy = adminId;
      targetUser.suspensionReason = reason;
      if (duration > 0) {
        targetUser.suspensionExpiresAt = new Date(Date.now() + duration * 60 * 60 * 1000);
      }
      await targetUser.save();
    }

    // Populate action for response
    await moderationAction.populate('adminId', 'firstName lastName email');
    await moderationAction.populate('targetUserId', 'firstName lastName email');
    if (complaintId) {
      await moderationAction.populate('complaintId', 'title category');
    }

    // Send notification to target user
    try {
      const actionMessages = {
        'WARN': 'Vous avez reçu un avertissement',
        'BAN': 'Votre compte a été banni',
        'SUSPEND': 'Votre compte a été suspendu',
        'RESTRICT': 'Votre compte a été restreint'
      };

      await notificationService.createAndSendNotification({
        userId: targetUserId,
        type: 'MODERATION_ACTION',
        title: actionMessages[type] || 'Action de modération',
        body: `Raison: ${reason}${type === 'BAN' ? '\nPour faire appel, contactez le support.' : ''}`,
        link: '/profile',
        metadata: {
          entityType: 'moderation',
          actionType: type,
          reason: reason,
          duration: duration
        }
      });
    } catch (notifError) {
      console.error('Error sending notification:', notifError);
    }

    res.status(201).json({
      success: true,
      message: 'Action de modération créée avec succès',
      data: moderationAction
    });

  } catch (error) {
    console.error('Error creating moderation action:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de l\'action de modération'
    });
  }
};

// Get moderation actions for a user
exports.getUserModerationActions = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20, type } = req.query;

    let query = { targetUserId: userId };
    if (type) {
      query.type = type;
    }

    const actions = await ModerationAction.find(query)
      .populate('adminId', 'firstName lastName email')
      .populate('complaintId', 'title category')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await ModerationAction.countDocuments(query);

    res.json({
      success: true,
      data: {
        actions,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });

  } catch (error) {
    console.error('Error fetching user moderation actions:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des actions de modération'
    });
  }
};

// Admin: Get all moderation actions
exports.getAdminModerationActions = async (req, res) => {
  try {
    const {
      type,
      targetUserId,
      page = 1,
      limit = 50,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build query
    let query = {};
    if (type) query.type = type;
    if (targetUserId) query.targetUserId = targetUserId;

    // Build sort
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const actions = await ModerationAction.find(query)
      .populate('adminId', 'firstName lastName email')
      .populate('targetUserId', 'firstName lastName email')
      .populate('complaintId', 'title category')
      .sort(sort)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await ModerationAction.countDocuments(query);

    res.json({
      success: true,
      data: {
        actions,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });

  } catch (error) {
    console.error('Error fetching admin moderation actions:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des actions de modération'
    });
  }
};

// Revoke a moderation action
exports.revokeModerationAction = async (req, res) => {
  try {
    const { actionId } = req.params;
    const { reason } = req.body;
    const adminId = req.user.id;

    const action = await ModerationAction.findById(actionId)
      .populate('targetUserId', 'firstName lastName email');

    if (!action) {
      return res.status(404).json({
        success: false,
        message: 'Action de modération non trouvée'
      });
    }

    // Check if action is active
    if (action.status !== 'ACTIVE') {
      return res.status(400).json({
        success: false,
        message: 'Cette action de modération n\'est plus active'
      });
    }

    // Revoke the action
    await action.revoke(adminId, reason);

    // Update user status if necessary
    if (action.type === 'BAN' || action.type === 'SUSPEND') {
      const targetUser = await User.findById(action.targetUserId);
      if (targetUser) {
        targetUser.isActive = true;
        targetUser.status = 'ACTIVE';
        targetUser.bannedAt = undefined;
        targetUser.bannedBy = undefined;
        targetUser.banReason = undefined;
        targetUser.ban = undefined;
        targetUser.suspendedAt = undefined;
        targetUser.suspendedBy = undefined;
        targetUser.suspensionReason = undefined;
        targetUser.suspensionExpiresAt = undefined;
        await targetUser.save();
      }
    }

    // Send notification to target user
    try {
      await notificationService.createAndSendNotification({
        userId: action.targetUserId._id,
        type: 'MODERATION_ACTION_REVOKED',
        title: 'Action de modération révoquée',
        body: `L'action de modération "${action.type}" a été révoquée`,
        link: '/profile',
        metadata: {
          entityType: 'moderation',
          actionType: action.type,
          revokedReason: reason
        }
      });
    } catch (notifError) {
      console.error('Error sending notification:', notifError);
    }

    // Populate revoked action
    await action.populate('adminId', 'firstName lastName email');
    await action.populate('revokedBy', 'firstName lastName email');
    await action.populate('complaintId', 'title category');

    res.json({
      success: true,
      message: 'Action de modération révoquée avec succès',
      data: action
    });

  } catch (error) {
    console.error('Error revoking moderation action:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la révocation de l\'action de modération'
    });
  }
};

// Get moderation statistics
exports.getModerationStats = async (req, res) => {
  try {
    const stats = await ModerationAction.aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 }
        }
      }
    ]);

    const statusStats = await ModerationAction.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get active bans and suspensions
    const activeActions = await ModerationAction.find({
      status: 'ACTIVE',
      type: { $in: ['BAN', 'SUSPEND'] }
    }).countDocuments();

    // Convert to object format
    const typeStats = {};
    stats.forEach(stat => {
      typeStats[stat._id] = stat.count;
    });

    const statusStatsObj = {};
    statusStats.forEach(stat => {
      statusStatsObj[stat._id] = stat.count;
    });

    res.json({
      success: true,
      data: {
        type: typeStats,
        status: statusStatsObj,
        activeActions
      }
    });

  } catch (error) {
    console.error('Error fetching moderation stats:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des statistiques'
    });
  }
};

// Check if user has active moderation actions
exports.checkUserModerationStatus = async (req, res) => {
  try {
    const { userId } = req.params;

    const activeActions = await ModerationAction.getActiveActionsForUser(userId);

    const user = await User.findById(userId).select('isActive bannedAt suspendedAt');

    res.json({
      success: true,
      data: {
        activeActions,
        userStatus: {
          isActive: user.isActive,
          bannedAt: user.bannedAt,
          suspendedAt: user.suspendedAt
        }
      }
    });

  } catch (error) {
    console.error('Error checking user moderation status:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la vérification du statut de modération'
    });
  }
};
