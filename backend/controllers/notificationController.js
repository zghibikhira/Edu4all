const notificationService = require('../services/notificationService');
const UserPreferences = require('../models/userPreferences');
const DeliveryLog = require('../models/deliveryLog');

// Get user notifications with pagination and filters
const getUserNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      page = 1,
      limit = 20,
      unreadOnly = false,
      type = null,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      unreadOnly: unreadOnly === 'true',
      type,
      sortBy,
      sortOrder
    };

    const result = await notificationService.getUserNotifications(userId, options);

    res.json({
      success: true,
      data: result.notifications,
      pagination: result.pagination
    });
  } catch (error) {
    console.error('Error getting user notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des notifications',
      error: error.message
    });
  }
};

// Get unread notification count
const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;
    const count = await notificationService.getUnreadCount(userId);

    res.json({
      success: true,
      data: { unreadCount: count }
    });
  } catch (error) {
    console.error('Error getting unread count:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du nombre de notifications non lues',
      error: error.message
    });
  }
};

// Mark notification as read
const markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user.id;

    const notification = await notificationService.markAsRead(notificationId, userId);

    res.json({
      success: true,
      message: 'Notification marquée comme lue',
      data: notification
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du marquage de la notification',
      error: error.message
    });
  }
};

// Mark all notifications as read
const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await notificationService.markAllAsRead(userId);

    res.json({
      success: true,
      message: 'Toutes les notifications ont été marquées comme lues',
      data: { modifiedCount: result.modifiedCount }
    });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du marquage des notifications',
      error: error.message
    });
  }
};

// Delete a notification
const deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user.id;

    // Check if notification exists and belongs to user
    const notification = await require('../models/notification').findOne({
      _id: notificationId,
      userId
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification non trouvée'
      });
    }

    await notification.deleteOne();

    res.json({
      success: true,
      message: 'Notification supprimée avec succès'
    });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression de la notification',
      error: error.message
    });
  }
};

// Get user notification preferences
const getNotificationPreferences = async (req, res) => {
  try {
    const userId = req.user.id;
    const preferences = await UserPreferences.getOrCreatePreferences(userId);

    res.json({
      success: true,
      data: preferences
    });
  } catch (error) {
    console.error('Error getting notification preferences:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des préférences',
      error: error.message
    });
  }
};

// Update user notification preferences
const updateNotificationPreferences = async (req, res) => {
  try {
    const userId = req.user.id;
    const updates = req.body;

    // Validate updates
    const allowedUpdates = ['notifications', 'general', 'privacy'];
    const filteredUpdates = {};
    
    for (const key of allowedUpdates) {
      if (updates[key]) {
        filteredUpdates[key] = updates[key];
      }
    }

    const preferences = await UserPreferences.updatePreferences(userId, filteredUpdates);

    res.json({
      success: true,
      message: 'Préférences mises à jour avec succès',
      data: preferences
    });
  } catch (error) {
    console.error('Error updating notification preferences:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour des préférences',
      error: error.message
    });
  }
};

// Update specific notification channel preference
const updateChannelPreference = async (req, res) => {
  try {
    const userId = req.user.id;
    const { type, channel, enabled } = req.body;

    if (!type || !channel || typeof enabled !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'Type, canal et état requis'
      });
    }

    const preferences = await UserPreferences.getOrCreatePreferences(userId);
    await preferences.updateNotificationPreferences(type, channel, enabled);

    res.json({
      success: true,
      message: 'Préférence mise à jour avec succès',
      data: preferences
    });
  } catch (error) {
    console.error('Error updating channel preference:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour de la préférence',
      error: error.message
    });
  }
};

// Get delivery statistics (admin only)
const getDeliveryStats = async (req, res) => {
  try {
    const { channel, timeRange } = req.query;
    
    if (!channel) {
      return res.status(400).json({
        success: false,
        message: 'Canal requis'
      });
    }

    const stats = await DeliveryLog.getDeliveryStats(channel, timeRange);

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error getting delivery stats:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des statistiques',
      error: error.message
    });
  }
};

// Get failed deliveries for retry (admin only)
const getFailedDeliveries = async (req, res) => {
  try {
    const { channel, limit = 100 } = req.query;
    
    if (!channel) {
      return res.status(400).json({
        success: false,
        message: 'Canal requis'
      });
    }

    const failedDeliveries = await DeliveryLog.getFailedDeliveries(channel, parseInt(limit));

    res.json({
      success: true,
      data: failedDeliveries
    });
  } catch (error) {
    console.error('Error getting failed deliveries:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des livraisons échouées',
      error: error.message
    });
  }
};

// Retry failed delivery (admin only)
const retryFailedDelivery = async (req, res) => {
  try {
    const { deliveryLogId } = req.params;
    
    const deliveryLog = await DeliveryLog.findById(deliveryLogId);
    if (!deliveryLog) {
      return res.status(404).json({
        success: false,
        message: 'Journal de livraison non trouvé'
      });
    }

    if (!deliveryLog.canRetry()) {
      return res.status(400).json({
        success: false,
        message: 'Cette livraison ne peut pas être relancée'
      });
    }

    // Reset for retry
    deliveryLog.status = 'pending';
    deliveryLog.nextRetryAt = new Date();
    deliveryLog.updatedAt = new Date();
    await deliveryLog.save();

    res.json({
      success: true,
      message: 'Livraison programmée pour nouvelle tentative',
      data: deliveryLog
    });
  } catch (error) {
    console.error('Error retrying failed delivery:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la nouvelle tentative',
      error: error.message
    });
  }
};

// Cleanup expired notifications (admin only)
const cleanupExpiredNotifications = async (req, res) => {
  try {
    const result = await notificationService.cleanupExpiredNotifications();

    res.json({
      success: true,
      message: 'Nettoyage terminé',
      data: result
    });
  } catch (error) {
    console.error('Error cleaning up expired notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du nettoyage',
      error: error.message
    });
  }
};

// Test notification (for development/testing)
const testNotification = async (req, res) => {
  try {
    const userId = req.user.id;
    const { type = 'SYSTEM_ANNOUNCEMENT' } = req.body;

    const notificationData = {
      userId,
      type,
      title: 'Test Notification',
      body: 'Ceci est une notification de test pour vérifier le système.',
      link: '/notifications',
      priority: 'normal'
    };

    const notification = await notificationService.createAndSendNotification(notificationData);

    res.json({
      success: true,
      message: 'Notification de test envoyée',
      data: notification
    });
  } catch (error) {
    console.error('Error sending test notification:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'envoi de la notification de test',
      error: error.message
    });
  }
};

module.exports = {
  getUserNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getNotificationPreferences,
  updateNotificationPreferences,
  updateChannelPreference,
  getDeliveryStats,
  getFailedDeliveries,
  retryFailedDelivery,
  cleanupExpiredNotifications,
  testNotification
};
