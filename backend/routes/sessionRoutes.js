const express = require('express');
const router = express.Router();
const sessionController = require('../controllers/sessionController');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');

// Secure all session routes
router.use(authenticateToken);

// Create a new video session (teacher only)
router.post('/', sessionController.createSession);

// Get all sessions for the authenticated user
router.get('/', sessionController.getUserSessions);

// Get a specific session by ID
router.get('/:id', sessionController.getSessionById);

// Admin: sessions series for charts
router.get('/admin/series', authorizeRoles('admin'), sessionController.getAdminSessionsSeries);

// Update a session (teacher only)
router.put('/:id', sessionController.updateSession);

// Publish a session (change status from draft to scheduled)
router.patch('/:id/publish', sessionController.publishSession);

// Enroll in a session (student only)
router.post('/:id/enroll', sessionController.enrollInSession);

// Join a session (for attendance tracking)
router.post('/:id/join', sessionController.joinSession);

// Leave a session (update attendance)
router.post('/:id/leave', sessionController.leaveSession);

// Cancel a session (teacher only)
router.post('/:id/cancel', sessionController.cancelSession);

// Delete a session (teacher only, only if no students enrolled)
router.delete('/:id', sessionController.deleteSession);

// Get session statistics
router.get('/stats/overview', sessionController.getSessionStats);

module.exports = router;
