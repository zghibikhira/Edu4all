const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/authMiddleware');
const {
  getUserPurchases,
  checkCoursePurchase,
  downloadPurchasedFile,
  getPurchaseStats,
  requestRefund,
  purchaseCourse
} = require('../controllers/purchaseController');

// Routes protégées (authentification requise)
router.use(authenticateToken);

// Obtenir les achats d'un utilisateur
router.get('/', getUserPurchases);

// Obtenir les statistiques d'achat
router.get('/stats', getPurchaseStats);

// Vérifier si un utilisateur a acheté un cours
router.get('/check/:courseId/:type?', checkCoursePurchase);

// Télécharger un fichier acheté
router.get('/download/:courseId/:fileId', downloadPurchasedFile);

// Demander un remboursement
router.post('/refund', requestRefund);

// Acheter un cours
router.post('/purchase/:courseId', purchaseCourse);

module.exports = router; 