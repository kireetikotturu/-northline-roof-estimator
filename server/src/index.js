// server/src/index.js
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';

import { connectDB } from './config/db.js';
import configRoutes from './routes/configRoutes.js';
import estimateRoutes from './routes/estimateRoutes.js';
import authRoutes from './routes/authRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

const app = express();

// --- Core middleware -------------------------------------------------
const allowedOrigins = (process.env.CLIENT_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map((o) => o.trim());

app.use(
  cors({
    origin(origin, callback) {
      // Allow no-origin requests (curl, server-to-server health checks).
      if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error(`Origin ${origin} is not allowed by CORS.`));
    },
  })
);
app.use(express.json({ limit: '1mb' }));

// Light rate limiting on the public write endpoint so the estimator can't
// be used to spam the leads table.
const estimateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
});

// --- Routes ------------------------------------------------------------
app.get('/api/health', (req, res) => res.json({ ok: true, service: 'roof-estimator-api' }));

app.use('/api/config', configRoutes);
app.use('/api/estimate', estimateLimiter, estimateRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);

// --- 404 + error handling ----------------------------------------------
app.use('/api', (req, res) => res.status(404).json({ error: 'Not found.' }));

app.use((err, req, res, next) => {
  console.error('[error]', err.message);
  if (err.message?.startsWith('Origin')) {
    return res.status(403).json({ error: err.message });
  }
  res.status(500).json({ error: 'Internal server error.' });
});

// --- Boot ----------------------------------------------------------------
const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    app.listen(PORT, () => console.log(`[server] listening on port ${PORT}`));
  })
  .catch((err) => {
    console.error('[server] failed to start:', err.message);
    process.exit(1);
  });
