/**
 * Database Service
 * Simulates database operations that can fail in various ways
 */

const CONNECTION_TIMEOUT = parseInt(process.env.DB_TIMEOUT) || 5000;
const MAX_RETRIES = parseInt(process.env.DB_MAX_RETRIES) || 3;

class DatabaseService {
  constructor(config = {}) {
    this.host = config.host || process.env.DB_HOST || 'localhost';
    this.port = config.port || process.env.DB_PORT || 5432;
    this.connected = false;
    this.connectionAttempts = 0;
  }

  async connect() {
    this.connectionAttempts++;

    // Simulate connection delay
    await this.delay(100);

    // Simulate intermittent connection failures
    if (this.connectionAttempts <= MAX_RETRIES && Math.random() < 0.3) {
      throw new Error(`Connection timeout after ${CONNECTION_TIMEOUT}ms to ${this.host}:${this.port}`);
    }

    this.connected = true;
    return { status: 'connected', host: this.host, port: this.port };
  }

  async query(sql, params = []) {
    if (!this.connected) {
      throw new Error('Database not connected. Call connect() first.');
    }

    // Simulate query execution time
    const queryTime = Math.random() * 200 + 50;
    await this.delay(queryTime);

    // Simulate slow query detection
    if (queryTime > 150) {
      console.warn(`Slow query detected: ${queryTime.toFixed(2)}ms`);
    }

    // Simulate deadlock (rare)
    if (Math.random() < 0.05) {
      throw new Error('ERROR: deadlock detected');
    }

    return { rows: [], rowCount: 0, queryTime };
  }

  async transaction(operations) {
    if (!this.connected) {
      throw new Error('Database not connected');
    }

    const results = [];
    try {
      for (const op of operations) {
        results.push(await this.query(op.sql, op.params));
      }
      return { success: true, results };
    } catch (error) {
      // Rollback simulation
      return { success: false, error: error.message, rolledBack: true };
    }
  }

  async healthCheck() {
    try {
      await this.query('SELECT 1');
      return { healthy: true, latency: Date.now() };
    } catch (error) {
      return { healthy: false, error: error.message };
    }
  }

  async close() {
    this.connected = false;
    return { status: 'disconnected' };
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = { DatabaseService };
