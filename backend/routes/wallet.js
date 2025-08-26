const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');
const {
	getWallet,
	getTransactionHistory,
	addFunds,
	withdrawFunds,
	makePurchase
} = require('../controllers/walletController');
const payoutController = require('../controllers/payoutController');

// Routes protégées (authentification requise)
router.use(authenticateToken);

// Obtenir le wallet de l'utilisateur
router.get('/', getWallet);

// Obtenir l'historique des transactions
router.get('/transactions', getTransactionHistory);

// Ajouter des fonds au wallet
router.post('/add-funds', addFunds);

// Retirer des fonds du wallet
router.post('/withdraw', withdrawFunds);

// Effectuer un achat avec le wallet
router.post('/purchase', makePurchase);

// Payout Requests
router.post('/payouts', authorizeRoles('enseignant'), payoutController.createPayoutRequest);
router.get('/payouts/admin', authorizeRoles('admin'), payoutController.listPayoutRequests);
router.post('/payouts/:id/approve', authorizeRoles('admin'), payoutController.approvePayoutRequest);
router.post('/payouts/:id/reject', authorizeRoles('admin'), payoutController.rejectPayoutRequest);

module.exports = router; 