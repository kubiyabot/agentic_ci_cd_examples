# Flaky Test Quick Reference Guide

## 🚨 Common Flaky Patterns to Avoid

### 1. Random Values
```javascript
// ❌ DON'T: Non-deterministic
if (Math.random() > 0.5) {
  // test logic
}

// ✅ DO: Use deterministic mocking
Math.random = jest.fn(() => 0.7);
```

### 2. Time Dependencies
```javascript
// ❌ DON'T: Real time dependencies
const now = new Date();
expect(now.getHours()).toBe(10);

// ✅ DO: Mock time
jest.spyOn(global, 'Date').mockImplementation(() =>
  new Date('2024-01-15T10:00:00.000Z')
);
```

### 3. Async Race Conditions
```javascript
// ❌ DON'T: Insufficient waiting
setTimeout(() => value = 'done', 100);
await new Promise(resolve => setTimeout(resolve, 50)); // Too short!

// ✅ DO: Proper synchronization
const operation = new Promise(resolve => {
  setImmediate(() => {
    value = 'done';
    resolve();
  });
});
await operation;
```

### 4. Shared State
```javascript
// ❌ DON'T: Global state between tests
let globalCounter = 0;

// ✅ DO: Isolated state per test
beforeEach(() => {
  const testContext = new TestContext();
});
```

### 5. System Dependencies
```javascript
// ❌ DON'T: Real system calls
const memory = process.memoryUsage().heapUsed;

// ✅ DO: Mock system calls
process.memoryUsage = jest.fn(() => ({ heapUsed: 1000000 }));
```

## 🛠 Quick Fixes

### Setup Deterministic Environment
```javascript
// Add to test setup
import { setupDeterministicTestEnvironment } from './setup/deterministic-test-setup';

beforeAll(() => {
  cleanup = setupDeterministicTestEnvironment();
});

afterAll(() => {
  cleanup();
});
```

### Mock Common Sources of Flakiness
```javascript
// Mock time
Date.now = jest.fn(() => 1642234800000);

// Mock random
Math.random = jest.fn(() => 0.5);

// Mock network
fetch = jest.fn().mockResolvedValue({
  ok: true,
  json: () => Promise.resolve({ data: 'test' })
});

// Mock memory
process.memoryUsage = jest.fn(() => ({
  heapUsed: 50000000,
  heapTotal: 75000000
}));
```

## 📋 Checklist for Test Review

- [ ] No `Math.random()` without mocking
- [ ] No `Date.now()` or `new Date()` without mocking
- [ ] No `setTimeout` with variable delays
- [ ] No shared variables between tests
- [ ] No real network calls
- [ ] No real file system operations
- [ ] Proper async/await usage
- [ ] Tests can run in any order
- [ ] Tests clean up after themselves

## 🎯 Test Structure Template

```javascript
describe('Feature Tests', () => {
  let testContext;
  let cleanup;

  beforeAll(() => {
    cleanup = setupDeterministicTestEnvironment();
  });

  beforeEach(() => {
    testContext = new TestContext();
  });

  afterEach(() => {
    testContext.destroy();
  });

  afterAll(() => {
    cleanup();
  });

  test('should work reliably', async () => {
    // Arrange
    const testData = TestDataFactory.createUser(1);

    // Act
    const result = await serviceUnderTest.process(testData);

    // Assert
    expect(result).toBeDefined();
    expect(result.status).toBe('success');
  });
});
```

## 📊 Monitoring Flaky Tests

### Run Tests Multiple Times
```bash
# Test consistency
for i in {1..10}; do npm test; done

# With different seeds
SEED=123 npm test
SEED=456 npm test
```

### Performance Tracking
```javascript
const monitor = new TestPerformanceMonitor();

test('performance test', async () => {
  monitor.start('operation');
  // ... test logic ...
  const metrics = monitor.end('operation');
  expect(metrics.duration).toBeLessThan(100);
});
```

---

*Keep this guide handy when writing new tests or reviewing existing ones!*