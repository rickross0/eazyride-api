// ============================================================
// EazyRide + Haye! v3.0.0 — Server Entry Point
// ============================================================

require('dotenv').config();

const http = require('http');
const app = require('./app');
const { initializeSocket } = require('./services/socketService');
const { connectRedis } = require('./config/redis');
const { initializeCronJobs } = require('./services/cronService');
const logger = require('./utils/logger');

const PORT = process.env.PORT || 3000;

const server = http.createServer(app);

// Initialize Socket.io
const io = initializeSocket(server);

// Make io accessible to routes
app.set('io', io);

// Start server
const startServer = async () => {
  try {
    // Connect to Redis (optional, continues without it)
    try {
      await connectRedis();
      logger.info('✅ Redis connected');
    } catch (redisError) {
      logger.warn('⚠️ Redis connection failed, continuing without cache');
    }

    // Initialize cron jobs
    initializeCronJobs();
    logger.info('✅ Cron jobs initialized');

    // Start listening
    server.listen(PORT, () => {
      logger.info(`
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║     🚀 EazyRide + Haye! v3.0.0 — Premium Edition             ║
║                                                               ║
║     Server running on port ${PORT}                              ║
║     Environment: ${process.env.NODE_ENV || 'development'}                    ║
║                                                               ║
║     📍 Health: http://localhost:${PORT}/health                   ║
║     📍 API:    http://localhost:${PORT}/api                      ║
║                                                               ║
║     🇸🇴  Built for Somalia  🇸🇴                               ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    logger.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error('UNHANDLED REJECTION:', err);
  server.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('UNCAUGHT EXCEPTION:', err);
  process.exit(1);
});

startServer();

module.exports = server;
