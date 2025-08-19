const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');

// User notification routes (authenticated users)
router.get('/', authenticateToken, notificationController.getUserNotifications);
router.get('/unread-count', authenticateToken, notificationController.getUnreadCount);
router.patch('/:notificationId/read', authenticateToken, notificationController.markAsRead);
router.patch('/mark-all-read', authenticateToken, notificationController.markAllAsRead);
router.delete('/:notificationId', authenticateToken, notificationController.deleteNotification);

// User preferences routes
router.get('/preferences', authenticateToken, notificationController.getNotificationPreferences);
router.put('/preferences', authenticateToken, notificationController.updateNotificationPreferences);
router.patch('/preferences/channel', authenticateToken, notificationController.updateChannelPreference);

// Test notification (for development)
router.post('/test', authenticateToken, notificationController.testNotification);

// Admin routes (admin only)
router.get('/admin/delivery-stats', authenticateToken, authorizeRoles('admin'), notificationController.getDeliveryStats);
router.get('/admin/failed-deliveries', authenticateToken, authorizeRoles('admin'), notificationController.getFailedDeliveries);
router.patch('/admin/retry-delivery/:deliveryLogId', authenticateToken, authorizeRoles('admin'), notificationController.retryFailedDelivery);
router.post('/admin/cleanup', authenticateToken, authorizeRoles('admin'), notificationController.cleanupExpiredNotifications);

module.exports = router;
