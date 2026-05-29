const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const path = require('path');
const rateLimit = require('express-rate-limit');

dotenv.config({ path: path.resolve(__dirname, '.env') });

// ─── Env Validation ────────────────────────────────────────────────────────
function validateEnv() {
  const required = ['MONGODB_URI', 'CLIENT_URL', 'JWT_STUDENT_SECRET', 'JWT_ADMIN_SECRET'];
  for (const key of required) {
    if (!process.env[key]) {
      console.error(`❌ Missing required env var: ${key}`);
      process.exit(1);
    }
  }
  console.log('✅ Environment variables validated');
}
validateEnv();

const app = express();

// ─── Rate Limiters ─────────────────────────────────────────────────────────
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: 'Too many requests from this IP, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.method === 'GET',
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'Too many login attempts. Try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const similarityLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
});

const postLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: 'Too many POST requests, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.method !== 'POST',
});

// ─── Core Middleware ────────────────────────────────────────────────────────
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));
app.use(cors({
  origin(origin, callback) {
    const configuredOrigins = (process.env.CLIENT_URL || 'http://localhost:5173')
      .split(',')
      .map((url) => url.trim())
      .filter(Boolean);
    const devOrigins = ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175'];
    const allowedOrigins = new Set([
      ...configuredOrigins,
      ...(process.env.NODE_ENV === 'production' ? [] : devOrigins),
    ]);
    if (!origin) return callback(null, true);
    if (allowedOrigins.has(origin)) return callback(null, true);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

morgan.token('sanitized-url', (req) => req.originalUrl.replace(/token=\w+/gi, 'token=***'));
app.use(morgan(':method :sanitized-url :status :response-time ms'));

// ─── No-cache + Rate limit for all /api routes ─────────────────────────────
app.use('/api', generalLimiter);
app.use('/api', (req, res, next) => {
  res.set('ETag', 'false');
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  next();
});

// ─── Routes ────────────────────────────────────────────────────────────────
app.use('/api/faqs',        postLimiter,       require('./routes/faq'));
app.use('/api/auth',                           require('./routes/auth'));
app.use('/api/admin/auth',                     require('./routes/admin.auth'));
app.use('/api/categories',                     require('./routes/categories'));
app.use('/api/queries',                        require('./routes/queries'));
app.use('/api/similarity',  similarityLimiter, require('./routes/similarity'));
app.use('/api/cache',                          require('./routes/cache'));
app.use('/api/drafts',                         require('./routes/drafts'));
app.use('/api/answers',                        require('./routes/answers'));
app.use('/api/admin',                          require('./routes/admin.queries'));

// ─── Health Check ──────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'faq-unified-backend',
    env: process.env.NODE_ENV || 'development',
  });
});

// ─── 404 ───────────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// ─── Error Handler ─────────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  if (err.status === 429) return res.status(429).json({ error: 'Too many requests' });
  if (err.message === 'Not allowed by CORS') return res.status(403).json({ error: 'CORS policy violation' });
  if (process.env.NODE_ENV === 'development') console.error(err);
  return res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

// ─── DB + Server Start ─────────────────────────────────────────────────────
const PORT = process.env.PORT || 5002;
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI || MONGODB_URI.includes('your_mongodb_cluster_connection_string_here')) {
  console.warn('⚠️  WARNING: MONGODB_URI is not set properly. Connection will fail.');
  process.exit(1);
}

mongoose.connect(MONGODB_URI, {
  serverSelectionTimeoutMS: 5000,
  retryWrites: true,
  w: 'majority',
})
  .then(() => {
    console.log('✅ MongoDB connected securely');
    app.listen(PORT, () => {
      console.log(`✅ Unified backend running on port ${PORT}`);
      console.log(`🔒 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });
