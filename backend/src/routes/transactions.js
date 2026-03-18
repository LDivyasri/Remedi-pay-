const express = require('express');
const jwt = require('jsonwebtoken');
const Transaction = require('../models/Transaction');
const Medicine = require('../models/Medicine');
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

router.get('/', auth, async (req, res) => {
  try {
    const list = await Transaction.find({
      $or: [{ buyerId: req.user.id }, { sellerId: req.user.id }],
    })
      .sort({ createdAt: -1 })
      .limit(200)
      .populate('medicineId', 'name price');

    const serialized = list.map((t) => ({
      id: t.id,
      created_at: t.createdAt,
      updated_at: t.updatedAt,
      buyer_id: String(t.buyerId),
      seller_id: String(t.sellerId),
      medicine_id: String(t.medicineId?._id || t.medicineId),
      medicine_name: t.medicineId && t.medicineId.name ? t.medicineId.name : 'Medicine',
      unit_price: t.medicineId && typeof t.medicineId.price === 'number' ? t.medicineId.price : 0,
      quantity: t.quantity,
      total_amount: t.totalAmount,
      payment_method: t.paymentMethod,
      status: t.status,
      upi_reference: t.upiReference || '',
      type: t.type,
    }));

    return res.json({ transactions: serialized });
  } catch (err) {
    console.error('List transactions error', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Purchase route
router.post('/', auth, async (req, res) => {
  try {
    const { medicineId, quantity, paymentMethod, upiReference, otp, cardNumber, upiId, paymentDetails } = req.body;
    if (!medicineId || !quantity || !paymentMethod) return res.status(400).json({ error: 'Missing fields' });
    if (!['upi', 'cod', 'card'].includes(paymentMethod)) return res.status(400).json({ error: 'Invalid payment method' });
    
    // Check KYC verification status for buyers
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.kyc.status !== 'verified') {
      return res.status(403).json({ 
        error: 'KYC verification required',
        message: 'You must complete KYC verification before making purchases',
        kycStatus: user.kyc.status,
        required: true
      });
    }
    
    const med = await Medicine.findById(medicineId);
    if (!med) return res.status(404).json({ error: 'Medicine not found' });
    if (med.quantity < quantity) return res.status(400).json({ error: 'Insufficient stock' });
    
    const totalAmount = med.price * quantity;
    const tx = await Transaction.create({
      type: 'purchase',
      buyerId: req.user.id,
      sellerId: med.sellerId,
      medicineId: med.id,
      quantity,
      totalAmount,
      paymentMethod,
      status: paymentMethod === 'cod' ? 'pending' : 'completed',
      upiReference: paymentMethod === 'upi' ? (upiReference || '') : undefined,
      otp: otp || null,
      cardNumber: cardNumber || null,
      upiId: upiId || null,
      paymentDetails: paymentDetails || null,
    });
    
    // decrement stock
    med.quantity = med.quantity - quantity;
    await med.save();
    
    // Create notifications for both buyer and seller with OTP
    if (otp) {
      const Notification = require('../models/Notification');
      const User = require('../models/User');
      
      // Get seller information for notifications
      const seller = await User.findById(med.sellerId).select('name phone');
      const buyer = await User.findById(req.user.id).select('name phone');
      
      // Notification for buyer
      await Notification.create({
        userId: req.user.id,
        type: 'transaction',
        title: 'Transaction Successful',
        message: `Your payment was successful! Transaction OTP: ${otp}. Use this OTP to verify with the seller.`,
        data: { 
          transactionId: tx._id, 
          otp: otp,
          sellerName: seller?.name || 'Unknown Seller',
          sellerPhone: seller?.phone || 'N/A',
          buyerName: buyer?.name || 'Unknown Buyer',
          buyerPhone: buyer?.phone || 'N/A'
        }
      });
      
      // Notification for seller
      await Notification.create({
        userId: med.sellerId,
        type: 'transaction',
        title: 'New Sale',
        message: `You have a new sale! Transaction OTP: ${otp}. Verify this OTP with the buyer.`,
        data: { 
          transactionId: tx._id, 
          otp: otp,
          sellerName: seller?.name || 'Unknown Seller',
          sellerPhone: seller?.phone || 'N/A',
          buyerName: buyer?.name || 'Unknown Buyer',
          buyerPhone: buyer?.phone || 'N/A'
        }
      });
      
      console.log(`Created notifications with OTP: ${otp} for transaction: ${tx._id}`);
    }
    
    return res.status(201).json({ transaction: tx });
  } catch (err) {
    console.error('Purchase error', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
