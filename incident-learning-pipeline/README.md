# Incident Learning Pipeline

**Learn from CI failures. Never repeat the same mistakes.**

```bash
kubiya exec "Analyze test failures and learn from them" --local --cwd . --yes
```

---

## The Problem

Your CI fails. You investigate. You fix it. **Three weeks later, the same failure happens to a teammate.**

```
FAIL  __tests__/integration/services.test.js
  ● Service Integration › Database Connection
    Connection timeout after 5000ms to localhost:5432
```

Nobody remembers the fix. The investigation starts from scratch.

---

## The Solution

Kubiya's Cognitive Memory turns every failure into organizational knowledge:

1. **Failure occurs** → Agent analyzes root cause
2. **Learning stored** → Root cause + workaround saved to memory
3. **Next run starts** → Agent recalls previous failures
4. **Knowledge applied** → Known issues handled automatically

---

## Quick Start

### 1. Setup

```bash
# From repo root
cd incident-learning-pipeline
npm install

# Ensure API key is set
source ../.env
```

### 2. See Failures (Before Intelligence)

```bash
npm test
```

Run it several times. Tests will fail randomly due to simulated:
- Database connection timeouts
- API rate limiting
- Cache connection issues
- Deadlock conditions

### 3. See Learning (With Intelligence)

```bash
# Let Kubiya learn from failures
kubiya exec "
  Run the tests. If any fail:
  1. Analyze what went wrong
  2. Categorize the failure (timeout, connection, flaky)
  3. Store the analysis to memory for future reference

  Use store_memory to save your learnings.
" --local --cwd . --yes
```

### 4. Apply Learnings (Next Run)

```bash
# Future runs recall previous learnings
kubiya exec "
  Before running tests:
  1. Recall previous failure learnings
  2. Apply known workarounds
  3. Run tests with adjustments

  Use recall_memory to get organizational knowledge.
" --local --cwd . --yes
```

---

## Memory Integration Patterns

### Pattern A: CLI Recall → Pass Context

```bash
# Step 1: Recall learnings via CLI
LEARNINGS=$(kubiya memory recall "failures in incident-learning-pipeline" \
  --top-k 10 --output json)

# Step 2: Pass as context to agent
kubiya exec "
  PREVIOUS FAILURE LEARNINGS:
  $LEARNINGS

  TASK:
  Based on the learnings above:
  1. Identify tests with known issues
  2. Apply appropriate workarounds
  3. Run: npm test
" --local --cwd . --yes
```

### Pattern B: Agent-Native Memory Tools

```bash
kubiya exec "
  You are a CI agent with memory capabilities.

  PHASE 1 - RECALL:
  recall_memory('timeout failures in integration tests')
  recall_memory('database connection issues')

  PHASE 2 - EXECUTE:
  Run: npm test -- --json --outputFile=results.json

  PHASE 3 - LEARN:
  If NEW failures occur, store them:
  store_memory({
    dataset: 'ci-failure-learnings',
    content: 'Failure analysis',
    metadata: {
      test_file: '[file]',
      failure_type: 'timeout|connection|flaky',
      root_cause: '[analysis]',
      workaround: '[fix]'
    }
  })
" --local --cwd . --yes
```

---

## What Gets Learned

| Failure Type | Example | Learning Stored |
|-------------|---------|-----------------|
| Connection Timeout | DB connection fails | Increase timeout, add retry |
| Rate Limiting | API returns 429 | Add exponential backoff |
| Deadlock | Transaction conflicts | Retry strategy, isolation level |
| Cache Miss | Redis unavailable | Graceful degradation path |
| Flaky Test | Random assertion failure | Mark as flaky, track occurrence |

---

## Project Structure

```
incident-learning-pipeline/
├── __tests__/
│   ├── unit/
│   │   ├── database.test.js      # DB service tests
│   │   ├── api-client.test.js    # API client tests
│   │   └── cache.test.js         # Cache service tests
│   └── integration/
│       └── services.test.js      # Full integration tests
├── src/
│   └── services/
│       ├── database.js           # Simulated DB with failures
│       ├── api-client.js         # Simulated API with failures
│       └── cache.js              # Simulated Redis with failures
├── .circleci/
│   └── config.yml                # CI with memory integration
└── package.json
```

---

## CircleCI Integration

The `.circleci/config.yml` includes three workflows:

### 1. Baseline (No Intelligence)
```yaml
jobs:
  - test-baseline
```
Standard test run. Failures are not learned from.

### 2. Intelligent Pipeline
```yaml
jobs:
  - test-with-learning:
      context: kubiya-secrets
```
- Recalls previous learnings before tests
- Stores new learnings on failure
- Documents success patterns

### 3. Autonomous Learning
```yaml
jobs:
  - autonomous-learning-pipeline:
      context: kubiya-secrets
```
Fully autonomous agent that:
- Recalls organizational knowledge
- Runs tests with applied learnings
- Analyzes and stores new insights

---

## Memory Datasets Used

| Dataset | Purpose |
|---------|---------|
| `ci-failure-learnings` | Root cause analysis, workarounds |
| `ci-build-history` | Build success/failure records |
| `ci-test-patterns` | Recurring patterns (flaky, slow, etc.) |

---

## Commands

```bash
# Run all tests
npm test

# Run only unit tests
npm run test:unit

# Run only integration tests
npm run test:integration

# Output JSON results
npm run test:json
```

---

## Simulated Failure Modes

The services simulate real-world failures:

**Database (`src/services/database.js`):**
- Connection timeouts (30% chance)
- Deadlocks (5% chance)
- Slow queries with warnings

**API Client (`src/services/api-client.js`):**
- Rate limiting after 5+ requests
- Timeouts (15% chance)
- 5xx errors (7% chance)
- Connection refused (3% chance)

**Cache (`src/services/cache.js`):**
- Connection failures (20% chance)
- OOM errors under pressure
- Key expiration

---

## Next Steps

- Check out [Flaky Test Detection](../fleaky-tests-circleci/)
- Try [Smart Test Selection](../smart-test-selection/)
- See [Performance Regression Detection](../performance-regression-detector/) (coming soon)
# Trigger CI
