/**
 * Benchmark Runner
 * Executes benchmarks and collects statistical data
 */

const { DataOperations, AsyncOperations, MemoryOperations } = require('./operations');

class BenchmarkRunner {
  constructor(options = {}) {
    this.warmupRuns = options.warmupRuns || 3;
    this.sampleRuns = options.sampleRuns || 10;
    this.outlierThreshold = options.outlierThreshold || 2; // Standard deviations
  }

  /**
   * Run a single benchmark multiple times and collect statistics
   */
  async runBenchmark(name, fn, isAsync = false) {
    const results = [];

    // Warmup runs (not counted)
    for (let i = 0; i < this.warmupRuns; i++) {
      if (isAsync) {
        await fn();
      } else {
        fn();
      }
    }

    // Sample runs
    for (let i = 0; i < this.sampleRuns; i++) {
      const duration = isAsync ? await fn() : fn();
      results.push(duration);
    }

    return this.calculateStats(name, results);
  }

  /**
   * Calculate statistical measures
   */
  calculateStats(name, samples) {
    const sorted = [...samples].sort((a, b) => a - b);
    const n = sorted.length;

    const sum = sorted.reduce((a, b) => a + b, 0);
    const mean = sum / n;

    const squaredDiffs = sorted.map(x => Math.pow(x - mean, 2));
    const variance = squaredDiffs.reduce((a, b) => a + b, 0) / n;
    const stdDev = Math.sqrt(variance);

    const median = n % 2 === 0
      ? (sorted[n/2 - 1] + sorted[n/2]) / 2
      : sorted[Math.floor(n/2)];

    const p95Index = Math.floor(n * 0.95);
    const p99Index = Math.floor(n * 0.99);

    // Remove outliers for adjusted mean
    const filtered = sorted.filter(
      x => Math.abs(x - mean) <= this.outlierThreshold * stdDev
    );
    const adjustedMean = filtered.length > 0
      ? filtered.reduce((a, b) => a + b, 0) / filtered.length
      : mean;

    return {
      name,
      samples: n,
      min: sorted[0],
      max: sorted[n - 1],
      mean,
      median,
      stdDev,
      p95: sorted[p95Index] || sorted[n - 1],
      p99: sorted[p99Index] || sorted[n - 1],
      adjustedMean,
      outliers: samples.length - filtered.length,
      raw: samples
    };
  }

  /**
   * Run all benchmarks
   */
  async runAll() {
    const results = {
      timestamp: new Date().toISOString(),
      environment: {
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch
      },
      benchmarks: {}
    };

    console.log('Running benchmarks...\n');

    // Data Operations
    console.log('Data Operations:');

    results.benchmarks.sortArray = await this.runBenchmark(
      'sortArray',
      () => DataOperations.sortArray(10000)
    );
    console.log(`  sortArray: ${results.benchmarks.sortArray.mean.toFixed(2)}ms (±${results.benchmarks.sortArray.stdDev.toFixed(2)})`);

    results.benchmarks.objectLookup = await this.runBenchmark(
      'objectLookup',
      () => DataOperations.objectLookup(100000, 10000)
    );
    console.log(`  objectLookup: ${results.benchmarks.objectLookup.mean.toFixed(2)}ms`);

    results.benchmarks.filterArray = await this.runBenchmark(
      'filterArray',
      () => DataOperations.filterArray(100000)
    );
    console.log(`  filterArray: ${results.benchmarks.filterArray.mean.toFixed(2)}ms`);

    results.benchmarks.stringConcat = await this.runBenchmark(
      'stringConcat',
      () => DataOperations.stringConcat(50000)
    );
    console.log(`  stringConcat: ${results.benchmarks.stringConcat.mean.toFixed(2)}ms`);

    results.benchmarks.jsonSerialize = await this.runBenchmark(
      'jsonSerialize',
      () => DataOperations.jsonSerialize(4, 8)
    );
    console.log(`  jsonSerialize: ${results.benchmarks.jsonSerialize.mean.toFixed(2)}ms`);

    results.benchmarks.regexMatch = await this.runBenchmark(
      'regexMatch',
      () => DataOperations.regexMatch(100000)
    );
    console.log(`  regexMatch: ${results.benchmarks.regexMatch.mean.toFixed(2)}ms`);

    results.benchmarks.deepClone = await this.runBenchmark(
      'deepClone',
      () => DataOperations.deepClone(5000)
    );
    console.log(`  deepClone: ${results.benchmarks.deepClone.mean.toFixed(2)}ms`);

    // Async Operations
    console.log('\nAsync Operations:');

    results.benchmarks.asyncBatch = await this.runBenchmark(
      'asyncBatch',
      () => AsyncOperations.asyncBatch(50, 2),
      true
    );
    console.log(`  asyncBatch: ${results.benchmarks.asyncBatch.mean.toFixed(2)}ms overhead`);

    results.benchmarks.eventLoopStress = await this.runBenchmark(
      'eventLoopStress',
      () => AsyncOperations.eventLoopStress(5000),
      true
    );
    console.log(`  eventLoopStress: ${results.benchmarks.eventLoopStress.mean.toFixed(2)}ms`);

    // Memory Operations
    console.log('\nMemory Operations:');

    results.benchmarks.memoryAllocation = await this.runBenchmark(
      'memoryAllocation',
      () => MemoryOperations.memoryAllocation(5000, 500)
    );
    console.log(`  memoryAllocation: ${results.benchmarks.memoryAllocation.mean.toFixed(2)}ms`);

    results.benchmarks.bufferOperations = await this.runBenchmark(
      'bufferOperations',
      () => MemoryOperations.bufferOperations(512 * 1024, 50)
    );
    console.log(`  bufferOperations: ${results.benchmarks.bufferOperations.mean.toFixed(2)}ms`);

    console.log('\nBenchmarks complete.');

    return results;
  }

  /**
   * Compare current results to baseline
   */
  compareToBaseline(current, baseline) {
    if (!baseline || !baseline.benchmarks) {
      return { hasBaseline: false };
    }

    const comparisons = {};
    const regressions = [];
    const improvements = [];

    for (const [name, currentStats] of Object.entries(current.benchmarks)) {
      const baselineStats = baseline.benchmarks[name];
      if (!baselineStats) continue;

      const ratio = currentStats.mean / baselineStats.mean;
      const change = ((ratio - 1) * 100).toFixed(1);

      let status = 'stable';
      if (ratio > 1.5) status = 'regression';
      else if (ratio < 0.8) status = 'improvement';

      comparisons[name] = {
        current: currentStats.mean,
        baseline: baselineStats.mean,
        ratio,
        change: parseFloat(change),
        status
      };

      if (status === 'regression') {
        regressions.push({ name, ...comparisons[name] });
      } else if (status === 'improvement') {
        improvements.push({ name, ...comparisons[name] });
      }
    }

    return {
      hasBaseline: true,
      comparisons,
      regressions,
      improvements,
      summary: {
        total: Object.keys(comparisons).length,
        regressions: regressions.length,
        improvements: improvements.length,
        stable: Object.keys(comparisons).length - regressions.length - improvements.length
      }
    };
  }

  /**
   * Format results for memory storage
   */
  formatForMemory(results, buildInfo = {}) {
    const benchmarkSummary = {};
    for (const [name, stats] of Object.entries(results.benchmarks)) {
      benchmarkSummary[name] = {
        mean: stats.mean,
        p95: stats.p95,
        stdDev: stats.stdDev
      };
    }

    return {
      dataset: 'ci-performance-baselines',
      content: `Performance baseline for ${buildInfo.repo || 'unknown'}`,
      metadata: {
        repository: buildInfo.repo,
        branch: buildInfo.branch,
        commit: buildInfo.commit,
        buildNum: buildInfo.buildNum,
        nodeVersion: results.environment.nodeVersion,
        platform: results.environment.platform,
        benchmarks: benchmarkSummary,
        timestamp: results.timestamp
      }
    };
  }
}

module.exports = { BenchmarkRunner };
