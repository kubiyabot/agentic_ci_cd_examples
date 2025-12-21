# Agentic CI/CD Pipeline Examples

**Make your CI/CD pipelines intelligent with one command.**

```bash
kubiya exec "Run only the tests that matter" --local --cwd . --yes
```

No config files. No complex setup. Just tell Kubiya what you want.

---

## What's Inside

| Example | Problem It Solves | Key Benefit |
|---------|-------------------|-------------|
| [Flaky Test Detection](./fleaky-tests-circleci/) | Tests randomly fail, blocking PRs | 100% reliable CI |
| [Smart Test Selection](./smart-test-selection/) | Running all 54 tests for a 1-line change | 70-85% fewer tests |
| [Incident Learning Pipeline](./incident-learning-pipeline/) | Same failures repeat across teams | Learn once, apply forever |
| [Build Artifact Analyzer](./build-artifact-analyzer/) | Build data lost after each run | Trend analysis & alerts |
| [Performance Regression Detector](./performance-regression-detector/) | Slow degradation goes unnoticed | Catch regressions early |
| [Cross-Repo Knowledge Share](./cross-repo-knowledge-share/) | Each repo starts from zero knowledge | Org-wide intelligence |

---

## 5-Minute Quick Start

### 1. Get Your API Key

Go to [compose.kubiya.ai/settings#apiKeys](https://compose.kubiya.ai/settings#apiKeys) and create an API key.

### 2. Clone & Setup

```bash
git clone https://github.com/kubiyabot/agentic_ci_cd_examples.git
cd agentic_ci_cd_examples

# Create your .env file
cp .env.example .env

# Add your API key to .env
echo "KUBIYA_API_KEY=your-key-here" > .env

# Install the Kubiya CLI
curl -fsSL https://raw.githubusercontent.com/kubiyabot/cli/main/install.sh | bash
export PATH="$HOME/.kubiya/bin:$PATH"

# Install dependencies
make setup
```

### 3. Run Your First Pipeline

```bash
# Load your API key
source .env

# Run the flaky test detection example
make test-flaky-kubiya
```

That's it! You should see Kubiya analyze your tests and run only the stable ones.

---

## How It Works

When you run `kubiya exec --local --cwd . --yes`:

```
1. EPHEMERAL WORKER    Kubiya spins up a temporary worker on your machine
2. AI PLANNING         Selects the best agent for your task
3. LOCAL EXECUTION     Runs commands with full access to your files
4. AUTO CLEANUP        Worker shuts down when done
```

### The Key Flags

| Flag | What It Does |
|------|--------------|
| `--local` | Creates a temporary worker on your machine (required for file access) |
| `--cwd .` | Tells the agent to work in the current directory |
| `--yes` | Auto-approves the execution plan (needed for CI/CD) |

**Important:** Always use `--local --cwd .` together. Without them, the agent can't access your files.

---

## Available Commands

```bash
make help                  # See all commands

# Flaky Test Detection
make test-flaky            # Run all tests (see the flaky ones fail)
make test-flaky-stable     # Run only stable tests
make test-flaky-kubiya     # Let Kubiya detect and skip flaky tests

# Smart Test Selection
make test-smart            # Run all 54 tests
make test-smart-tasks      # Run only tasks module (13 tests)
make test-smart-kubiya     # Let Kubiya run only affected tests

# Incident Learning Pipeline
make test-incident         # Run tests (may fail randomly)
make test-incident-kubiya  # Run with Kubiya learning from failures

# Build Artifact Analyzer
make test-artifact         # Run tests with coverage
make test-artifact-kubiya  # Run with Kubiya analysis and ingestion

# Performance Regression Detector
make test-perf             # Run benchmarks
make test-perf-kubiya      # Run with baseline comparison

# Cross-Repo Knowledge Share
make test-crossrepo        # Run pattern detection tests
make test-crossrepo-kubiya # Run with org knowledge sharing

# Other
make demo                  # Run everything
make clean                 # Clean up
```

---

## Examples in Detail

### Flaky Test Detection

```bash
cd fleaky-tests-circleci
kubiya exec "Find flaky tests and run only stable ones" --local --cwd . --yes
```

The agent:
1. Scans `__tests__/flaky/` for patterns like `Math.random()`, `new Date()`
2. Reports which tests are flaky and why
3. Runs only stable tests: `npm run test:stable`

**Result:** 100% pass rate instead of random failures.

### Smart Test Selection

```bash
cd smart-test-selection
kubiya exec "Check git diff and run only affected tests" --local --cwd . --yes
```

The agent:
1. Runs `git diff --name-only` to see what changed
2. Maps files to test suites (e.g., `src/tasks/*` → `npm run test:tasks`)
3. Runs only the relevant tests

**Result:** Change one file, run one test suite instead of all 54 tests.

### Incident Learning Pipeline

```bash
cd incident-learning-pipeline
kubiya exec "Run tests and learn from any failures" --local --cwd . --yes
```

The agent:
1. Recalls previous failure learnings from memory
2. Runs tests with known workarounds applied
3. If new failures occur, analyzes root cause
4. Stores learnings for future runs

**Result:** Same failures never surprise you twice.

### Build Artifact Analyzer

```bash
cd build-artifact-analyzer
kubiya exec "Analyze build results and compare to baseline" --local --cwd . --yes
```

The agent:
1. Runs tests and generates coverage/timing data
2. Recalls historical build metrics from memory
3. Compares current run to baseline
4. Stores results and alerts on regressions

**Result:** Track build health over time with trend analysis.

### Performance Regression Detector

```bash
cd performance-regression-detector
kubiya exec "Run benchmarks and check for regressions" --local --cwd . --yes
```

The agent:
1. Recalls performance baselines from memory
2. Runs benchmark suite
3. Compares each benchmark to baseline (>50% slower = regression)
4. Stores results and alerts on significant changes

**Result:** Catch performance regressions before they reach production.

### Cross-Repo Knowledge Share

```bash
cd cross-repo-knowledge-share
kubiya exec "Apply org patterns and contribute learnings" --local --cwd . --yes
```

The agent:
1. Recalls org-wide patterns (test configs, CI patterns, flaky patterns)
2. Applies relevant patterns to this repository
3. Detects new patterns worth sharing
4. Contributes valuable learnings back to org memory

**Result:** Every repository benefits from organizational intelligence.

---

## Using in CI/CD (CircleCI Example)

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
          name: Smart Test Execution
          command: |
            kubiya exec "Analyze changes and run only affected tests" \
              --local --cwd . --yes

workflows:
  test:
    jobs:
      - test:
          context: kubiya-secrets  # Contains KUBIYA_API_KEY
```

---

## Cognitive Memory

Kubiya agents remember what they learn:

- **Flaky patterns** detected in your tests
- **File-to-test mappings** for your codebase
- **Solutions** that worked before

This knowledge is:
- Stored automatically after each run
- Shared across your organization
- Used to make future runs smarter

---

## Troubleshooting

### "Command not found: kubiya"

```bash
export PATH="$HOME/.kubiya/bin:$PATH"
# Add to ~/.bashrc or ~/.zshrc for persistence
```

### "KUBIYA_API_KEY is not set"

```bash
source .env
# Or: export KUBIYA_API_KEY="your-key"
```

### Agent can't find files

Make sure you're using both flags:
```bash
kubiya exec "..." --local --cwd . --yes
#                 ^^^^^^^ ^^^^^^
#                 Both are required!
```

---

## Creating New Use Cases

Want to add your own CI/CD use case? Use the generator script - it creates everything for you automatically.

### Quick Start

```bash
./generate_usecase.sh "Detect security vulnerabilities in npm dependencies"
```

That's it! Kubiya will create a complete, working use case with tests, CI/CD config, and documentation.

### More Examples

```bash
# Security scanning
./generate_usecase.sh "Scan Docker images for CVEs before deployment"

# Cost optimization
./generate_usecase.sh "Track and alert on AWS resource costs in CI"

# Code quality
./generate_usecase.sh "Enforce code coverage thresholds and block PRs below 80%"

# Using make
make generate-usecase DESC="Your use case description here"
```

### What Gets Created

```
your-use-case-name/
├── package.json           # Project config with test scripts
├── jest.config.js         # Test framework setup
├── README.md              # How to use this example
├── .gitignore
├── .circleci/
│   └── config.yml         # CI/CD pipeline (baseline + Kubiya-enhanced)
├── src/
│   └── *.js               # Implementation code
└── __tests__/
    └── unit/
        └── *.test.js      # Working tests
```

### Example Session

```bash
$ ./generate_usecase.sh "Detect security vulnerabilities in npm dependencies"

=== Kubiya Use Case Generator ===

Generating use case for:
  Detect security vulnerabilities in npm dependencies

🤖 Intelligent Task Planning
✓ Discovered 21 agents, 17 teams, 7 environments
✓ Plan generated successfully

  🤖 Using agent: Security Engineer
  📋 Summary: Create CI/CD use case for npm vulnerability detection
  💰 Estimated cost: $0.41

🚀 Starting local worker...
✓ Worker ready (16s)

╭───────────────────────────────────╮
│ CONNECTED • Execution d9f4aea8    │
╰───────────────────────────────────╯

💬 Assistant:
Creating security vulnerability scanner...

✓ 💻 Bash    mkdir -p security-vulnerability-scanner/src
✓ ✏️ Write   package.json
✓ ✏️ Write   jest.config.js
✓ ✏️ Write   .circleci/config.yml
✓ ✏️ Write   src/scanner.js
✓ ✏️ Write   __tests__/unit/scanner.test.js
✓ ✏️ Write   README.md
✓ ✏️ Write   .gitignore

╭──────────────────────────────╮
│ DONE • Completed in 45s      │
╰──────────────────────────────╯

=== Use case generation complete ===

Next steps:
  1. cd security-vulnerability-scanner
  2. npm install
  3. npm test
  4. Add Makefile targets (see suggestions above)
```

### After Generation

```bash
# Navigate to your new use case
cd security-vulnerability-scanner

# Install dependencies
npm install

# Verify tests pass
npm test

# Try it with Kubiya
kubiya exec "Scan for vulnerabilities and report findings" --local --cwd . --yes
```

---

## Learn More

- [Kubiya Documentation](https://docs.kubiya.ai/)
- [CLI Reference](https://docs.kubiya.ai/cli/on-demand-execution)
- [Get API Key](https://compose.kubiya.ai/settings#apiKeys)

---

**Questions?** Open an issue or reach out at [kubiya.ai](https://kubiya.ai)
