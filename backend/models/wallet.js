const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['deposit', 'withdrawal', 'purchase', 'refund', 'commission'],
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'EUR'
  },
  description: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'cancelled'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['stripe', 'paypal', 'wallet', 'bank_transfer'],
    required: true
  },
  paymentIntentId: String, // Stripe Payment Intent ID
  paypalOrderId: String,   // PayPal Order ID
  relatedCourse: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  },
  relatedUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  metadata: {
    type: Map,
    of: String
  },
  processedAt: Date,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const walletSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  balance: {
    type: Number,
    default: 0,
    min: 0
  },
  currency: {
    type: String,
    default: 'EUR'
  },
  transactions: [transactionSchema],
  isActive: {
    type: Boolean,
    default: true
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Méthodes d'instance
walletSchema.methods.addTransaction = function(transaction) {
  this.transactions.push(transaction);
  
  if (transaction.status === 'completed') {
    if (transaction.type === 'deposit' || transaction.type === 'refund') {
      this.balance += transaction.amount;
    } else if (transaction.type === 'withdrawal' || transaction.type === 'purchase') {
      this.balance -= transaction.amount;
    }
  }
  
  this.lastUpdated = new Date();
  return this.save();
};

walletSchema.methods.getBalance = function() {
  return this.balance;
};

walletSchema.methods.canAfford = function(amount) {
  return this.balance >= amount;
};

walletSchema.methods.getTransactionHistory = function(limit = 10, offset = 0) {
  return this.transactions
    .sort({ createdAt: -1 })
    .slice(offset, offset + limit);
};

// Index pour les performances
walletSchema.index({ user: 1 });
walletSchema.index({ 'transactions.createdAt': -1 });

module.exports = mongoose.model('Wallet', walletSchema); 