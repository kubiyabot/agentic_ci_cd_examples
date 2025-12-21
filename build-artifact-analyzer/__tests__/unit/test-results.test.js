/**
 * Test Results Analyzer Tests
 */

const { TestResultsAnalyzer } = require('../../src/analyzers/test-results');

describe('TestResultsAnalyzer', () => {
  let analyzer;

  beforeEach(() => {
    analyzer = new TestResultsAnalyzer({
      slowTestMs: 1000,
      verySlowTestMs: 5000
    });
  });

  describe('analyze', () => {
    it('should extract summary from jest results', () => {
      const jestResults = {
        numTotalTests: 10,
        numPassedTests: 8,
        numFailedTests: 2,
        numPendingTests: 0,
        numTotalTestSuites: 3,
        numPassedTestSuites: 2,
        numFailedTestSuites: 1,
        success: false,
        startTime: Date.now(),
        testResults: []
      };

      const result = analyzer.analyze(jestResults);

      expect(result.summary.numTotalTests).toBe(10);
      expect(result.summary.numPassedTests).toBe(8);
      expect(result.summary.numFailedTests).toBe(2);
    });

    it('should throw on invalid input', () => {
      expect(() => analyzer.analyze(null)).toThrow('Invalid Jest results format');
      expect(() => analyzer.analyze({})).toThrow('Invalid Jest results format');
    });

    it('should extract test details', () => {
      const jestResults = {
        numTotalTests: 2,
        numPassedTests: 1,
        numFailedTests: 1,
        testResults: [{
          name: 'test-suite.js',
          perfStats: { runtime: 1500 },
          assertionResults: [
            { fullName: 'should pass', status: 'passed', duration: 100 },
            { fullName: 'should fail', status: 'failed', duration: 200, failureMessages: ['Error'] }
          ]
        }]
      };

      const result = analyzer.analyze(jestResults);

      expect(result.testDetails).toHaveLength(2);
      expect(result.testDetails[0].status).toBe('passed');
      expect(result.testDetails[1].status).toBe('failed');
    });
  });

  describe('findSlowTests', () => {
    it('should identify slow tests', () => {
      const testDetails = [
        { testName: 'fast test', duration: 100 },
        { testName: 'slow test', duration: 2000 },
        { testName: 'very slow test', duration: 6000 }
      ];

      const result = analyzer.findSlowTests(testDetails);

      expect(result.slow).toHaveLength(1);
      expect(result.verySlow).toHaveLength(1);
      expect(result.total).toBe(2);
    });

    it('should categorize by severity', () => {
      const testDetails = [
        { testName: 'very slow', duration: 8000 }
      ];

      const result = analyzer.findSlowTests(testDetails);

      expect(result.verySlow[0].severity).toBe('critical');
    });
  });

  describe('extractFailures', () => {
    it('should extract failure details', () => {
      const jestResults = {
        testResults: [{
          name: 'suite.js',
          assertionResults: [
            { fullName: 'test 1', status: 'failed', failureMessages: ['timeout error'] },
            { fullName: 'test 2', status: 'passed', failureMessages: [] }
          ]
        }]
      };

      const result = analyzer.extractFailures(jestResults);

      expect(result).toHaveLength(1);
      expect(result[0].testName).toBe('test 1');
      expect(result[0].category).toBe('TIMEOUT');
    });
  });

  describe('categorizeFailure', () => {
    it('should categorize timeout failures', () => {
      expect(analyzer.categorizeFailure(['Request timeout after 5000ms'])).toBe('TIMEOUT');
    });

    it('should categorize connection failures', () => {
      expect(analyzer.categorizeFailure(['ECONNREFUSED: Connection refused'])).toBe('CONNECTION');
    });

    it('should categorize assertion failures', () => {
      expect(analyzer.categorizeFailure(['expect(received).toBe(expected)'])).toBe('ASSERTION');
    });

    it('should return UNKNOWN for unrecognized patterns', () => {
      expect(analyzer.categorizeFailure(['Something weird happened'])).toBe('UNKNOWN');
    });
  });

  describe('generateRecommendations', () => {
    it('should recommend action for high failure rate', () => {
      const summary = { numTotalTests: 10, numFailedTests: 5 };
      const result = analyzer.generateRecommendations({ summary, slowTests: { slow: [], verySlow: [] }, failures: [] });

      expect(result.some(r => r.type === 'FAILURE_RATE')).toBe(true);
    });

    it('should recommend action for very slow tests', () => {
      const summary = { numTotalTests: 10, numFailedTests: 0 };
      const slowTests = { slow: [], verySlow: [{ name: 'slow test', duration: 6000 }], total: 1 };

      const result = analyzer.generateRecommendations({ summary, slowTests, failures: [] });

      expect(result.some(r => r.type === 'SLOW_TESTS' && r.severity === 'high')).toBe(true);
    });

    it('should recommend action for timeout failures', () => {
      const summary = { numTotalTests: 10, numFailedTests: 1 };
      const failures = [{ testName: 'test', category: 'TIMEOUT' }];

      const result = analyzer.generateRecommendations({
        summary,
        slowTests: { slow: [], verySlow: [], total: 0 },
        failures
      });

      expect(result.some(r => r.type === 'TIMEOUT_FAILURES')).toBe(true);
    });
  });

  describe('calculateTrends', () => {
    it('should group by status', () => {
      const testDetails = [
        { status: 'passed', suiteName: 'a' },
        { status: 'passed', suiteName: 'a' },
        { status: 'failed', suiteName: 'b' }
      ];

      const trends = analyzer.calculateTrends(testDetails);

      expect(trends.byStatus.passed).toBe(2);
      expect(trends.byStatus.failed).toBe(1);
    });

    it('should group by suite', () => {
      const testDetails = [
        { status: 'passed', suiteName: 'suite-a', duration: 100 },
        { status: 'passed', suiteName: 'suite-a', duration: 200 },
        { status: 'failed', suiteName: 'suite-b', duration: 300 }
      ];

      const trends = analyzer.calculateTrends(testDetails);

      expect(trends.bySuite['suite-a'].passed).toBe(2);
      expect(trends.bySuite['suite-a'].duration).toBe(300);
      expect(trends.bySuite['suite-b'].failed).toBe(1);
    });
  });
});
