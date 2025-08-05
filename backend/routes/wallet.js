const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/authMiddleware');
const {
  getWallet,
  getTransactionHistory,
  addFunds,
  withdrawFunds,
  makePurchase
} = require('../controllers/walletController');

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

module.exports = router; 