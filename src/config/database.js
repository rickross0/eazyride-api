// ============================================================
// Database Configuration — Prisma Client v3.0.0
// ============================================================

const { PrismaClient } = require('@prisma/client');
const logger = require('../utils/logger');

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development'
    ? ['warn', 'error']
    : ['error'],
});

// Test connection
const testConnection = async () => {
  try {
    await prisma.$connect();
    logger.info('✅ PostgreSQL connected');
    return true;
  } catch (error) {
    logger.error('❌ PostgreSQL connection failed:', error.message);
    return false;
  }
};

module.exports = { prisma, testConnection };
