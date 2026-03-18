const express = require('express');
const Medicine = require('../models/Medicine');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');

const router = express.Router();
// Multer storage for medicine images
const fs = require('fs');
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = path.join(__dirname, '..', '..', 'uploads', 'medicines');
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'medicine-' + unique + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) return cb(null, true);
    return cb(new Error('Only image files are allowed!'));
  },
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

router.get('/', async (req, res) => {
  try {
    const { search, min_price, max_price, expiry_after } = req.query;
    const query = { 
      status: 'active',
      quantity: { $gt: 0 } // Only show medicines with stock available
    };
    if (search) {
      query.$or = [
        { name: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') }
      ];
    }
    if (min_price) query.price = { ...(query.price || {}), $gte: Number(min_price) };
    if (max_price) query.price = { ...(query.price || {}), $lte: Number(max_price) };
    if (expiry_after) query.expiryDate = { $gt: new Date(expiry_after) };

    const meds = await Medicine.find(query)
      .sort({ createdAt: -1 })
      .limit(200)
      .populate('sellerId', 'name phone verificationStatus');
    return res.json({ medicines: meds.map(serializeMedicine) });
  } catch (err) {
    console.error('List medicines error', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const med = await Medicine.findById(req.params.id).populate('sellerId', 'name phone verificationStatus');
    if (!med) return res.status(404).json({ error: 'Not found' });
    
    // Check if medicine is sold out
    if (med.quantity <= 0) {
      return res.status(410).json({ error: 'Medicine is sold out' });
    }
    
    return res.json(serializeMedicine(med));
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const body = req.body;
    const med = await Medicine.create({
      name: body.name,
      description: body.description,
      category: body.category,
      price: body.price,
      quantity: body.quantity,
      expiryDate: body.expiryDate || body.expiry_date,
      images: body.images || (body.imageUrl ? [body.imageUrl] : []),
      sellerId: req.user.id,
    });
    return res.status(201).json(serializeMedicine(med));
  } catch (err) {
    console.error('Create medicine error', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Upload medicine image
router.post('/upload-image', auth, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    // Public URL for the uploaded image
    const publicUrl = `/uploads/medicines/${req.file.filename}`;
    const absoluteUrl = `${req.protocol}://${req.get('host')}${publicUrl}`;
    return res.json({ url: absoluteUrl, path: publicUrl });
  } catch (err) {
    console.error('Upload medicine image error', err);
    return res.status(500).json({ error: 'Failed to upload image' });
  }
});

// Update medicine (seller only)
router.put('/:id', auth, async (req, res) => {
  try {
    const med = await Medicine.findById(req.params.id);
    if (!med) return res.status(404).json({ error: 'Not found' });
    if (String(med.sellerId) !== req.user.id) return res.status(403).json({ error: 'Forbidden' });
    const body = req.body;
    med.name = body.name ?? med.name;
    med.description = body.description ?? med.description;
    med.category = body.category ?? med.category;
    med.price = body.price ?? med.price;
    med.quantity = body.quantity ?? med.quantity;
    med.expiryDate = body.expiryDate || body.expiry_date || med.expiryDate;
    if (body.images) med.images = body.images;
    await med.save();
    return res.json(serializeMedicine(med));
  } catch (err) {
    console.error('Update medicine error', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete medicine (seller only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const med = await Medicine.findById(req.params.id);
    if (!med) return res.status(404).json({ error: 'Not found' });
    if (String(med.sellerId) !== req.user.id) return res.status(403).json({ error: 'Forbidden' });
    await med.deleteOne();
    return res.json({ ok: true });
  } catch (err) {
    console.error('Delete medicine error', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

function serializeMedicine(med) {
  const m = typeof med.toJSON === 'function' ? med.toJSON() : med;
  const seller = m.sellerId && typeof m.sellerId === 'object' ? m.sellerId : null;
  return {
    id: m.id,
    name: m.name,
    description: m.description,
    category: m.category,
    price: m.price,
    quantity: m.quantity,
    expiryDate: m.expiryDate,
    expiry_date: m.expiryDate,
    images: m.images || [],
    image_url: (m.images && m.images[0]) || '',
    sellerId: seller ? seller.id || seller._id : m.sellerId,
    seller_id: seller ? seller.id || seller._id : m.sellerId,
    seller_name: seller ? seller.name : undefined,
    seller_phone: seller ? seller.phone : undefined,
    seller_verified: seller ? seller.verificationStatus === 'verified' : undefined,
    status: m.status || 'active',
    createdAt: m.createdAt,
    updatedAt: m.updatedAt,
  };
}

module.exports = router;


