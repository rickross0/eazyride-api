// ============================================================
// EazyRide + Haye! v3.0.0 — Express Application Setup
// ============================================================

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const hpp = require('hpp');
const path = require('path');

const { errorHandler, notFound } = require('./middleware/errorHandler');
const routes = require('./routes');
const { apiLimiter } = require('./middleware/rateLimiter');

const app = express();

// ============================================================
// SECURITY MIDDLEWARE
// ============================================================

app.use(helmet());

// Enable CORS — supports comma-separated origins from env var
const corsOrigin = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map(s => s.trim()).filter(Boolean)
  : '*';

app.use(cors({
  origin: corsOrigin,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Rate limiting
app.use('/api/', apiLimiter);

// Body parser with size limit
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Prevent HTTP parameter pollution
app.use(hpp());

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// ============================================================
// STATIC FILES
// ============================================================

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use('/admin', express.static(path.join(__dirname, '../admin')));

// ============================================================
// API ROUTES
// ============================================================

app.use('/api', routes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'EazyRide + Haye! API is running',
    version: '3.0.0',
    timestamp: new Date().toISOString()
  });
});

// API info
app.get('/', (req, res) => {
  res.json({
    name: 'EazyRide + Haye! API',
    version: '3.0.0',
    description: 'Premium Super-App for Somalia',
    docs: '/api',
    health: '/health'
  });
});

// ============================================================
// ERROR HANDLING
// ============================================================

app.use(notFound);
app.use(errorHandler);

module.exports = app;
