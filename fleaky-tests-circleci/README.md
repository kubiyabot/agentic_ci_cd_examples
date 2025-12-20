# Flaky Test Detection with Kubiya

**Stop letting random test failures block your PRs.**

This example shows how Kubiya agents can automatically detect flaky tests in your codebase and skip them, running only stable tests that give reliable results.

---

## Table of Contents

- [The Problem](#the-problem)
- [The Solution](#the-solution)
- [Quick Start](#quick-start)
- [Using the Makefile](#using-the-makefile-recommended)
- [Project Structure](#project-structure)
- [Flaky Patterns Detected](#flaky-patterns-detected)
- [Available npm Scripts](#available-npm-scripts)
- [The `kubiya exec` Command](#the-kubiya-exec-command)
- [CircleCI Integration](#circleci-integration)
- [How It Works](#how-it-works)
- [Cognitive Memory Integration](#cognitive-memory-integration)
- [Results](#results)
- [Customization](#customization)
- [Troubleshooting](#troubleshooting)
- [Learn More](#learn-more)

---

## The Problem

You've seen this before:

```
FAIL  __tests__/flaky/random-failure.test.ts
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
6. **Stores findings in cognitive memory** for future reference

---

## Quick Start

### Prerequisites

- **Node.js 20+** - [Download](https://nodejs.org/)
- **Kubiya CLI** - [Installation guide](https://docs.kubiya.ai/cli)
- **Kubiya API Key** - [Get yours here](https://app.kubiya.ai/settings#apiKeys)

### Step 1: Clone and Install

```bash
git clone https://github.com/kubiyabot/agentic_ci_cd_examples.git
cd agentic_ci_cd_examples/fleaky-tests-circleci
npm install
```

### Step 2: Set Your API Key

```bash
# Copy the example .env file in the parent directory
cp ../.env.example ../.env

# Edit ../.env with your credentials:
# KUBIYA_API_KEY=your-api-key-here
# KUBIYA_AGENT_UUID=your-agent-uuid (optional, for direct execution)

# Source the .env file
source ../.env

# Verify it's set
echo $KUBIYA_API_KEY
```

### Step 3: Install Kubiya CLI (if not already installed)

```bash
curl -fsSL https://raw.githubusercontent.com/kubiyabot/cli/main/install.sh | bash

# Add to PATH
export PATH="$HOME/.kubiya/bin:$PATH"

# Verify
kubiya --version
kubiya auth status
```

### Step 4: See the Problem

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

### Step 5: See the Solution

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

## Using the Makefile (Recommended)

The easiest way to run this example is using the Makefile from the parent directory:

```bash
cd ..  # Go to agentic_ci_cd_examples root

# See all available commands
make help

# Run ALL tests (shows flaky failures)
make test-flaky

# Run only stable tests
make test-flaky-stable

# Run with Kubiya agent
make test-flaky-kubiya
```

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
| `npm run test:stable` | Run only stable unit tests | 6 |
| `npm run test:flaky` | Run only flaky tests (demo) | 4 |
| `npm run test:integration` | Run integration tests | 4 |

---

## The `kubiya exec` Command

### Basic Syntax

```bash
kubiya exec "<instruction>" --local --cwd . --yes
```

### Essential Flags

| Flag | Purpose |
|------|---------|
| `"<instruction>"` | Natural language description of what you want |
| `--local` | Run with ephemeral local worker |
| `--cwd .` | **CRITICAL:** Set working directory to current folder |
| `--yes` | Auto-confirm actions (required for CI) |

### Execution Modes

**Planning Mode (Recommended for Local):**
```bash
kubiya exec "Analyze tests for flaky patterns" --local --cwd . --yes
```
- Automatically selects best agent
- Creates ephemeral worker
- Works reliably for local testing

**Direct Agent Mode (For CI/CD):**
```bash
kubiya exec agent <AGENT_UUID> "run stable tests" --cwd . --yes
```
- Bypasses planning phase
- Faster execution
- Requires pre-configured agent UUID
- Best for production CI/CD with remote workers

---

## CircleCI Integration

The included `.circleci/config.yml` runs Kubiya automatically on every push.

### Required Environment Variables

Set these in your CircleCI context (e.g., `kubiya-secrets`):

| Variable | Description |
|----------|-------------|
| `KUBIYA_API_KEY` | Your Kubiya API key |
| `KUBIYA_AGENT_UUID` | Agent UUID for direct execution |
| `KUBIYA_NON_INTERACTIVE` | Set to `true` (automatically set in config) |

### Setup Steps

1. **Create a CircleCI context** named `kubiya-secrets`
2. **Add environment variables** to the context:
   - `KUBIYA_API_KEY`: Your API key
   - `KUBIYA_AGENT_UUID`: Your agent UUID

3. **Push your code:**
   ```bash
   git push origin main
   ```

4. **Watch intelligent CI in action.**

### The Pipeline

```yaml
version: 2.1

jobs:
  test-with-kubiya:
    docker:
      - image: cimg/node:20.11
    environment:
      KUBIYA_NON_INTERACTIVE: "true"
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
            kubiya exec agent ${KUBIYA_AGENT_UUID} "
              You are an intelligent CI/CD agent analyzing tests for flaky patterns.

              STEP 1: Analyze flaky test directory:
              List files in __tests__/flaky/ and analyze each for flaky patterns.

              STEP 2: Report findings:
              For each flaky test found, explain the type of flakiness.

              STEP 3: Run stable tests only:
              Execute: npm run test:unit

              STEP 4: Summary:
              Report how many tests were run vs skipped.
            " --cwd . --yes

workflows:
  intelligent-testing:
    jobs:
      - test-with-kubiya:
          context:
            - kubiya-secrets
```

### Local Testing Note

**Important:** `circleci local execute` has limitations with environment variable handling. For local testing, use the Makefile targets instead:

```bash
# Instead of: circleci local execute test-with-kubiya
# Use:
make test-flaky-kubiya
```

---

## How It Works

```
┌─────────────────────────────────────────────────────────────┐
│                    kubiya exec --local --cwd .              │
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
│  5. STORE                                                    │
│     └── Save findings to cognitive memory                   │
│                                                              │
│  6. SUMMARIZE                                                │
│     └── Tests run: 6, skipped: 6, all passed               │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Cognitive Memory Integration

Kubiya agents use **Cognitive Memory** to learn and remember across sessions:

### How It Benefits This Example

1. **Pattern Recognition** - Agent stores detected flaky patterns
2. **Cross-Session Learning** - Remembers which tests were flaky in previous runs
3. **Team Knowledge Sharing** - Other agents in your org can access flaky test findings
4. **Continuous Improvement** - Agent gets smarter over time

### Memory Operations

```python
# Agent automatically stores findings
store_memory(
    content="random-failure.test.ts uses Math.random() causing 30% failure rate",
    metadata={
        "category": "flaky-test",
        "file": "random-failure.test.ts",
        "pattern": "Math.random()",
        "environment": "test"
    }
)

# Agent recalls past findings on subsequent runs
recall_memory("flaky test patterns in this repository")
```

### Semantic Search

When running, the agent uses semantic search to find relevant past learnings:

| Query | What It Finds |
|-------|---------------|
| "flaky tests" | All previously detected flaky tests |
| "random failure patterns" | Tests using Math.random() |
| "timing issues" | Tests with Date/time dependencies |

---

## Results

| Metric | Without Kubiya | With Kubiya |
|--------|----------------|-------------|
| Tests run | 12 | 6 |
| Flaky failures per day | 2-5 | 0 |
| CI pass rate | ~70% | 100% |
| Time wasted on re-runs | Hours | Zero |
| Knowledge retained | None | Stored in memory |

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

### Custom Pattern Detection

```bash
kubiya exec "
  Read all test files in __tests__/

  Mark as flaky if the test:
  - Uses any global state
  - Depends on network calls
  - Uses timers without mocking
  - Accesses external services

  Generate a flaky-tests.json report.
  Run only tests NOT in the flaky list.
" --local --cwd . --yes
```

---

## Troubleshooting

### "Command not found: kubiya"

The CLI isn't in your PATH:
```bash
export PATH="$HOME/.kubiya/bin:$PATH"

# Add to ~/.bashrc or ~/.zshrc for persistence
echo 'export PATH="$HOME/.kubiya/bin:$PATH"' >> ~/.zshrc
```

### "KUBIYA_API_KEY is not set"

Source your .env file:
```bash
source ../.env

# Or export directly
export KUBIYA_API_KEY="your-api-key-here"
```

Or use the Makefile (which loads .env automatically):
```bash
make test-flaky-kubiya
```

### Agent not finding files

Make sure you're using `--cwd .` flag:
```bash
kubiya exec "..." --local --cwd . --yes
#                          ^^^^^^ Critical!
```

### "422 error: worker_queue_id required"

This happens with direct agent execution using `--local`. Use planning mode:
```bash
# Instead of:
kubiya exec agent $UUID "..." --local --cwd . --yes

# Use:
kubiya exec "..." --local --cwd . --yes
```

### Tests still failing

Check that you're running stable tests only:
```bash
npm run test:stable
# or
npm run test:unit
```

---

## Learn More

- **[Kubiya Documentation](https://docs.kubiya.ai/)**
- **[kubiya exec Reference](https://docs.kubiya.ai/cli/on-demand-execution)**
- **[Cognitive Memory](https://docs.kubiya.ai/core-concepts/cognitive-memory/overview)**
- **[Main Examples README](../README.md)**

---

## Next Steps

1. Try the **[Smart Test Selection](../smart-test-selection/)** example
2. Combine both patterns: smart selection + flaky detection
3. Add Kubiya to your own CI pipeline
4. Leverage cognitive memory for continuous improvement
