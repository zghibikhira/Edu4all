const mongoose = require('mongoose');

const payoutRequestSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  amount: { type: Number, required: true, min: 0 },
  currency: { type: String, default: 'EUR' },
  method: { type: String, enum: ['paypal', 'moneygram', 'manual'], required: true },
  destination: { type: String }, // PayPal email or MoneyGram reference info
  status: { type: String, enum: ['pending', 'approved', 'rejected', 'paid'], default: 'pending', index: true },
  reference: { type: String }, // external reference (PayPal batch id, MoneyGram code)
  notes: { type: String },
  createdAt: { type: Date, default: Date.now, index: true },
  updatedAt: { type: Date, default: Date.now },
  processedAt: { type: Date }
}, { timestamps: true });

payoutRequestSchema.index({ createdAt: -1 });

module.exports = mongoose.model('PayoutRequest', payoutRequestSchema);


