const express = require('express');
const jwt = require('jsonwebtoken');
const Notification = require('../models/Notification');

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

// Get notifications for the authenticated user
router.get('/', auth, async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(50);

    const serialized = notifications.map((n) => ({
      id: n._id,
      type: n.type,
      title: n.title,
      message: n.message,
      data: n.data,
      read: n.read,
      created_at: n.createdAt,
      updated_at: n.updatedAt
    }));

    return res.json({ notifications: serialized });
  } catch (err) {
    console.error('Get notifications error', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Mark notification as read
router.put('/:id/read', auth, async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { read: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    return res.json({ ok: true });
  } catch (err) {
    console.error('Mark notification read error', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
