/**
 * Flaky Test Detection Post-Processor
 * Analyzes test results to identify potentially flaky patterns
 */

const fs = require('fs');
const path = require('path');

class FlakyTestDetector {
  constructor() {
    this.resultsHistory = this.loadResultsHistory();
    this.flakinessThreshold = 0.1; // 10% failure rate indicates flakiness
    this.minRunsForDetection = 5;
  }

  loadResultsHistory() {
    const historyFile = path.join(__dirname, '../../test-results-history/flaky-detection.json');
    try {
      if (fs.existsSync(historyFile)) {
        return JSON.parse(fs.readFileSync(historyFile, 'utf8'));
      }
    } catch (error) {
      console.warn('Could not load test results history:', error.message);
    }
    return {};
  }

  saveResultsHistory() {
    const historyDir = path.join(__dirname, '../../test-results-history');
    const historyFile = path.join(historyDir, 'flaky-detection.json');

    try {
      if (!fs.existsSync(historyDir)) {
        fs.mkdirSync(historyDir, { recursive: true });
      }
      fs.writeFileSync(historyFile, JSON.stringify(this.resultsHistory, null, 2));
    } catch (error) {
      console.warn('Could not save test results history:', error.message);
    }
  }

  analyzeTestResults(results) {
    const timestamp = new Date().toISOString();

    // Process each test result
    results.testResults.forEach(testFile => {
      testFile.assertionResults.forEach(test => {
        const testFullName = `${testFile.testFilePath}::${test.fullName}`;

        if (!this.resultsHistory[testFullName]) {
          this.resultsHistory[testFullName] = {
            runs: [],
            totalRuns: 0,
            failures: 0,
            flakiness: 0,
            isFlaky: false,
            firstSeen: timestamp
          };
        }

        const testHistory = this.resultsHistory[testFullName];
        const status = test.status === 'passed' ? 'PASS' : 'FAIL';

        // Add this run to history
        testHistory.runs.push({
          status,
          timestamp,
          duration: test.duration,
          errorMessage: test.failureMessages.join('; ') || null
        });

        // Keep only last 50 runs
        if (testHistory.runs.length > 50) {
          testHistory.runs = testHistory.runs.slice(-50);
        }

        // Update statistics
        testHistory.totalRuns = testHistory.runs.length;
        testHistory.failures = testHistory.runs.filter(run => run.status === 'FAIL').length;
        testHistory.flakiness = testHistory.failures / testHistory.totalRuns;

        // Determine if test is flaky
        if (testHistory.totalRuns >= this.minRunsForDetection) {
          testHistory.isFlaky = this.detectFlakiness(testHistory);
        }
      });
    });

    this.saveResultsHistory();
    this.generateReport(results);

    return results;
  }

  detectFlakiness(testHistory) {
    const { runs, flakiness, totalRuns } = testHistory;

    // Not flaky if always passes or always fails
    if (flakiness === 0 || flakiness === 1) {
      return false;
    }

    // Flaky if failure rate is between thresholds and has sufficient runs
    if (flakiness > this.flakinessThreshold &&
        flakiness < (1 - this.flakinessThreshold) &&
        totalRuns >= this.minRunsForDetection) {
      return true;
    }

    // Check for alternating pass/fail patterns
    if (totalRuns >= 6) {
      let alternationCount = 0;
      for (let i = 1; i < runs.length; i++) {
        if (runs[i].status !== runs[i-1].status) {
          alternationCount++;
        }
      }

      // If more than 50% of transitions are alternating, it's likely flaky
      const alternationRate = alternationCount / (runs.length - 1);
      if (alternationRate > 0.5) {
        return true;
      }
    }

    return false;
  }

  generateReport(results) {
    const flakyTests = Object.entries(this.resultsHistory)
      .filter(([_, history]) => history.isFlaky)
      .sort((a, b) => b[1].flakiness - a[1].flakiness);

    if (flakyTests.length > 0) {
      console.log('\n🔄 FLAKY TESTS DETECTED:');
      console.log('========================');

      flakyTests.forEach(([testName, history]) => {
        const fileName = testName.split('::')[0].split('/').pop();
        const testTitle = testName.split('::')[1];
        const flakinessPercent = (history.flakiness * 100).toFixed(1);

        console.log(`\n❌ ${fileName}`);
        console.log(`   Test: ${testTitle}`);
        console.log(`   Flakiness: ${flakinessPercent}% (${history.failures}/${history.totalRuns} failures)`);
        console.log(`   Last failure: ${history.runs.reverse().find(r => r.status === 'FAIL')?.timestamp || 'None'}`);
      });

      console.log('\n💡 RECOMMENDATIONS:');
      console.log('- Review the FLAKY_TEST_ANALYSIS.md for detailed patterns');
      console.log('- Consider running fixed tests: tests/fixed-flaky-tests.test.js');
      console.log('- Check test isolation and remove dependencies on external state');
      console.log('- Mock time-sensitive and network-dependent operations\n');
    }

    // Generate summary statistics
    const totalTests = Object.keys(this.resultsHistory).length;
    const totalFlaky = flakyTests.length;
    const flakyPercentage = totalTests > 0 ? ((totalFlaky / totalTests) * 100).toFixed(1) : 0;

    console.log(`\n📊 TEST STABILITY REPORT:`);
    console.log(`Total Tests: ${totalTests}`);
    console.log(`Flaky Tests: ${totalFlaky} (${flakyPercentage}%)`);
    console.log(`Stable Tests: ${totalTests - totalFlaky}`);

    // Save detailed report
    this.saveDetailedReport(flakyTests, results);
  }

  saveDetailedReport(flakyTests, results) {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalTests: Object.keys(this.resultsHistory).length,
        flakyTests: flakyTests.length,
        stableTests: Object.keys(this.resultsHistory).length - flakyTests.length,
        overallSuccess: results.success
      },
      flakyTests: flakyTests.map(([testName, history]) => ({
        test: testName,
        flakiness: history.flakiness,
        totalRuns: history.totalRuns,
        failures: history.failures,
        recentRuns: history.runs.slice(-10) // Last 10 runs
      })),
      recommendations: [
        'Review FLAKY_TEST_ANALYSIS.md for detailed remediation steps',
        'Use fixed test implementations in tests/fixed-flaky-tests.test.js',
        'Implement proper test isolation and mocking',
        'Consider test categorization and parallel execution strategies'
      ]
    };

    const reportPath = path.join(__dirname, '../../test-results-history/flaky-report.json');
    try {
      fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    } catch (error) {
      console.warn('Could not save detailed flaky test report:', error.message);
    }
  }
}

module.exports = (results) => {
  const detector = new FlakyTestDetector();
  return detector.analyzeTestResults(results);
};