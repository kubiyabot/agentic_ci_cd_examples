/**
 * FIXED VERSION - Timing Dependencies Tests
 * ✅ NO LONGER FLAKY - All timing dependencies mocked and controlled
 *
 * Common flaky patterns addressed:
 * - Async operations without proper waiting
 * - Race conditions between parallel operations
 * - setTimeout/setInterval dependencies
 * - Promise timing issues
 */

describe('FIXED - Timing Dependencies Tests', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('FIXED - should handle setTimeout predictably', async () => {
    // ✅ FIXED - Use fake timers to control setTimeout
    let callbackExecuted = false;

    setTimeout(() => {
      callbackExecuted = true;
    }, 1000);

    // Before advancing timers
    expect(callbackExecuted).toBe(false);

    // Fast-forward time
    jest.advanceTimersByTime(1000);

    // After advancing timers
    expect(callbackExecuted).toBe(true);
  });

  it('FIXED - should handle multiple async operations in sequence', async () => {
    // ✅ FIXED - Control timing of multiple async operations
    const results = [];

    setTimeout(() => results.push('first'), 100);
    setTimeout(() => results.push('second'), 200);
    setTimeout(() => results.push('third'), 300);

    // Advance time step by step
    jest.advanceTimersByTime(100);
    expect(results).toEqual(['first']);

    jest.advanceTimersByTime(100);
    expect(results).toEqual(['first', 'second']);

    jest.advanceTimersByTime(100);
    expect(results).toEqual(['first', 'second', 'third']);
  });

  it('FIXED - should handle Promise.resolve timing', async () => {
    // ✅ FIXED - Use fake timers for Promise-based delays
    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    let completed = false;

    const asyncOperation = async () => {
      await delay(500);
      completed = true;
      return 'done';
    };

    const promise = asyncOperation();

    // Initially not completed
    expect(completed).toBe(false);

    // Fast-forward time
    jest.advanceTimersByTime(500);

    const result = await promise;
    expect(completed).toBe(true);
    expect(result).toBe('done');
  });

  it('FIXED - should handle debounced operations', () => {
    // ✅ FIXED - Test debouncing with controlled timing
    let callCount = 0;

    const debouncedFunction = jest.fn(() => {
      callCount++;
    });

    const debounce = (fn, delay) => {
      let timeoutId;
      return (...args) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => fn(...args), delay);
      };
    };

    const debounced = debounce(debouncedFunction, 300);

    // Call multiple times rapidly
    debounced();
    debounced();
    debounced();

    // Should not have called the function yet
    expect(debouncedFunction).not.toHaveBeenCalled();

    // Fast-forward time
    jest.advanceTimersByTime(300);

    // Should have called only once
    expect(debouncedFunction).toHaveBeenCalledTimes(1);
  });

  it('FIXED - should handle interval operations', () => {
    // ✅ FIXED - Control setInterval with fake timers
    let counter = 0;

    const intervalId = setInterval(() => {
      counter++;
    }, 100);

    // Initial state
    expect(counter).toBe(0);

    // After 250ms (2.5 intervals)
    jest.advanceTimersByTime(250);
    expect(counter).toBe(2);

    // After another 150ms (total 400ms, 4 intervals)
    jest.advanceTimersByTime(150);
    expect(counter).toBe(4);

    // Clean up
    clearInterval(intervalId);
  });

  it('FIXED - should handle race conditions deterministically', async () => {
    // ✅ FIXED - Control race conditions with deterministic timing
    const results = [];

    const asyncTask = (id, delay) => {
      return new Promise(resolve => {
        setTimeout(() => {
          results.push(id);
          resolve(id);
        }, delay);
      });
    };

    // Start multiple async tasks
    const promises = [
      asyncTask('task1', 100),
      asyncTask('task2', 50),
      asyncTask('task3', 75)
    ];

    // Control the execution order by advancing time precisely
    jest.advanceTimersByTime(50);
    expect(results).toEqual(['task2']);

    jest.advanceTimersByTime(25);
    expect(results).toEqual(['task2', 'task3']);

    jest.advanceTimersByTime(25);
    expect(results).toEqual(['task2', 'task3', 'task1']);

    const finalResults = await Promise.all(promises);
    expect(finalResults).toEqual(['task1', 'task2', 'task3']);
  });
});