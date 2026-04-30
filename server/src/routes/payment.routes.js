const express = require('express');
const router = express.Router();
const payment = require('../controllers/payment.controller');
const { protect } = require('../middleware/auth.middleware');

// Webhook must come before json body parser (handled in index.js via raw body)
router.post('/webhook', payment.stripeWebhook);

router.post('/create-intent', protect, payment.createPaymentIntent);
router.post('/refund/:contributionId', protect, payment.requestRefund);
router.get('/my-contributions', protect, payment.getMyContributions);

module.exports = router;
