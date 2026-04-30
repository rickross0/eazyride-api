// ============================================================
// Redis Configuration — gracefully degrades if no REDIS_URL
// ============================================================

const Redis = require('ioredis');
const logger = require('../utils/logger');

let redis = null;

const connectRedis = async () => {
  const redisUrl = process.env.REDIS_URL;

  if (!redisUrl) {
    logger.warn('⚠️ REDIS_URL not set — caching disabled, continuing without Redis');
    return null;
  }

  try {
    redis = new Redis(redisUrl, {
      retryDelayOnFailover: 100,
      maxRetriesPerRequest: 3,
      lazyConnect: true,
      tls: redisUrl.startsWith('rediss://') ? { rejectUnauthorized: false } : undefined,
    });

    await redis.connect();

    redis.on('error', (err) => {
      logger.error('Redis error:', err.message);
    });

    redis.on('reconnecting', () => {
      logger.warn('⚠️ Redis reconnecting...');
    });

    redis.on('connect', () => {
      logger.info('✅ Redis connected');
    });

    return redis;
  } catch (error) {
    logger.warn('⚠️ Redis connection failed, continuing without cache:', error.message);
    redis = null;
    return null;
  }
};

const getRedis = () => redis;

// Cache helpers — all no-op gracefully when Redis is unavailable
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
      logger.error('Redis set error:', err.message);
    }
  },

  async del(key) {
    if (!redis) return;
    try {
      await redis.del(key);
    } catch (err) {
      logger.error('Redis del error:', err.message);
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
      logger.error('Redis invalidatePattern error:', err.message);
    }
  }
};

module.exports = { connectRedis, getRedis, cache };
