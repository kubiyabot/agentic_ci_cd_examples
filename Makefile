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

# Colors for output (works on macOS and Linux)
GREEN := \033[0;32m
YELLOW := \033[0;33m
RED := \033[0;31m
BLUE := \033[0;34m
NC := \033[0m # No Color

.PHONY: help setup setup-deps check-env check-kubiya \
        test-flaky test-flaky-kubiya test-flaky-stable \
        test-smart test-smart-kubiya test-smart-tasks \
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
# Demo - Run both examples
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
	@rm -rf $(FLAKY_DIR)/.kubiya $(SMART_DIR)/.kubiya
	@echo "$(GREEN)Clean complete$(NC)"
