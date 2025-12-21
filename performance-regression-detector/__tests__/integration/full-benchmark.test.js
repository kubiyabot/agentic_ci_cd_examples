/**
 * Full Benchmark Integration Tests
 * Runs the complete benchmark suite and validates output
 */

const { BenchmarkRunner } = require('../../src/benchmarks/runner');

describe('Full Benchmark Suite', () => {
  let runner;

  beforeAll(() => {
    // Reduced parameters for faster tests
    runner = new BenchmarkRunner({
      warmupRuns: 1,
      sampleRuns: 3,
      outlierThreshold: 2
    });
  });

  it('should run all benchmarks successfully', async () => {
    const results = await runner.runAll();

    expect(results.timestamp).toBeDefined();
    expect(results.environment.nodeVersion).toBeDefined();
    expect(results.benchmarks).toBeDefined();
  }, 60000); // 60 second timeout

  it('should include all expected benchmarks', async () => {
    const results = await runner.runAll();

    const expectedBenchmarks = [
      'sortArray',
      'objectLookup',
      'filterArray',
      'stringConcat',
      'jsonSerialize',
      'regexMatch',
      'deepClone',
      'asyncBatch',
      'eventLoopStress',
      'memoryAllocation',
      'bufferOperations'
    ];

    for (const name of expectedBenchmarks) {
      expect(results.benchmarks[name]).toBeDefined();
      expect(results.benchmarks[name].mean).toBeGreaterThanOrEqual(0);
    }
  }, 60000);

  it('should produce valid statistics for each benchmark', async () => {
    const results = await runner.runAll();

    for (const [name, stats] of Object.entries(results.benchmarks)) {
      expect(stats.samples).toBeGreaterThan(0);
      expect(stats.min).toBeLessThanOrEqual(stats.max);
      expect(stats.mean).toBeGreaterThanOrEqual(stats.min);
      expect(stats.mean).toBeLessThanOrEqual(stats.max);
      expect(stats.p95).toBeGreaterThanOrEqual(stats.median);
    }
  }, 60000);

  it('should compare against baseline correctly', async () => {
    const results1 = await runner.runAll();

    // Simulate baseline (use same results)
    const comparison = runner.compareToBaseline(results1, results1);

    expect(comparison.hasBaseline).toBe(true);

    // Same results should be stable
    for (const [name, comp] of Object.entries(comparison.comparisons)) {
      expect(comp.ratio).toBeCloseTo(1, 1); // Close to 1
    }
  }, 60000);

  it('should format results for memory correctly', async () => {
    const results = await runner.runAll();

    const formatted = runner.formatForMemory(results, {
      repo: 'test-repo',
      branch: 'main',
      commit: 'abc123',
      buildNum: 1
    });

    expect(formatted.dataset).toBe('ci-performance-baselines');
    expect(formatted.metadata.repository).toBe('test-repo');
    expect(formatted.metadata.benchmarks).toBeDefined();
    expect(Object.keys(formatted.metadata.benchmarks).length).toBeGreaterThan(0);
  }, 60000);
});
