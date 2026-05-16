const { cache: redisCache, invalidateCache: redisInvalidate } = require('../config/redis');

/**
 * Redis-based API response cache middleware.
 * Usage: router.get('/restaurants', cacheMiddleware('restaurants', 60), ctrl)
 *
 * Gracefully degrades when Redis is unavailable.
 */
function cacheMiddleware(key, ttl = 30) {
  return async (req, res, next) => {
    if (req.method !== 'GET') return next();

    try {
      const cacheKey = key + ':' + req.originalUrl;
      const cached = await redisCache.get(cacheKey);
      if (cached) {
        res.set('X-Cache', 'HIT');
        return res.json(cached);
      }
      res.set('X-Cache', 'MISS');

      const originalJson = res.json.bind(res);
      res.json = (data) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          redisCache.set(cacheKey, data, ttl).catch(() => {});
        }
        return originalJson(data);
      };
      next();
    } catch (e) {
      next();
    }
  };
}

/**
 * Invalidate cache entries matching a key prefix.
 */
async function invalidateCache(prefix) {
  try {
    await redisInvalidate(prefix);
  } catch (e) {
    // Silently fail — cache will expire via TTL
  }
}

module.exports = { cache: cacheMiddleware, invalidateCache };
