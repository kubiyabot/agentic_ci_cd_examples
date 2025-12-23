/**
 * Stable Test Suite
 * These tests should always pass - used to demonstrate TeamCity can distinguish
 * between genuinely stable tests and flaky ones
 */

describe('Stable Mathematical Operations', () => {
  test('basic arithmetic operations', () => {
    expect(2 + 2).toBe(4);
    expect(10 - 5).toBe(5);
    expect(3 * 4).toBe(12);
    expect(15 / 3).toBe(5);
  });

  test('mathematical constants', () => {
    expect(Math.PI).toBeCloseTo(3.14159, 5);
    expect(Math.E).toBeCloseTo(2.71828, 5);
    expect(Math.SQRT2).toBeCloseTo(1.41421, 5);
  });

  test('array operations', () => {
    const arr = [1, 2, 3, 4, 5];
    expect(arr.length).toBe(5);
    expect(arr.reduce((a, b) => a + b, 0)).toBe(15);
    expect(arr.filter(x => x > 3)).toEqual([4, 5]);
    expect(arr.map(x => x * 2)).toEqual([2, 4, 6, 8, 10]);
  });
});

describe('Stable String Operations', () => {
  test('string manipulation', () => {
    const str = 'TeamCity Intelligence';
    expect(str.length).toBe(21);
    expect(str.toUpperCase()).toBe('TEAMCITY INTELLIGENCE');
    expect(str.toLowerCase()).toBe('teamcity intelligence');
    expect(str.includes('Intelligence')).toBe(true);
  });

  test('string parsing', () => {
    expect(parseInt('42')).toBe(42);
    expect(parseFloat('3.14')).toBeCloseTo(3.14);
    expect('hello,world'.split(',')).toEqual(['hello', 'world']);
    expect(['Team', 'City'].join('')).toBe('TeamCity');
  });
});

describe('Stable Object Operations', () => {
  test('object creation and access', () => {
    const obj = {
      name: 'TeamCity',
      version: 2023.11,
      features: ['CI', 'CD', 'Test Intelligence']
    };
    
    expect(obj.name).toBe('TeamCity');
    expect(obj.version).toBe(2023.11);
    expect(obj.features).toHaveLength(3);
    expect(obj.features[2]).toBe('Test Intelligence');
  });

  test('object methods', () => {
    const obj = { a: 1, b: 2, c: 3 };
    expect(Object.keys(obj)).toEqual(['a', 'b', 'c']);
    expect(Object.values(obj)).toEqual([1, 2, 3]);
    expect(Object.entries(obj)).toHaveLength(3);
  });
});

describe('Stable Async Operations', () => {
  test('resolved promises', async () => {
    const result = await Promise.resolve('success');
    expect(result).toBe('success');
  });

  test('async/await with timeout', async () => {
    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
    const start = Date.now();
    await delay(100);
    const elapsed = Date.now() - start;
    expect(elapsed).toBeGreaterThanOrEqual(100);
    expect(elapsed).toBeLessThan(200); // Generous margin
  });

  test('promise all', async () => {
    const promises = [
      Promise.resolve(1),
      Promise.resolve(2),
      Promise.resolve(3)
    ];
    const results = await Promise.all(promises);
    expect(results).toEqual([1, 2, 3]);
  });
});

describe('Stable Error Handling', () => {
  test('throwing and catching errors', () => {
    const throwError = () => {
      throw new Error('Test error');
    };
    
    expect(throwError).toThrow('Test error');
    expect(throwError).toThrow(Error);
  });

  test('try-catch blocks', () => {
    let caught = false;
    try {
      throw new Error('Caught error');
    } catch (e) {
      caught = true;
    }
    expect(caught).toBe(true);
  });
});

describe('Stable Data Structures', () => {
  test('Set operations', () => {
    const set = new Set([1, 2, 3, 3, 4]);
    expect(set.size).toBe(4);
    expect(set.has(3)).toBe(true);
    expect(set.has(5)).toBe(false);
  });

  test('Map operations', () => {
    const map = new Map();
    map.set('key1', 'value1');
    map.set('key2', 'value2');
    expect(map.size).toBe(2);
    expect(map.get('key1')).toBe('value1');
    expect(map.has('key2')).toBe(true);
  });
});
