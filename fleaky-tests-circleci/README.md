# Flaky Test Detection

**Stop random test failures from blocking your PRs.**

```bash
kubiya exec "Find flaky tests and run only stable ones" --local --cwd . --yes
```

---

## The Problem

Your CI fails randomly:

```
FAIL  __tests__/checkout.test.ts
  ● should process payment
    Timeout - waited 5000ms

CI Status: FAILED
```

You re-run. It passes. **The test was flaky.**

This wastes hours every week on:
- Debugging non-issues
- Re-running pipelines
- Waiting for "green" builds

---

## The Solution

Kubiya automatically:
1. Scans your tests for flaky patterns (`Math.random()`, `new Date()`, etc.)
2. Reports what makes each test flaky
3. Skips flaky tests and runs only stable ones

**Result:** 100% pass rate, every time.

---

## Quick Start

### 1. Setup (one time)

```bash
# From the repo root
cp .env.example .env
# Edit .env and add your KUBIYA_API_KEY

# Install dependencies
cd fleaky-tests-circleci
npm install
```

### 2. See the Problem

```bash
npm run test:all
```

Run it a few times. Sometimes it passes, sometimes it fails. That's flaky.

### 3. See the Solution

```bash
# From repo root
source .env
make test-flaky-kubiya

# Or run directly
kubiya exec "Analyze __tests__/flaky/ for flaky patterns, then run npm run test:stable" \
  --local --cwd . --yes
```

Now it passes every time.

---

## What Gets Detected

| Pattern | Example | Why It's Flaky |
|---------|---------|----------------|
| `Math.random()` | `expect(Math.random() > 0.5)` | Different result each run |
| `new Date()` | `expect(hour).toBe(9)` | Fails at different times |
| `setTimeout` | Variable timing | Race conditions |
| `process.env` | Unmocked env vars | Different in CI vs local |

---

## Project Structure

```
__tests__/
├── unit/           # Stable tests (always pass)
│   ├── utils.test.ts
│   ├── payment-processor.test.ts
│   └── user-service.test.ts
│
├── flaky/          # Intentionally flaky (for demo)
│   ├── random-failure.test.ts      # Uses Math.random()
│   └── environment-dependent.test.ts   # Uses Date
│
└── integration/
    └── api.test.ts
```

---

## Available Commands

```bash
npm run test:all      # Run everything (will randomly fail)
npm run test:stable   # Run only stable tests
npm run test:flaky    # Run only flaky tests (demo)
```

Or use the Makefile from the repo root:

```bash
make test-flaky           # Run all (shows flaky failures)
make test-flaky-stable    # Run only stable
make test-flaky-kubiya    # Let Kubiya handle it
```

---

## How `--local` Works

The `--local` flag creates a temporary worker on your machine:

```
kubiya exec "..." --local --cwd . --yes
                  ^^^^^^^
                  Creates ephemeral worker queue
                          ^^^^^^
                          Sets working directory (required for file access)
```

**What happens:**
1. Ephemeral worker queue spins up locally
2. Agent runs commands in your environment
3. Full access to your files and git repo
4. Worker auto-destroys when done

**Without `--local`:** Agent runs remotely and can't access your files.

---

## CI/CD Integration

### CircleCI

```yaml
jobs:
  test:
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
          name: Run Stable Tests
          command: |
            kubiya exec "Detect flaky tests and run only stable ones" \
              --local --cwd . --yes

workflows:
  test:
    jobs:
      - test:
          context: kubiya-secrets  # Contains KUBIYA_API_KEY
```

---

## Troubleshooting

### "KUBIYA_API_KEY is not set"

```bash
source .env
# Or: export KUBIYA_API_KEY="your-key"
```

### Agent can't find test files

Always use both flags:
```bash
kubiya exec "..." --local --cwd . --yes
```

### Tests still failing

Make sure you're running stable tests:
```bash
npm run test:stable
```

---

## Next Steps

- Try [Smart Test Selection](../smart-test-selection/) to run only affected tests
- Add Kubiya to your CI pipeline
- Check the [main README](../README.md) for more examples

<!-- CI validated -->
