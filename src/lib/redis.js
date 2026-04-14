const { createClient } = require('redis');

let client;

/**
 * Create Redis Client
 */
function createRedisClient() {
  const url = process.env.REDIS_URL;

  if (!url) {
    console.log('⚠️ REDIS_URL not set → Redis disabled');
    return null;
  }

  const c = createClient({
    url,
    socket: {
      reconnectStrategy: (retries) => {
        if (retries > 5) return false;
        return Math.min(retries * 300, 3000);
      },
    },
  });

  c.on('connect', () => console.log('🔌 Redis connecting...'));
  c.on('ready', () => console.log('✅ Redis ready'));
  c.on('error', (err) => console.log('❌ Redis error:', err.message));
  c.on('end', () => console.log('⚠️ Redis connection closed'));

  return c;
}

/**
 * Connect Redis (safe singleton)
 */
async function connectRedis() {
  if (client?.isReady) return client;

  try {
    client = createRedisClient();
    if (!client) return null;

    await client.connect();
    return client;
  } catch (err) {
    console.error('❌ Redis connect failed:', err.message);
    client = null;
    return null;
  }
}

/**
 * Health check (FIXED)
 */
async function isRedisHealthy() {
  try {
    if (!client?.isReady) return false;

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
    if (!client?.isReady) return null;
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
    if (!client?.isReady) return;

    await client.set(key, JSON.stringify(value), {
      EX: ttl,
    });
  } catch (e) {}
}

/**
 * Delete cache
 */
async function deleteCache(key) {
  try {
    if (!client?.isReady) return;
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