# Performance Regression Detector

**Catch performance regressions before they reach production.**

```bash
kubiya exec "Run benchmarks and compare to baseline" --local --cwd . --yes
```

---

## The Problem

Performance degrades slowly:
- Week 1: Tests take 45 seconds
- Week 2: Tests take 48 seconds (barely noticeable)
- Week 3: Tests take 52 seconds
- Week 8: Tests take 90 seconds (everyone complains)

By the time you notice, it's impossible to find which commit caused it.

---

## The Solution

Kubiya tracks performance baselines in Cognitive Memory:

1. **Each build** → Benchmarks run and recorded
2. **Baseline established** → Statistical analysis of recent runs
3. **Every commit** → Current vs baseline comparison
4. **Regression detected** → Alert immediately with specifics

---

## Quick Start

### 1. Setup

```bash
cd performance-regression-detector
npm install

# Ensure API key is set
source ../.env
```

### 2. Run Benchmarks

```bash
# Run all benchmarks
npm run benchmark

# Output JSON for analysis
npm run benchmark:json
```

### 3. Compare to Baseline

```bash
# Recall baseline and compare
BASELINE=$(kubiya memory recall "performance baselines for this repo" \
  --top-k 5 --output json)

kubiya exec "
  BASELINE DATA:
  $BASELINE

  CURRENT RESULTS:
  $(cat benchmark-results.json)

  TASK:
  Compare each benchmark to baseline.
  Flag any >50% regressions.
  Report status: PASS / REGRESSION / CRITICAL
" --local --cwd . --yes
```

---

## Memory Integration Patterns

### Pattern A: CLI Recall → Compare

```bash
# Step 1: Get baseline from memory
BASELINE=$(kubiya memory recall "performance baseline for myrepo" \
  --top-k 1 --output json)

# Step 2: Run benchmarks
npm run benchmark:json

# Step 3: Compare
kubiya exec "
  BASELINE: $BASELINE
  CURRENT: $(cat benchmark-results.json)

  Compare and report regressions.
" --local --cwd . --yes
```

### Pattern B: Agent-Native Full Pipeline

```bash
kubiya exec "
  You are a performance guardian with memory capabilities.

  PHASE 1 - RECALL BASELINE:
  recall_memory('performance baselines for this repository')
  recall_memory('known performance issues')

  PHASE 2 - RUN BENCHMARKS:
  Execute: npm run benchmark:json
  Read the results.

  PHASE 3 - COMPARE:
  For each benchmark:
  - ratio = current / baseline
  - If ratio > 1.5: REGRESSION
  - If ratio > 2.0: CRITICAL
  - If ratio < 0.8: IMPROVEMENT

  PHASE 4 - STORE:
  store_memory({
    dataset: 'ci-benchmark-runs',
    content: 'Benchmark results',
    metadata: {
      benchmarks: { name: { current, baseline, ratio } },
      status: 'pass|regression|critical',
      regressions: ['list of regressed']
    }
  })

  PHASE 5 - ALERT:
  If critical regression:
  store_memory({
    dataset: 'ci-performance-alerts',
    content: 'Critical performance regression',
    metadata: { severity: 'critical', details: '...' }
  })
" --local --cwd . --yes
```

---

## Benchmarks Included

### Data Operations
| Benchmark | What it measures |
|-----------|------------------|
| `sortArray` | Array.sort() performance |
| `objectLookup` | Hash map access patterns |
| `filterArray` | Array iteration and filtering |
| `stringConcat` | String buffer operations |
| `jsonSerialize` | JSON.stringify/parse |
| `regexMatch` | Regex engine performance |
| `deepClone` | Object cloning overhead |

### Async Operations
| Benchmark | What it measures |
|-----------|------------------|
| `asyncBatch` | Promise.all overhead |
| `eventLoopStress` | Event loop throughput |

### Memory Operations
| Benchmark | What it measures |
|-----------|------------------|
| `memoryAllocation` | Array allocation speed |
| `bufferOperations` | Buffer handling |

---

## Regression Detection Thresholds

| Threshold | Ratio | Meaning |
|-----------|-------|---------|
| IMPROVEMENT | < 0.8 | 20%+ faster than baseline |
| STABLE | 0.8 - 1.5 | Within normal variance |
| REGRESSION | > 1.5 | 50%+ slower than baseline |
| CRITICAL | > 2.0 | 100%+ slower (double) |

---

## Project Structure

```
performance-regression-detector/
├── __tests__/
│   ├── unit/
│   │   ├── operations.test.js
│   │   └── runner.test.js
│   └── integration/
│       └── full-benchmark.test.js
├── src/
│   └── benchmarks/
│       ├── operations.js     # Benchmark operations
│       └── runner.js         # Benchmark runner with stats
├── .circleci/
│   └── config.yml           # CI with regression detection
└── package.json
```

---

## Statistical Analysis

Each benchmark collects:
- **Mean**: Average execution time
- **Median**: Middle value (less affected by outliers)
- **P95/P99**: 95th/99th percentile
- **StdDev**: Variability measure
- **Adjusted Mean**: Mean with outliers removed

```javascript
const { BenchmarkRunner } = require('./src/benchmarks/runner');

const runner = new BenchmarkRunner({
  warmupRuns: 3,      // Warmup iterations
  sampleRuns: 10,     // Measurement iterations
  outlierThreshold: 2 // StdDev for outlier detection
});

const results = await runner.runAll();
// {
//   benchmarks: {
//     sortArray: {
//       mean: 12.5,
//       median: 12.1,
//       p95: 15.2,
//       stdDev: 1.8,
//       ...
//     }
//   }
// }
```

---

## Memory Datasets

| Dataset | Purpose |
|---------|---------|
| `ci-performance-baselines` | Reference baselines per repo |
| `ci-benchmark-runs` | Individual benchmark results |
| `ci-performance-alerts` | Regression alerts |
| `ci-performance-trends` | Weekly trend analysis |

---

## CircleCI Workflows

### `regression-detection`
Every commit:
- Recalls baseline from memory
- Runs full benchmark suite
- Compares to baseline
- Stores results and alerts

### `weekly-trends`
Every Sunday:
- Analyzes all benchmark runs
- Identifies gradual degradation
- Creates trend reports
- Alerts on concerning patterns

---

## Commands

```bash
# Run benchmarks (console output)
npm run benchmark

# Run benchmarks (JSON output)
npm run benchmark:json

# Run tests
npm test

# Run unit tests only
npm run test:unit
```

---

## Example Output

```
Running benchmarks...

Data Operations:
  sortArray: 12.45ms (±1.23)
  objectLookup: 3.21ms (±0.45)
  filterArray: 8.67ms (±0.89)
  stringConcat: 15.32ms (±2.11)
  jsonSerialize: 45.67ms (±5.43)
  regexMatch: 23.45ms (±3.21)
  deepClone: 34.56ms (±4.12)

Async Operations:
  asyncBatch: 2.34ms overhead
  eventLoopStress: 156.78ms

Memory Operations:
  memoryAllocation: 67.89ms
  bufferOperations: 123.45ms

Benchmarks complete.
```

---

## Next Steps

- Try [Build Artifact Analyzer](../build-artifact-analyzer/)
- Check out [Incident Learning Pipeline](../incident-learning-pipeline/)
- See [Cross-Repo Knowledge Share](../cross-repo-knowledge-share/) (coming soon)

<!-- CI trigger: 1766363472 -->
