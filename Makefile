# =============================================================================
# Kubiya Agentic CI/CD Examples - Makefile
# =============================================================================
# Easy commands to run the example pipelines locally
#
# Usage:
#   make setup          - Install dependencies for all examples
#   make test-flaky     - Run flaky test detection (baseline)
#   make test-flaky-kubiya - Run flaky test detection with Kubiya
#   make test-smart     - Run smart test selection (baseline)
#   make test-smart-kubiya - Run smart test selection with Kubiya
#   make circleci-flaky - Run full CircleCI pipeline for flaky tests
#   make circleci-smart - Run full CircleCI pipeline for smart tests
# =============================================================================

# Load environment variables from .env file
ifneq (,$(wildcard ./.env))
    include .env
    export
endif

# Directories
FLAKY_DIR := fleaky-tests-circleci
SMART_DIR := smart-test-selection

# Colors for output
GREEN := \033[0;32m
YELLOW := \033[0;33m
RED := \033[0;31m
NC := \033[0m # No Color

.PHONY: help setup check-env check-kubiya \
        test-flaky test-flaky-kubiya test-flaky-stable \
        test-smart test-smart-kubiya test-smart-tasks \
        circleci-flaky circleci-flaky-kubiya \
        circleci-smart circleci-smart-kubiya \
        clean

# Default target
help:
	@echo "=============================================="
	@echo "  Kubiya Agentic CI/CD Examples"
	@echo "=============================================="
	@echo ""
	@echo "Setup:"
	@echo "  make setup              Install all dependencies"
	@echo "  make check-env          Verify environment is configured"
	@echo ""
	@echo "Flaky Test Detection:"
	@echo "  make test-flaky         Run ALL tests (shows flaky failures)"
	@echo "  make test-flaky-stable  Run only stable tests"
	@echo "  make test-flaky-kubiya  Run with Kubiya (with planning)"
	@echo "  make test-flaky-kubiya-direct  Run with explicit agent (no planning)"
	@echo "  make circleci-flaky     Run CircleCI pipeline (baseline)"
	@echo "  make circleci-flaky-kubiya  Run CircleCI pipeline with Kubiya"
	@echo ""
	@echo "Smart Test Selection:"
	@echo "  make test-smart         Run ALL tests"
	@echo "  make test-smart-tasks   Run only tasks module tests"
	@echo "  make test-smart-kubiya  Run with Kubiya (with planning)"
	@echo "  make test-smart-kubiya-direct  Run with explicit agent (no planning)"
	@echo "  make circleci-smart     Run CircleCI pipeline (baseline)"
	@echo "  make circleci-smart-kubiya  Run CircleCI pipeline with Kubiya"
	@echo ""
	@echo "Utilities:"
	@echo "  make demo               Run full demo (all examples)"
	@echo "  make clean              Clean up node_modules and coverage"
	@echo ""

# =============================================================================
# Setup & Checks
# =============================================================================

setup: check-env
	@echo "$(GREEN)Installing dependencies for flaky-tests example...$(NC)"
	cd $(FLAKY_DIR) && npm ci
	@echo "$(GREEN)Installing dependencies for smart-test-selection example...$(NC)"
	cd $(SMART_DIR) && npm install
	@echo "$(GREEN)Setup complete!$(NC)"

check-env:
	@echo "Checking environment..."
	@if [ -z "$(KUBIYA_API_KEY)" ]; then \
		echo "$(RED)ERROR: KUBIYA_API_KEY is not set$(NC)"; \
		echo "Please set it in .env file or export it:"; \
		echo "  export KUBIYA_API_KEY=your-key-here"; \
		exit 1; \
	else \
		echo "$(GREEN)KUBIYA_API_KEY is set$(NC)"; \
	fi
	@which kubiya > /dev/null 2>&1 || (echo "$(YELLOW)WARNING: kubiya CLI not found. Install from https://docs.kubiya.ai/cli$(NC)")
	@which circleci > /dev/null 2>&1 || (echo "$(YELLOW)WARNING: circleci CLI not found. Install from https://circleci.com/docs/local-cli/$(NC)")

check-kubiya: check-env
	@echo "Verifying Kubiya authentication..."
	@kubiya auth status || (echo "$(RED)Kubiya authentication failed$(NC)" && exit 1)

# =============================================================================
# Flaky Test Detection - Local Tests
# =============================================================================

test-flaky:
	@echo "$(YELLOW)Running ALL tests (including flaky ones)...$(NC)"
	@echo "Some tests will fail randomly - that's the point!"
	@echo ""
	cd $(FLAKY_DIR) && npm run test:all || true

test-flaky-stable:
	@echo "$(GREEN)Running only STABLE tests...$(NC)"
	cd $(FLAKY_DIR) && npm run test:stable

test-flaky-kubiya: check-kubiya
	@echo "$(GREEN)Running Kubiya intelligent flaky test detection...$(NC)"
	@echo ""
	cd $(FLAKY_DIR) && kubiya exec " \
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

# Run with explicit agent UUID (no planning phase)
test-flaky-kubiya-direct: check-kubiya
	@echo "$(GREEN)Running Kubiya with explicit agent (no planning)...$(NC)"
	@echo ""
	cd $(FLAKY_DIR) && kubiya exec " \
		List files in __tests__/flaky/ directory and run npm run test:stable \
	" --local --cwd . --yes --agent 9b1e3684-c8d4-4c20-adef-1a11f61c3548

# =============================================================================
# Flaky Test Detection - CircleCI Pipelines
# =============================================================================

circleci-flaky:
	@echo "$(YELLOW)Running CircleCI pipeline (baseline - all tests)...$(NC)"
	cd $(FLAKY_DIR) && circleci local execute test-without-kubiya

circleci-flaky-kubiya: check-env
	@echo "$(GREEN)Running CircleCI pipeline with Kubiya...$(NC)"
	cd $(FLAKY_DIR) && circleci local execute test-with-kubiya \
		-e KUBIYA_API_KEY="$(KUBIYA_API_KEY)"

# =============================================================================
# Smart Test Selection - Local Tests
# =============================================================================

test-smart:
	@echo "$(YELLOW)Running ALL tests...$(NC)"
	cd $(SMART_DIR) && npm run test:all

test-smart-tasks:
	@echo "$(GREEN)Running only tasks module tests...$(NC)"
	cd $(SMART_DIR) && npm run test:tasks

test-smart-kubiya: check-kubiya
	@echo "$(GREEN)Running Kubiya intelligent test selection...$(NC)"
	@echo ""
	cd $(SMART_DIR) && kubiya exec " \
		You are a CI/CD agent that runs only relevant tests. \
		\
		STEP 1: Run 'git diff --name-only' to see changed files. \
		If no changes, assume src/tasks/tasks.js changed. \
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

# Run with explicit agent UUID (no planning phase)
test-smart-kubiya-direct: check-kubiya
	@echo "$(GREEN)Running Kubiya with explicit agent (no planning)...$(NC)"
	@echo ""
	cd $(SMART_DIR) && kubiya exec " \
		Check git diff and run only tests for changed modules. \
		Map: src/tasks->test:tasks, src/projects->test:projects \
	" --local --cwd . --yes --agent 9b1e3684-c8d4-4c20-adef-1a11f61c3548

# =============================================================================
# Smart Test Selection - CircleCI Pipelines
# =============================================================================

circleci-smart:
	@echo "$(YELLOW)Running CircleCI pipeline (baseline - all tests)...$(NC)"
	cd $(SMART_DIR) && circleci local execute test-mechanical

circleci-smart-kubiya: check-env
	@echo "$(GREEN)Running CircleCI pipeline with Kubiya...$(NC)"
	cd $(SMART_DIR) && circleci local execute test-intelligent \
		-e KUBIYA_API_KEY="$(KUBIYA_API_KEY)"

# =============================================================================
# Demo - Run both examples
# =============================================================================

demo: check-kubiya
	@echo "=============================================="
	@echo "  Running Full Demo"
	@echo "=============================================="
	@echo ""
	@echo "$(YELLOW)1. Flaky Test Detection - Baseline$(NC)"
	@make test-flaky
	@echo ""
	@echo "$(GREEN)2. Flaky Test Detection - With Kubiya$(NC)"
	@make test-flaky-kubiya
	@echo ""
	@echo "$(YELLOW)3. Smart Test Selection - Baseline$(NC)"
	@make test-smart
	@echo ""
	@echo "$(GREEN)4. Smart Test Selection - With Kubiya$(NC)"
	@make test-smart-kubiya
	@echo ""
	@echo "=============================================="
	@echo "  Demo Complete!"
	@echo "=============================================="

# =============================================================================
# Cleanup
# =============================================================================

clean:
	@echo "Cleaning up..."
	rm -rf $(FLAKY_DIR)/node_modules $(FLAKY_DIR)/coverage
	rm -rf $(SMART_DIR)/node_modules $(SMART_DIR)/coverage
	@echo "$(GREEN)Clean complete$(NC)"
