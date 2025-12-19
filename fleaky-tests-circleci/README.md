# Flaky Test Detection with Kubiya

> Make your CI pipeline intelligent - automatically detect and skip flaky tests.

## What This Does

Traditional CI runs ALL tests, including flaky ones that fail randomly. This wastes time and blocks PRs unnecessarily.

**With Kubiya:**
- Agent analyzes test code for flaky patterns (`Math.random()`, timing dependencies, etc.)
- Skips known flaky tests automatically
- Runs only stable tests
- Reports why tests were skipped

## Quick Start

### Prerequisites

1. **Node.js 20+**
2. **Kubiya CLI** - [Install instructions](https://docs.kubiya.ai/cli)
3. **Kubiya API Key** - Get from [Kubiya Dashboard](https://app.kubiya.ai)

### 1. Clone and Install

```bash
git clone https://github.com/kubiyabot/agentic_ci_cd_examples.git
cd agentic_ci_cd_examples/fleaky-tests-circleci
npm install
```

### 2. Set API Key

```bash
export KUBIYA_API_KEY="your-api-key-here"
```

### 3. Run Tests (See the Problem)

```bash
# Run ALL tests including flaky ones - watch some fail randomly
npm run test:all
```

**Expected Output:**
```
FAIL  __tests__/flaky/random-failure.test.ts
  ● random success/failure test
    expect(received).toBeLessThan(expected)
    Random flaky failure!

FAIL  __tests__/flaky/environment-dependent.test.ts
  ● environment dependent test
    expect(received).toBe(expected)
    Expected: true, Received: false

Test Suites: 2 failed, 4 passed, 6 total
Tests:       4 failed, 8 passed, 12 total
```

### 4. Run with Kubiya (See the Solution)

```bash
kubiya exec "
  Analyze the __tests__/flaky/ directory for flaky test patterns.
  Report what makes each test flaky.
  Then run only stable tests with: npm run test:unit
" --local --cwd . --yes
```

**Expected Output:**
```
=== Flaky Test Analysis ===

Found 2 flaky tests in __tests__/flaky/:

1. random-failure.test.ts
   - Pattern: Math.random() > 0.7
   - Type: RANDOM
   - Issue: Fails ~30% of the time randomly
   - Fix: Mock Math.random() in test setup

2. environment-dependent.test.ts
   - Pattern: new Date().getHours()
   - Type: TIMING
   - Issue: Fails at certain hours of the day
   - Fix: Mock Date in test setup

=== Running Stable Tests ===

Running: npm run test:unit

PASS  __tests__/unit/utils.test.ts
PASS  __tests__/unit/payment-processor.test.ts
PASS  __tests__/unit/user-service.test.ts

Test Suites: 3 passed, 3 total
Tests:       6 passed, 6 total

=== Summary ===
- Tests run: 6 (stable only)
- Tests skipped: 6 (flaky)
- Result: All passed!
```

## Project Structure

```
fleaky-tests-circleci/
├── __tests__/
│   ├── unit/                    # Stable tests (always pass)
│   │   ├── utils.test.ts
│   │   ├── payment-processor.test.ts
│   │   └── user-service.test.ts
│   ├── flaky/                   # Intentionally flaky tests
│   │   ├── random-failure.test.ts      # Uses Math.random()
│   │   └── environment-dependent.test.ts # Uses Date/time
│   └── integration/             # Integration tests
├── lib/                         # Application code
├── .circleci/config.yml         # CircleCI pipeline
└── package.json
```

## Flaky Test Patterns

| Test File | Flaky Pattern | Why It Fails |
|-----------|--------------|--------------|
| `random-failure.test.ts` | `Math.random() > 0.7` | Fails ~30% randomly |
| `environment-dependent.test.ts` | `new Date().getHours()` | Fails at certain hours |

## CircleCI Integration

The `.circleci/config.yml` runs Kubiya automatically:

```yaml
- run:
    name: Intelligent Test Execution
    command: |
      kubiya exec "
        Analyze tests for flaky patterns.
        Skip flaky tests.
        Run only stable tests.
      " --local --cwd . --yes
```

### Setup CircleCI

1. **Add KUBIYA_API_KEY** to CircleCI:
   - Go to Project Settings → Environment Variables
   - Add `KUBIYA_API_KEY` with your key

2. **Push to trigger pipeline:**
   ```bash
   git push origin main
   ```

## Available npm Scripts

| Script | Description |
|--------|-------------|
| `npm run test:all` | Run ALL tests (including flaky) |
| `npm run test:unit` | Run only stable unit tests |
| `npm run test:flaky` | Run only flaky tests (for demo) |

## Metrics

| Metric | Without Kubiya | With Kubiya |
|--------|----------------|-------------|
| Tests Run | 12 (all) | 6 (stable) |
| Flaky Failures | 2-4 per run | 0 |
| Pass Rate | ~70% | 100% |

## How It Works

```
┌─────────────────────────────────────────────────────────────┐
│                    kubiya exec --local                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. ANALYZE                                                  │
│     └── Scan __tests__/flaky/ for patterns                  │
│         ├── Math.random() → RANDOM type                     │
│         ├── new Date() → TIMING type                        │
│         └── setTimeout(variable) → ASYNC type               │
│                                                              │
│  2. DECIDE                                                   │
│     └── Skip tests matching flaky patterns                  │
│                                                              │
│  3. EXECUTE                                                  │
│     └── npm run test:unit (stable tests only)               │
│                                                              │
│  4. REPORT                                                   │
│     └── Show what was skipped and why                       │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Learn More

- [Kubiya Documentation](https://docs.kubiya.ai/)
- [kubiya exec Reference](https://docs.kubiya.ai/cli/on-demand-execution)
