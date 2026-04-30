const redis = require('../config/redis');

/**
 * Redis-based API response cache middleware.
 * Usage: router.get('/restaurants', cache('restaurants', 60), ctrl)
 *
 * @param {string} key  - Cache key prefix (will include query params)
 * @param {number} ttl  - Time-to-live in seconds (default 30)
 */
function cache(key, ttl = 30) {
  return async (req, res, next) => {
    // Skip cache for non-GET requests
    if (req.method !== 'GET') return next();

    try {
      const cacheKey = key + ':' + req.originalUrl;
      const cached = await redis.get(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        res.set('X-Cache', 'HIT');
        return res.json(parsed);
      }
      res.set('X-Cache', 'MISS');

      // Intercept res.json to cache the response
      const originalJson = res.json.bind(res);
      res.json = (data) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          redis.set(cacheKey, JSON.stringify(data), 'EX', ttl).catch(() => {});
        }
        return originalJson(data);
      };
      next();
    } catch (e) {
      // Redis down — pass through without caching
      next();
    }
  };
}

/**
 * Invalidate cache entries matching a key prefix.
 * Usage: await invalidateCache('restaurants');
 *
 * @param {string} prefix - Cache key prefix to invalidate
 */
async function invalidateCache(prefix) {
  try {
    const keys = await redis.keys(prefix + ':*');
    if (keys.length) await redis.del(...keys);
  } catch (e) {
    // Silently fail — cache will expire via TTL
  }
}

module.exports = { cache, invalidateCache };
