// Basic Express.js server setup
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(process.cwd(), '.env') });

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/remedi';

// Middlewares
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// Database connection
mongoose
  .connect(MONGO_URI, {
    autoIndex: true,
  })
  .then(() => console.log('[MongoDB] connected'))
  .catch((err) => {
    console.error('[MongoDB] connection error', err);
    process.exit(1);
  });

// Health route
app.get('/api/health', (req, res) => {
  res.json({ ok: true, uptime: process.uptime() });
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/medicines', require('./routes/medicines'));
app.use('/api/transactions', require('./routes/transactions'));

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
