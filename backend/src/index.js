const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config({ path: path.resolve(process.cwd(), '.env') });

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
  'http://localhost:3002',
  'http://127.0.0.1:3002',
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
app.use(morgan('dev'));

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

app.use('/api/auth', require('./routes/auth'));
app.use('/api/medicines', require('./routes/medicines'));
app.use('/api/transactions', require('./routes/transactions'));
app.use('/api/kyc', require('./routes/kyc'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/notifications', require('./routes/notifications'));
// Stubs for wallet and upload to keep UI working
app.get('/api/wallet', (req, res) => res.json({ balance: 0, updated_at: new Date().toISOString() }));
app.post('/api/wallet/add', (req, res) => res.json({ wallet: { balance: (req.body.amount || 0), updated_at: new Date().toISOString() } }));
app.post('/api/upload', (req, res) => res.json({ url: '' }));

app.listen(PORT, () => console.log(`Backend listening on :${PORT}`));


