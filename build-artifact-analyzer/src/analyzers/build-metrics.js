/**
 * Build Metrics Analyzer
 * Tracks and analyzes build performance over time
 */

class BuildMetricsAnalyzer {
  constructor(options = {}) {
    this.baselineWindow = options.baselineWindow || 10; // Last N builds for baseline
    this.regressionThreshold = options.regressionThreshold || 1.5; // 50% slower = regression
    this.improvementThreshold = options.improvementThreshold || 0.8; // 20% faster = improvement
  }

  analyze(currentBuild, historicalBuilds = []) {
    // Validate input
    if (!currentBuild || typeof currentBuild !== 'object') {
      throw new Error('Invalid currentBuild: must be a non-null object');
    }

    if (!Array.isArray(historicalBuilds)) {
      throw new Error('Invalid historicalBuilds: must be an array');
    }

    const metrics = this.extractMetrics(currentBuild);
    const baseline = this.calculateBaseline(historicalBuilds);
    const comparison = this.compareToBaseline(metrics, baseline);
    const trends = this.analyzeTrends(historicalBuilds);

    return {
      current: metrics,
      baseline,
      comparison,
      trends,
      anomalies: this.detectAnomalies(metrics, baseline),
      recommendations: this.generateRecommendations({ metrics, comparison, trends })
    };
  }

  extractMetrics(build) {
    return {
      totalDuration: build.totalDuration || 0,
      testDuration: build.testDuration || 0,
      buildDuration: build.buildDuration || 0,
      lintDuration: build.lintDuration || 0,
      installDuration: build.installDuration || 0,
      testsRun: build.testsRun || 0,
      testsPassed: build.testsPassed || 0,
      testsFailed: build.testsFailed || 0,
      coverage: build.coverage || 0,
      timestamp: build.timestamp || Date.now()
    };
  }

  calculateBaseline(historicalBuilds) {
    if (historicalBuilds.length === 0) {
      return null;
    }

    // Take the most recent N builds
    const recentBuilds = historicalBuilds
      .slice(-this.baselineWindow)
      .map(b => this.extractMetrics(b));

    const avg = (arr, key) => arr.reduce((sum, b) => sum + (b[key] || 0), 0) / arr.length;
    const p95 = (arr, key) => {
      const sorted = arr.map(b => b[key] || 0).sort((a, b) => a - b);
      const idx = Math.floor(sorted.length * 0.95);
      return sorted[idx] || sorted[sorted.length - 1];
    };

    return {
      avgTotalDuration: avg(recentBuilds, 'totalDuration'),
      avgTestDuration: avg(recentBuilds, 'testDuration'),
      avgBuildDuration: avg(recentBuilds, 'buildDuration'),
      p95TotalDuration: p95(recentBuilds, 'totalDuration'),
      p95TestDuration: p95(recentBuilds, 'testDuration'),
      avgTestsRun: avg(recentBuilds, 'testsRun'),
      avgCoverage: avg(recentBuilds, 'coverage'),
      sampleSize: recentBuilds.length
    };
  }

  compareToBaseline(metrics, baseline) {
    if (!baseline) {
      return { hasBaseline: false };
    }

    const ratio = (current, base) => base > 0 ? current / base : 1;
    const change = (current, base) => base > 0 ? ((current - base) / base * 100) : 0;

    return {
      hasBaseline: true,
      totalDuration: {
        ratio: ratio(metrics.totalDuration, baseline.avgTotalDuration),
        change: change(metrics.totalDuration, baseline.avgTotalDuration),
        status: this.getStatus(ratio(metrics.totalDuration, baseline.avgTotalDuration))
      },
      testDuration: {
        ratio: ratio(metrics.testDuration, baseline.avgTestDuration),
        change: change(metrics.testDuration, baseline.avgTestDuration),
        status: this.getStatus(ratio(metrics.testDuration, baseline.avgTestDuration))
      },
      coverage: {
        current: metrics.coverage,
        baseline: baseline.avgCoverage,
        change: metrics.coverage - baseline.avgCoverage,
        status: metrics.coverage >= baseline.avgCoverage ? 'good' : 'regression'
      }
    };
  }

  getStatus(ratio) {
    if (ratio >= this.regressionThreshold) return 'regression';
    if (ratio <= this.improvementThreshold) return 'improvement';
    return 'stable';
  }

  analyzeTrends(historicalBuilds) {
    if (historicalBuilds.length < 3) {
      return { hasTrend: false };
    }

    const metrics = historicalBuilds.map(b => this.extractMetrics(b));

    // Simple linear regression for duration trend
    const durations = metrics.map((m, i) => ({ x: i, y: m.totalDuration }));
    const slope = this.calculateSlope(durations);

    // Coverage trend
    const coverages = metrics.map((m, i) => ({ x: i, y: m.coverage }));
    const coverageSlope = this.calculateSlope(coverages);

    return {
      hasTrend: true,
      duration: {
        slope,
        direction: slope > 100 ? 'increasing' : slope < -100 ? 'decreasing' : 'stable',
        message: slope > 100
          ? 'Build duration is trending up'
          : slope < -100
          ? 'Build duration is improving'
          : 'Build duration is stable'
      },
      coverage: {
        slope: coverageSlope,
        direction: coverageSlope > 0.5 ? 'improving' : coverageSlope < -0.5 ? 'declining' : 'stable',
        message: coverageSlope > 0.5
          ? 'Coverage is trending up'
          : coverageSlope < -0.5
          ? 'Coverage is declining - attention needed'
          : 'Coverage is stable'
      }
    };
  }

  calculateSlope(points) {
    if (points.length < 2) return 0;

    const n = points.length;
    const sumX = points.reduce((s, p) => s + p.x, 0);
    const sumY = points.reduce((s, p) => s + p.y, 0);
    const sumXY = points.reduce((s, p) => s + p.x * p.y, 0);
    const sumXX = points.reduce((s, p) => s + p.x * p.x, 0);

    return (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  }

  detectAnomalies(metrics, baseline) {
    const anomalies = [];

    if (!baseline) return anomalies;

    // Duration spike
    if (metrics.totalDuration > baseline.p95TotalDuration * 1.2) {
      anomalies.push({
        type: 'DURATION_SPIKE',
        severity: 'high',
        message: `Build duration ${metrics.totalDuration}ms exceeds p95 baseline by >20%`,
        expected: baseline.p95TotalDuration,
        actual: metrics.totalDuration
      });
    }

    // Test count change
    const testDiff = metrics.testsRun - baseline.avgTestsRun;
    if (Math.abs(testDiff) > baseline.avgTestsRun * 0.1) {
      anomalies.push({
        type: testDiff > 0 ? 'TEST_COUNT_INCREASE' : 'TEST_COUNT_DECREASE',
        severity: 'medium',
        message: `Test count changed by ${testDiff.toFixed(0)} (${(testDiff/baseline.avgTestsRun*100).toFixed(1)}%)`,
        expected: baseline.avgTestsRun,
        actual: metrics.testsRun
      });
    }

    // Coverage drop
    if (metrics.coverage < baseline.avgCoverage - 5) {
      anomalies.push({
        type: 'COVERAGE_DROP',
        severity: 'high',
        message: `Coverage dropped from ${baseline.avgCoverage.toFixed(1)}% to ${metrics.coverage.toFixed(1)}%`,
        expected: baseline.avgCoverage,
        actual: metrics.coverage
      });
    }

    return anomalies;
  }

  generateRecommendations({ metrics, comparison, trends }) {
    const recommendations = [];

    if (comparison.hasBaseline) {
      if (comparison.totalDuration.status === 'regression') {
        recommendations.push({
          severity: 'high',
          type: 'PERFORMANCE_REGRESSION',
          message: `Build is ${comparison.totalDuration.change.toFixed(1)}% slower than baseline`,
          action: 'Investigate recent changes for performance impact'
        });
      }

      if (comparison.coverage.status === 'regression') {
        recommendations.push({
          severity: 'medium',
          type: 'COVERAGE_REGRESSION',
          message: `Coverage dropped by ${Math.abs(comparison.coverage.change).toFixed(1)}%`,
          action: 'Add tests for new code paths'
        });
      }
    }

    if (trends.hasTrend) {
      if (trends.duration.direction === 'increasing') {
        recommendations.push({
          severity: 'medium',
          type: 'DURATION_TREND',
          message: 'Build duration has been increasing over time',
          action: 'Review test suite for optimization opportunities'
        });
      }

      if (trends.coverage.direction === 'declining') {
        recommendations.push({
          severity: 'high',
          type: 'COVERAGE_TREND',
          message: 'Code coverage has been declining',
          action: 'Enforce coverage requirements in CI'
        });
      }
    }

    return recommendations;
  }

  formatForMemory(analysis, buildInfo = {}) {
    return {
      dataset: 'ci-build-history',
      content: `Build #${buildInfo.buildNum || 'N/A'} for ${buildInfo.repo || 'unknown'}`,
      metadata: {
        repository: buildInfo.repo,
        branch: buildInfo.branch,
        buildNum: buildInfo.buildNum,
        commit: buildInfo.commit,
        totalDuration: analysis.current.totalDuration,
        testDuration: analysis.current.testDuration,
        testsRun: analysis.current.testsRun,
        testsPassed: analysis.current.testsPassed,
        testsFailed: analysis.current.testsFailed,
        coverage: analysis.current.coverage,
        status: analysis.comparison.hasBaseline
          ? analysis.comparison.totalDuration.status
          : 'no_baseline',
        anomalyCount: analysis.anomalies.length,
        timestamp: new Date().toISOString()
      }
    };
  }
}

module.exports = { BuildMetricsAnalyzer };
