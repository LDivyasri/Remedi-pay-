const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(process.cwd(), 'backend/.env') });

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/remedi';
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173';

// Allow common localhost dev ports
const allowedOrigins = new Set([
  CLIENT_ORIGIN,
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:3001',
  'http://127.0.0.1:3001',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
]);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.has(origin)) return callback(null, true);
    return callback(null, true);
  },
  credentials: true,
}));
app.use(express.json());

// Serve uploaded files statically (e.g., medicine images, KYC docs)
// Use __dirname to avoid double "backend/backend" when CWD is already backend
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

mongoose
  .connect(MONGO_URI, { autoIndex: true })
  .then(() => console.log('[MongoDB] connected'))
  .catch((err) => {
    console.error('[MongoDB] connection error', err);
    process.exit(1);
  });

app.get('/api/health', (req, res) => res.json({ ok: true }));

// Root route for quick check
app.get('/', (req, res) => {
  res.send('Remedi backend is running. Try /api/health');
});

app.use('/api/auth', require('./src/routes/auth'));
app.use('/api/medicines', require('./src/routes/medicines'));
app.use('/api/transactions', require('./src/routes/transactions'));
app.use('/api/payments', require('./src/routes/payments'));
app.use('/api/kyc', require('./src/routes/kyc'));

app.listen(PORT, () => console.log(`server.js listening on :${PORT}`));


