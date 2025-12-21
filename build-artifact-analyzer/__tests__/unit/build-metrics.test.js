/**
 * Build Metrics Analyzer Tests
 */

const { BuildMetricsAnalyzer } = require('../../src/analyzers/build-metrics');

describe('BuildMetricsAnalyzer', () => {
  let analyzer;

  beforeEach(() => {
    analyzer = new BuildMetricsAnalyzer({
      baselineWindow: 5,
      regressionThreshold: 1.5,
      improvementThreshold: 0.8
    });
  });

  describe('extractMetrics', () => {
    it('should extract all metrics from build', () => {
      const build = {
        totalDuration: 60000,
        testDuration: 45000,
        buildDuration: 10000,
        testsRun: 100,
        testsPassed: 95,
        testsFailed: 5,
        coverage: 85
      };

      const metrics = analyzer.extractMetrics(build);

      expect(metrics.totalDuration).toBe(60000);
      expect(metrics.testDuration).toBe(45000);
      expect(metrics.testsRun).toBe(100);
      expect(metrics.coverage).toBe(85);
    });

    it('should default missing values to 0', () => {
      const metrics = analyzer.extractMetrics({});

      expect(metrics.totalDuration).toBe(0);
      expect(metrics.testsRun).toBe(0);
    });

    it('should include timestamp', () => {
      const metrics = analyzer.extractMetrics({});

      expect(metrics.timestamp).toBeDefined();
    });
  });

  describe('calculateBaseline', () => {
    it('should return null for empty history', () => {
      const baseline = analyzer.calculateBaseline([]);

      expect(baseline).toBeNull();
    });

    it('should calculate averages from history', () => {
      const history = [
        { totalDuration: 60000, testDuration: 40000, testsRun: 100 },
        { totalDuration: 70000, testDuration: 50000, testsRun: 100 },
        { totalDuration: 65000, testDuration: 45000, testsRun: 100 }
      ];

      const baseline = analyzer.calculateBaseline(history);

      expect(baseline.avgTotalDuration).toBe(65000);
      expect(baseline.avgTestDuration).toBe(45000);
      expect(baseline.sampleSize).toBe(3);
    });

    it('should calculate p95', () => {
      const history = Array(10).fill(null).map((_, i) => ({
        totalDuration: 60000 + i * 1000,
        testDuration: 40000,
        testsRun: 100
      }));

      const baseline = analyzer.calculateBaseline(history);

      expect(baseline.p95TotalDuration).toBeGreaterThan(baseline.avgTotalDuration);
    });

    it('should use most recent N builds', () => {
      const history = Array(20).fill(null).map((_, i) => ({
        totalDuration: 60000 + i * 1000,
        testDuration: 40000,
        testsRun: 100
      }));

      const baseline = analyzer.calculateBaseline(history);

      // Should only use last 5 (baselineWindow)
      expect(baseline.sampleSize).toBe(5);
    });
  });

  describe('compareToBaseline', () => {
    it('should return hasBaseline: false when no baseline', () => {
      const metrics = { totalDuration: 60000 };
      const result = analyzer.compareToBaseline(metrics, null);

      expect(result.hasBaseline).toBe(false);
    });

    it('should detect regression', () => {
      const metrics = { totalDuration: 100000, testDuration: 70000, coverage: 80 };
      const baseline = { avgTotalDuration: 60000, avgTestDuration: 40000, avgCoverage: 85 };

      const result = analyzer.compareToBaseline(metrics, baseline);

      expect(result.totalDuration.status).toBe('regression');
    });

    it('should detect improvement', () => {
      const metrics = { totalDuration: 40000, testDuration: 30000, coverage: 90 };
      const baseline = { avgTotalDuration: 60000, avgTestDuration: 50000, avgCoverage: 85 };

      const result = analyzer.compareToBaseline(metrics, baseline);

      expect(result.totalDuration.status).toBe('improvement');
    });

    it('should detect stable', () => {
      const metrics = { totalDuration: 62000, testDuration: 42000, coverage: 85 };
      const baseline = { avgTotalDuration: 60000, avgTestDuration: 40000, avgCoverage: 85 };

      const result = analyzer.compareToBaseline(metrics, baseline);

      expect(result.totalDuration.status).toBe('stable');
    });

    it('should calculate percentage change', () => {
      const metrics = { totalDuration: 72000, testDuration: 48000, coverage: 85 };
      const baseline = { avgTotalDuration: 60000, avgTestDuration: 40000, avgCoverage: 85 };

      const result = analyzer.compareToBaseline(metrics, baseline);

      expect(result.totalDuration.change).toBe(20); // 20% increase
    });
  });

  describe('analyzeTrends', () => {
    it('should return hasTrend: false for insufficient data', () => {
      const result = analyzer.analyzeTrends([{ totalDuration: 60000 }]);

      expect(result.hasTrend).toBe(false);
    });

    it('should detect increasing duration trend', () => {
      const history = [
        { totalDuration: 50000, coverage: 80 },
        { totalDuration: 60000, coverage: 80 },
        { totalDuration: 70000, coverage: 80 },
        { totalDuration: 80000, coverage: 80 }
      ];

      const result = analyzer.analyzeTrends(history);

      expect(result.duration.direction).toBe('increasing');
    });

    it('should detect decreasing coverage trend', () => {
      const history = [
        { totalDuration: 60000, coverage: 90 },
        { totalDuration: 60000, coverage: 85 },
        { totalDuration: 60000, coverage: 80 },
        { totalDuration: 60000, coverage: 75 }
      ];

      const result = analyzer.analyzeTrends(history);

      expect(result.coverage.direction).toBe('declining');
    });
  });

  describe('detectAnomalies', () => {
    it('should detect duration spike', () => {
      const metrics = { totalDuration: 100000, testsRun: 100, coverage: 85 };
      const baseline = { p95TotalDuration: 70000, avgTestsRun: 100, avgCoverage: 85 };

      const anomalies = analyzer.detectAnomalies(metrics, baseline);

      expect(anomalies.some(a => a.type === 'DURATION_SPIKE')).toBe(true);
    });

    it('should detect test count change', () => {
      const metrics = { totalDuration: 60000, testsRun: 150, coverage: 85 };
      const baseline = { p95TotalDuration: 70000, avgTestsRun: 100, avgCoverage: 85 };

      const anomalies = analyzer.detectAnomalies(metrics, baseline);

      expect(anomalies.some(a => a.type === 'TEST_COUNT_INCREASE')).toBe(true);
    });

    it('should detect coverage drop', () => {
      const metrics = { totalDuration: 60000, testsRun: 100, coverage: 70 };
      const baseline = { p95TotalDuration: 70000, avgTestsRun: 100, avgCoverage: 85 };

      const anomalies = analyzer.detectAnomalies(metrics, baseline);

      expect(anomalies.some(a => a.type === 'COVERAGE_DROP')).toBe(true);
    });

    it('should return empty array when no baseline', () => {
      const anomalies = analyzer.detectAnomalies({}, null);

      expect(anomalies).toEqual([]);
    });
  });

  describe('formatForMemory', () => {
    it('should format analysis for memory storage', () => {
      const analysis = {
        current: {
          totalDuration: 60000,
          testDuration: 45000,
          testsRun: 100,
          testsPassed: 95,
          testsFailed: 5,
          coverage: 85
        },
        comparison: { hasBaseline: true, totalDuration: { status: 'stable' } },
        anomalies: []
      };

      const buildInfo = {
        repo: 'test-repo',
        branch: 'main',
        buildNum: 123,
        commit: 'abc123'
      };

      const result = analyzer.formatForMemory(analysis, buildInfo);

      expect(result.dataset).toBe('ci-build-history');
      expect(result.metadata.repository).toBe('test-repo');
      expect(result.metadata.buildNum).toBe(123);
      expect(result.metadata.totalDuration).toBe(60000);
    });
  });

  describe('full analysis', () => {
    it('should run complete analysis', () => {
      const currentBuild = {
        totalDuration: 65000,
        testDuration: 45000,
        testsRun: 100,
        testsPassed: 98,
        testsFailed: 2,
        coverage: 82
      };

      const history = [
        { totalDuration: 60000, testDuration: 40000, testsRun: 100, coverage: 85 },
        { totalDuration: 62000, testDuration: 42000, testsRun: 100, coverage: 84 },
        { totalDuration: 58000, testDuration: 38000, testsRun: 100, coverage: 86 }
      ];

      const result = analyzer.analyze(currentBuild, history);

      expect(result.current).toBeDefined();
      expect(result.baseline).toBeDefined();
      expect(result.comparison).toBeDefined();
      expect(result.trends).toBeDefined();
      expect(result.anomalies).toBeDefined();
      expect(result.recommendations).toBeDefined();
    });
  });
});
