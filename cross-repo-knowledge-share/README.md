# Cross-Repository Knowledge Sharing

**Every repository learns from the entire organization.**

```bash
kubiya exec "Apply org-wide patterns and contribute learnings" --local --cwd . --yes
```

---

## The Problem

Each repository starts from zero:
- Team A solves flaky tests, Team B hits the same issue next month
- Best practices exist in one repo, unknown to others
- Same mistakes repeated across teams

**Knowledge is siloed, not shared.**

---

## The Solution

Kubiya's Cognitive Memory creates organizational intelligence:

1. **Learn** → Each repo recalls org-wide patterns
2. **Apply** → Relevant patterns applied automatically
3. **Discover** → New patterns detected during CI
4. **Contribute** → Valuable learnings shared org-wide

---

## Quick Start

### 1. Setup

```bash
cd cross-repo-knowledge-share
npm install

# Ensure API key is set
source ../.env
```

### 2. Learn from Organization

```bash
# Recall and apply org patterns
kubiya exec "
  Recall organization patterns:
  recall_memory('CI patterns for Node.js')
  recall_memory('flaky test patterns')

  Apply relevant patterns to this repo.
" --local --cwd . --yes
```

### 3. Contribute Back

```bash
# Share new patterns with org
kubiya exec "
  Analyze this repository.
  If you find valuable patterns:
  store_memory({
    dataset: 'org-ci-patterns',
    content: 'Pattern discovered here',
    metadata: { applicableTo: ['node', 'jest'] }
  })
" --local --cwd . --yes
```

---

## Memory Integration Patterns

### Pattern A: CLI Pre-fetch → Apply

```bash
# Step 1: Pre-fetch org patterns via CLI
ORG_PATTERNS=$(kubiya memory recall "CI patterns for Node.js" \
  --top-k 10 --output json)

FLAKY_PATTERNS=$(kubiya memory recall "known flaky patterns" \
  --top-k 10 --output json)

# Step 2: Pass to agent
kubiya exec "
  ORGANIZATION PATTERNS:
  $ORG_PATTERNS

  KNOWN FLAKY PATTERNS:
  $FLAKY_PATTERNS

  Apply relevant patterns to this repository.
" --local --cwd . --yes
```

### Pattern B: Agent-Native Bidirectional

```bash
kubiya exec "
  You are an org learning agent.

  PHASE 1 - LEARN:
  recall_memory('CI patterns for Node.js')
  recall_memory('test optimization strategies')

  PHASE 2 - APPLY:
  Apply relevant patterns to this repo.

  PHASE 3 - RUN:
  Execute: npm test

  PHASE 4 - CONTRIBUTE:
  If NEW valuable patterns found:
  store_memory({
    dataset: 'org-ci-patterns',
    content: 'Pattern discovered',
    metadata: { ... }
  })
" --local --cwd . --yes
```

---

## Pattern Types

### CI Patterns
| Pattern | Description | Effectiveness |
|---------|-------------|---------------|
| `dependency_caching` | Cache dependencies between builds | High |
| `parallel_jobs` | Run independent jobs concurrently | High |
| `matrix_builds` | Test across configurations | Medium |

### Quality Patterns
| Pattern | Description | Effectiveness |
|---------|-------------|---------------|
| `static_analysis` | ESLint/TSLint code checking | High |
| `pre_commit_hooks` | Automated checks before commit | High |
| `type_checking` | TypeScript static types | High |

### Test Patterns
| Pattern | Description | Effectiveness |
|---------|-------------|---------------|
| `test_isolation` | Proper setup/teardown | High |
| `mocking` | External dependency mocking | High |
| `async_testing` | Async/await test patterns | High |

### Flaky Patterns (Anti-patterns)
| Pattern | Description | Fix |
|---------|-------------|-----|
| `time_dependency` | Uses `new Date()` | Use fake timers |
| `random_values` | Uses `Math.random()` | Seed or deterministic |
| `hardcoded_ports` | Static port numbers | Dynamic allocation |
| `timing_delays` | `setTimeout` in tests | Use polling/waitFor |

---

## How Sharing Works

```
┌─────────────┐     ┌──────────────────┐     ┌─────────────┐
│   Repo A    │────▶│   Org Memory     │◀────│   Repo B    │
│ (discovers) │     │   (patterns)     │     │  (applies)  │
└─────────────┘     └──────────────────┘     └─────────────┘
       │                    │                       │
       │                    ▼                       │
       │           ┌──────────────────┐            │
       └──────────▶│  Shared Dataset  │◀───────────┘
                   │ org-ci-patterns  │
                   └──────────────────┘
```

---

## Project Structure

```
cross-repo-knowledge-share/
├── __tests__/
│   └── unit/
│       ├── detector.test.js   # Pattern detection tests
│       └── matcher.test.js    # Pattern matching tests
├── src/
│   ├── patterns/
│   │   └── detector.js        # Detect patterns in repos
│   └── learnings/
│       └── matcher.js         # Match org patterns to repo
├── .circleci/
│   └── config.yml            # CI with bidirectional learning
└── package.json
```

---

## Memory Datasets

| Dataset | Scope | Purpose |
|---------|-------|---------|
| `org-ci-patterns` | ORG | Shared CI/CD patterns |
| `org-flaky-patterns` | ORG | Known flaky test patterns |
| `org-best-practices` | ORG | Validated best practices |
| `org-learning-log` | ORG | Learning application log |

---

## Pattern Detection

```javascript
const { PatternDetector } = require('./src/patterns/detector');

const detector = new PatternDetector();

// Detect from package.json
const testFramework = detector.detectTestFramework(packageJson);
const quality = detector.detectQualityPatterns(packageJson);

// Detect from test code
const testPatterns = detector.detectTestPatterns(testCode);
const flaky = detector.detectFlakyPatterns(testCode);

// Make shareable
const shareable = detector.toShareablePattern(pattern, {
  repository: 'my-repo'
});
```

---

## Pattern Matching

```javascript
const { PatternMatcher } = require('./src/learnings/matcher');

const matcher = new PatternMatcher();

// Find applicable org patterns
const applicable = matcher.findApplicablePatterns(orgPatterns, {
  technologies: ['javascript', 'node'],
  frameworks: ['jest', 'react'],
  hasTests: true
});

// Get application instructions
const instructions = matcher.generateApplicationInstructions(
  pattern,
  repoContext
);
```

---

## CircleCI Workflows

### `apply-knowledge`
- Recalls org patterns
- Applies to current repo
- Runs tests with knowledge

### `contribute`
- Analyzes repository
- Detects valuable patterns
- Stores to org memory

### `bidirectional`
- Full learn + contribute cycle
- Best for comprehensive CI

---

## Commands

```bash
# Run tests
npm test

# Detect patterns
npm run patterns

# Contribute to org
npm run contribute

# Apply org learnings
npm run learn
```

---

## Example Contribution

When a repo discovers a useful pattern:

```javascript
store_memory({
  dataset: 'org-ci-patterns',
  content: 'Jest configuration for optimal test isolation',
  metadata: {
    patternType: 'TEST_PATTERN',
    name: 'jest_isolation_config',
    applicableTo: ['jest', 'javascript', 'typescript'],
    effectiveness: 'high',
    discoveredIn: 'payments-service',
    description: 'Configure Jest for proper test isolation with shared state cleanup',
    implementation: `
      // jest.config.js
      module.exports = {
        clearMocks: true,
        resetModules: true,
        restoreMocks: true,
        setupFilesAfterEnv: ['./jest.setup.js']
      };
    `,
    confidence: 0.9
  }
})
```

Other repos can then recall and apply this pattern.

---

## Quality Guidelines

**DO share:**
- Patterns that solved real problems
- Configurations that improved CI speed
- Fixes for flaky tests
- High-confidence learnings

**DON'T share:**
- Repository-specific quirks
- Untested configurations
- Low-confidence patterns
- Temporary workarounds

---

## Next Steps

- Check out [Incident Learning Pipeline](../incident-learning-pipeline/)
- Try [Build Artifact Analyzer](../build-artifact-analyzer/)
- See [Performance Regression Detector](../performance-regression-detector/)
