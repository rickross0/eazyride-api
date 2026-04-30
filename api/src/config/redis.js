// ============================================================
// Redis Configuration
// ============================================================

const Redis = require('ioredis');
const logger = require('../utils/logger');

let redis = null;

const connectRedis = async () => {
  try {
    redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379,
      password: process.env.REDIS_PASSWORD || undefined,
      retryDelayOnFailover: 100,
      maxRetriesPerRequest: 3,
      lazyConnect: true
    });

    await redis.connect();
    
    redis.on('error', (err) => {
      logger.error('Redis error:', err);
    });

    redis.on('connect', () => {
      logger.info('✅ Redis connected');
    });

    return redis;
  } catch (error) {
    logger.warn('⚠️ Redis connection failed:', error.message);
    throw error;
  }
};

const getRedis = () => redis;

// Cache helpers
const cache = {
  async get(key) {
    if (!redis) return null;
    try {
      const data = await redis.get(key);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  async set(key, value, ttl = 300) {
    if (!redis) return;
    try {
      await redis.set(key, JSON.stringify(value), 'EX', ttl);
    } catch (err) {
      logger.error('Redis set error:', err);
    }
  },

  async del(key) {
    if (!redis) return;
    try {
      await redis.del(key);
    } catch (err) {
      logger.error('Redis del error:', err);
    }
  },

  async invalidatePattern(pattern) {
    if (!redis) return;
    try {
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    } catch (err) {
      logger.error('Redis invalidatePattern error:', err);
    }
  }
};

module.exports = { connectRedis, getRedis, cache };
