# Agentic CI/CD Pipeline Examples

**Make your CI/CD pipelines intelligent in minutes - no complex setup, no vendor lock-in.**

This repository demonstrates how to add AI-powered intelligence to your existing CI/CD pipelines using [Kubiya](https://kubiya.ai). The examples show real-world problems that cost engineering teams hours every week, and how a single command can solve them.

---

## The Problem

Every engineering team faces these CI/CD pain points:

| Problem | Impact | Traditional Solution |
|---------|--------|---------------------|
| **Flaky tests** | PRs blocked, developers waiting | Manual retries, disable tests |
| **Running all tests** | 10-30 min pipelines | Complex caching, parallelization |
| **No code awareness** | Wasted compute, slow feedback | Static rules, manual optimization |

**The result?** Slow pipelines, frustrated developers, and wasted cloud spend.

---

## The Solution: One Command

```bash
kubiya exec "Analyze my code and run only the tests that matter" --local --cwd . --yes
```

That's it. The Kubiya agent:
- Reads your code and understands its structure
- Analyzes git diff to see what changed
- Makes intelligent decisions about what to test
- Executes only what's necessary
- Reports what it did and why

**No configuration files. No complex setup. No vendor lock-in.**

---

## Examples in This Repository

### 1. Flaky Test Detection

**Problem:** Tests that randomly fail block PRs and waste developer time.

**Solution:** Kubiya scans test code for flaky patterns (Math.random, timing, etc.) and skips them automatically.

```
Before: 12 tests, ~70% pass rate (flaky failures)
After:   6 tests, 100% pass rate (stable only)
```

**[View Example](./fleaky-tests-circleci/)**

---

### 2. Smart Test Selection

**Problem:** CI runs ALL tests even when you only changed one file.

**Solution:** Kubiya maps code changes to test suites and runs only what's affected.

```
Before: 30 tests on every commit (3+ seconds)
After:  13 tests when tasks changed (57% saved)
        0 tests when README changed (100% saved)
```

**[View Example](./smart-test-selection/)**

---

## Quick Start (5 Minutes)

### Prerequisites

- Node.js 20+
- A Kubiya API key ([Get one free](https://app.kubiya.ai))

### Step 1: Install Kubiya CLI

```bash
curl -fsSL https://raw.githubusercontent.com/kubiyabot/cli/main/install.sh | bash
```

Verify installation:
```bash
kubiya --version
# Output: kubiya version 1.x.x
```

### Step 2: Set Your API Key

```bash
export KUBIYA_API_KEY="your-api-key-here"
```

### Step 3: Clone and Run

```bash
# Clone the repository
git clone https://github.com/kubiyabot/agentic_ci_cd_examples.git
cd agentic_ci_cd_examples

# Try Example 1: Flaky Test Detection
cd fleaky-tests-circleci
npm install

# First, see the problem - run all tests (some will fail randomly)
npm run test:all

# Now see the solution - Kubiya runs only stable tests
kubiya exec "Analyze __tests__/flaky/ for flaky patterns, then run only stable tests with npm run test:unit" --local --cwd . --yes
```

### Expected Output

```
=== Flaky Test Analysis ===

Scanning __tests__/flaky/ for flaky patterns...

Found 2 flaky tests:

1. random-failure.test.ts
   Pattern: Math.random() > 0.7
   Issue: Fails ~30% of the time randomly

2. environment-dependent.test.ts
   Pattern: new Date().getHours()
   Issue: Fails at certain hours

=== Running Stable Tests ===

Executing: npm run test:unit

PASS  __tests__/unit/utils.test.ts
PASS  __tests__/unit/payment-processor.test.ts
PASS  __tests__/unit/user-service.test.ts

Test Suites: 3 passed, 3 total
Tests:       6 passed, 6 total

=== Summary ===
Stable tests: 6 passed
Flaky tests:  6 skipped
Result: SUCCESS
```

---

## How It Works

```
┌─────────────────────────────────────────────────────────────────────┐
│                        YOUR CI PIPELINE                              │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────────┐                                                   │
│  │  git push    │                                                   │
│  └──────┬───────┘                                                   │
│         │                                                            │
│         ▼                                                            │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  kubiya exec "..." --local --cwd . --yes                     │   │
│  └──────────────────────────────────────────────────────────────┘   │
│         │                                                            │
│         ▼                                                            │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                    KUBIYA AGENT                               │   │
│  │                                                               │   │
│  │   1. READ      → Scans your codebase                         │   │
│  │   2. ANALYZE   → Understands what changed (git diff)         │   │
│  │   3. DECIDE    → Determines what tests to run                │   │
│  │   4. EXECUTE   → Runs only necessary tests                   │   │
│  │   5. REPORT    → Explains what it did and why                │   │
│  │                                                               │   │
│  └──────────────────────────────────────────────────────────────┘   │
│         │                                                            │
│         ▼                                                            │
│  ┌──────────────┐                                                   │
│  │  CI PASSES   │  (in 30 seconds instead of 3 minutes)            │
│  └──────────────┘                                                   │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## CircleCI Integration

Both examples include working `.circleci/config.yml` files. Here's how to use them:

### 1. Add Your API Key to CircleCI

Go to **Project Settings** > **Environment Variables** > Add:
- Name: `KUBIYA_API_KEY`
- Value: Your Kubiya API key

### 2. The Pipeline Configuration

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
              Analyze the codebase and run tests intelligently.
              Skip flaky tests, run only what's needed.
            " --local --cwd . --yes

workflows:
  test:
    jobs:
      - intelligent-test:
          context: kubiya  # Contains KUBIYA_API_KEY
```

### 3. Push and Watch

```bash
git push origin main
# CircleCI runs with intelligent test selection
```

---

## Key Concepts

### The `kubiya exec` Command

```bash
kubiya exec "<instruction>" --local --cwd . --yes
```

| Flag | Purpose |
|------|---------|
| `"<instruction>"` | Natural language description of what you want |
| `--local` | Run the agent locally (in your CI environment) |
| `--cwd .` | Set working directory to current folder |
| `--yes` | Auto-confirm actions (required for CI) |

### What the Agent Can Do

- **Read files** - Understands your code structure
- **Run commands** - Executes npm, git, shell commands
- **Analyze output** - Interprets test results, errors
- **Make decisions** - Chooses what to run based on context
- **Report results** - Explains actions in human-readable format

### Why `--local` Mode?

The `--local` flag runs the Kubiya agent directly in your CI environment. This means:
- Full access to your codebase
- Can run any command (npm, git, etc.)
- No data leaves your CI runner
- Works with any CI provider (CircleCI, GitHub Actions, Jenkins, etc.)

---

## Comparison: Traditional vs Kubiya

| Aspect | Traditional CI | With Kubiya |
|--------|---------------|-------------|
| **Configuration** | Complex YAML, caching rules | One command |
| **Test selection** | Run everything or manual rules | Automatic based on changes |
| **Flaky tests** | Manual tracking, retries | Auto-detected and skipped |
| **Maintenance** | Update rules as code changes | Self-adapting |
| **Time to setup** | Hours/days | 5 minutes |

---

## Repository Structure

```
agentic_ci_cd_examples/
├── README.md                          # This file
├── .env.example                       # Environment variable template
│
├── fleaky-tests-circleci/             # Example 1: Flaky test detection
│   ├── __tests__/
│   │   ├── unit/                      # Stable tests (always pass)
│   │   └── flaky/                     # Intentionally flaky tests
│   ├── lib/                           # Application code
│   ├── .circleci/config.yml           # CircleCI configuration
│   ├── package.json
│   └── README.md                      # Detailed documentation
│
└── smart-test-selection/              # Example 2: Smart test selection
    ├── src/
    │   ├── tasks/                     # Tasks module + tests
    │   └── projects/                  # Projects module + tests
    ├── .circleci/config.yml           # CircleCI configuration
    ├── package.json
    └── README.md                      # Detailed documentation
```

---

## Troubleshooting

### "Command not found: kubiya"

The CLI isn't in your PATH. Run:
```bash
export PATH="$HOME/.kubiya/bin:$PATH"
```

### "Invalid API key"

Make sure your API key is set:
```bash
echo $KUBIYA_API_KEY
# Should print your key
```

### Agent taking too long

Add `--output json` for structured output, or check your network connection to Kubiya's API.

---

## Learn More

- **[Kubiya Documentation](https://docs.kubiya.ai/)** - Full platform documentation
- **[kubiya exec Reference](https://docs.kubiya.ai/cli/on-demand-execution)** - Detailed CLI guide
- **[Get API Key](https://app.kubiya.ai)** - Sign up and get your key

---

## License

MIT License - Use these examples freely in your projects.

---

**Questions?** Open an issue or reach out at [kubiya.ai](https://kubiya.ai)
