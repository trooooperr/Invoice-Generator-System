const { Redis } = require('@upstash/redis');

let client = null;

/**
 * Create Redis Client (Upstash)
 */
function createRedisClient() {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    console.log('⚠️ Upstash Redis not configured → Redis disabled');
    return null;
  }

  console.log('🔌 Upstash Redis initialized');

  return new Redis({
    url,
    token,
  });
}

/**
 * Connect Redis (no real connection needed in Upstash)
 */
async function connectRedis() {
  if (client) return client;

  try {
    client = createRedisClient();
    return client;
  } catch (err) {
    console.error('❌ Redis init failed:', err.message);
    client = null;
    return null;
  }
}

/**
 * Health check
 */
async function isRedisHealthy() {
  try {
    if (!client) return false;

    const pong = await client.ping();
    return pong === 'PONG';
  } catch {
    return false;
  }
}

/**
 * Get cache
 */
async function getCache(key) {
  try {
    if (!client) return null;

    const val = await client.get(key);
    return val ? JSON.parse(val) : null;
  } catch (e) {
    return null;
  }
}

/**
 * Set cache
 */
async function setCache(key, value, ttl = 300) {
  try {
    if (!client) return;

    await client.set(key, JSON.stringify(value), {
      ex: ttl, // ⚠️ lowercase 'ex' in Upstash
    });
  } catch (e) {}
}

/**
 * Delete cache
 */
async function deleteCache(key) {
  try {
    if (!client) return;

    await client.del(key);
  } catch (e) {}
}

module.exports = {
  connectRedis,
  isRedisHealthy,
  getCache,
  setCache,
  deleteCache,
};