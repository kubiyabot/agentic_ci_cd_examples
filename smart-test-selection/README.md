# Smart Test Selection with Kubiya

> Run only the tests that matter - save 50-80% of CI time.

## What This Does

Traditional CI runs ALL tests on every commit, even when you only changed one file. This wastes time and resources.

**With Kubiya:**
- Agent analyzes `git diff` to see what changed
- Maps changes to affected modules
- Runs only relevant test suites
- Skips unrelated tests entirely

## Quick Start

### Prerequisites

1. **Node.js 20+**
2. **Kubiya CLI** - [Install instructions](https://docs.kubiya.ai/cli)
3. **Kubiya API Key** - Get from [Kubiya Dashboard](https://app.kubiya.ai)

### 1. Clone and Install

```bash
git clone https://github.com/kubiyabot/agentic_ci_cd_examples.git
cd agentic_ci_cd_examples/smart-test-selection
npm install
```

### 2. Set API Key

```bash
export KUBIYA_API_KEY="your-api-key-here"
```

### 3. Run All Tests (See the Problem)

```bash
# Run ALL 30 tests - takes ~3 seconds
npm run test:all
```

**Output:**
```
PASS  src/tasks/tasks.test.js (13 tests)
PASS  src/projects/projects.test.js (17 tests)

Test Suites: 2 passed, 2 total
Tests:       30 passed, 30 total
Time:        2.847s
```

### 4. Simulate a Change

```bash
# Add a comment to tasks.js (simulating a code change)
echo "// Bug fix" >> src/tasks/tasks.js
```

### 5. Run with Kubiya (See the Solution)

```bash
kubiya exec "
  Check git diff to see what changed.
  If src/tasks/ changed, run: npm run test:tasks
  If src/projects/ changed, run: npm run test:projects
  If only README changed, skip all tests.
  Report how many tests you saved.
" --local --cwd . --yes
```

**Expected Output:**
```
=== Analyzing Changes ===

Changed files:
- src/tasks/tasks.js

=== Module Mapping ===

src/tasks/tasks.js → tasks module

=== Running Targeted Tests ===

Only running: npm run test:tasks

PASS  src/tasks/tasks.test.js

Test Suites: 1 passed, 1 total
Tests:       13 passed, 13 total
Time:        0.892s

=== Efficiency Report ===

- Total tests in project: 30
- Tests actually run: 13
- Tests skipped: 17
- Time saved: ~57%
```

## Project Structure

```
smart-test-selection/
├── src/
│   ├── tasks/
│   │   ├── tasks.js           # Task CRUD operations
│   │   └── tasks.test.js      # 13 tests
│   └── projects/
│       ├── projects.js        # Project management
│       └── projects.test.js   # 17 tests
├── .circleci/config.yml       # CircleCI pipeline
└── package.json
```

## Module → Test Mapping

| Changed File | Test Command | Tests Run |
|--------------|--------------|-----------|
| `src/tasks/*` | `npm run test:tasks` | 13 |
| `src/projects/*` | `npm run test:projects` | 17 |
| `package.json` | `npm run test:all` | 30 |
| `README.md` | (skip) | 0 |

## CircleCI Integration

The `.circleci/config.yml` runs Kubiya automatically:

```yaml
- run:
    name: Intelligent Test Selection
    command: |
      kubiya exec "
        Check git diff HEAD~1.
        Map changes to modules.
        Run only affected tests.
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

| Script | Description | Tests |
|--------|-------------|-------|
| `npm run test:all` | Run ALL tests | 30 |
| `npm run test:tasks` | Run only tasks tests | 13 |
| `npm run test:projects` | Run only projects tests | 17 |

## Example Scenarios

### Scenario 1: Fix a Task Bug

```bash
# Change tasks.js
echo "// Fix validation" >> src/tasks/tasks.js

# Kubiya runs only tasks tests
kubiya exec "Check diff, run only affected tests" --local --cwd . --yes
# Result: 13 tests run, 17 skipped (57% saved)
```

### Scenario 2: Update Documentation

```bash
# Change README only
echo "## Update" >> README.md

# Kubiya skips all tests
kubiya exec "Check diff, run only affected tests" --local --cwd . --yes
# Result: 0 tests run (100% saved)
```

### Scenario 3: Update Dependencies

```bash
# Change package.json
npm install lodash

# Kubiya runs all tests (dependencies affect everything)
kubiya exec "Check diff, run only affected tests" --local --cwd . --yes
# Result: 30 tests run (full coverage needed)
```

## Metrics

| Scenario | Without Kubiya | With Kubiya | Saved |
|----------|----------------|-------------|-------|
| Tasks change | 30 tests (3s) | 13 tests (1s) | 57% |
| Projects change | 30 tests (3s) | 17 tests (1.2s) | 43% |
| Docs only | 30 tests (3s) | 0 tests (0s) | 100% |

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
│     └── npm run test:tasks                                  │
│                                                              │
│  4. EXECUTE                                                  │
│     └── Run 13 tests (skip 17)                              │
│                                                              │
│  5. REPORT                                                   │
│     └── 57% time saved                                      │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Learn More

- [Kubiya Documentation](https://docs.kubiya.ai/)
- [kubiya exec Reference](https://docs.kubiya.ai/cli/on-demand-execution)
