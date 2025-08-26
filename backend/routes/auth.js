const express = require('express');
const router = express.Router();

// Import des contrôleurs
const {
  register,
  login,
  getProfile,
  updateProfile,
  logout,
  forgotPassword,
  resetPassword,
  resendEmailOtp,
  verifyEmailOtp,
  getGlobalStats,
  requestDeletion,
  adminForceDelete,
  getDeletionQueue,
  adminListUsers
} = require('../controllers/authController');
const teacherController = require('../controllers/teacherController');

// Import des middlewares
const {
  authenticateToken,
  authorizeRoles,
  requireVerification,
  loginLimiter,
  registerLimiter
} = require('../middleware/authMiddleware');

// Routes publiques
router.post('/register', registerLimiter, register);
router.post('/login', loginLimiter, login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/email/resend-otp', resendEmailOtp);
router.post('/email/verify-otp', verifyEmailOtp);
router.get('/stats', getGlobalStats);

// Liste publique des enseignants
router.get('/teachers', teacherController.getAllTeachers);

// Routes protégées
router.get('/profile', authenticateToken, getProfile);
router.put('/profile', authenticateToken, updateProfile);
router.post('/logout', authenticateToken, logout);

// RGPD account deletion
router.post('/delete/request', authenticateToken, authorizeRoles('enseignant'), requestDeletion);

// Routes pour les enseignants uniquement
router.get('/teacher/profile', authenticateToken, authorizeRoles('enseignant'), getProfile);
router.put('/teacher/profile', authenticateToken, authorizeRoles('enseignant'), updateProfile);

// Routes pour les étudiants uniquement
router.get('/student/profile', authenticateToken, authorizeRoles('etudiant'), getProfile);
router.put('/student/profile', authenticateToken, authorizeRoles('etudiant'), updateProfile);

// Routes pour les administrateurs
router.get('/admin/stats', authenticateToken, authorizeRoles('admin'), getGlobalStats);
router.get('/admin/users', authenticateToken, authorizeRoles('admin'), adminListUsers);
// Admin Users: ban/unban
const moderationController = require('../controllers/moderationController');
router.post('/admin/users/:id/ban', authenticateToken, authorizeRoles('admin'), async (req, res, next) => {
  // Normalize to moderation action
  req.body = {
    type: 'BAN',
    targetUserId: req.params.id,
    reason: req.body?.reason || 'Violation des règles',
    duration: req.body?.expiresAt ? Math.max(0, Math.ceil((new Date(req.body.expiresAt) - Date.now()) / (60*60*1000))) : 0
  };
  return moderationController.createModerationAction(req, res, next);
});

// Admin deletion controls
router.post('/admin/teachers/:id/delete', authenticateToken, authorizeRoles('admin'), adminForceDelete);
router.get('/admin/deletion-queue', authenticateToken, authorizeRoles('admin'), getDeletionQueue);
router.post('/admin/users/:id/unban', authenticateToken, authorizeRoles('admin'), async (req, res, next) => {
  // Create a synthetic UNBAN action for audit trail
  const ModerationAction = require('../models/moderationAction');
  const User = require('../models/user');
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
    user.isActive = true;
    user.status = 'ACTIVE';
    user.bannedAt = undefined;
    user.bannedBy = undefined;
    user.banReason = undefined;
    user.ban = undefined;
    await user.save();

    const action = await ModerationAction.create({
      adminId: req.user.id,
      type: 'UNBAN',
      targetUserId: user._id,
      reason: req.body?.reason || 'Unban admin',
      status: 'ACTIVE'
    });

    return res.json({ success: true, message: 'Utilisateur débanni', data: action });
  } catch (e) {
    return res.status(500).json({ success: false, message: 'Erreur lors du débannissement' });
  }
});

module.exports = router;
