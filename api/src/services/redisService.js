// ============================================================
// Redis Service — v3.0.0
// ============================================================

const logger = require('../utils/logger');

// In-memory fallback when Redis is unavailable
const memoryCache = new Map();
let redis = null;
let isConnected = false;

const connectRedis = async () => {
  try {
    const { redis: redisClient } = require('../config/redis');
    await redisClient.ping();
    redis = redisClient;
    isConnected = true;
    logger.info('✅ Redis connected');
  } catch (error) {
    logger.warn('⚠️ Redis unavailable, using in-memory cache');
    isConnected = false;
  }
};

const get = async (key) => {
  try {
    if (isConnected && redis) {
      const value = await redis.get(key);
      return value ? JSON.parse(value) : null;
    }
    const entry = memoryCache.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expires) {
      memoryCache.delete(key);
      return null;
    }
    return entry.value;
  } catch {
    return null;
  }
};

const set = async (key, value, ttlSeconds = 30) => {
  try {
    if (isConnected && redis) {
      await redis.set(key, JSON.stringify(value), 'EX', ttlSeconds);
      return;
    }
    memoryCache.set(key, { value, expires: Date.now() + ttlSeconds * 1000 });
  } catch (error) {
    logger.error('Cache set error:', error.message);
  }
};

const del = async (key) => {
  try {
    if (isConnected && redis) {
      await redis.del(key);
      return;
    }
    memoryCache.delete(key);
  } catch (error) {
    logger.error('Cache del error:', error.message);
  }
};

const cache = {
  get,
  set,
  del,
  connect: connectRedis,
  isConnected: () => isConnected,
};

module.exports = { cache, connectRedis };
