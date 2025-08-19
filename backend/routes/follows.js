const express = require('express');
const router = express.Router();
const followController = require('../controllers/followController');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');

// Follow/Unfollow routes
router.post('/teachers/:teacherId/follow', authenticateToken, followController.followTeacher);
router.delete('/teachers/:teacherId/follow', authenticateToken, followController.unfollowTeacher);

// Get followers and following
router.get('/teachers/:teacherId/followers', followController.getTeacherFollowers);
router.get('/me/following', authenticateToken, followController.getUserFollowing);

// Check follow status
router.get('/teachers/:teacherId/follow-status', authenticateToken, followController.checkFollowStatus);

// Get follow statistics
router.get('/teachers/:teacherId/follow-stats', followController.getTeacherFollowStats);

module.exports = router;
