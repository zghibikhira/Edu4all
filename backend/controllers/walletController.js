const Wallet = require('../models/wallet');
const User = require('../models/user');

// Obtenir le wallet d'un utilisateur
const getWallet = async (req, res) => {
  try {
    const userId = req.user.id;
    
    let wallet = await Wallet.findOne({ user: userId });
    
    if (!wallet) {
      // Créer un wallet si il n'existe pas
      wallet = new Wallet({
        user: userId,
        balance: 0,
        currency: 'EUR'
      });
      await wallet.save();
    }
    
    res.json({
      success: true,
      data: {
        balance: wallet.balance,
        currency: wallet.currency,
        isActive: wallet.isActive,
        lastUpdated: wallet.lastUpdated
      }
    });
  } catch (error) {
    console.error('Erreur getWallet:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du wallet'
    });
  }
};

// Obtenir l'historique des transactions
const getTransactionHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10, type } = req.query;
    
    const wallet = await Wallet.findOne({ user: userId });
    
    if (!wallet) {
      return res.status(404).json({
        success: false,
        message: 'Wallet non trouvé'
      });
    }
    
    let transactions = wallet.transactions;
    
    // Filtrer par type si spécifié
    if (type) {
      transactions = transactions.filter(t => t.type === type);
    }
    
    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedTransactions = transactions.slice(startIndex, endIndex);
    
    res.json({
      success: true,
      data: {
        transactions: paginatedTransactions,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(transactions.length / limit),
          totalTransactions: transactions.length,
          hasNext: endIndex < transactions.length,
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Erreur getTransactionHistory:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de l\'historique'
    });
  }
};

// Ajouter de l'argent au wallet (recharge)
const addFunds = async (req, res) => {
  try {
    const userId = req.user.id;
    const { amount, paymentMethod, paymentIntentId, paypalOrderId } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Montant invalide'
      });
    }
    
    let wallet = await Wallet.findOne({ user: userId });
    
    if (!wallet) {
      wallet = new Wallet({
        user: userId,
        balance: 0,
        currency: 'EUR'
      });
    }
    
    // Créer la transaction
    const transaction = {
      type: 'deposit',
      amount: amount,
      currency: 'EUR',
      description: `Recharge de ${amount}€`,
      status: 'completed',
      paymentMethod: paymentMethod,
      paymentIntentId: paymentIntentId,
      paypalOrderId: paypalOrderId,
      processedAt: new Date()
    };
    
    await wallet.addTransaction(transaction);
    
    res.json({
      success: true,
      message: 'Fonds ajoutés avec succès',
      data: {
        newBalance: wallet.balance,
        transaction: transaction
      }
    });
  } catch (error) {
    console.error('Erreur addFunds:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'ajout de fonds'
    });
  }
};

// Retirer de l'argent du wallet
const withdrawFunds = async (req, res) => {
  try {
    const userId = req.user.id;
    const { amount, description } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Montant invalide'
      });
    }
    
    const wallet = await Wallet.findOne({ user: userId });
    
    if (!wallet) {
      return res.status(404).json({
        success: false,
        message: 'Wallet non trouvé'
      });
    }
    
    if (!wallet.canAfford(amount)) {
      return res.status(400).json({
        success: false,
        message: 'Solde insuffisant'
      });
    }
    
    // Créer la transaction
    const transaction = {
      type: 'withdrawal',
      amount: amount,
      currency: 'EUR',
      description: description || `Retrait de ${amount}€`,
      status: 'completed',
      paymentMethod: 'wallet',
      processedAt: new Date()
    };
    
    await wallet.addTransaction(transaction);
    
    res.json({
      success: true,
      message: 'Retrait effectué avec succès',
      data: {
        newBalance: wallet.balance,
        transaction: transaction
      }
    });
  } catch (error) {
    console.error('Erreur withdrawFunds:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du retrait'
    });
  }
};

// Effectuer un achat avec le wallet
const makePurchase = async (req, res) => {
  try {
    const userId = req.user.id;
    const { courseId, amount, description } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Montant invalide'
      });
    }
    
    const wallet = await Wallet.findOne({ user: userId });
    
    if (!wallet) {
      return res.status(404).json({
        success: false,
        message: 'Wallet non trouvé'
      });
    }
    
    if (!wallet.canAfford(amount)) {
      return res.status(400).json({
        success: false,
        message: 'Solde insuffisant'
      });
    }
    
    // Créer la transaction
    const transaction = {
      type: 'purchase',
      amount: amount,
      currency: 'EUR',
      description: description || `Achat cours`,
      status: 'completed',
      paymentMethod: 'wallet',
      relatedCourse: courseId,
      processedAt: new Date()
    };
    
    await wallet.addTransaction(transaction);
    
    res.json({
      success: true,
      message: 'Achat effectué avec succès',
      data: {
        newBalance: wallet.balance,
        transaction: transaction
      }
    });
  } catch (error) {
    console.error('Erreur makePurchase:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'achat'
    });
  }
};

module.exports = {
  getWallet,
  getTransactionHistory,
  addFunds,
  withdrawFunds,
  makePurchase
}; 