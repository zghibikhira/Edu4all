const Wallet = require('../models/wallet');
const PayoutRequest = require('../models/payoutRequest');
const User = require('../models/user');

// Teacher creates payout request
exports.createPayoutRequest = async (req, res) => {
  try {
    const userId = req.user.id;
    const { amount, method = 'paypal', destination, notes } = req.body;

    if (!amount || amount <= 0) return res.status(400).json({ success: false, message: 'Montant invalide' });

    const wallet = await Wallet.findOne({ user: userId });
    if (!wallet) return res.status(400).json({ success: false, message: 'Wallet introuvable' });
    if (!wallet.canAfford(amount)) return res.status(400).json({ success: false, message: 'Solde insuffisant' });

    const reqDoc = await PayoutRequest.create({ user: userId, amount, currency: wallet.currency, method, destination, notes, status: 'pending' });
    return res.status(201).json({ success: true, data: reqDoc });
  } catch (e) {
    console.error('createPayoutRequest error:', e);
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// Admin list
exports.listPayoutRequests = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status;
    const docs = await PayoutRequest.find(filter).populate('user', 'firstName lastName email').sort({ createdAt: -1 }).limit(parseInt(limit)).skip((parseInt(page)-1)*parseInt(limit));
    const total = await PayoutRequest.countDocuments(filter);
    return res.json({ success: true, data: { requests: docs, pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total/parseInt(limit)) } } });
  } catch (e) {
    console.error('listPayoutRequests error:', e);
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// Admin approve (deduct balance and mark as approved/paid)
exports.approvePayoutRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { reference, markPaid = true } = req.body;
    const reqDoc = await PayoutRequest.findById(id);
    if (!reqDoc || !['pending','approved'].includes(reqDoc.status)) return res.status(400).json({ success: false, message: 'Demande introuvable' });
    const wallet = await Wallet.findOne({ user: reqDoc.user });
    if (!wallet || !wallet.canAfford(reqDoc.amount)) return res.status(400).json({ success: false, message: 'Solde insuffisant' });

    // Deduct funds immediately
    await wallet.addTransaction({ type: 'withdrawal', amount: reqDoc.amount, currency: reqDoc.currency, description: `Payout ${reqDoc._id}`, status: 'completed', paymentMethod: 'wallet', processedAt: new Date(), relatedUser: reqDoc.user });

    reqDoc.status = markPaid ? 'paid' : 'approved';
    reqDoc.reference = reference;
    reqDoc.processedAt = new Date();
    await reqDoc.save();

    return res.json({ success: true, data: reqDoc });
  } catch (e) {
    console.error('approvePayoutRequest error:', e);
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// Admin reject (return to balance is a no-op since funds not held; we simply mark rejected)
exports.rejectPayoutRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const reqDoc = await PayoutRequest.findById(id);
    if (!reqDoc || reqDoc.status !== 'pending') return res.status(400).json({ success: false, message: 'Demande introuvable' });
    reqDoc.status = 'rejected';
    reqDoc.notes = reason || reqDoc.notes;
    reqDoc.processedAt = new Date();
    await reqDoc.save();
    return res.json({ success: true, data: reqDoc });
  } catch (e) {
    console.error('rejectPayoutRequest error:', e);
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};


