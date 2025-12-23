/**
 * Test Results Analyzer
 * Parses Jest JSON output and extracts insights
 */

class TestResultsAnalyzer {
  constructor(options = {}) {
    this.thresholds = {
      slowTest: options.slowTestMs || 1000,
      verySlowTest: options.verySlowTestMs || 5000,
      acceptableFailRate: options.acceptableFailRate || 0.05
    };
  }

  analyze(jestResults) {
    // Validate input structure
    if (!jestResults || typeof jestResults !== 'object') {
      throw new Error('Invalid Jest results format: must be a non-null object');
    }

    if (!jestResults.testResults || !Array.isArray(jestResults.testResults)) {
      throw new Error('Invalid Jest results format: testResults must be an array');
    }

    const summary = this.extractSummary(jestResults);
    const testDetails = this.extractTestDetails(jestResults);
    const slowTests = this.findSlowTests(testDetails);
    const failures = this.extractFailures(jestResults);
    const trends = this.calculateTrends(testDetails);

    return {
      summary,
      testDetails,
      slowTests,
      failures,
      trends,
      recommendations: this.generateRecommendations({ summary, slowTests, failures })
    };
  }

  extractSummary(results) {
    return {
      numTotalTests: results.numTotalTests || 0,
      numPassedTests: results.numPassedTests || 0,
      numFailedTests: results.numFailedTests || 0,
      numPendingTests: results.numPendingTests || 0,
      numTotalTestSuites: results.numTotalTestSuites || 0,
      numPassedTestSuites: results.numPassedTestSuites || 0,
      numFailedTestSuites: results.numFailedTestSuites || 0,
      startTime: results.startTime,
      success: results.success,
      totalDurationMs: this.calculateTotalDuration(results)
    };
  }

  calculateTotalDuration(results) {
    if (!results.testResults) return 0;
    return results.testResults.reduce((total, suite) => {
      const runtime = suite.perfStats?.runtime || suite.perfStats?.end - suite.perfStats?.start || 0;
      return total + runtime;
    }, 0);
  }

  extractTestDetails(results) {
    const details = [];

    for (const suite of results.testResults || []) {
      const suiteName = suite.name || 'unknown';
      const suiteRuntime = suite.perfStats?.runtime || 0;

      for (const test of suite.assertionResults || []) {
        details.push({
          suiteName,
          testName: test.fullName || test.title,
          status: test.status,
          duration: test.duration || 0,
          ancestorTitles: test.ancestorTitles || [],
          failureMessages: test.failureMessages || []
        });
      }
    }

    return details;
  }

  findSlowTests(testDetails) {
    const slow = [];
    const verySlow = [];

    for (const test of testDetails) {
      if (test.duration >= this.thresholds.verySlowTest) {
        verySlow.push({
          name: test.testName,
          suite: test.suiteName,
          duration: test.duration,
          severity: 'critical'
        });
      } else if (test.duration >= this.thresholds.slowTest) {
        slow.push({
          name: test.testName,
          suite: test.suiteName,
          duration: test.duration,
          severity: 'warning'
        });
      }
    }

    return { slow, verySlow, total: slow.length + verySlow.length };
  }

  extractFailures(results) {
    const failures = [];

    for (const suite of results.testResults || []) {
      for (const test of suite.assertionResults || []) {
        if (test.status === 'failed') {
          failures.push({
            testName: test.fullName || test.title,
            suiteName: suite.name,
            failureMessages: test.failureMessages || [],
            category: this.categorizeFailure(test.failureMessages)
          });
        }
      }
    }

    return failures;
  }

  categorizeFailure(messages) {
    const combined = messages.join(' ').toLowerCase();

    if (combined.includes('timeout')) return 'TIMEOUT';
    if (combined.includes('econnrefused') || combined.includes('connection')) return 'CONNECTION';
    if (combined.includes('assertion') || combined.includes('expect')) return 'ASSERTION';
    if (combined.includes('undefined') || combined.includes('null')) return 'NULL_REFERENCE';
    if (combined.includes('network')) return 'NETWORK';
    return 'UNKNOWN';
  }

  calculateTrends(testDetails) {
    const byStatus = {};
    const bySuite = {};

    for (const test of testDetails) {
      // By status
      byStatus[test.status] = (byStatus[test.status] || 0) + 1;

      // By suite
      if (!bySuite[test.suiteName]) {
        bySuite[test.suiteName] = { passed: 0, failed: 0, duration: 0 };
      }
      if (test.status === 'passed') bySuite[test.suiteName].passed++;
      if (test.status === 'failed') bySuite[test.suiteName].failed++;
      bySuite[test.suiteName].duration += test.duration || 0;
    }

    return { byStatus, bySuite };
  }

  generateRecommendations({ summary, slowTests, failures }) {
    const recommendations = [];

    // Failure rate check
    const failRate = summary.numFailedTests / summary.numTotalTests;
    if (failRate > this.thresholds.acceptableFailRate) {
      recommendations.push({
        severity: 'high',
        type: 'FAILURE_RATE',
        message: `Failure rate ${(failRate * 100).toFixed(1)}% exceeds threshold`,
        action: 'Investigate failing tests and address root causes'
      });
    }

    // Slow tests
    if (slowTests.verySlow.length > 0) {
      recommendations.push({
        severity: 'high',
        type: 'SLOW_TESTS',
        message: `${slowTests.verySlow.length} critically slow tests (>5s)`,
        tests: slowTests.verySlow.map(t => t.name),
        action: 'Optimize or parallelize these tests'
      });
    }

    if (slowTests.slow.length > 5) {
      recommendations.push({
        severity: 'medium',
        type: 'SLOW_TESTS',
        message: `${slowTests.slow.length} slow tests (>1s)`,
        action: 'Consider optimizing test setup/teardown'
      });
    }

    // Failure categories
    const timeoutFailures = failures.filter(f => f.category === 'TIMEOUT');
    if (timeoutFailures.length > 0) {
      recommendations.push({
        severity: 'high',
        type: 'TIMEOUT_FAILURES',
        message: `${timeoutFailures.length} timeout failures detected`,
        action: 'Increase timeouts or mock slow dependencies'
      });
    }

    const connectionFailures = failures.filter(f => f.category === 'CONNECTION');
    if (connectionFailures.length > 0) {
      recommendations.push({
        severity: 'high',
        type: 'CONNECTION_FAILURES',
        message: `${connectionFailures.length} connection failures`,
        action: 'Check external service availability or add retry logic'
      });
    }

    return recommendations;
  }
}

module.exports = { TestResultsAnalyzer };
