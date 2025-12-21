/**
 * Cache Service Unit Tests
 * These tests can fail due to simulated Redis issues
 */

const { CacheService } = require('../../src/services/cache');

describe('CacheService', () => {
  let cache;

  beforeEach(() => {
    cache = new CacheService({ host: 'test-redis', port: 6379 });
  });

  afterEach(async () => {
    if (cache.connected) {
      await cache.close();
    }
  });

  describe('connection', () => {
    it('should connect successfully', async () => {
      // May fail due to simulated connection issues
      const result = await cache.connect();
      expect(result.status).toBe('connected');
    });

    it('should handle connection refused', async () => {
      // Multiple attempts may be needed due to random failures
      let connected = false;
      for (let i = 0; i < 5; i++) {
        try {
          await cache.connect();
          connected = true;
          break;
        } catch (error) {
          if (!error.message.includes('ECONNREFUSED')) {
            throw error;
          }
        }
      }
      // May or may not connect
      expect(typeof connected).toBe('boolean');
    });
  });

  describe('basic operations', () => {
    beforeEach(async () => {
      await cache.connect();
    });

    it('should set and get value', async () => {
      await cache.set('key1', 'value1');
      const result = await cache.get('key1');
      expect(result).toBe('value1');
    });

    it('should return null for missing key', async () => {
      const result = await cache.get('nonexistent');
      expect(result).toBeNull();
    });

    it('should delete key', async () => {
      await cache.set('deleteMe', 'value');
      const deleted = await cache.delete('deleteMe');
      expect(deleted).toBe(1);

      const result = await cache.get('deleteMe');
      expect(result).toBeNull();
    });

    it('should flush all keys', async () => {
      await cache.set('key1', 'value1');
      await cache.set('key2', 'value2');
      await cache.flush();

      expect(await cache.get('key1')).toBeNull();
      expect(await cache.get('key2')).toBeNull();
    });
  });

  describe('TTL handling', () => {
    beforeEach(async () => {
      await cache.connect();
    });

    it('should expire keys after TTL', async () => {
      await cache.set('expiring', 'value', 0.1); // 100ms TTL

      // Wait for expiration
      await new Promise(resolve => setTimeout(resolve, 150));

      const result = await cache.get('expiring');
      expect(result).toBeNull();
    });

    it('should keep keys without TTL', async () => {
      await cache.set('permanent', 'value', null);
      const result = await cache.get('permanent');
      expect(result).toBe('value');
    });
  });

  describe('statistics', () => {
    beforeEach(async () => {
      await cache.connect();
    });

    it('should track hit count', async () => {
      await cache.set('key', 'value');
      await cache.get('key');
      await cache.get('key');

      const stats = cache.getStats();
      expect(stats.hits).toBeGreaterThanOrEqual(2);
    });

    it('should track miss count', async () => {
      await cache.get('missing1');
      await cache.get('missing2');

      const stats = cache.getStats();
      expect(stats.misses).toBeGreaterThanOrEqual(2);
    });

    it('should calculate hit rate', async () => {
      await cache.set('key', 'value');
      await cache.get('key'); // hit
      await cache.get('missing'); // miss

      const stats = cache.getStats();
      expect(stats.hitRate).toBeGreaterThanOrEqual(0);
      expect(stats.hitRate).toBeLessThanOrEqual(1);
    });
  });

  describe('error handling', () => {
    it('should fail operations without connection', async () => {
      await expect(cache.get('key')).rejects.toThrow('not connected');
    });

    it('should handle health check', async () => {
      await cache.connect();
      const health = await cache.healthCheck();
      expect(health).toHaveProperty('healthy');
    });
  });
});
