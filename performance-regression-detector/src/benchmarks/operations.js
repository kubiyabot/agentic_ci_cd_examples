/**
 * Sample Operations to Benchmark
 * These simulate real-world operations with varying performance characteristics
 */

class DataOperations {
  /**
   * Array sorting - O(n log n)
   * Performance varies with array size and data distribution
   */
  static sortArray(size = 10000) {
    const arr = Array.from({ length: size }, () => Math.random());
    const start = process.hrtime.bigint();
    arr.sort((a, b) => a - b);
    const end = process.hrtime.bigint();
    return Number(end - start) / 1e6; // ms
  }

  /**
   * Object lookup - O(1) amortized
   * Tests hash map performance
   */
  static objectLookup(size = 100000, lookups = 10000) {
    const obj = {};
    for (let i = 0; i < size; i++) {
      obj[`key_${i}`] = { value: i, data: `data_${i}` };
    }

    const start = process.hrtime.bigint();
    for (let i = 0; i < lookups; i++) {
      const key = `key_${Math.floor(Math.random() * size)}`;
      const _ = obj[key];
    }
    const end = process.hrtime.bigint();
    return Number(end - start) / 1e6; // ms
  }

  /**
   * Array filtering - O(n)
   * Tests iteration and predicate evaluation
   */
  static filterArray(size = 100000) {
    const arr = Array.from({ length: size }, (_, i) => ({
      id: i,
      active: Math.random() > 0.5,
      score: Math.random() * 100
    }));

    const start = process.hrtime.bigint();
    const filtered = arr.filter(item => item.active && item.score > 50);
    const end = process.hrtime.bigint();
    return Number(end - start) / 1e6; // ms
  }

  /**
   * String concatenation - varies by method
   * Tests string buffer performance
   */
  static stringConcat(iterations = 50000) {
    const start = process.hrtime.bigint();
    const parts = [];
    for (let i = 0; i < iterations; i++) {
      parts.push(`item_${i}_value_${Math.random()}`);
    }
    const result = parts.join(',');
    const end = process.hrtime.bigint();
    return Number(end - start) / 1e6; // ms
  }

  /**
   * JSON serialization - O(n) where n is object size
   * Tests JSON.stringify performance
   */
  static jsonSerialize(depth = 5, breadth = 10) {
    const buildObject = (d) => {
      if (d === 0) return { value: Math.random(), label: 'leaf' };
      const obj = {};
      for (let i = 0; i < breadth; i++) {
        obj[`child_${i}`] = buildObject(d - 1);
      }
      return obj;
    };

    const data = buildObject(depth);

    const start = process.hrtime.bigint();
    const json = JSON.stringify(data);
    const parsed = JSON.parse(json);
    const end = process.hrtime.bigint();
    return Number(end - start) / 1e6; // ms
  }

  /**
   * Regex matching - varies by pattern complexity
   * Tests regex engine performance
   */
  static regexMatch(textSize = 100000, matches = 1000) {
    // Generate text with known patterns
    let text = '';
    for (let i = 0; i < textSize / 100; i++) {
      text += `user_${i}@example.com some random text here `;
    }

    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

    const start = process.hrtime.bigint();
    const found = text.match(emailRegex) || [];
    const end = process.hrtime.bigint();
    return Number(end - start) / 1e6; // ms
  }

  /**
   * Deep clone - O(n) where n is total object size
   * Tests structured cloning performance
   */
  static deepClone(size = 10000) {
    const data = Array.from({ length: size }, (_, i) => ({
      id: i,
      name: `item_${i}`,
      metadata: {
        created: new Date().toISOString(),
        tags: ['tag1', 'tag2', 'tag3'],
        scores: [Math.random(), Math.random(), Math.random()]
      }
    }));

    const start = process.hrtime.bigint();
    const cloned = JSON.parse(JSON.stringify(data));
    const end = process.hrtime.bigint();
    return Number(end - start) / 1e6; // ms
  }
}

class AsyncOperations {
  /**
   * Simulated async operation
   * Tests promise handling overhead
   */
  static async asyncBatch(count = 100, delayMs = 5) {
    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    const start = process.hrtime.bigint();
    const promises = Array.from({ length: count }, () => delay(delayMs));
    await Promise.all(promises);
    const end = process.hrtime.bigint();

    // Return overhead (total - expected delay)
    const total = Number(end - start) / 1e6;
    return total - delayMs; // Just the overhead
  }

  /**
   * Event loop stress test
   * Tests event loop processing
   */
  static async eventLoopStress(iterations = 10000) {
    const start = process.hrtime.bigint();

    await new Promise(resolve => {
      let count = 0;
      const tick = () => {
        count++;
        if (count >= iterations) {
          resolve();
        } else {
          setImmediate(tick);
        }
      };
      tick();
    });

    const end = process.hrtime.bigint();
    return Number(end - start) / 1e6; // ms
  }
}

class MemoryOperations {
  /**
   * Memory allocation test
   * Tests allocator performance
   */
  static memoryAllocation(allocations = 10000, size = 1000) {
    const start = process.hrtime.bigint();
    const arrays = [];
    for (let i = 0; i < allocations; i++) {
      arrays.push(new Array(size).fill(i));
    }
    const end = process.hrtime.bigint();

    // Clear for GC
    arrays.length = 0;

    return Number(end - start) / 1e6; // ms
  }

  /**
   * Buffer operations
   * Tests Buffer allocation and operations
   */
  static bufferOperations(size = 1024 * 1024, iterations = 100) {
    const start = process.hrtime.bigint();

    for (let i = 0; i < iterations; i++) {
      const buf = Buffer.alloc(size);
      buf.fill(0xff);
      const copy = Buffer.from(buf);
    }

    const end = process.hrtime.bigint();
    return Number(end - start) / 1e6; // ms
  }
}

module.exports = {
  DataOperations,
  AsyncOperations,
  MemoryOperations
};
