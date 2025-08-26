const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const paypal = require('@paypal/checkout-server-sdk');
const Wallet = require('../models/wallet');
const Purchase = require('../models/purchase');
const Course = require('../models/course');

// Configuration PayPal
let environment = new paypal.core.SandboxEnvironment(
  process.env.PAYPAL_CLIENT_ID,
  process.env.PAYPAL_CLIENT_SECRET
);
if (process.env.NODE_ENV === 'production') {
  environment = new paypal.core.LiveEnvironment(
    process.env.PAYPAL_CLIENT_ID,
    process.env.PAYPAL_CLIENT_SECRET
  );
}
const paypalClient = new paypal.core.PayPalHttpClient(environment);

// Créer un Payment Intent Stripe pour recharge wallet
const createStripePaymentIntent = async (req, res) => {
  try {
    const { amount, currency = 'eur' } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Montant invalide'
      });
    }
    
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Stripe utilise les centimes
      currency: currency,
      metadata: {
        userId: req.user.id,
        type: 'wallet_recharge'
      }
    });
    
    res.json({
      success: true,
      data: {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id
      }
    });
  } catch (error) {
    console.error('Erreur createStripePaymentIntent:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création du paiement'
    });
  }
};

// Confirmer un paiement Stripe
const confirmStripePayment = async (req, res) => {
  try {
    const { paymentIntentId } = req.body;
    
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    if (paymentIntent.status === 'succeeded') {
      const amount = paymentIntent.amount / 100; // Convertir de centimes en euros
      
      // Ajouter les fonds au wallet
      const walletController = require('./walletController');
      req.body = {
        amount: amount,
        paymentMethod: 'stripe',
        paymentIntentId: paymentIntentId
      };
      
      await walletController.addFunds(req, res);
    } else {
      res.status(400).json({
        success: false,
        message: 'Paiement non confirmé'
      });
    }
  } catch (error) {
    console.error('Erreur confirmStripePayment:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la confirmation du paiement'
    });
  }
};

// Créer une commande PayPal pour recharge wallet
const createPayPalOrder = async (req, res) => {
  try {
    const { amount, currency = 'EUR' } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Montant invalide'
      });
    }
    
    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer("return=representation");
    request.requestBody({
      intent: 'CAPTURE',
      purchase_units: [{
        amount: {
          currency_code: currency,
          value: amount.toString()
        },
        description: `Recharge wallet - ${amount}${currency}`,
        custom_id: req.user.id
      }]
    });
    
    const order = await paypalClient.execute(request);
    
    res.json({
      success: true,
      data: {
        orderId: order.result.id,
        approvalUrl: order.result.links.find(link => link.rel === 'approve').href
      }
    });
  } catch (error) {
    console.error('Erreur createPayPalOrder:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de la commande PayPal'
    });
  }
};

// Capturer un paiement PayPal
const capturePayPalPayment = async (req, res) => {
  try {
    const { orderId } = req.body;
    
    const request = new paypal.orders.OrdersCaptureRequest(orderId);
    const capture = await paypalClient.execute(request);
    
    if (capture.result.status === 'COMPLETED') {
      const amount = parseFloat(capture.result.purchase_units[0].amount.value);
      
      // Ajouter les fonds au wallet
      const walletController = require('./walletController');
      req.body = {
        amount: amount,
        paymentMethod: 'paypal',
        paypalOrderId: orderId
      };
      
      await walletController.addFunds(req, res);
    } else {
      res.status(400).json({
        success: false,
        message: 'Paiement PayPal non complété'
      });
    }
  } catch (error) {
    console.error('Erreur capturePayPalPayment:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la capture du paiement'
    });
  }
};

// Acheter un cours avec Stripe
const purchaseCourseWithStripe = async (req, res) => {
  try {
    const { courseId, amount, currency = 'eur' } = req.body;
    const userId = req.user.id;
    
    // Vérifier que le cours existe
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Cours non trouvé'
      });
    }
    
    // Vérifier que l'utilisateur n'a pas déjà acheté ce cours
    const existingPurchase = await Purchase.hasUserPurchased(userId, courseId);
    if (existingPurchase) {
      return res.status(400).json({
        success: false,
        message: 'Vous avez déjà acheté ce cours'
      });
    }
    
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: currency,
      metadata: {
        userId: userId,
        courseId: courseId,
        type: 'course_purchase'
      }
    });
    
    res.json({
      success: true,
      data: {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id
      }
    });
  } catch (error) {
    console.error('Erreur purchaseCourseWithStripe:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création du paiement'
    });
  }
};

// Confirmer l'achat d'un cours
const confirmCoursePurchase = async (req, res) => {
  try {
    const { courseId, paymentIntentId, paypalOrderId, paymentMethod, amount } = req.body;
    const userId = req.user.id;
    
    // Vérifier que le cours existe
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Cours non trouvé'
      });
    }
    
    // Créer l'achat
    const purchase = new Purchase({
      user: userId,
      course: courseId,
      type: 'full_course',
      amount: amount,
      currency: 'EUR',
      paymentMethod: paymentMethod,
      paymentIntentId: paymentIntentId,
      paypalOrderId: paypalOrderId,
      status: 'completed',
      accessGranted: true,
      purchasedFiles: course.files.map(file => ({
        fileId: file._id,
        filename: file.filename,
        originalName: file.originalName,
        fileType: file.fileType,
        fileUrl: file.fileUrl,
        cloudinaryId: file.cloudinaryId
      }))
    });
    
    await purchase.save();
    
    // Si paiement par wallet, déduire le montant
    if (paymentMethod === 'wallet') {
      const walletController = require('./walletController');
      req.body = {
        courseId: courseId,
        amount: amount,
        description: `Achat du cours: ${course.title}`
      };
      
      await walletController.makePurchase(req, res);
    } else {
      res.json({
        success: true,
        message: 'Achat confirmé avec succès',
        data: {
          purchase: purchase
        }
      });
    }
  } catch (error) {
    console.error('Erreur confirmCoursePurchase:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la confirmation de l\'achat'
    });
  }
};

// Webhook Stripe pour les événements de paiement
const stripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;
  
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Erreur webhook signature:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  
  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        console.log('Paiement Stripe réussi:', paymentIntent.id);
        break;
        
      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object;
        console.log('Paiement Stripe échoué:', failedPayment.id);
        break;
        
      default:
        console.log(`Événement non géré: ${event.type}`);
    }
    
    res.json({ received: true });
  } catch (error) {
    console.error('Erreur webhook:', error);
    res.status(500).json({ error: 'Erreur webhook' });
  }
};

module.exports = {
  createStripePaymentIntent,
  confirmStripePayment,
  createPayPalOrder,
  capturePayPalPayment,
  purchaseCourseWithStripe,
  confirmCoursePurchase,
  stripeWebhook,
  // Admin: revenue summary (gross purchases, wallet credits)
  async getAdminRevenueSummary(req, res) {
    try {
      if (req.user.role !== 'admin') return res.status(403).json({ success: false, message: 'Accès administrateur requis' });
      const from = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const [purchaseAgg, walletAgg] = await Promise.all([
        Purchase.aggregate([
          { $match: { status: 'completed', purchasedAt: { $gte: from } } },
          { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } }
        ]),
        Wallet.aggregate([
          { $unwind: '$transactions' },
          { $match: { 'transactions.status': 'completed', 'transactions.type': 'deposit', 'transactions.createdAt': { $gte: from } } },
          { $group: { _id: null, totalCredits: { $sum: '$transactions.amount' }, creditCount: { $sum: 1 } } }
        ])
      ]);
      const totalRevenue = purchaseAgg[0]?.total || 0;
      const totalCredits = walletAgg[0]?.totalCredits || 0;
      return res.json({ success: true, data: { totalRevenue, totalCredits } });
    } catch (e) {
      console.error('getAdminRevenueSummary error:', e);
      return res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
  }
}; 