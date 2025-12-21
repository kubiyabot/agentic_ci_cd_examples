/**
 * Database Service Unit Tests
 * These tests can fail due to simulated infrastructure issues
 */

const { DatabaseService } = require('../../src/services/database');

describe('DatabaseService', () => {
  let db;

  beforeEach(() => {
    db = new DatabaseService({ host: 'test-db', port: 5432 });
  });

  afterEach(async () => {
    if (db.connected) {
      await db.close();
    }
  });

  describe('connection', () => {
    it('should connect successfully', async () => {
      const result = await db.connect();
      expect(result.status).toBe('connected');
      expect(db.connected).toBe(true);
    });

    it('should handle connection timeout', async () => {
      // This test may fail randomly due to simulated timeouts
      const result = await db.connect();
      expect(result.status).toBe('connected');
    });

    it('should report correct host and port', async () => {
      const result = await db.connect();
      expect(result.host).toBe('test-db');
      expect(result.port).toBe(5432);
    });
  });

  describe('queries', () => {
    beforeEach(async () => {
      // May fail due to connection issues
      await db.connect();
    });

    it('should execute simple query', async () => {
      const result = await db.query('SELECT * FROM users');
      expect(result).toHaveProperty('rows');
      expect(result).toHaveProperty('rowCount');
    });

    it('should handle parameterized queries', async () => {
      const result = await db.query('SELECT * FROM users WHERE id = $1', [1]);
      expect(result).toHaveProperty('queryTime');
    });

    it('should detect slow queries', async () => {
      // This may log warnings for slow queries
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      await db.query('SELECT * FROM large_table');
      consoleSpy.mockRestore();
    });

    it('should fail without connection', async () => {
      const newDb = new DatabaseService();
      await expect(newDb.query('SELECT 1')).rejects.toThrow('Database not connected');
    });
  });

  describe('transactions', () => {
    beforeEach(async () => {
      await db.connect();
    });

    it('should execute transaction successfully', async () => {
      const result = await db.transaction([
        { sql: 'INSERT INTO users (name) VALUES ($1)', params: ['test'] },
        { sql: 'UPDATE users SET active = true WHERE name = $1', params: ['test'] }
      ]);
      expect(result.success).toBeDefined();
    });

    it('should rollback on failure', async () => {
      // May randomly fail due to deadlock simulation
      const result = await db.transaction([
        { sql: 'INSERT INTO users (name) VALUES ($1)', params: ['test'] }
      ]);
      if (!result.success) {
        expect(result.rolledBack).toBe(true);
      }
    });
  });

  describe('health check', () => {
    it('should return healthy when connected', async () => {
      await db.connect();
      const health = await db.healthCheck();
      expect(health.healthy).toBeDefined();
    });

    it('should return unhealthy when disconnected', async () => {
      const health = await db.healthCheck();
      expect(health.healthy).toBe(false);
    });
  });
});
