# =============================================================================
# Kubiya Agentic CI/CD Examples - Makefile
# =============================================================================
# Easy commands to run the example pipelines locally
#
# Quick Start:
#   1. cp .env.example .env
#   2. Edit .env with your KUBIYA_API_KEY
#   3. make setup
#   4. make test-flaky-kubiya
#
# Usage:
#   make help             - Show all available commands
#   make setup            - Install dependencies for all examples
#   make test-flaky-kubiya - Run flaky test detection with Kubiya
#   make test-smart-kubiya - Run smart test selection with Kubiya
# =============================================================================

# Load environment variables from .env file if it exists
ifneq (,$(wildcard ./.env))
    include .env
    export
endif

# Directories
FLAKY_DIR := fleaky-tests-circleci
SMART_DIR := smart-test-selection
INCIDENT_DIR := incident-learning-pipeline
ARTIFACT_DIR := build-artifact-analyzer
PERF_DIR := performance-regression-detector
CROSSREPO_DIR := cross-repo-knowledge-share

# Colors for output (works on macOS and Linux)
GREEN := \033[0;32m
YELLOW := \033[0;33m
RED := \033[0;31m
BLUE := \033[0;34m
NC := \033[0m # No Color

.PHONY: help setup setup-deps check-env check-kubiya \
        test-flaky test-flaky-kubiya test-flaky-stable \
        test-smart test-smart-kubiya test-smart-tasks \
        test-incident test-incident-kubiya \
        test-artifact test-artifact-kubiya \
        test-perf test-perf-kubiya \
        test-crossrepo test-crossrepo-kubiya \
        circleci-flaky circleci-flaky-kubiya \
        circleci-smart circleci-smart-kubiya \
        demo clean

# Default target
help:
	@echo "=============================================="
	@echo "  Kubiya Agentic CI/CD Examples"
	@echo "=============================================="
	@echo ""
	@echo "$(BLUE)Quick Start:$(NC)"
	@echo "  1. cp .env.example .env"
	@echo "  2. Edit .env with your KUBIYA_API_KEY"
	@echo "  3. make setup"
	@echo "  4. make test-flaky-kubiya"
	@echo ""
	@echo "$(BLUE)Setup:$(NC)"
	@echo "  make setup              Install all dependencies"
	@echo "  make check-env          Verify environment is configured"
	@echo ""
	@echo "$(BLUE)Flaky Test Detection:$(NC)"
	@echo "  make test-flaky         Run ALL tests (shows flaky failures)"
	@echo "  make test-flaky-stable  Run only stable tests"
	@echo "  make test-flaky-kubiya  Run with Kubiya agent"
	@echo ""
	@echo "$(BLUE)Smart Test Selection:$(NC)"
	@echo "  make test-smart         Run ALL tests"
	@echo "  make test-smart-tasks   Run only tasks module tests"
	@echo "  make test-smart-kubiya  Run with Kubiya agent"
	@echo ""
	@echo "$(BLUE)Incident Learning Pipeline:$(NC)"
	@echo "  make test-incident        Run all tests (may fail randomly)"
	@echo "  make test-incident-kubiya Run with Kubiya learning agent"
	@echo ""
	@echo "$(BLUE)Build Artifact Analyzer:$(NC)"
	@echo "  make test-artifact        Run tests with coverage"
	@echo "  make test-artifact-kubiya Run with Kubiya analysis"
	@echo ""
	@echo "$(BLUE)Performance Regression Detector:$(NC)"
	@echo "  make test-perf            Run benchmarks"
	@echo "  make test-perf-kubiya     Run with baseline comparison"
	@echo ""
	@echo "$(BLUE)Cross-Repo Knowledge Share:$(NC)"
	@echo "  make test-crossrepo        Run pattern detection tests"
	@echo "  make test-crossrepo-kubiya Run with org learning"
	@echo ""
	@echo "$(BLUE)Utilities:$(NC)"
	@echo "  make demo               Run full demo (all examples)"
	@echo "  make clean              Clean up node_modules and coverage"
	@echo ""
	@echo "$(YELLOW)Note: Kubiya targets require KUBIYA_API_KEY in .env$(NC)"
	@echo ""

# =============================================================================
# Setup & Checks
# =============================================================================

# Install dependencies only (no API key required)
setup-deps:
	@echo "$(GREEN)Installing dependencies for flaky-tests example...$(NC)"
	@cd $(FLAKY_DIR) && npm install
	@echo "$(GREEN)Installing dependencies for smart-test-selection example...$(NC)"
	@cd $(SMART_DIR) && npm install
	@echo "$(GREEN)Installing dependencies for incident-learning-pipeline example...$(NC)"
	@cd $(INCIDENT_DIR) && npm install
	@echo "$(GREEN)Installing dependencies for build-artifact-analyzer example...$(NC)"
	@cd $(ARTIFACT_DIR) && npm install
	@echo "$(GREEN)Installing dependencies for performance-regression-detector example...$(NC)"
	@cd $(PERF_DIR) && npm install
	@echo "$(GREEN)Installing dependencies for cross-repo-knowledge-share example...$(NC)"
	@cd $(CROSSREPO_DIR) && npm install
	@echo "$(GREEN)Dependencies installed!$(NC)"

# Full setup with environment check
setup: setup-deps
	@echo ""
	@echo "$(GREEN)Setup complete!$(NC)"
	@echo ""
	@if [ -z "$(KUBIYA_API_KEY)" ]; then \
		echo "$(YELLOW)Next step: Set up your Kubiya API key$(NC)"; \
		echo "  1. cp .env.example .env"; \
		echo "  2. Edit .env with your KUBIYA_API_KEY"; \
		echo "  3. Run: source .env"; \
		echo ""; \
		echo "Get your API key at: https://app.kubiya.ai/settings#apiKeys"; \
	else \
		echo "$(GREEN)KUBIYA_API_KEY is configured. You're ready to go!$(NC)"; \
		echo "Try: make test-flaky-kubiya"; \
	fi

check-env:
	@echo "Checking environment..."
	@if [ -z "$(KUBIYA_API_KEY)" ]; then \
		echo "$(RED)ERROR: KUBIYA_API_KEY is not set$(NC)"; \
		echo ""; \
		echo "To fix this:"; \
		echo "  1. Copy the example env file: cp .env.example .env"; \
		echo "  2. Edit .env and add your API key"; \
		echo "  3. Source it: source .env"; \
		echo ""; \
		echo "Get your API key at: https://app.kubiya.ai/settings#apiKeys"; \
		exit 1; \
	else \
		echo "$(GREEN)✓ KUBIYA_API_KEY is set$(NC)"; \
	fi
	@if command -v kubiya > /dev/null 2>&1; then \
		echo "$(GREEN)✓ kubiya CLI is installed$(NC)"; \
	else \
		echo "$(YELLOW)⚠ kubiya CLI not found$(NC)"; \
		echo "  Install it: curl -fsSL https://raw.githubusercontent.com/kubiyabot/cli/main/install.sh | bash"; \
		echo "  Then add to PATH: export PATH=\"\$$HOME/.kubiya/bin:\$$PATH\""; \
	fi

check-kubiya: check-env
	@echo "Verifying Kubiya authentication..."
	@kubiya auth status || (echo "$(RED)Kubiya authentication failed. Check your API key.$(NC)" && exit 1)
	@echo "$(GREEN)✓ Kubiya authentication successful$(NC)"

# =============================================================================
# Flaky Test Detection - Local Tests
# =============================================================================

test-flaky:
	@echo "$(YELLOW)Running ALL tests (including flaky ones)...$(NC)"
	@echo "Some tests will fail randomly - that's the point!"
	@echo ""
	@cd $(FLAKY_DIR) && npm run test:all || true

test-flaky-stable:
	@echo "$(GREEN)Running only STABLE tests...$(NC)"
	@cd $(FLAKY_DIR) && npm run test:stable

test-flaky-kubiya: check-kubiya
	@echo "$(GREEN)Running Kubiya intelligent flaky test detection...$(NC)"
	@echo ""
	@cd $(FLAKY_DIR) && kubiya exec " \
		You are a CI/CD agent analyzing tests for flaky patterns. \
		\
		STEP 1: List and read files in __tests__/flaky/ directory. \
		\
		STEP 2: For each test file, identify flaky patterns: \
		- Math.random() = RANDOM flakiness \
		- new Date() = TIMING flakiness \
		- setTimeout with variables = ASYNC flakiness \
		\
		STEP 3: Report findings in a table format. \
		\
		STEP 4: Run stable tests only: npm run test:stable \
		\
		STEP 5: Summarize tests run vs skipped. \
	" --local --cwd . --yes

# =============================================================================
# Smart Test Selection - Local Tests
# =============================================================================

test-smart:
	@echo "$(YELLOW)Running ALL tests...$(NC)"
	@cd $(SMART_DIR) && npm run test:all

test-smart-tasks:
	@echo "$(GREEN)Running only tasks module tests...$(NC)"
	@cd $(SMART_DIR) && npm run test:tasks

test-smart-kubiya: check-kubiya
	@echo "$(GREEN)Running Kubiya intelligent test selection...$(NC)"
	@echo ""
	@cd $(SMART_DIR) && kubiya exec " \
		You are a CI/CD agent that runs only relevant tests. \
		\
		STEP 1: Run 'git diff --name-only' to see changed files. \
		If no changes, assume src/tasks/tasks.js changed for demo purposes. \
		\
		STEP 2: Map changes to test commands: \
		- src/tasks/* -> npm run test:tasks \
		- src/projects/* -> npm run test:projects \
		- src/comments/* -> npm run test:comments \
		- src/tags/* -> npm run test:tags \
		- src/search/* -> npm run test:search \
		- package.json -> npm run test:all \
		\
		STEP 3: Run only the relevant test command. \
		\
		STEP 4: Report efficiency (tests run vs total 54). \
	" --local --cwd . --yes

# =============================================================================
# Incident Learning Pipeline - Local Tests
# =============================================================================

test-incident:
	@echo "$(YELLOW)Running incident learning pipeline tests...$(NC)"
	@echo "Some tests may fail due to simulated infrastructure issues"
	@cd $(INCIDENT_DIR) && npm test || true

test-incident-kubiya: check-kubiya
	@echo "$(GREEN)Running Kubiya incident learning pipeline...$(NC)"
	@cd $(INCIDENT_DIR) && kubiya exec " \
		You are a CI agent that learns from failures. \
		\
		STEP 1: Run tests: npm test -- --json --outputFile=test-results.json \
		\
		STEP 2: If failures occur, analyze root cause: \
		- TIMEOUT: Connection or async issues \
		- CONNECTION: Database/API unavailable \
		- FLAKY: Random/timing dependent \
		\
		STEP 3: Use store_memory to save learnings: \
		store_memory({ \
		  dataset: 'ci-failure-learnings', \
		  content: 'Failure analysis', \
		  metadata: { failure_type, root_cause, workaround } \
		}) \
		\
		STEP 4: Report what was learned for future runs. \
	" --local --cwd . --yes

# =============================================================================
# Build Artifact Analyzer - Local Tests
# =============================================================================

test-artifact:
	@echo "$(YELLOW)Running build artifact analyzer tests...$(NC)"
	@cd $(ARTIFACT_DIR) && npm run test:coverage

test-artifact-kubiya: check-kubiya
	@echo "$(GREEN)Running Kubiya build artifact analysis...$(NC)"
	@cd $(ARTIFACT_DIR) && kubiya exec " \
		You are a build analyzer with memory capabilities. \
		\
		STEP 1: Run tests with coverage: npm run test:json \
		\
		STEP 2: Recall previous build history: \
		recall_memory('build history for this repo') \
		\
		STEP 3: Analyze current results vs baseline: \
		- Test pass rate \
		- Duration comparison \
		- Coverage trends \
		\
		STEP 4: Store build metrics to memory: \
		store_memory({ \
		  dataset: 'ci-build-history', \
		  content: 'Build results', \
		  metadata: { tests_run, tests_passed, duration, coverage } \
		}) \
		\
		STEP 5: Report trends and anomalies. \
	" --local --cwd . --yes

# =============================================================================
# Performance Regression Detector - Local Tests
# =============================================================================

test-perf:
	@echo "$(YELLOW)Running performance benchmarks...$(NC)"
	@cd $(PERF_DIR) && npm run benchmark

test-perf-kubiya: check-kubiya
	@echo "$(GREEN)Running Kubiya performance regression detection...$(NC)"
	@cd $(PERF_DIR) && kubiya exec " \
		You are a performance guardian with memory capabilities. \
		\
		STEP 1: Recall performance baselines: \
		recall_memory('performance baselines for this repo') \
		\
		STEP 2: Run benchmarks: npm run benchmark:json \
		\
		STEP 3: Compare to baseline: \
		- ratio > 1.5 = REGRESSION \
		- ratio < 0.8 = IMPROVEMENT \
		\
		STEP 4: Store results: \
		store_memory({ \
		  dataset: 'ci-performance-baselines', \
		  content: 'Benchmark results', \
		  metadata: { benchmarks, status, timestamp } \
		}) \
		\
		STEP 5: Alert on regressions. \
	" --local --cwd . --yes

# =============================================================================
# Cross-Repo Knowledge Share - Local Tests
# =============================================================================

test-crossrepo:
	@echo "$(YELLOW)Running cross-repo pattern detection tests...$(NC)"
	@cd $(CROSSREPO_DIR) && npm test

test-crossrepo-kubiya: check-kubiya
	@echo "$(GREEN)Running Kubiya org knowledge sharing...$(NC)"
	@cd $(CROSSREPO_DIR) && kubiya exec " \
		You are an org learning agent. \
		\
		STEP 1: Recall org-wide patterns: \
		recall_memory('CI patterns for Node.js') \
		recall_memory('flaky test patterns across org') \
		\
		STEP 2: Detect patterns in this repo: \
		- Test frameworks and configs \
		- Quality tools \
		- CI/CD patterns \
		\
		STEP 3: Apply relevant org patterns. \
		\
		STEP 4: Run tests: npm test \
		\
		STEP 5: Contribute new patterns back to org: \
		store_memory({ \
		  dataset: 'org-ci-patterns', \
		  content: 'Pattern discovered', \
		  metadata: { patternType, applicableTo, effectiveness } \
		}) \
		\
		STEP 6: Report what was learned and contributed. \
	" --local --cwd . --yes

# =============================================================================
# Demo - Run all examples
# =============================================================================

demo: check-kubiya
	@echo "=============================================="
	@echo "  Running Full Demo"
	@echo "=============================================="
	@echo ""
	@echo "$(YELLOW)1. Flaky Test Detection - Baseline$(NC)"
	@$(MAKE) test-flaky
	@echo ""
	@echo "$(GREEN)2. Flaky Test Detection - With Kubiya$(NC)"
	@$(MAKE) test-flaky-kubiya
	@echo ""
	@echo "$(YELLOW)3. Smart Test Selection - Baseline$(NC)"
	@$(MAKE) test-smart
	@echo ""
	@echo "$(GREEN)4. Smart Test Selection - With Kubiya$(NC)"
	@$(MAKE) test-smart-kubiya
	@echo ""
	@echo "=============================================="
	@echo "  Demo Complete!"
	@echo "=============================================="

# =============================================================================
# Cleanup
# =============================================================================

clean:
	@echo "Cleaning up..."
	@rm -rf $(FLAKY_DIR)/node_modules $(FLAKY_DIR)/coverage
	@rm -rf $(SMART_DIR)/node_modules $(SMART_DIR)/coverage
	@rm -rf $(INCIDENT_DIR)/node_modules $(INCIDENT_DIR)/coverage
	@rm -rf $(ARTIFACT_DIR)/node_modules $(ARTIFACT_DIR)/artifacts
	@rm -rf $(PERF_DIR)/node_modules $(PERF_DIR)/benchmark-results.json
	@rm -rf $(CROSSREPO_DIR)/node_modules $(CROSSREPO_DIR)/coverage
	@rm -rf $(FLAKY_DIR)/.kubiya $(SMART_DIR)/.kubiya
	@rm -rf $(INCIDENT_DIR)/.kubiya $(ARTIFACT_DIR)/.kubiya
	@rm -rf $(PERF_DIR)/.kubiya $(CROSSREPO_DIR)/.kubiya
	@echo "$(GREEN)Clean complete$(NC)"
