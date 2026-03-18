const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

function signToken(payload) {
  const secret = process.env.JWT_SECRET || 'dev_secret_change_me';
  return jwt.sign(payload, secret, { expiresIn: '7d' });
}

function authMiddleware(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Missing token' });
  try {
    const secret = process.env.JWT_SECRET || 'dev_secret_change_me';
    req.user = jwt.verify(token, secret);
    return next();
  } catch (e) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

router.post('/signup', async (req, res) => {
  try {
    const { email, password, name, phone, role } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ error: 'Email already in use' });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ email, name, phone, role: role || 'buyer', passwordHash });

    const token = signToken({ id: user.id, email: user.email, role: user.role });
    return res.status(201).json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
  } catch (err) {
    console.error('Signup error', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    const valid = await bcrypt.compare(password, user.passwordHash || '');
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });
    const token = signToken({ id: user.id, email: user.email, role: user.role });
    return res.json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
  } catch (err) {
    console.error('Login error', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-passwordHash');
    if (!user) return res.status(404).json({ error: 'User not found' });
    return res.json(user);
  } catch (err) {
    console.error('Profile error', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Update profile (name, phone, address)
router.post('/profile', authMiddleware, async (req, res) => {
  try {
    const { name, phone, address } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (address) {
      user.address = {
        street: address.street || user.address?.street || '',
        city: address.city || user.address?.city || '',
        state: address.state || user.address?.state || '',
        pincode: address.pincode || user.address?.pincode || '',
        country: address.country || user.address?.country || 'India'
      };
    }

    await user.save();
    const out = user.toObject();
    delete out.passwordHash;
    return res.json(out);
  } catch (err) {
    console.error('Profile update error', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;


