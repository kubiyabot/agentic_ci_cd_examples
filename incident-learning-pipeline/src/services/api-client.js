/**
 * External API Client Service
 * Simulates API calls that can fail with various error types
 */

const DEFAULT_TIMEOUT = parseInt(process.env.API_TIMEOUT) || 5000;
const RETRY_DELAYS = [100, 500, 1000]; // Exponential backoff

class APIClient {
  constructor(baseUrl, options = {}) {
    this.baseUrl = baseUrl || process.env.API_BASE_URL || 'https://api.example.com';
    this.timeout = options.timeout || DEFAULT_TIMEOUT;
    this.retries = options.retries || 3;
    this.requestCount = 0;
  }

  async request(endpoint, options = {}) {
    this.requestCount++;
    const url = `${this.baseUrl}${endpoint}`;

    for (let attempt = 0; attempt < this.retries; attempt++) {
      try {
        return await this._makeRequest(url, options, attempt);
      } catch (error) {
        if (attempt === this.retries - 1) {
          throw error;
        }
        await this.delay(RETRY_DELAYS[attempt] || 1000);
      }
    }
  }

  async _makeRequest(url, options, attempt) {
    // Simulate network latency
    const latency = Math.random() * 300 + 50;
    await this.delay(latency);

    // Simulate various failure modes
    const failureRoll = Math.random();

    // Rate limiting (429)
    if (failureRoll < 0.1 && this.requestCount > 5) {
      const error = new Error('Rate limit exceeded');
      error.statusCode = 429;
      error.retryAfter = 60;
      throw error;
    }

    // Timeout
    if (failureRoll < 0.15) {
      const error = new Error(`Request timeout after ${this.timeout}ms`);
      error.code = 'ETIMEDOUT';
      throw error;
    }

    // Connection refused
    if (failureRoll < 0.18) {
      const error = new Error('Connection refused');
      error.code = 'ECONNREFUSED';
      throw error;
    }

    // 5xx errors
    if (failureRoll < 0.22) {
      const error = new Error('Internal Server Error');
      error.statusCode = 500 + Math.floor(Math.random() * 4);
      throw error;
    }

    return {
      status: 200,
      data: { success: true, timestamp: Date.now() },
      latency
    };
  }

  async get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  }

  async post(endpoint, data) {
    return this.request(endpoint, { method: 'POST', body: data });
  }

  async healthCheck() {
    try {
      const response = await this.get('/health');
      return { healthy: true, latency: response.latency };
    } catch (error) {
      return { healthy: false, error: error.message, code: error.code };
    }
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = { APIClient };
