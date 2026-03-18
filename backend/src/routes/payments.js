const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_test_1234567890');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

function auth(req, res, next) {
  const h = req.headers.authorization || '';
  const token = h.startsWith('Bearer ') ? h.slice(7) : '';
  if (!token) return res.status(401).json({ error: 'Missing token' });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret_change_me');
    return next();
  } catch (e) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

// Create payment intent (Demo Mode)
router.post('/create-payment-intent', auth, async (req, res) => {
  try {
    const { amount, currency = 'inr', medicineId, quantity } = req.body;
    
    if (!amount || !medicineId || !quantity) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check KYC verification status
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.kyc.status !== 'verified') {
      return res.status(403).json({ 
        error: 'KYC verification required',
        message: 'You must complete KYC verification before making payments',
        kycStatus: user.kyc.status,
        required: true
      });
    }

    // Demo mode - simulate payment intent creation
    console.log('Demo: Creating payment intent for amount:', amount, 'medicine:', medicineId);
    
    // Return a mock client secret for demo purposes
    res.json({
      clientSecret: 'pi_demo_' + Date.now() + '_secret_demo',
      paymentIntentId: 'pi_demo_' + Date.now(),
      amount: Math.round(amount * 100),
      currency: currency,
      demo: true
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({ error: 'Failed to create payment intent' });
  }
});

// Confirm payment (Demo Mode)
router.post('/confirm-payment', auth, async (req, res) => {
  try {
    const { paymentIntentId } = req.body;
    
    if (!paymentIntentId) {
      return res.status(400).json({ error: 'Missing payment intent ID' });
    }

    // Check KYC verification status
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.kyc.status !== 'verified') {
      return res.status(403).json({ 
        error: 'KYC verification required',
        message: 'You must complete KYC verification before making payments',
        kycStatus: user.kyc.status,
        required: true
      });
    }

    // Demo mode - simulate successful payment
    console.log('Demo: Confirming payment for intent:', paymentIntentId);
    
    // Always return success in demo mode
    res.json({ 
      success: true, 
      paymentId: paymentIntentId,
      status: 'succeeded',
      demo: true
    });
  } catch (error) {
    console.error('Error confirming payment:', error);
    res.status(500).json({ error: 'Payment confirmation failed' });
  }
});

// Stripe webhook endpoint
router.post('/webhook', express.raw({type: 'application/json'}), (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.log(`Webhook signature verification failed.`, err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      console.log('PaymentIntent succeeded:', paymentIntent.id);
      // Here you can update your database with the successful payment
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({received: true});
});

module.exports = router;
