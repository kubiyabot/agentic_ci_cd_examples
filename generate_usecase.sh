#!/bin/bash
set -e

# ============================================================
# Kubiya Use Case Generator
# Automatically creates new CI/CD use case examples
# ============================================================

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== Kubiya Use Case Generator ===${NC}"
echo ""

# Validate prerequisites
if [ -z "$KUBIYA_API_KEY" ]; then
    echo -e "${RED}Error: KUBIYA_API_KEY is not set${NC}"
    echo "Get your API key at: https://compose.kubiya.ai/settings#apiKeys"
    echo ""
    echo "Then run:"
    echo "  export KUBIYA_API_KEY=\"your-key-here\""
    exit 1
fi

if ! command -v kubiya &> /dev/null; then
    echo -e "${RED}Error: kubiya CLI is not installed${NC}"
    echo ""
    echo "Install with:"
    echo "  curl -fsSL https://raw.githubusercontent.com/kubiyabot/cli/main/install.sh | bash"
    echo "  export PATH=\"\$HOME/.kubiya/bin:\$PATH\""
    exit 1
fi

if [ -z "$1" ]; then
    echo -e "${YELLOW}Usage:${NC}"
    echo "  ./generate_usecase.sh \"Description of the use case\""
    echo ""
    echo -e "${YELLOW}Examples:${NC}"
    echo "  ./generate_usecase.sh \"Detect security vulnerabilities in npm dependencies\""
    echo "  ./generate_usecase.sh \"Track and reduce Docker image sizes across builds\""
    echo "  ./generate_usecase.sh \"Analyze code coverage trends and alert on drops\""
    exit 1
fi

DESCRIPTION="$1"

echo -e "${YELLOW}Generating use case for:${NC}"
echo "  $DESCRIPTION"
echo ""
echo -e "${YELLOW}This will:${NC}"
echo "  1. Analyze existing use cases for patterns"
echo "  2. Create a new directory with all required files"
echo "  3. Generate tests, source code, and CI/CD config"
echo ""

# Execute Kubiya agent with comprehensive prompt
kubiya exec "
You are a CI/CD use case generator for the Kubiya agentic_ci_cd_examples repository.

=== YOUR TASK ===

Create a complete, working use case based on this description:
$DESCRIPTION

=== STEP 1: UNDERSTAND THE PATTERNS ===

First, study the existing structure:
1. Read README.md in the current directory to understand the repository
2. Look at one existing use case directory (e.g., fleaky-tests-circleci/) to understand the exact file structure and patterns
3. Pay attention to:
   - How package.json is structured (scripts, dependencies)
   - How jest.config.js is configured
   - How README.md is formatted (sections, examples)
   - How .circleci/config.yml is structured (jobs, workflows, Kubiya integration)
   - How __tests__/ and src/ are organized

=== EXISTING USE CASES FOR REFERENCE ===
- fleaky-tests-circleci/ - Flaky test detection and skipping
- smart-test-selection/ - Run only tests affected by git changes
- incident-learning-pipeline/ - Learn from CI failures
- build-artifact-analyzer/ - Ingest and analyze build data
- performance-regression-detector/ - Track performance baselines
- cross-repo-knowledge-share/ - Share learnings across repos

=== STEP 2: CREATE THE USE CASE ===

Create a new directory and ALL required files:

1. **Directory name**: Use kebab-case (e.g., security-vulnerability-scanner)

2. **package.json**: Must include:
   - name: directory name
   - version: \"1.0.0\"
   - scripts: test, test:unit, test:json, plus domain-specific scripts
   - dependencies: jest and any needed packages

3. **jest.config.js**: Standard Jest config with:
   - testEnvironment: 'node'
   - testMatch for __tests__/**/*.test.js
   - coverageDirectory

4. **README.md**: Follow the EXACT template from existing use cases:
   - Title with one-liner kubiya exec command
   - \"The Problem\" section with real examples
   - \"The Solution\" section with numbered steps
   - \"Quick Start\" with 3 steps
   - Table showing what gets detected/analyzed
   - Project structure tree
   - Available commands section
   - CI/CD Integration YAML example

5. **.circleci/config.yml**: Include:
   - version: 2.1
   - orbs: node: circleci/node@5.1.0
   - executors with environment variables (KUBIYA_DATASET_* with defaults)
   - install-kubiya-cli command
   - Baseline job (without Kubiya)
   - Intelligent job (with Kubiya - simple task-focused prompts, NO specific store_memory instructions)
   - Workflows with kubiya-secrets context

6. **src/**: Create real implementation modules with actual functionality

7. **__tests__/unit/**: Create tests that:
   - Actually pass when run
   - Demonstrate the use case functionality
   - Have meaningful assertions

8. **.gitignore**: Standard Node.js ignores (node_modules, coverage, etc.)

=== STEP 3: VALIDATE ===

After creating all files:
1. Verify the directory structure is complete
2. List all created files
3. Suggest Makefile targets to add (following the pattern: test-[name] and test-[name]-kubiya)

=== CRITICAL REQUIREMENTS ===

- Study existing use cases FIRST before creating files
- Follow patterns EXACTLY - consistency is critical
- Tests MUST pass when running 'npm test'
- CircleCI config must be valid YAML
- Agent prompts in CircleCI should be task-focused, NOT include specific store_memory() calls
- Use environment variables like \${KUBIYA_DATASET_NAME:-default} for memory datasets
- README must be comprehensive and follow the exact template

=== OUTPUT FORMAT ===

After creating all files, provide a summary:
- Directory created: [name]
- Files generated: [list]
- Suggested Makefile targets:
  - test-[name]: [description]
  - test-[name]-kubiya: [description]
" --local --cwd . --yes

echo ""
echo -e "${GREEN}=== Use case generation complete ===${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "  1. cd into the new directory"
echo "  2. Run 'npm install'"
echo "  3. Run 'npm test' to validate tests pass"
echo "  4. Add the suggested Makefile targets"
echo "  5. Commit and push your changes"
