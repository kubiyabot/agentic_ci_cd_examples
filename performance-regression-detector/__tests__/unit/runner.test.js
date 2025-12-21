/**
 * Benchmark Runner Tests
 */

const { BenchmarkRunner } = require('../../src/benchmarks/runner');

describe('BenchmarkRunner', () => {
  let runner;

  beforeEach(() => {
    runner = new BenchmarkRunner({
      warmupRuns: 1,
      sampleRuns: 5,
      outlierThreshold: 2
    });
  });

  describe('calculateStats', () => {
    it('should calculate basic statistics', () => {
      const samples = [10, 12, 11, 13, 14];
      const stats = runner.calculateStats('test', samples);

      expect(stats.name).toBe('test');
      expect(stats.samples).toBe(5);
      expect(stats.min).toBe(10);
      expect(stats.max).toBe(14);
      expect(stats.mean).toBe(12);
      expect(stats.median).toBe(12);
    });

    it('should calculate standard deviation', () => {
      const samples = [10, 10, 10, 10, 10];
      const stats = runner.calculateStats('test', samples);

      expect(stats.stdDev).toBe(0);
    });

    it('should identify outliers', () => {
      const samples = [10, 11, 12, 11, 10, 100]; // 100 is outlier
      const stats = runner.calculateStats('test', samples);

      expect(stats.outliers).toBeGreaterThan(0);
    });

    it('should calculate percentiles', () => {
      const samples = Array.from({ length: 100 }, (_, i) => i + 1);
      const stats = runner.calculateStats('test', samples);

      expect(stats.p95).toBeGreaterThanOrEqual(95);
      expect(stats.p99).toBeGreaterThanOrEqual(99);
    });
  });

  describe('runBenchmark', () => {
    it('should run sync benchmark', async () => {
      const fn = () => {
        const start = process.hrtime.bigint();
        for (let i = 0; i < 1000; i++) { /* spin */ }
        const end = process.hrtime.bigint();
        return Number(end - start) / 1e6;
      };

      const stats = await runner.runBenchmark('spinTest', fn);

      expect(stats.name).toBe('spinTest');
      expect(stats.samples).toBe(5);
      expect(stats.mean).toBeGreaterThanOrEqual(0);
    });

    it('should run async benchmark', async () => {
      const fn = async () => {
        const start = Date.now();
        await new Promise(r => setTimeout(r, 5));
        return Date.now() - start;
      };

      const stats = await runner.runBenchmark('asyncTest', fn, true);

      expect(stats.name).toBe('asyncTest');
      expect(stats.mean).toBeGreaterThanOrEqual(5);
    });
  });

  describe('compareToBaseline', () => {
    it('should return hasBaseline: false when no baseline', () => {
      const current = { benchmarks: { test: { mean: 10 } } };
      const result = runner.compareToBaseline(current, null);

      expect(result.hasBaseline).toBe(false);
    });

    it('should detect regression', () => {
      const current = { benchmarks: { test: { mean: 20 } } };
      const baseline = { benchmarks: { test: { mean: 10 } } };

      const result = runner.compareToBaseline(current, baseline);

      expect(result.hasBaseline).toBe(true);
      expect(result.comparisons.test.status).toBe('regression');
      expect(result.regressions).toHaveLength(1);
    });

    it('should detect improvement', () => {
      const current = { benchmarks: { test: { mean: 5 } } };
      const baseline = { benchmarks: { test: { mean: 10 } } };

      const result = runner.compareToBaseline(current, baseline);

      expect(result.comparisons.test.status).toBe('improvement');
      expect(result.improvements).toHaveLength(1);
    });

    it('should detect stable performance', () => {
      const current = { benchmarks: { test: { mean: 10.5 } } };
      const baseline = { benchmarks: { test: { mean: 10 } } };

      const result = runner.compareToBaseline(current, baseline);

      expect(result.comparisons.test.status).toBe('stable');
    });

    it('should calculate percentage change', () => {
      const current = { benchmarks: { test: { mean: 12 } } };
      const baseline = { benchmarks: { test: { mean: 10 } } };

      const result = runner.compareToBaseline(current, baseline);

      expect(result.comparisons.test.change).toBe(20); // 20% increase
    });

    it('should summarize results', () => {
      const current = {
        benchmarks: {
          fast: { mean: 5 },
          stable: { mean: 10 },
          slow: { mean: 20 }
        }
      };
      const baseline = {
        benchmarks: {
          fast: { mean: 10 },
          stable: { mean: 10 },
          slow: { mean: 10 }
        }
      };

      const result = runner.compareToBaseline(current, baseline);

      expect(result.summary.total).toBe(3);
      expect(result.summary.improvements).toBe(1);
      expect(result.summary.regressions).toBe(1);
      expect(result.summary.stable).toBe(1);
    });
  });

  describe('formatForMemory', () => {
    it('should format results for memory storage', () => {
      const results = {
        timestamp: '2024-01-01T00:00:00Z',
        environment: {
          nodeVersion: 'v20.0.0',
          platform: 'linux',
          arch: 'x64'
        },
        benchmarks: {
          test1: { mean: 10, p95: 12, stdDev: 1 },
          test2: { mean: 20, p95: 25, stdDev: 2 }
        }
      };

      const buildInfo = {
        repo: 'test-repo',
        branch: 'main',
        commit: 'abc123',
        buildNum: 42
      };

      const formatted = runner.formatForMemory(results, buildInfo);

      expect(formatted.dataset).toBe('ci-performance-baselines');
      expect(formatted.metadata.repository).toBe('test-repo');
      expect(formatted.metadata.benchmarks.test1.mean).toBe(10);
    });
  });
});
