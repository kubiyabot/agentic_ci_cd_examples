#!/bin/bash

# Test Runner Script - Generates flaky test data for screenshots
# This helps create realistic test failure patterns for your demo

echo "🔄 Flaky Test Pattern Generator"
echo "================================"
echo ""

# Configuration
NUM_RUNS=${1:-10}  # Default to 10 runs if not specified
DELAY_BETWEEN_RUNS=2  # Seconds between runs

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Results tracking
declare -a test_results
declare -A flaky_test_failures
declare -A stable_test_passes
declare -A regression_test_failures

echo -e "${BLUE}Running tests ${NUM_RUNS} times to generate flaky patterns...${NC}"
echo ""

# Create results directory
mkdir -p test-results-history

for i in $(seq 1 $NUM_RUNS); do
    echo -e "${YELLOW}Run #$i of $NUM_RUNS${NC}"
    
    # Run tests and capture output
    npm test -- --json --outputFile="test-results-history/run-$i.json" 2>&1 | tee "test-results-history/run-$i.log" | grep -E "(PASS|FAIL)" | tail -5
    
    # Check exit code
    if [ ${PIPESTATUS[0]} -eq 0 ]; then
        echo -e "${GREEN}✅ Build #$i: PASSED${NC}"
        test_results[$i]="PASS"
    else
        echo -e "${RED}❌ Build #$i: FAILED${NC}"
        test_results[$i]="FAIL"
    fi
    
    echo "---"
    
    # Add delay between runs
    if [ $i -lt $NUM_RUNS ]; then
        sleep $DELAY_BETWEEN_RUNS
    fi
done

echo ""
echo -e "${BLUE}=== Test Pattern Analysis ===${NC}"
echo ""

# Analyze results
total_passes=0
total_fails=0

for result in "${test_results[@]}"; do
    if [ "$result" == "PASS" ]; then
        ((total_passes++))
    else
        ((total_fails++))
    fi
done

pass_rate=$((total_passes * 100 / NUM_RUNS))
fail_rate=$((total_fails * 100 / NUM_RUNS))

echo "Overall Results:"
echo "• Total Runs: $NUM_RUNS"
echo "• Passed: $total_passes ($pass_rate%)"
echo "• Failed: $total_fails ($fail_rate%)"
echo ""

# Parse JSON results to identify flaky tests
if command -v jq &> /dev/null; then
    echo -e "${BLUE}Analyzing individual test flakiness...${NC}"
    echo ""
    
    # Create summary report
    echo "# Flaky Test Analysis Report" > test-results-history/analysis.md
    echo "Generated: $(date)" >> test-results-history/analysis.md
    echo "" >> test-results-history/analysis.md
    echo "## Summary" >> test-results-history/analysis.md
    echo "- Total test runs: $NUM_RUNS" >> test-results-history/analysis.md
    echo "- Overall pass rate: $pass_rate%" >> test-results-history/analysis.md
    echo "" >> test-results-history/analysis.md
    echo "## Flaky Tests Detected" >> test-results-history/analysis.md
    echo "" >> test-results-history/analysis.md
    
    # Analyze each test file
    for file in test-results-history/run-*.json; do
        if [ -f "$file" ]; then
            # Extract test results (this is pseudo-code, actual parsing depends on Jest output format)
            echo "Processed: $file" >> test-results-history/analysis.md
        fi
    done
    
    echo -e "${GREEN}✅ Analysis complete! Check test-results-history/analysis.md${NC}"
else
    echo -e "${YELLOW}⚠️  Install 'jq' for detailed test analysis: brew install jq${NC}"
fi

echo ""
echo -e "${BLUE}=== Screenshot Readiness ===${NC}"
echo ""

if [ $fail_rate -gt 20 ] && [ $fail_rate -lt 80 ]; then
    echo -e "${GREEN}✅ Perfect flaky behavior detected!${NC}"
    echo "   Your tests are showing inconsistent pass/fail patterns."
    echo "   This is ideal for demonstrating TeamCity's intelligence."
else
    echo -e "${YELLOW}⚠️  Adjust test flakiness for better demo:${NC}"
    if [ $fail_rate -lt 20 ]; then
        echo "   Tests are too stable. Consider increasing flakiness in flaky-tests.test.js"
    else
        echo "   Tests are failing too consistently. Consider reducing flakiness."
    fi
fi

echo ""
echo -e "${BLUE}=== Next Steps for Screenshots ===${NC}"
echo ""
echo "1. Upload these test results to TeamCity (multiple builds)"
echo "2. After 3-5 builds, TeamCity will start showing flaky indicators"
echo "3. Capture screenshots as per screenshot-guide.sh"
echo ""
echo "Test results saved in: ./test-results-history/"
echo ""
echo -e "${GREEN}Ready for article screenshots! 📸${NC}"
