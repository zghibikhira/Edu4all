const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');

// Routes pour tous les utilisateurs authentifiés
router.post('/', authenticateToken, commentController.createComment);
router.get('/:entityType/:entityId', commentController.getComments);
router.get('/comment/:commentId', commentController.getComment);
router.put('/:commentId', authenticateToken, commentController.updateComment);
router.delete('/:commentId', authenticateToken, commentController.deleteComment);
router.post('/:commentId/reaction', authenticateToken, commentController.addReaction);
router.post('/:commentId/flag', authenticateToken, commentController.flagComment);
router.get('/:entityType/:entityId/stats', commentController.getCommentStats);
router.get('/search', commentController.searchComments);

// Routes pour les admins
router.patch('/:commentId/moderate', authenticateToken, authorizeRoles('admin'), commentController.moderateComment);

module.exports = router;
