const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');

// Post CRUD operations
router.post('/', authenticateToken, postController.createPost);
router.get('/feed', authenticateToken, postController.getFeedPosts);
router.get('/:postId', postController.getPost);
router.put('/:postId', authenticateToken, postController.updatePost);
router.delete('/:postId', authenticateToken, postController.deletePost);

// Teacher posts
router.get('/teachers/:teacherId/posts', postController.getTeacherPosts);

// Post engagement
router.post('/:postId/like', authenticateToken, postController.toggleLike);
router.post('/:postId/share', authenticateToken, postController.sharePost);

// Post statistics
router.get('/teachers/:teacherId/post-stats', postController.getPostStats);

// Post moderation
router.post('/:postId/report', authenticateToken, postController.reportPost);

module.exports = router;
