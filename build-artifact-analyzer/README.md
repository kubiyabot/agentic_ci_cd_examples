# Build Artifact Analyzer

**Turn build data into organizational intelligence.**

```bash
kubiya exec "Analyze test results and compare to baseline" --local --cwd . --yes
```

---

## The Problem

Every CI build generates valuable data:
- Test results and durations
- Coverage reports
- Build timing metrics

But this data is **lost after each build**. You can't:
- See if builds are getting slower over time
- Track coverage trends across sprints
- Identify which modules degrade most often

---

## The Solution

Kubiya ingests build artifacts into Cognitive Memory:

1. **Each build** → Metrics stored with full context
2. **Over time** → Baselines calculated automatically
3. **Every run** → Current build compared to history
4. **Trends detected** → Regressions caught early

---

## Quick Start

### 1. Setup

```bash
cd build-artifact-analyzer
npm install

# Ensure API key is set
source ../.env
```

### 2. Run Tests with Analysis

```bash
# Run tests and generate artifacts
npm run test:json

# Analyze against baseline
kubiya exec "
  Read artifacts/test-results.json and analyze:
  - Total tests, passed, failed
  - Duration statistics
  - Compare to previous builds using recall_memory
" --local --cwd . --yes
```

### 3. Ingest to Memory

```bash
kubiya exec "
  Ingest build results to memory:

  1. Parse artifacts/test-results.json
  2. Store the build record:
     store_memory({
       dataset: 'ci-build-history',
       content: 'Build results summary',
       metadata: {
         testsRun: [count],
         testsPassed: [count],
         testsFailed: [count],
         duration: [ms],
         coverage: [percent]
       }
     })
" --local --cwd . --yes
```

---

## Memory Integration Patterns

### Pattern A: CLI Direct Ingestion

```bash
# Run tests
npm run test:json

# Parse and store via CLI
TESTS_RUN=$(jq '.numTotalTests' artifacts/test-results.json)
TESTS_PASSED=$(jq '.numPassedTests' artifacts/test-results.json)

kubiya memory store \
  --title "Build #123: test-repo" \
  --content "Tests: $TESTS_RUN, Passed: $TESTS_PASSED" \
  --dataset-id ci-build-history \
  --tags build,main,test-repo
```

### Pattern B: CLI Recall → Compare → Store

```bash
# Step 1: Recall baseline
BASELINE=$(kubiya memory recall "build history for this repo" \
  --top-k 10 --output json)

# Step 2: Pass to agent for comparison
kubiya exec "
  HISTORICAL DATA:
  $BASELINE

  CURRENT RESULTS:
  $(cat artifacts/test-results.json)

  TASK:
  1. Calculate current metrics
  2. Compare to historical average
  3. Determine: IMPROVEMENT, STABLE, or REGRESSION
  4. Store result with trend analysis
" --local --cwd . --yes
```

### Pattern C: Agent-Native Full Pipeline

```bash
kubiya exec "
  You are a build analyzer with memory capabilities.

  PHASE 1 - RECALL HISTORY:
  recall_memory('build history for this repo')
  recall_memory('performance baselines')

  PHASE 2 - ANALYZE CURRENT:
  Read artifacts/test-results.json
  Calculate: duration, pass rate, coverage

  PHASE 3 - COMPARE:
  Against historical averages:
  - Duration change %
  - Coverage change %
  - Failure rate change

  PHASE 4 - STORE:
  store_memory({
    dataset: 'ci-build-history',
    content: 'Build analysis',
    metadata: {
      duration: [ms],
      coverage: [%],
      passRate: [%],
      trend: 'improving|stable|regressing'
    }
  })

  PHASE 5 - ALERT:
  If regression detected:
  store_memory({
    dataset: 'ci-alerts',
    content: 'Performance regression detected',
    metadata: { severity: 'high', details: '...' }
  })
" --local --cwd . --yes
```

---

## Analyzers

### Test Results Analyzer
```javascript
const { TestResultsAnalyzer } = require('./src/analyzers/test-results');

const analyzer = new TestResultsAnalyzer({ slowTestMs: 1000 });
const results = analyzer.analyze(jestResults);

// Returns:
// - summary: pass/fail counts, duration
// - slowTests: tests exceeding threshold
// - failures: categorized by type (TIMEOUT, CONNECTION, etc.)
// - recommendations: actionable insights
```

### Coverage Analyzer
```javascript
const { CoverageAnalyzer } = require('./src/analyzers/coverage');

const analyzer = new CoverageAnalyzer({ lineThreshold: 80 });
const results = analyzer.analyze(coverageData);

// Returns:
// - summary: line, branch, function coverage
// - riskAreas: files with low coverage
// - meetsThresholds: boolean checks
// - recommendations: where to add tests
```

### Build Metrics Analyzer
```javascript
const { BuildMetricsAnalyzer } = require('./src/analyzers/build-metrics');

const analyzer = new BuildMetricsAnalyzer();
const results = analyzer.analyze(currentBuild, historicalBuilds);

// Returns:
// - baseline: calculated from history
// - comparison: current vs baseline
// - trends: duration/coverage direction
// - anomalies: spikes, drops, unusual patterns
```

---

## Project Structure

```
build-artifact-analyzer/
├── __tests__/
│   └── unit/
│       ├── test-results.test.js
│       ├── coverage.test.js
│       └── build-metrics.test.js
├── src/
│   └── analyzers/
│       ├── test-results.js      # Jest output analyzer
│       ├── coverage.js          # Coverage report analyzer
│       └── build-metrics.js     # Build performance tracker
├── artifacts/                    # Generated build artifacts
├── .circleci/
│   └── config.yml               # CI with ingestion workflows
└── package.json
```

---

## Memory Datasets

| Dataset | Purpose | Retention |
|---------|---------|-----------|
| `ci-build-history` | Build metrics per run | 90 days |
| `ci-coverage-reports` | Full coverage artifacts | 30 days |
| `ci-trend-analysis` | Weekly trend summaries | Indefinite |
| `ci-alerts` | Performance/coverage alerts | 30 days |

---

## CircleCI Workflows

### `intelligent-build`
Every commit:
- Recalls historical data
- Runs tests with coverage
- Compares to baseline
- Stores metrics to memory

### `weekly-trends`
Every Sunday:
- Analyzes all builds from the week
- Identifies trends (improving/declining)
- Stores trend report
- Creates alerts for concerning patterns

---

## Commands

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Output JSON results
npm run test:json

# Run analysis scripts
npm run analyze
```

---

## Key Metrics Tracked

| Metric | Detection | Alert Threshold |
|--------|-----------|-----------------|
| Build Duration | Per-build | >50% slower than p95 |
| Test Duration | Per-test | >1s (slow), >5s (critical) |
| Coverage | Per-build | <80% or dropping >5% |
| Failure Rate | Per-build | >5% of tests failing |
| Flaky Tests | Pattern analysis | Recurring random failures |

---

## Next Steps

- Try [Incident Learning Pipeline](../incident-learning-pipeline/)
- Check out [Flaky Test Detection](../fleaky-tests-circleci/)
- See [Performance Regression Detection](../performance-regression-detector/) (coming soon)
