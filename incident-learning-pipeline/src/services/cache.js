/**
 * Cache Service
 * Simulates Redis-like cache with failure modes
 */

const CACHE_TTL = parseInt(process.env.CACHE_TTL) || 3600;

class CacheService {
  constructor(config = {}) {
    this.host = config.host || process.env.REDIS_HOST || 'localhost';
    this.port = config.port || process.env.REDIS_PORT || 6379;
    this.connected = false;
    this.store = new Map();
    this.hitCount = 0;
    this.missCount = 0;
  }

  async connect() {
    // Simulate connection delay
    await this.delay(50);

    // Simulate connection failures
    if (Math.random() < 0.2) {
      throw new Error(`ECONNREFUSED: Connection refused to ${this.host}:${this.port}`);
    }

    this.connected = true;
    return { status: 'connected' };
  }

  async get(key) {
    this.ensureConnected();

    await this.delay(10);

    const entry = this.store.get(key);
    if (!entry) {
      this.missCount++;
      return null;
    }

    // Check TTL
    if (entry.expiresAt && Date.now() > entry.expiresAt) {
      this.store.delete(key);
      this.missCount++;
      return null;
    }

    this.hitCount++;
    return entry.value;
  }

  async set(key, value, ttl = CACHE_TTL) {
    this.ensureConnected();

    await this.delay(10);

    // Simulate memory pressure errors
    if (this.store.size > 1000 && Math.random() < 0.1) {
      throw new Error('OOM command not allowed when used memory > maxmemory');
    }

    this.store.set(key, {
      value,
      expiresAt: ttl ? Date.now() + (ttl * 1000) : null
    });

    return 'OK';
  }

  async delete(key) {
    this.ensureConnected();
    return this.store.delete(key) ? 1 : 0;
  }

  async flush() {
    this.ensureConnected();
    this.store.clear();
    return 'OK';
  }

  getStats() {
    return {
      size: this.store.size,
      hits: this.hitCount,
      misses: this.missCount,
      hitRate: this.hitCount / (this.hitCount + this.missCount) || 0
    };
  }

  async healthCheck() {
    try {
      await this.set('__health__', 'ok', 10);
      const result = await this.get('__health__');
      return { healthy: result === 'ok' };
    } catch (error) {
      return { healthy: false, error: error.message };
    }
  }

  ensureConnected() {
    if (!this.connected) {
      throw new Error('Cache not connected. Call connect() first.');
    }
  }

  async close() {
    this.connected = false;
    this.store.clear();
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = { CacheService };
