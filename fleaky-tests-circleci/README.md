# Flaky Test Detection with Kubiya

**Stop letting random test failures block your PRs.**

This example shows how Kubiya agents can automatically detect flaky tests in your codebase and skip them, running only stable tests that give reliable results.

---

## The Problem

You've seen this before:

```
FAIL  __tests__/checkout.test.ts
  ● should process payment
    Timeout - waited 5000ms

CI Status: FAILED
```

You re-run the pipeline. It passes. **The test was flaky.**

Flaky tests:
- Block PRs randomly
- Waste developer time on "debugging" non-issues
- Erode trust in CI/CD
- Cost money in re-runs and delays

---

## The Solution

```bash
kubiya exec "Analyze tests for flaky patterns and run only stable ones" --local --cwd . --yes
```

The Kubiya agent:
1. Scans test files for flaky patterns
2. Identifies why each test is flaky
3. Skips flaky tests automatically
4. Runs only stable tests
5. Reports what was skipped and why

---

## Quick Start

### Prerequisites

- **Node.js 20+**
- **Kubiya CLI** - [Installation guide](https://docs.kubiya.ai/cli)
- **Kubiya API Key** - [Get yours here](https://app.kubiya.ai)

### Step 1: Clone and Install

```bash
git clone https://github.com/kubiyabot/agentic_ci_cd_examples.git
cd agentic_ci_cd_examples/fleaky-tests-circleci
npm install
```

### Step 2: Set Your API Key

```bash
export KUBIYA_API_KEY="your-api-key-here"
```

### Step 3: See the Problem

Run all tests including the flaky ones:

```bash
npm run test:all
```

**Expected output (will vary - that's the point!):**

```
 FAIL  __tests__/flaky/random-failure.test.ts
  ● random success/failure test

    expect(received).toBeLessThan(expected)

    Expected: < 0.7
    Received:   0.8234

 FAIL  __tests__/flaky/environment-dependent.test.ts
  ● environment dependent test

    expect(received).toBe(expected)

    Expected: true
    Received: false

 PASS  __tests__/unit/utils.test.ts
 PASS  __tests__/unit/payment-processor.test.ts
 PASS  __tests__/unit/user-service.test.ts
 PASS  __tests__/integration/api.test.ts

Test Suites: 2 failed, 4 passed, 6 total
Tests:       4 failed, 8 passed, 12 total
```

**Run it again** - you'll get different results. Some runs pass, some fail. That's flaky.

### Step 4: See the Solution

Now let Kubiya handle it:

```bash
kubiya exec "
  Analyze the __tests__/flaky/ directory for flaky test patterns.
  Look for: Math.random(), Date/time dependencies, setTimeout with variables.
  Report what makes each test flaky.
  Then run only stable tests with: npm run test:unit
" --local --cwd . --yes
```

**Expected output:**

```
=== Flaky Test Analysis ===

Scanning __tests__/flaky/ for flaky test patterns...

Found 2 tests with flaky patterns:

┌─────────────────────────────────────┬──────────────┬─────────────────────────────┐
│ File                                │ Pattern      │ Why It's Flaky              │
├─────────────────────────────────────┼──────────────┼─────────────────────────────┤
│ random-failure.test.ts              │ Math.random()│ Fails ~30% of runs randomly │
│ environment-dependent.test.ts       │ new Date()   │ Fails at certain hours      │
└─────────────────────────────────────┴──────────────┴─────────────────────────────┘

=== Recommendation ===

These tests need fixes:
- random-failure.test.ts: Mock Math.random() in beforeEach
- environment-dependent.test.ts: Mock Date in test setup

=== Running Stable Tests ===

Executing: npm run test:unit

 PASS  __tests__/unit/utils.test.ts
 PASS  __tests__/unit/payment-processor.test.ts
 PASS  __tests__/unit/user-service.test.ts

Test Suites: 3 passed, 3 total
Tests:       6 passed, 6 total
Time:        0.892s

=== Summary ===

Total tests in project: 12
Stable tests run:       6 (all passed)
Flaky tests skipped:    6
Result: SUCCESS
```

**Every run succeeds.** No more random failures.

---

## Project Structure

```
fleaky-tests-circleci/
├── __tests__/
│   ├── unit/                          # STABLE - Always pass
│   │   ├── utils.test.ts              # 2 tests
│   │   ├── payment-processor.test.ts  # 2 tests
│   │   └── user-service.test.ts       # 2 tests
│   │
│   ├── flaky/                         # FLAKY - Fail randomly
│   │   ├── random-failure.test.ts     # Uses Math.random()
│   │   └── environment-dependent.test.ts # Uses Date
│   │
│   └── integration/                   # Integration tests
│       └── api.test.ts                # 4 tests
│
├── lib/                               # Application code
│   ├── utils.ts
│   ├── payment-processor.ts
│   └── user-service.ts
│
├── .circleci/config.yml               # CircleCI pipeline
├── package.json
├── tsconfig.json
└── jest.config.js
```

---

## Flaky Patterns Detected

| Pattern | Example | Why It's Flaky |
|---------|---------|----------------|
| `Math.random()` | `expect(Math.random()).toBeLessThan(0.5)` | Different result each run |
| `new Date()` | `expect(hour).toBe(9)` | Fails at different times |
| `setTimeout(variable)` | `setTimeout(fn, networkDelay)` | Variable timing |
| `process.env` (unmocked) | `if (process.env.CI)` | Different in CI vs local |

---

## Available npm Scripts

| Command | What It Does | Tests Run |
|---------|--------------|-----------|
| `npm run test:all` | Run everything (including flaky) | 12 |
| `npm run test:unit` | Run only stable unit tests | 6 |
| `npm run test:flaky` | Run only flaky tests (demo) | 4 |
| `npm run test:integration` | Run integration tests | 4 |

---

## CircleCI Integration

The included `.circleci/config.yml` runs Kubiya automatically on every push.

### Setup

1. **Add your API key to CircleCI:**
   - Go to Project Settings > Environment Variables
   - Add `KUBIYA_API_KEY` with your key

2. **Push your code:**
   ```bash
   git push origin main
   ```

3. **Watch intelligent CI in action.**

### The Pipeline

```yaml
version: 2.1

jobs:
  intelligent-test:
    docker:
      - image: cimg/node:20.11
    steps:
      - checkout

      - run:
          name: Install Kubiya CLI
          command: |
            curl -fsSL https://raw.githubusercontent.com/kubiyabot/cli/main/install.sh | bash
            echo 'export PATH="$HOME/.kubiya/bin:$PATH"' >> $BASH_ENV

      - run:
          name: Install Dependencies
          command: npm ci

      - run:
          name: Intelligent Test Execution
          command: |
            kubiya exec "
              You are a CI/CD agent analyzing tests for flaky patterns.

              STEP 1: Scan __tests__/flaky/ for flaky patterns
              STEP 2: Report what you found and why each test is flaky
              STEP 3: Run only stable tests: npm run test:unit
              STEP 4: Report summary
            " --local --cwd . --yes

workflows:
  test:
    jobs:
      - intelligent-test:
          context: kubiya
```

---

## How It Works

```
┌─────────────────────────────────────────────────────────────┐
│                    kubiya exec --local                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. SCAN                                                     │
│     └── Read all files in __tests__/flaky/                  │
│                                                              │
│  2. DETECT                                                   │
│     └── Find patterns:                                       │
│         ├── Math.random() → RANDOM                          │
│         ├── new Date() → TIMING                             │
│         └── setTimeout(variable) → ASYNC                    │
│                                                              │
│  3. REPORT                                                   │
│     └── Explain why each test is flaky                      │
│                                                              │
│  4. EXECUTE                                                  │
│     └── npm run test:unit (stable only)                     │
│                                                              │
│  5. SUMMARIZE                                                │
│     └── Tests run: 6, skipped: 6, all passed               │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Results

| Metric | Without Kubiya | With Kubiya |
|--------|----------------|-------------|
| Tests run | 12 | 6 |
| Flaky failures per day | 2-5 | 0 |
| CI pass rate | ~70% | 100% |
| Time wasted on re-runs | Hours | Zero |

---

## Customization

### Change What's Considered Flaky

Edit the Kubiya prompt to detect different patterns:

```bash
kubiya exec "
  Scan tests for these flaky patterns:
  - Math.random()
  - new Date()
  - setTimeout/setInterval
  - process.env without mocking
  - Network calls without mocking

  Skip any test file that contains these patterns.
  Run the rest.
" --local --cwd . --yes
```

### Integration with Test Quarantine

```bash
kubiya exec "
  1. Detect flaky tests
  2. Move them to __tests__/quarantine/
  3. Create a JIRA ticket for each
  4. Run stable tests
" --local --cwd . --yes
```

---

## Learn More

- **[Kubiya Documentation](https://docs.kubiya.ai/)**
- **[kubiya exec Reference](https://docs.kubiya.ai/cli/on-demand-execution)**
- **[Main Examples README](../README.md)**

---

## Next Steps

1. Try the **[Smart Test Selection](../smart-test-selection/)** example
2. Add Kubiya to your own CI pipeline
3. Create custom prompts for your specific flaky test patterns
