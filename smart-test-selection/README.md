# Smart Test Selection with Kubiya

**Stop running 30 minutes of tests when you only changed one file.**

This example shows how Kubiya agents can analyze your git diff and run only the tests that are actually affected by your changes.

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

---

## Quick Start

### Prerequisites

- **Node.js 20+**
- **Kubiya CLI** - [Installation guide](https://docs.kubiya.ai/cli)
- **Kubiya API Key** - [Get yours here](https://app.kubiya.ai)

### Step 1: Clone and Install

```bash
git clone https://github.com/kubiyabot/agentic_ci_cd_examples.git
cd agentic_ci_cd_examples/smart-test-selection
npm install
```

### Step 2: Set Your API Key

```bash
export KUBIYA_API_KEY="your-api-key-here"
```

### Step 3: See the Problem

Run all tests:

```bash
npm run test:all
```

**Output:**

```
 PASS  src/tasks/tasks.test.js
 PASS  src/projects/projects.test.js

Test Suites: 2 passed, 2 total
Tests:       30 passed, 30 total
Time:        2.847s
```

30 tests run. Every single time. Even for a one-line change.

### Step 4: Simulate a Code Change

```bash
# Add a comment to tasks.js (simulating a bug fix)
echo "// Bug fix for task validation" >> src/tasks/tasks.js
```

### Step 5: See the Solution

Now let Kubiya be smart about it:

```bash
kubiya exec "
  Check git diff to see what files changed.

  Use this mapping:
  - src/tasks/* changes → run: npm run test:tasks
  - src/projects/* changes → run: npm run test:projects
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

Total tests in project: 30
Tests actually run:     13
Tests skipped:          17

Time saved: ~57%
```

**You just saved 57% of your test time** by running only what mattered.

---

## Project Structure

```
smart-test-selection/
├── src/
│   ├── tasks/                    # Tasks module
│   │   ├── tasks.js              # Task CRUD operations
│   │   └── tasks.test.js         # 13 tests
│   │
│   └── projects/                 # Projects module
│       ├── projects.js           # Project management
│       └── projects.test.js      # 17 tests
│
├── .circleci/config.yml          # CircleCI pipeline
├── package.json
└── jest.config.js
```

---

## Change → Test Mapping

| What Changed | Test Command | Tests Run | Tests Skipped |
|--------------|--------------|-----------|---------------|
| `src/tasks/*` | `npm run test:tasks` | 13 | 17 (57% saved) |
| `src/projects/*` | `npm run test:projects` | 17 | 13 (43% saved) |
| Both modules | `npm run test:all` | 30 | 0 |
| `package.json` | `npm run test:all` | 30 | 0 (deps affect all) |
| `README.md` only | (skip) | 0 | 30 (100% saved) |

---

## Available npm Scripts

| Command | What It Does | Tests |
|---------|--------------|-------|
| `npm run test:all` | Run ALL tests | 30 |
| `npm run test:tasks` | Run only tasks module tests | 13 |
| `npm run test:projects` | Run only projects module tests | 17 |

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

3. **Watch intelligent test selection in action.**

### The Pipeline

```yaml
version: 2.1

jobs:
  smart-test:
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
          name: Smart Test Selection
          command: |
            kubiya exec "
              STEP 1: Run git diff HEAD~1 --name-only to see changes
              STEP 2: Map changes to test suites:
                      - src/tasks/* → npm run test:tasks
                      - src/projects/* → npm run test:projects
                      - package.json → npm run test:all
                      - README only → skip tests
              STEP 3: Execute the appropriate test command
              STEP 4: Report what ran and what was saved
            " --local --cwd . --yes

workflows:
  test:
    jobs:
      - smart-test:
          context: kubiya
```

---

## How It Works

```
┌─────────────────────────────────────────────────────────────┐
│                    kubiya exec --local                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. DIFF                                                     │
│     └── git diff HEAD~1 --name-only                         │
│         Output: src/tasks/tasks.js                          │
│                                                              │
│  2. MAP                                                      │
│     └── src/tasks/* → tasks module                          │
│                                                              │
│  3. SELECT                                                   │
│     └── Command: npm run test:tasks                         │
│                                                              │
│  4. EXECUTE                                                  │
│     └── Run 13 tests (skip 17)                              │
│                                                              │
│  5. REPORT                                                   │
│     └── 57% time saved                                      │
│                                                              │
└─────────────────────────────────────────────────────────────┘
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

**Result:** 13 tests run, 17 skipped (57% saved)

### Scenario 2: Update Documentation

```bash
# Change only README
echo "## Updated docs" >> README.md

# Kubiya skips all tests
kubiya exec "Check diff, run only affected tests" --local --cwd . --yes
```

**Result:** 0 tests run, 30 skipped (100% saved)

### Scenario 3: Update Dependencies

```bash
# Install a new package
npm install lodash

# Kubiya runs all tests (dependencies affect everything)
kubiya exec "Check diff, run only affected tests" --local --cwd . --yes
```

**Result:** 30 tests run, 0 skipped (full coverage needed)

### Scenario 4: Change Multiple Modules

```bash
# Change both modules
echo "// Update" >> src/tasks/tasks.js
echo "// Update" >> src/projects/projects.js

# Kubiya runs all tests
kubiya exec "Check diff, run only affected tests" --local --cwd . --yes
```

**Result:** 30 tests run, 0 skipped (both modules affected)

---

## Results

| Scenario | Without Kubiya | With Kubiya | Saved |
|----------|----------------|-------------|-------|
| Tasks change | 30 tests (3s) | 13 tests (1s) | 57% |
| Projects change | 30 tests (3s) | 17 tests (1.2s) | 43% |
| Docs only | 30 tests (3s) | 0 tests (0s) | 100% |
| Both modules | 30 tests (3s) | 30 tests (3s) | 0% |

**Average savings: 50-70%** on typical workdays where most changes are isolated.

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

---

## Learn More

- **[Kubiya Documentation](https://docs.kubiya.ai/)**
- **[kubiya exec Reference](https://docs.kubiya.ai/cli/on-demand-execution)**
- **[Main Examples README](../README.md)**

---

## Next Steps

1. Try the **[Flaky Test Detection](../fleaky-tests-circleci/)** example
2. Combine both patterns: smart selection + flaky detection
3. Add Kubiya to your monorepo for even bigger savings
