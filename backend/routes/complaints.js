const express = require('express');
const router = express.Router();
const complaintController = require('../controllers/complaintController');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');
const { uploadEvidence } = require('../config/cloudinary');

// User routes (authenticated users)
router.post('/', authenticateToken, uploadEvidence.array('evidenceFiles', 5), complaintController.createComplaint);
router.get('/mine', authenticateToken, complaintController.getUserComplaints);
router.get('/:complaintId', authenticateToken, complaintController.getComplaintById);

// Admin routes (admin only)
router.get('/admin/all', authenticateToken, authorizeRoles('admin'), complaintController.getAdminComplaints);
router.patch('/admin/:complaintId', authenticateToken, authorizeRoles('admin'), complaintController.updateComplaint);
router.post('/admin/:complaintId/escalate', authenticateToken, authorizeRoles('admin'), complaintController.escalateComplaint);
router.get('/admin/stats', authenticateToken, authorizeRoles('admin'), complaintController.getComplaintStats);
router.get('/admin/:complaintId/evidence/:index/url', authenticateToken, authorizeRoles('admin'), complaintController.getEvidenceSignedUrl);

module.exports = router;
