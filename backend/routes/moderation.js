const express = require('express');
const router = express.Router();
const moderationController = require('../controllers/moderationController');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');

// Admin routes (admin only)
router.post('/actions', authenticateToken, authorizeRoles('admin'), moderationController.createModerationAction);
router.get('/actions', authenticateToken, authorizeRoles('admin'), moderationController.getAdminModerationActions);
router.get('/actions/user/:userId', authenticateToken, authorizeRoles('admin'), moderationController.getUserModerationActions);
router.patch('/actions/:actionId/revoke', authenticateToken, authorizeRoles('admin'), moderationController.revokeModerationAction);
router.get('/stats', authenticateToken, authorizeRoles('admin'), moderationController.getModerationStats);
router.get('/user/:userId/status', authenticateToken, authorizeRoles('admin'), moderationController.checkUserModerationStatus);

module.exports = router;
