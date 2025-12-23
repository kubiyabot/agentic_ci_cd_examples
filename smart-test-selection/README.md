# Smart Test Selection

**Stop running all tests when you only changed one file.**

```bash
kubiya exec "Check git diff and run only affected tests" --local --cwd . --yes
```

---

## The Problem

You fix a typo in one file:

```bash
git commit -m "Fix typo in tasks.js"
```

CI runs **all 54 tests**. Takes 3 minutes. Every. Single. Time.

The waste adds up:
- 100 commits/day × 3 min = 5 hours of CI time daily
- Developers waiting for feedback
- Cloud costs for unnecessary compute

---

## The Solution

Kubiya automatically:
1. Runs `git diff` to see what changed
2. Maps changed files to their test suites
3. Runs only the relevant tests

**Result:** Change `src/tasks/tasks.js` → run only 13 tests instead of 54.

---

## Quick Start

### 1. Setup (one time)

```bash
# From the repo root
cp .env.example .env
# Edit .env and add your KUBIYA_API_KEY from https://compose.kubiya.ai/settings#apiKeys

# Install dependencies
cd smart-test-selection
npm install
```

### 2. See the Problem

```bash
npm run test:all
# Runs all 54 tests - takes a while
```

### 3. See the Solution

```bash
# Simulate a change
echo "// fix" >> src/tasks/tasks.js

# From repo root
source .env
make test-smart-kubiya

# Or run directly
kubiya exec "Check git diff, then run only tests for changed modules" \
  --local --cwd . --yes
```

Only 13 tests run (the tasks module). **76% saved.**

---

## File → Test Mapping

| Changed File | Test Command | Tests Run | Saved |
|--------------|--------------|-----------|-------|
| `src/tasks/*` | `npm run test:tasks` | 13 | 76% |
| `src/projects/*` | `npm run test:projects` | 17 | 69% |
| `src/comments/*` | `npm run test:comments` | 6 | 89% |
| `src/tags/*` | `npm run test:tags` | 8 | 85% |
| `src/search/*` | `npm run test:search` | 10 | 81% |
| `package.json` | `npm run test:all` | 54 | 0% |
| `README.md` | (skip) | 0 | 100% |

---

## Project Structure

```
src/
├── tasks/          # 13 tests
│   ├── tasks.js
│   └── tasks.test.js
│
├── projects/       # 17 tests
│   ├── projects.js
│   └── projects.test.js
│
├── comments/       # 6 tests
│   ├── comments.js
│   └── comments.test.js
│
├── tags/           # 8 tests
│   ├── tags.js
│   └── tags.test.js
│
└── search/         # 10 tests
    ├── search.js
    └── search.test.js

Total: 54 tests across 5 modules
```

---

## Available Commands

```bash
npm run test:all        # All 54 tests
npm run test:tasks      # Just tasks (13 tests)
npm run test:projects   # Just projects (17 tests)
npm run test:comments   # Just comments (6 tests)
npm run test:tags       # Just tags (8 tests)
npm run test:search     # Just search (10 tests)
```

Or use the Makefile from the repo root:

```bash
make test-smart           # Run all 54 tests
make test-smart-tasks     # Run just tasks module
make test-smart-kubiya    # Let Kubiya pick the right tests
```

---

## How `--local` Works

The `--local` flag creates a temporary worker on your machine:

```
kubiya exec "..." --local --cwd . --yes
                  ^^^^^^^
                  Creates ephemeral worker queue
                          ^^^^^^
                          Sets working directory (required for git/file access)
```

**What happens:**
1. Ephemeral worker queue spins up locally
2. Agent runs `git diff` and reads your files
3. Executes the right `npm run test:*` command
4. Worker auto-destroys when done

**Without `--local`:** Agent runs remotely and can't access your git repo.

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
          name: Fetch git history
          command: git fetch origin main --depth=2 || true
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
            kubiya exec "Check git diff and run only affected test suites" \
              --local --cwd . --yes

workflows:
  test:
    jobs:
      - test:
          context: kubiya-secrets  # Contains KUBIYA_API_KEY
```

---

## Example Scenarios

### Changed one module

```bash
echo "// fix" >> src/tasks/tasks.js
kubiya exec "Check diff, run affected tests" --local --cwd . --yes
# Result: 13 tests (tasks only)
```

### Changed documentation

```bash
echo "## update" >> README.md
kubiya exec "Check diff, run affected tests" --local --cwd . --yes
# Result: 0 tests (docs don't need tests)
```

### Changed dependencies

```bash
npm install lodash
kubiya exec "Check diff, run affected tests" --local --cwd . --yes
# Result: 54 tests (package.json affects everything)
```

### Changed multiple modules

```bash
echo "// fix" >> src/tasks/tasks.js
echo "// fix" >> src/projects/projects.js
kubiya exec "Check diff, run affected tests" --local --cwd . --yes
# Result: 30 tests (tasks + projects)
```

---

## Troubleshooting

### "KUBIYA_API_KEY is not set"

```bash
source .env
# Or: export KUBIYA_API_KEY="your-key"
```

### Agent can't access git

Always use both flags:
```bash
kubiya exec "..." --local --cwd . --yes
```

### No git diff available

Make sure you have commits to compare:
```bash
git log --oneline -3
```

---

## Next Steps

- Try [Flaky Test Detection](../fleaky-tests-circleci/) to skip unreliable tests
- Combine both: smart selection + flaky detection
- Check the [main README](../README.md) for more examples

<!-- CI trigger: 1766363472 -->
