# Agentic CI/CD Examples

> Make your CI/CD pipelines intelligent with Kubiya agents. Zero overhead, instant results.

## What's Inside

Two practical examples showing how to add AI intelligence to CI/CD pipelines:

| Example | Problem Solved | Time Saved |
|---------|---------------|------------|
| [**fleaky-tests-circleci**](./fleaky-tests-circleci/) | Flaky tests blocking PRs | 50%+ |
| [**smart-test-selection**](./smart-test-selection/) | Running unnecessary tests | 50-80% |

## How It Works

```
┌─────────────────────────────────────────────────────────────────┐
│                     Your CI Pipeline                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   1. Push code                                                   │
│      │                                                           │
│      ▼                                                           │
│   2. kubiya exec "Analyze tests, run only what's needed"        │
│      │         --local --cwd . --yes                            │
│      │                                                           │
│      ▼                                                           │
│   3. Kubiya Agent:                                              │
│      ├── Reads your code                                        │
│      ├── Analyzes git diff                                      │
│      ├── Makes intelligent decisions                            │
│      └── Runs only necessary tests                              │
│      │                                                           │
│      ▼                                                           │
│   4. Fast, reliable CI results                                  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Quick Start

### 1. Install Kubiya CLI

```bash
curl -fsSL https://raw.githubusercontent.com/kubiyabot/cli/main/install.sh | bash
```

### 2. Set Your API Key

```bash
export KUBIYA_API_KEY="your-api-key"
# Get your key from: https://app.kubiya.ai
```

### 3. Try an Example

```bash
# Clone this repo
git clone https://github.com/kubiyabot/agentic_ci_cd_examples.git
cd agentic_ci_cd_examples

# Try flaky test detection
cd fleaky-tests-circleci
npm install
kubiya exec "Analyze __tests__/flaky/ for flaky patterns and run stable tests" --local --cwd . --yes

# Or try smart test selection
cd ../smart-test-selection
npm install
kubiya exec "Check git diff and run only affected tests" --local --cwd . --yes
```

## Example 1: Flaky Test Detection

**Problem:** Flaky tests fail randomly, blocking PRs and wasting developer time.

**Solution:** Kubiya analyzes test code, identifies flaky patterns, and skips them.

```bash
cd fleaky-tests-circleci

# See the problem - some tests fail randomly
npm run test:all

# See the solution - only stable tests run
kubiya exec "Skip flaky tests, run only stable ones" --local --cwd . --yes
```

[**Full Documentation →**](./fleaky-tests-circleci/)

## Example 2: Smart Test Selection

**Problem:** CI runs ALL tests even when only one file changed.

**Solution:** Kubiya checks git diff and runs only affected test suites.

```bash
cd smart-test-selection

# See the problem - all 30 tests run
npm run test:all

# See the solution - only affected tests run
echo "// fix" >> src/tasks/tasks.js
kubiya exec "Run only tests for changed modules" --local --cwd . --yes
```

[**Full Documentation →**](./smart-test-selection/)

## CircleCI Integration

Both examples include ready-to-use CircleCI configs:

```yaml
# .circleci/config.yml
- run:
    name: Intelligent Test Execution
    command: |
      kubiya exec "
        Analyze code and run tests intelligently
      " --local --cwd . --yes
```

### Setup

1. Add `KUBIYA_API_KEY` to CircleCI Environment Variables
2. Push your code
3. Watch intelligent CI in action

## Why Kubiya?

| Traditional CI | With Kubiya |
|---------------|-------------|
| Runs ALL tests every time | Runs only what's needed |
| Flaky tests block PRs | Flaky tests auto-skipped |
| No code understanding | Analyzes actual code |
| Static rules | Intelligent decisions |
| 3-5 min test runs | 30-60 second runs |

## Key Features

- **Zero Config**: Just `KUBIYA_API_KEY` - everything connects automatically
- **Local Execution**: `--local` flag runs agent in your CI environment
- **Full Context**: Agent sees files, git history, environment
- **Natural Language**: Describe what you want in plain English

## Support

- [Kubiya Documentation](https://docs.kubiya.ai/)
- [kubiya exec Reference](https://docs.kubiya.ai/cli/on-demand-execution)
- [Report Issues](https://github.com/kubiyabot/agentic_ci_cd_examples/issues)
