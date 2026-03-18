const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const multer = require('multer');
const path = require('path');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/kyc/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    // Accept images and PDFs (frontend allows jpg, png, pdf)
    if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only image or PDF files are allowed!'), false);
    }
  }
});

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

// Get KYC status
router.get('/status', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('kyc verificationStatus');
    res.json({
      kycStatus: user.kyc.status,
      verificationStatus: user.verificationStatus,
      documents: user.kyc.documents,
      submittedAt: user.kyc.submittedAt,
      verifiedAt: user.kyc.verifiedAt,
      rejectedReason: user.kyc.rejectedReason
    });
  } catch (error) {
    console.error('Error fetching KYC status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Submit KYC documents
router.post('/submit', auth, upload.fields([
  { name: 'aadharFront', maxCount: 1 },
  { name: 'aadharBack', maxCount: 1 },
  { name: 'panImage', maxCount: 1 },
  { name: 'addressDocument', maxCount: 1 }
]), async (req, res) => {
  try {
    const { 
      aadharNumber, 
      panNumber, 
      addressType,
      street,
      city,
      state,
      pincode
    } = req.body;

    const files = req.files;
    
    // Validate required fields
    if (!aadharNumber || !panNumber || !street || !city || !state || !pincode) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (!files.aadharFront || !files.aadharBack || !files.panImage) {
      return res.status(400).json({ error: 'Missing required documents' });
    }

    const user = await User.findById(req.user.id);
    
    // Update KYC information - Auto approve immediately
    user.kyc.status = 'verified';
    user.kyc.submittedAt = new Date();
    user.kyc.verifiedAt = new Date();
    user.kyc.documents.aadhar.number = aadharNumber;
    user.kyc.documents.aadhar.frontImage = files.aadharFront[0].path;
    user.kyc.documents.aadhar.backImage = files.aadharBack[0].path;
    user.kyc.documents.aadhar.verified = true;
    user.kyc.documents.pan.number = panNumber;
    user.kyc.documents.pan.image = files.panImage[0].path;
    user.kyc.documents.pan.verified = true;
    user.kyc.documents.address.type = addressType || 'aadhar';
    user.kyc.documents.address.document = files.addressDocument ? files.addressDocument[0].path : files.aadharFront[0].path;
    user.kyc.documents.address.verified = true;
    
    // Update address
    user.address = {
      street,
      city,
      state,
      pincode,
      country: 'India'
    };

    // Update verification status
    user.verificationStatus = 'verified';

    await user.save();

    res.json({ 
      success: true, 
      message: 'KYC documents submitted and verified successfully!',
      kycStatus: user.kyc.status
    });
  } catch (error) {
    console.error('Error submitting KYC:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin: Verify KYC
router.post('/verify/:userId', auth, async (req, res) => {
  try {
    // Check if user is admin
    const admin = await User.findById(req.user.id);
    if (admin.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { status, rejectedReason } = req.body;
    const user = await User.findById(req.params.userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.kyc.status = status;
    user.verificationStatus = status === 'verified' ? 'verified' : 'unverified';
    
    if (status === 'verified') {
      user.kyc.verifiedAt = new Date();
      user.kyc.documents.aadhar.verified = true;
      user.kyc.documents.pan.verified = true;
      user.kyc.documents.address.verified = true;
    } else if (status === 'rejected') {
      user.kyc.rejectedReason = rejectedReason;
    }

    await user.save();

    res.json({ 
      success: true, 
      message: `KYC ${status} successfully`,
      kycStatus: user.kyc.status
    });
  } catch (error) {
    console.error('Error verifying KYC:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Check KYC requirement for actions
router.get('/check-requirement/:action', auth, async (req, res) => {
  try {
    const { action } = req.params;
    const user = await User.findById(req.user.id);
    
    const requirements = {
      'list_medicine': user.role === 'seller' && user.kyc.status === 'verified',
      'buy_medicine': user.kyc.status === 'verified',
      'sell_medicine': user.role === 'seller' && user.kyc.status === 'verified'
    };

    const isRequired = requirements[action] || false;
    const userKycStatus = user.kyc.status;

    res.json({
      required: isRequired,
      userKycStatus,
      message: isRequired 
        ? 'KYC verification required for this action'
        : 'KYC verification not required'
    });
  } catch (error) {
    console.error('Error checking KYC requirement:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
