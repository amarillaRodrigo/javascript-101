const Redis = require('ioredis');

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

let redisClient = null;

try {
  redisClient = new Redis(redisUrl, {
    lazyConnect: true,
    maxRetriesPerRequest: 2,
    retryStrategy(times) {
      if (times > 3) return null; // stop retrying after 3 attempts
      return Math.min(times * 200, 1000);
    },
  });

  redisClient.on('error', (err) => {
    console.warn('[Redis] Connection warning/error:', err.message);
  });
} catch (error) {
  console.warn('[Redis] Failed to initialize Redis client:', error.message);
}

async function pingRedis() {
  if (!redisClient) {
    return { status: 'down', error: 'Redis client not initialized' };
  }
  try {
    if (redisClient.status === 'wait') {
      await redisClient.connect();
    }
    const result = await redisClient.ping();
    return { status: 'up', response: result };
  } catch (error) {
    return { status: 'down', error: error.message };
  }
}

module.exports = {
  redisClient,
  pingRedis,
};
