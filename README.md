# Agentic CI/CD Pipeline Examples

**Make your CI/CD pipelines intelligent in minutes - no complex setup, no vendor lock-in.**

This repository demonstrates how to add AI-powered intelligence to your existing CI/CD pipelines using [Kubiya](https://kubiya.ai). The examples show real-world problems that cost engineering teams hours every week, and how a single command can solve them.

---

## Table of Contents

- [The Problem](#the-problem)
- [The Solution](#the-solution-one-command)
- [Examples](#examples-in-this-repository)
- [Quick Start](#quick-start)
- [Makefile Commands](#makefile-commands)
- [The `kubiya exec` Command](#the-kubiya-exec-command)
- [How It Works](#how-it-works)
- [Cognitive Memory](#cognitive-memory)
- [CircleCI Integration](#circleci-integration)
- [Repository Structure](#repository-structure)
- [Troubleshooting](#troubleshooting)
- [Learn More](#learn-more)

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
- **Stores learnings in cognitive memory** for future runs

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
Before: 54 tests on every commit
After:  13 tests when tasks changed (76% saved)
        0 tests when README changed (100% saved)
```

**[View Example](./smart-test-selection/)**

---

## Quick Start

### Prerequisites

- **Node.js 20+** - [Download](https://nodejs.org/)
- **Kubiya CLI** - [Installation guide](https://docs.kubiya.ai/cli)
- **Kubiya API Key** - [Get yours here](https://app.kubiya.ai/settings#apiKeys)

### Step 1: Clone the Repository

```bash
git clone https://github.com/kubiyabot/agentic_ci_cd_examples.git
cd agentic_ci_cd_examples
```

### Step 2: Set Up Environment

```bash
# Copy the example .env file
cp .env.example .env

# Edit .env with your credentials:
# KUBIYA_API_KEY=your-api-key-here
# KUBIYA_AGENT_UUID=your-agent-uuid (optional, for direct execution)
```

### Step 3: Install Kubiya CLI

```bash
curl -fsSL https://raw.githubusercontent.com/kubiyabot/cli/main/install.sh | bash

# Add to your PATH (add to ~/.bashrc or ~/.zshrc for persistence)
export PATH="$HOME/.kubiya/bin:$PATH"
```

Verify installation:
```bash
kubiya --version
# Output: kubiya version 1.x.x

# Authenticate
kubiya auth status
```

### Step 4: Install Dependencies

```bash
make setup
```

### Step 5: Run Your First Example

```bash
# Source your environment variables
source .env

# Run flaky test detection with Kubiya
make test-flaky-kubiya
```

---

## Makefile Commands

The Makefile provides easy commands to run all examples:

```bash
# See all available commands
make help
```

### Setup & Environment

| Command | Description |
|---------|-------------|
| `make setup` | Install dependencies for all examples |
| `make check-env` | Verify environment is configured |

### Flaky Test Detection

| Command | Description |
|---------|-------------|
| `make test-flaky` | Run ALL tests (shows flaky failures) |
| `make test-flaky-stable` | Run only stable tests |
| `make test-flaky-kubiya` | Run with Kubiya agent |

### Smart Test Selection

| Command | Description |
|---------|-------------|
| `make test-smart` | Run ALL tests |
| `make test-smart-tasks` | Run only tasks module tests |
| `make test-smart-kubiya` | Run with Kubiya agent |

### Utilities

| Command | Description |
|---------|-------------|
| `make demo` | Run full demo (all examples) |
| `make clean` | Clean up node_modules and coverage |

---

## The `kubiya exec` Command

### Basic Syntax

```bash
# Planning mode (recommended for local testing)
kubiya exec "PROMPT" --local --cwd . --yes

# Direct agent execution (for CI/CD with remote workers)
kubiya exec agent AGENT_UUID "PROMPT" --cwd . --yes

# Team execution
kubiya exec team TEAM_ID "PROMPT" --cwd . --yes
```

### Essential Flags

| Flag | Purpose |
|------|---------|
| `"<instruction>"` | Natural language description of what you want |
| `--local` | Run with ephemeral local worker (creates temporary worker) |
| `--cwd .` | **CRITICAL:** Set working directory for file/git access |
| `--yes, -y` | Auto-approve plans (required for CI/CD) |
| `--non-interactive` | Skip all prompts for automation |
| `--output, -o` | Output format (text/json/yaml) |
| `--priority` | Task priority (low/medium/high/critical) |

### Execution Modes

**Planning Mode (Recommended for Local):**
```bash
kubiya exec "analyze tests and run only stable ones" --local --cwd . --yes
```
- Automatically selects best agent/team
- Generates execution plan with cost estimation
- Creates ephemeral worker for execution
- Best for local testing and development

**Direct Agent Mode (For CI/CD):**
```bash
kubiya exec agent $KUBIYA_AGENT_UUID "run tests" --cwd . --yes
```
- Bypasses planning phase
- Faster execution
- Requires pre-configured agent UUID
- Best for production CI/CD pipelines

### Important Notes

1. **Always use `--cwd .`** - This flag is critical for the agent to access files in your repository
2. **Planning mode for local** - Use `kubiya exec "prompt"` with `--local` for local testing
3. **Export API key** - Ensure `KUBIYA_API_KEY` is exported: `export KUBIYA_API_KEY="your-key"`

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
│  │   2. RECALL    → Checks cognitive memory for past learnings  │   │
│  │   3. ANALYZE   → Understands what changed (git diff)         │   │
│  │   4. DECIDE    → Determines what tests to run                │   │
│  │   5. EXECUTE   → Runs only necessary tests                   │   │
│  │   6. STORE     → Saves learnings to cognitive memory         │   │
│  │   7. REPORT    → Explains what it did and why                │   │
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

### Execution Lifecycle

1. **Request Submission** - Your prompt is sent to Kubiya
2. **Planning** - Agent analyzes the task and creates execution plan
3. **Worker Deployment** - Ephemeral worker spins up (with `--local`)
4. **Execution** - Agent runs commands with real-time streaming output
5. **Memory Storage** - Learnings are stored for future reference
6. **Completion** - Results returned, worker cleaned up

---

## Cognitive Memory

Kubiya includes a **Cognitive Memory** system that enables agents to learn and remember across sessions. This is a key differentiator from stateless AI systems.

### What is Cognitive Memory?

Cognitive Memory provides persistent, semantic knowledge storage that enables AI agents to:
- **Learn** from each execution
- **Remember** context across sessions
- **Recall** relevant information using semantic search
- **Share** knowledge between agents in the same organization

### How It Works

```
┌─────────────────────────────────────────────────────────────────────┐
│                      COGNITIVE MEMORY SYSTEM                         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌────────────────┐    ┌────────────────┐    ┌────────────────┐    │
│  │   INGESTION    │ →  │  KNOWLEDGE     │ →  │   SEMANTIC     │    │
│  │                │    │  GRAPH         │    │   SEARCH       │    │
│  │ - Chunking     │    │ - Entities     │    │ - Natural lang │    │
│  │ - Embedding    │    │ - Relations    │    │ - Similarity   │    │
│  │ - Indexing     │    │ - Context      │    │ - Ranking      │    │
│  └────────────────┘    └────────────────┘    └────────────────┘    │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### Key Capabilities

| Feature | Description |
|---------|-------------|
| **Semantic Search** | Natural language queries instead of keyword matching |
| **Temporal Memory** | Time-aware information retrieval |
| **Knowledge Extraction** | Automatic entity and relationship identification |
| **Cross-Agent Sharing** | Agents in same environment share knowledge |

### Agent Memory Operations

Agents automatically have access to these memory functions:

```python
# Store context with metadata
store_memory(content, metadata)

# Semantic search for relevant memories
recall_memory(query, limit)

# List stored memories
list_memories()

# Access dataset details
get_dataset_info()
```

### Dataset Scopes

| Scope | Visibility | Use Case |
|-------|------------|----------|
| **USER** | Private to agent/user | Personal notes, agent-specific learning |
| **ORG** | Organization-wide (default) | Team knowledge, shared solutions |
| **ROLE** | Role-based access | Sensitive procedures, compliance docs |

### Cross-Agent Coordination Example

```
Agent A: Detects node failure, starts recovery
         → Stores: "Cluster A recovering, do not deploy"

Agent B: Needs to deploy, first recalls memory
         → Finds: "Cluster A recovering, do not deploy"
         → Intelligently waits until recovery completes
```

This prevents conflicting operations and enables distributed workflow coordination.

### Managing Datasets via CLI

```bash
# Create a dataset
kubiya cognitive dataset create production-runbooks \
  --scope org \
  --description "Production environment runbooks"

# List datasets
kubiya cognitive dataset list

# View dataset details
kubiya cognitive dataset get production-runbooks

# Delete dataset
kubiya cognitive dataset delete production-runbooks --confirm
```

### Best Practices

1. **Store rich context** - Include details about what was done and why
2. **Use ORG scope** - Enable knowledge sharing across your team
3. **Environment isolation** - Datasets auto-isolate by environment (prod, staging)
4. **Regular cleanup** - Remove outdated memories to keep searches relevant

---

## CircleCI Integration

Both examples include working `.circleci/config.yml` files.

### Required Environment Variables

Set these in your CircleCI context (e.g., `kubiya-secrets`):

| Variable | Description |
|----------|-------------|
| `KUBIYA_API_KEY` | Your Kubiya API key |
| `KUBIYA_AGENT_UUID` | Agent UUID for direct execution |
| `KUBIYA_NON_INTERACTIVE` | Set to `true` for CI environments |

### Setup Steps

1. **Create a CircleCI context** named `kubiya-secrets`
2. **Add environment variables** to the context
3. **Push your code** and watch intelligent CI in action

### Example Pipeline Configuration

```yaml
version: 2.1

jobs:
  intelligent-test:
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
              Analyze the codebase and run tests intelligently.
              Skip flaky tests, run only what's needed.
            " --cwd . --yes

workflows:
  test:
    jobs:
      - intelligent-test:
          context: kubiya-secrets
```

### Local Testing Note

**Important:** `circleci local execute` has limitations with environment variable handling. For local testing, use the Makefile targets instead:

```bash
# Instead of: circleci local execute test-with-kubiya
# Use:
make test-flaky-kubiya
make test-smart-kubiya
```

---

## Repository Structure

```
agentic_ci_cd_examples/
├── README.md                          # This file
├── Makefile                           # Easy-run commands
├── .env.example                       # Environment variable template
├── .env                               # Your local config (gitignored)
│
├── fleaky-tests-circleci/             # Example 1: Flaky test detection
│   ├── __tests__/
│   │   ├── unit/                      # Stable tests (always pass)
│   │   │   ├── utils.test.ts
│   │   │   ├── payment-processor.test.ts
│   │   │   └── user-service.test.ts
│   │   ├── flaky/                     # Intentionally flaky tests
│   │   │   ├── random-failure.test.ts
│   │   │   └── environment-dependent.test.ts
│   │   └── integration/
│   │       └── api.test.ts
│   ├── lib/                           # Application code
│   ├── .circleci/config.yml           # CircleCI configuration
│   ├── package.json
│   └── README.md                      # Detailed documentation
│
└── smart-test-selection/              # Example 2: Smart test selection
    ├── src/
    │   ├── tasks/                     # Tasks module + tests (13 tests)
    │   ├── projects/                  # Projects module + tests (17 tests)
    │   ├── comments/                  # Comments module + tests (6 tests)
    │   ├── tags/                      # Tags module + tests (8 tests)
    │   └── search/                    # Search module + tests (10 tests)
    ├── .circleci/config.yml           # CircleCI configuration
    ├── package.json
    └── README.md                      # Detailed documentation
```

---

## Comparison: Traditional vs Kubiya

| Aspect | Traditional CI | With Kubiya |
|--------|---------------|-------------|
| **Configuration** | Complex YAML, caching rules | One command |
| **Test selection** | Run everything or manual rules | Automatic based on changes |
| **Flaky tests** | Manual tracking, retries | Auto-detected and skipped |
| **Knowledge retention** | None - stateless | Cognitive memory learns |
| **Cross-run learning** | Not possible | Agents remember solutions |
| **Maintenance** | Update rules as code changes | Self-adapting |
| **Time to setup** | Hours/days | 5 minutes |

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
source .env

# Or export directly
export KUBIYA_API_KEY="your-api-key-here"
```

### "Invalid API key" or "Authentication failed"

Verify your API key:
```bash
echo $KUBIYA_API_KEY
kubiya auth status
```

### Agent not finding files

Make sure you're using the `--cwd .` flag:
```bash
kubiya exec "..." --local --cwd . --yes
#                          ^^^^^^ Critical!
```

### "422 error: worker_queue_id required"

This happens with direct agent execution (`kubiya exec agent <UUID>`) using `--local`. Use planning mode instead:
```bash
# Instead of:
kubiya exec agent $UUID "..." --local --cwd . --yes

# Use:
kubiya exec "..." --local --cwd . --yes
```

### Timeout connecting to control plane

This is usually transient. Retry the command:
```bash
# Wait a few seconds and retry
make test-flaky-kubiya
```

---

## Learn More

- **[Kubiya Documentation](https://docs.kubiya.ai/)** - Full platform documentation
- **[kubiya exec Reference](https://docs.kubiya.ai/cli/on-demand-execution)** - Detailed CLI guide
- **[Cognitive Memory](https://docs.kubiya.ai/core-concepts/cognitive-memory/overview)** - Memory system docs
- **[Get API Key](https://app.kubiya.ai/settings#apiKeys)** - Sign up and get your key

---

## License

MIT License - Use these examples freely in your projects.

---

**Questions?** Open an issue or reach out at [kubiya.ai](https://kubiya.ai)
