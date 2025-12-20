# Agentic CI/CD Pipeline Examples

**Make your CI/CD pipelines intelligent with one command.**

```bash
kubiya exec "Run only the tests that matter" --local --cwd . --yes
```

No config files. No complex setup. Just tell Kubiya what you want.

---

## What's Inside

| Example | Problem It Solves | Time Saved |
|---------|-------------------|------------|
| [Flaky Test Detection](./fleaky-tests-circleci/) | Tests randomly fail, blocking PRs | 100% reliable CI |
| [Smart Test Selection](./smart-test-selection/) | Running all 54 tests for a 1-line change | 70-85% fewer tests |

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

## Learn More

- [Kubiya Documentation](https://docs.kubiya.ai/)
- [CLI Reference](https://docs.kubiya.ai/cli/on-demand-execution)
- [Get API Key](https://compose.kubiya.ai/settings#apiKeys)

---

**Questions?** Open an issue or reach out at [kubiya.ai](https://kubiya.ai)
