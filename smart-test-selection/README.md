# Smart Test Selection with Kubiya

**Stop running 30 minutes of tests when you only changed one file.**

This example shows how Kubiya agents can analyze your git diff and run only the tests that are actually affected by your changes.

---

## Table of Contents

- [The Problem](#the-problem)
- [The Solution](#the-solution)
- [Quick Start](#quick-start)
- [Using the Makefile](#using-the-makefile-recommended)
- [Project Structure](#project-structure)
- [Change to Test Mapping](#change-to-test-mapping)
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

Every commit triggers your full test suite:

```
git commit -m "Fix typo in tasks.js"
CI: Running ALL 500 tests... (8 minutes)
```

You changed one file. Why run tests for the entire codebase?

The waste adds up:
- 100 commits/day x 8 minutes = 13+ hours of CI time daily
- Developers waiting on feedback
- Cloud costs for unnecessary compute
- Slower release cycles

---

## The Solution

```bash
kubiya exec "Check git diff and run only tests for changed modules" --local --cwd . --yes
```

The Kubiya agent:
1. Runs `git diff` to see what changed
2. Maps changed files to their test suites
3. Runs only the relevant tests
4. Skips everything else
5. Reports how much time/tests you saved
6. **Stores mappings in cognitive memory** for faster future runs

---

## Quick Start

### Prerequisites

- **Node.js 20+** - [Download](https://nodejs.org/)
- **Kubiya CLI** - [Installation guide](https://docs.kubiya.ai/cli)
- **Kubiya API Key** - [Get yours here](https://app.kubiya.ai/settings#apiKeys)

### Step 1: Clone and Install

```bash
git clone https://github.com/kubiyabot/agentic_ci_cd_examples.git
cd agentic_ci_cd_examples/smart-test-selection
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

Run all tests:

```bash
npm run test:all
```

**Output:**

```
 PASS  src/tasks/tasks.test.js
 PASS  src/projects/projects.test.js
 PASS  src/comments/comments.test.js
 PASS  src/tags/tags.test.js
 PASS  src/search/search.test.js

Test Suites: 5 passed, 5 total
Tests:       54 passed, 54 total
Time:        2.847s
```

54 tests run. Every single time. Even for a one-line change.

### Step 5: Simulate a Code Change

```bash
# Add a comment to tasks.js (simulating a bug fix)
echo "// Bug fix for task validation" >> src/tasks/tasks.js
```

### Step 6: See the Solution

Now let Kubiya be smart about it:

```bash
kubiya exec "
  Check git diff to see what files changed.

  Use this mapping:
  - src/tasks/* changes → run: npm run test:tasks
  - src/projects/* changes → run: npm run test:projects
  - src/comments/* changes → run: npm run test:comments
  - src/tags/* changes → run: npm run test:tags
  - src/search/* changes → run: npm run test:search
  - package.json changes → run: npm run test:all
  - README changes → skip tests entirely

  Run only the tests for changed modules.
  Report how many tests you saved.
" --local --cwd . --yes
```

**Expected output:**

```
=== Analyzing Git Diff ===

Running: git diff --name-only

Changed files:
  - src/tasks/tasks.js

=== Mapping Changes to Tests ===

┌─────────────────────┬─────────────────────┬──────────────────────┐
│ Changed File        │ Module              │ Test Command         │
├─────────────────────┼─────────────────────┼──────────────────────┤
│ src/tasks/tasks.js  │ tasks               │ npm run test:tasks   │
└─────────────────────┴─────────────────────┴──────────────────────┘

=== Running Targeted Tests ===

Executing: npm run test:tasks

 PASS  src/tasks/tasks.test.js

Test Suites: 1 passed, 1 total
Tests:       13 passed, 13 total
Time:        0.892s

=== Efficiency Report ===

Total tests in project: 54
Tests actually run:     13
Tests skipped:          41

Time saved: ~76%
```

**You just saved 76% of your test time** by running only what mattered.

---

## Using the Makefile (Recommended)

The easiest way to run this example is using the Makefile from the parent directory:

```bash
cd ..  # Go to agentic_ci_cd_examples root

# See all available commands
make help

# Run ALL tests
make test-smart

# Run only tasks module tests
make test-smart-tasks

# Run with Kubiya agent
make test-smart-kubiya
```

---

## Project Structure

```
smart-test-selection/
├── src/
│   ├── tasks/                    # Tasks module
│   │   ├── tasks.js              # Task CRUD operations
│   │   └── tasks.test.js         # 13 tests
│   │
│   ├── projects/                 # Projects module
│   │   ├── projects.js           # Project management
│   │   └── projects.test.js      # 17 tests
│   │
│   ├── comments/                 # Comments module
│   │   ├── comments.js           # Comment management
│   │   └── comments.test.js      # 6 tests
│   │
│   ├── tags/                     # Tags module
│   │   ├── tags.js               # Tag management
│   │   └── tags.test.js          # 8 tests
│   │
│   └── search/                   # Search module
│       ├── search.js             # Search & filtering
│       └── search.test.js        # 10 tests
│
├── .circleci/config.yml          # CircleCI pipeline
├── package.json
└── jest.config.js
```

**Total: 54 tests across 5 modules**

---

## Change to Test Mapping

| What Changed | Test Command | Tests Run | Tests Skipped |
|--------------|--------------|-----------|---------------|
| `src/tasks/*` | `npm run test:tasks` | 13 | 41 (76% saved) |
| `src/projects/*` | `npm run test:projects` | 17 | 37 (69% saved) |
| `src/comments/*` | `npm run test:comments` | 6 | 48 (89% saved) |
| `src/tags/*` | `npm run test:tags` | 8 | 46 (85% saved) |
| `src/search/*` | `npm run test:search` | 10 | 44 (81% saved) |
| `package.json` | `npm run test:all` | 54 | 0 (deps affect all) |
| `README.md` only | (skip) | 0 | 54 (100% saved) |

---

## Available npm Scripts

| Command | What It Does | Tests |
|---------|--------------|-------|
| `npm run test:all` | Run ALL tests | 54 |
| `npm run test:tasks` | Run only tasks module tests | 13 |
| `npm run test:projects` | Run only projects module tests | 17 |
| `npm run test:comments` | Run only comments module tests | 6 |
| `npm run test:tags` | Run only tags module tests | 8 |
| `npm run test:search` | Run only search module tests | 10 |

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
| `--local` | Creates an ephemeral worker queue on your machine |
| `--cwd .` | **CRITICAL:** Set working directory to current folder |
| `--yes` | Auto-confirm actions (required for CI) |

### The `--local` Flag and Ephemeral Queues

The `--local` flag creates a temporary worker queue directly on your machine:

```bash
kubiya exec "Check git diff" --local --cwd . --yes
```

**What happens:**
1. **Ephemeral Queue Created** - A temporary worker queue spins up locally
2. **Agent Executes Locally** - Commands run in your environment with access to local files
3. **Auto-Cleanup** - Queue is destroyed after execution completes

**Why this matters for smart test selection:**
```
Without --local: Agent can't access your git repository or run local tests
With --local:    Agent runs git diff, reads files, and executes npm commands locally
```

This is essential for:
- Running `git diff` to detect changed files
- Executing test commands (`npm run test:tasks`, etc.)
- Reading source files to understand code structure

### Execution Modes

**Planning Mode (Recommended):**
```bash
kubiya exec "Check git diff and run only affected tests" --local --cwd . --yes
```
- Automatically selects best agent for the task
- Creates ephemeral worker queue for local execution
- Works reliably for local testing and CI/CD

**Direct Agent Mode:**
```bash
kubiya exec agent <AGENT_UUID> "run affected tests" --cwd . --yes
```
- Bypasses planning phase for faster execution
- Uses remote workers (requires dedicated worker setup)
- Best for production CI/CD with pre-configured infrastructure

---

## CircleCI Integration

The included `.circleci/config.yml` runs Kubiya automatically on every push using direct agent execution for faster CI runs.

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

4. **Watch intelligent test selection in action.**

### The Pipeline

```yaml
version: 2.1

jobs:
  test-intelligent:
    docker:
      - image: cimg/node:20.11
    environment:
      KUBIYA_NON_INTERACTIVE: "true"
    steps:
      - checkout

      - run:
          name: Fetch git history for diff
          command: git fetch origin main --depth=2 || true

      - run:
          name: Install Kubiya CLI
          command: |
            curl -fsSL https://raw.githubusercontent.com/kubiyabot/cli/main/install.sh | bash
            echo 'export PATH="$HOME/.kubiya/bin:$PATH"' >> $BASH_ENV

      - run:
          name: Install Dependencies
          command: npm install

      - run:
          name: Intelligent Test Selection
          command: |
            kubiya exec agent ${KUBIYA_AGENT_UUID} "
            You are an intelligent CI/CD agent that runs only relevant tests.

            MODULE STRUCTURE:
            - src/tasks/ → npm run test:tasks (13 tests)
            - src/projects/ → npm run test:projects (17 tests)
            - src/comments/ → npm run test:comments (6 tests)
            - src/tags/ → npm run test:tags (8 tests)
            - src/search/ → npm run test:search (10 tests)

            TASK: Analyze changes and run only affected tests

            STEP 1 - Check what changed:
            Run: git diff HEAD~1 --name-only

            STEP 2 - Map changes to modules and run only affected test commands.

            STEP 3 - Report efficiency (tests run vs total 54).
            " --cwd . --yes

workflows:
  intelligent-testing:
    jobs:
      - test-intelligent:
          context:
            - kubiya-secrets
```

### Local Testing Note

**Important:** `circleci local execute` has limitations with environment variable handling. For local testing, use the Makefile targets instead:

```bash
# Instead of: circleci local execute test-intelligent
# Use:
make test-smart-kubiya
```

---

## How It Works

```
┌─────────────────────────────────────────────────────────────┐
│                    kubiya exec --local --cwd .              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. DIFF                                                     │
│     └── git diff HEAD~1 --name-only                         │
│         Output: src/tasks/tasks.js                          │
│                                                              │
│  2. RECALL                                                   │
│     └── Check cognitive memory for file→test mappings       │
│                                                              │
│  3. MAP                                                      │
│     └── src/tasks/* → tasks module                          │
│                                                              │
│  4. SELECT                                                   │
│     └── Command: npm run test:tasks                         │
│                                                              │
│  5. EXECUTE                                                  │
│     └── Run 13 tests (skip 41)                              │
│                                                              │
│  6. STORE                                                    │
│     └── Save mapping to cognitive memory                    │
│                                                              │
│  7. REPORT                                                   │
│     └── 76% time saved                                      │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Cognitive Memory Integration

Kubiya agents use **Cognitive Memory** to learn and remember across sessions:

### How It Benefits This Example

1. **File-to-Test Mapping Storage** - Agent learns which files trigger which tests
2. **Dependency Tracking** - Remembers cross-module dependencies
3. **Pattern Recognition** - Identifies which changes typically require full test runs
4. **Team Knowledge Sharing** - Mappings are shared across your organization

### Memory Operations

```python
# Agent stores file→test mappings
store_memory(
    content="src/tasks/* files map to npm run test:tasks (13 tests)",
    metadata={
        "category": "test-mapping",
        "module": "tasks",
        "test_count": 13,
        "environment": "ci"
    }
)

# Agent recalls mappings on subsequent runs
recall_memory("test mapping for src/tasks files")
```

### Semantic Search for Test Mappings

| Query | What It Finds |
|-------|---------------|
| "test mapping for tasks" | npm run test:tasks |
| "what tests for projects module" | npm run test:projects |
| "cross-module dependencies" | Files that require full test suite |

### Learning from Historical Runs

Over time, the agent builds knowledge about:
- Which file changes tend to break which tests
- Hidden dependencies not obvious from file structure
- Optimal test ordering for faster feedback
- Common patterns that require full test runs

---

## Results

| Scenario | Without Kubiya | With Kubiya | Saved |
|----------|----------------|-------------|-------|
| Tasks change | 54 tests | 13 tests | 76% |
| Projects change | 54 tests | 17 tests | 69% |
| Comments change | 54 tests | 6 tests | 89% |
| Tags change | 54 tests | 8 tests | 85% |
| Docs only | 54 tests | 0 tests | 100% |
| All modules | 54 tests | 54 tests | 0% |

**Average savings: 70-85%** on typical workdays where most changes are isolated to a single module.

---

## Customization

### Add More Modules

Extend the mapping for your codebase:

```bash
kubiya exec "
  Check git diff and map to test suites:

  - src/auth/* → npm run test:auth
  - src/api/* → npm run test:api
  - src/database/* → npm run test:db
  - src/ui/* → npm run test:ui
  - src/utils/* → npm run test:all (utils affect everything)
  - package.json → npm run test:all
  - *.md → skip tests

  Run only affected tests.
" --local --cwd . --yes
```

### Add Dependency Analysis

For smarter cross-module detection:

```bash
kubiya exec "
  1. Check git diff for changed files
  2. Analyze imports in changed files
  3. Find all files that import from changed files
  4. Run tests for all affected modules
  5. Report the dependency chain
" --local --cwd . --yes
```

### Multiple Module Changes

When multiple modules change, run all relevant tests:

```bash
kubiya exec "
  Check what changed in this commit.

  For each changed file:
  - Identify its module
  - Queue that module's tests

  Run all queued test commands.
  Report total coverage.
" --local --cwd . --yes
```

---

## Example Scenarios

### Scenario 1: Fix a Task Bug

```bash
# Make a change to tasks
echo "// Fix validation" >> src/tasks/tasks.js

# Kubiya runs only tasks tests
kubiya exec "Check diff, run only affected tests" --local --cwd . --yes
```

**Result:** 13 tests run, 41 skipped (76% saved)

### Scenario 2: Update Documentation

```bash
# Change only README
echo "## Updated docs" >> README.md

# Kubiya skips all tests
kubiya exec "Check diff, run only affected tests" --local --cwd . --yes
```

**Result:** 0 tests run, 54 skipped (100% saved)

### Scenario 3: Update Dependencies

```bash
# Install a new package
npm install lodash

# Kubiya runs all tests (dependencies affect everything)
kubiya exec "Check diff, run only affected tests" --local --cwd . --yes
```

**Result:** 54 tests run, 0 skipped (full coverage needed)

### Scenario 4: Change Multiple Modules

```bash
# Change multiple modules
echo "// Update" >> src/tasks/tasks.js
echo "// Update" >> src/projects/projects.js

# Kubiya runs tests for both modules
kubiya exec "Check diff, run only affected tests" --local --cwd . --yes
```

**Result:** 30 tests run (tasks + projects), 24 skipped (44% saved)

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
make test-smart-kubiya
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

### No git diff available

If there's no git history to diff against:
```bash
# Ensure you have at least 2 commits
git log --oneline -5

# Or specify what to test manually
kubiya exec "Run npm run test:tasks" --local --cwd . --yes
```

---

## Learn More

- **[Kubiya Documentation](https://docs.kubiya.ai/)**
- **[kubiya exec Reference](https://docs.kubiya.ai/cli/on-demand-execution)**
- **[Cognitive Memory](https://docs.kubiya.ai/core-concepts/cognitive-memory/overview)**
- **[Main Examples README](../README.md)**

---

## Next Steps

1. Try the **[Flaky Test Detection](../fleaky-tests-circleci/)** example
2. Combine both patterns: smart selection + flaky detection
3. Add Kubiya to your monorepo for even bigger savings
4. Leverage cognitive memory to learn optimal test patterns
