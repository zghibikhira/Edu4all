const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');
const {
	createStripePaymentIntent,
	confirmStripePayment,
	createPayPalOrder,
	capturePayPalPayment,
	purchaseCourseWithStripe,
	confirmCoursePurchase,
	stripeWebhook,
	getAdminRevenueSummary
} = require('../controllers/paymentController');

// Webhook Stripe (pas d'authentification requise)
router.post('/stripe/webhook', express.raw({ type: 'application/json' }), stripeWebhook);

// Routes protégées (authentification requise)
router.use(authenticateToken);

// Stripe - Recharge wallet
router.post('/stripe/create-payment-intent', createStripePaymentIntent);
router.post('/stripe/confirm-payment', confirmStripePayment);

// PayPal - Recharge wallet
router.post('/paypal/create-order', createPayPalOrder);
router.post('/paypal/capture-payment', capturePayPalPayment);

// Achat de cours
router.post('/stripe/purchase-course', purchaseCourseWithStripe);
router.post('/confirm-purchase', confirmCoursePurchase);

// Admin
router.get('/admin/revenue-summary', authorizeRoles('admin'), getAdminRevenueSummary);

module.exports = router; 