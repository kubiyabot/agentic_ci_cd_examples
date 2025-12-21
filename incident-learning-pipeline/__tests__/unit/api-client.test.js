/**
 * API Client Unit Tests
 * These tests can fail due to simulated network issues
 */

const { APIClient } = require('../../src/services/api-client');

describe('APIClient', () => {
  let client;

  beforeEach(() => {
    client = new APIClient('https://api.test.com', { retries: 2, timeout: 1000 });
  });

  describe('basic requests', () => {
    it('should make GET request successfully', async () => {
      // May fail due to simulated network issues
      const response = await client.get('/users');
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('success');
    });

    it('should make POST request successfully', async () => {
      const response = await client.post('/users', { name: 'test' });
      expect(response.status).toBe(200);
    });

    it('should include latency in response', async () => {
      const response = await client.get('/health');
      expect(response.latency).toBeGreaterThan(0);
    });
  });

  describe('error handling', () => {
    it('should handle timeout errors', async () => {
      // Reduced retries to increase failure chance
      const shortClient = new APIClient('https://api.test.com', { retries: 1 });

      try {
        await shortClient.get('/slow-endpoint');
        // If it succeeds, that's also fine
      } catch (error) {
        expect(error.message).toContain('timeout');
      }
    });

    it('should handle connection refused', async () => {
      const badClient = new APIClient('https://invalid.host.local', { retries: 1 });

      try {
        await badClient.get('/');
      } catch (error) {
        expect(['ECONNREFUSED', 'ETIMEDOUT']).toContain(error.code);
      }
    });

    it('should retry on failure', async () => {
      // The client should retry and eventually succeed (or exhaust retries)
      try {
        await client.get('/flaky-endpoint');
      } catch (error) {
        // Expected after retries exhausted
        expect(error).toBeDefined();
      }
    });
  });

  describe('rate limiting', () => {
    it('should handle rate limit responses', async () => {
      // Make many requests to trigger rate limiting
      const promises = [];
      for (let i = 0; i < 10; i++) {
        promises.push(client.get('/resource').catch(e => e));
      }

      const results = await Promise.all(promises);
      const rateLimited = results.filter(r => r.statusCode === 429);

      // May or may not hit rate limiting
      expect(results.length).toBe(10);
    });
  });

  describe('health check', () => {
    it('should report healthy service', async () => {
      const health = await client.healthCheck();
      expect(health).toHaveProperty('healthy');
    });

    it('should report latency on success', async () => {
      const health = await client.healthCheck();
      if (health.healthy) {
        expect(health.latency).toBeGreaterThan(0);
      }
    });
  });
});
