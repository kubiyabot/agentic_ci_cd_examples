/**
 * FIXED VERSION - Shared State Dependencies Tests
 * ✅ NO LONGER FLAKY - All shared state isolated and controlled
 *
 * Common flaky patterns addressed:
 * - Tests modifying global state
 * - Order-dependent tests
 * - Shared variables between tests
 * - Singleton pattern issues
 * - Module state persistence
 */

// Mock a shared state service
class SharedStateService {
  constructor() {
    this.data = {};
    this.cache = new Map();
    this.listeners = [];
  }

  static getInstance() {
    if (!this.instance) {
      this.instance = new SharedStateService();
    }
    return this.instance;
  }

  static resetInstance() {
    this.instance = null;
  }

  setValue(key, value) {
    this.data[key] = value;
    this.cache.set(key, value);
    this.notifyListeners(key, value);
  }

  getValue(key) {
    return this.data[key] || this.cache.get(key);
  }

  addListener(listener) {
    this.listeners.push(listener);
  }

  notifyListeners(key, value) {
    this.listeners.forEach(listener => listener(key, value));
  }

  clear() {
    this.data = {};
    this.cache.clear();
    this.listeners = [];
  }
}

// Global variable that could cause flaky tests
let globalCounter = 0;
let globalConfig = { debug: false };

describe('FIXED - Shared State Dependencies Tests', () => {
  // ✅ FIXED - Reset all shared state before each test
  beforeEach(() => {
    // Reset singleton instance
    SharedStateService.resetInstance();

    // Reset global variables
    globalCounter = 0;
    globalConfig = { debug: false };

    // Clear any module-level state
    jest.resetModules();
  });

  afterEach(() => {
    // Additional cleanup
    SharedStateService.resetInstance();
  });

  it('FIXED - should isolate singleton state between tests', () => {
    // ✅ FIXED - Each test gets a fresh singleton
    const service1 = SharedStateService.getInstance();
    service1.setValue('user', 'alice');

    expect(service1.getValue('user')).toBe('alice');

    // This test won't be affected by previous singleton state
    const service2 = SharedStateService.getInstance();
    expect(service2).toBe(service1); // Same instance within test
    expect(service2.getValue('user')).toBe('alice');
  });

  it('FIXED - should have clean singleton state in this test', () => {
    // ✅ FIXED - Fresh singleton state due to beforeEach reset
    const service = SharedStateService.getInstance();

    // Should not have any data from previous test
    expect(service.getValue('user')).toBeUndefined();

    service.setValue('user', 'bob');
    expect(service.getValue('user')).toBe('bob');
  });

  it('FIXED - should handle global counter without interference', () => {
    // ✅ FIXED - Global counter reset before each test
    expect(globalCounter).toBe(0);

    const incrementCounter = () => {
      globalCounter++;
      return globalCounter;
    };

    expect(incrementCounter()).toBe(1);
    expect(incrementCounter()).toBe(2);
    expect(globalCounter).toBe(2);
  });

  it('FIXED - should have fresh global counter', () => {
    // ✅ FIXED - Counter should be 0 again due to reset
    expect(globalCounter).toBe(0);

    globalCounter = 10;
    expect(globalCounter).toBe(10);
  });

  it('FIXED - should handle global configuration changes', () => {
    // ✅ FIXED - Global config reset before each test
    expect(globalConfig.debug).toBe(false);

    const enableDebug = () => {
      globalConfig.debug = true;
      globalConfig.logLevel = 'verbose';
    };

    enableDebug();
    expect(globalConfig.debug).toBe(true);
    expect(globalConfig.logLevel).toBe('verbose');
  });

  it('FIXED - should have clean global configuration', () => {
    // ✅ FIXED - Config should be reset
    expect(globalConfig.debug).toBe(false);
    expect(globalConfig.logLevel).toBeUndefined();

    globalConfig.theme = 'dark';
    expect(globalConfig.theme).toBe('dark');
  });

  it('FIXED - should handle module state properly', () => {
    // ✅ FIXED - Module state cleared with jest.resetModules()

    // Create a module that maintains state
    const createStatefulModule = () => ({
      _state: {},
      setState(key, value) {
        this._state[key] = value;
      },
      getState(key) {
        return this._state[key];
      },
      clearState() {
        this._state = {};
      }
    });

    const module1 = createStatefulModule();
    module1.setState('count', 5);
    expect(module1.getState('count')).toBe(5);
  });

  it('FIXED - should handle array and object mutations', () => {
    // ✅ FIXED - Fresh objects for each test
    const testArray = [];
    const testObject = {};

    // These modifications won't affect other tests
    testArray.push('item1', 'item2');
    testObject.name = 'test';
    testObject.items = testArray;

    expect(testArray).toEqual(['item1', 'item2']);
    expect(testObject.name).toBe('test');
    expect(testObject.items).toBe(testArray);
  });

  it('FIXED - should handle event listeners cleanup', () => {
    // ✅ FIXED - Clean event listeners with proper cleanup
    const service = SharedStateService.getInstance();
    const mockListener = jest.fn();

    service.addListener(mockListener);
    service.setValue('key', 'value');

    expect(mockListener).toHaveBeenCalledWith('key', 'value');

    // Clear listeners to prevent interference
    service.clear();
  });

  it('FIXED - should handle promise state isolation', async () => {
    // ✅ FIXED - Each test has isolated promise state
    const createPromiseState = () => {
      const promises = new Map();

      return {
        addPromise(id, promise) {
          promises.set(id, promise);
        },
        getPromise(id) {
          return promises.get(id);
        },
        resolvePromise(id, value) {
          const promise = promises.get(id);
          if (promise && promise.resolve) {
            promise.resolve(value);
          }
        }
      };
    };

    const promiseState = createPromiseState();

    let resolvePromise;
    const testPromise = new Promise(resolve => {
      resolvePromise = resolve;
    });

    promiseState.addPromise('test', { resolve: resolvePromise });

    setTimeout(() => {
      promiseState.resolvePromise('test', 'completed');
    }, 0);

    const result = await testPromise;
    expect(result).toBe('completed');
  });

  describe('FIXED - Nested describe blocks with shared state', () => {
    let nestedSharedState;

    beforeEach(() => {
      // ✅ FIXED - Initialize nested state for each test
      nestedSharedState = {
        values: [],
        config: {}
      };
    });

    it('should have fresh nested state - test 1', () => {
      expect(nestedSharedState.values).toEqual([]);

      nestedSharedState.values.push('test1');
      nestedSharedState.config.option = 'value1';

      expect(nestedSharedState.values).toEqual(['test1']);
      expect(nestedSharedState.config.option).toBe('value1');
    });

    it('should have fresh nested state - test 2', () => {
      // ✅ FIXED - Should not see data from previous test
      expect(nestedSharedState.values).toEqual([]);
      expect(nestedSharedState.config.option).toBeUndefined();

      nestedSharedState.values.push('test2');
      expect(nestedSharedState.values).toEqual(['test2']);
    });
  });
});