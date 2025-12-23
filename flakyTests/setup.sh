#!/bin/bash

# TeamCity Flaky Test Demo Setup Script
# This script sets up the demo environment for showcasing TeamCity's intelligent test handling

echo "🚀 TeamCity Flaky Test Demo Setup"
echo "=================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm is not installed. Please install Node.js first.${NC}"
    exit 1
fi

# Check if docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${YELLOW}⚠️  Docker is not installed. You won't be able to run the local comparison.${NC}"
    echo "   Consider installing Docker for the full demo experience."
    echo ""
fi

# Install dependencies
echo "📦 Installing npm dependencies..."
npm install

echo ""
echo -e "${GREEN}✅ Setup complete!${NC}"
echo ""
echo "🎯 Next Steps:"
echo "============="
echo ""
echo "Option 1: TeamCity Cloud (Recommended - 2 minutes)"
echo "---------------------------------------------------"
echo "1. Go to: https://www.jetbrains.com/teamcity/cloud/"
echo "2. Click 'Start Free Trial'"
echo "3. Connect this repository"
echo "4. Run the build 3-5 times to see flaky test detection"
echo ""
echo "Option 2: Local Setup (15 minutes)"
echo "-----------------------------------"
echo "1. Start services:    docker-compose up -d"
echo "2. Access TeamCity:   http://localhost:8111"
echo "3. Access Jenkins:    http://localhost:8080"
echo "4. Configure and run builds"
echo ""
echo "Option 3: Run Tests Locally"
echo "----------------------------"
echo "See test results:     npm test"
echo "Generate JUnit XML:   npm run test:junit"
echo ""
echo "📊 What to Look For:"
echo "==================="
echo "- Tests in 'flaky-tests.test.js' will randomly fail"
echo "- Tests in 'stable-tests.test.js' will always pass"
echo "- Tests in 'regression-tests.test.js' will always fail"
echo ""
echo "TeamCity will automatically:"
echo "✅ Detect which tests are flaky"
echo "✅ Show flakiness percentages"
echo "✅ Only retry flaky tests"
echo "✅ Keep builds green despite flaky failures"
echo ""
echo "Jenkins will:"
echo "❌ Treat all failures the same"
echo "❌ Require manual investigation"
echo "❌ Need plugins for basic tracking"
echo "❌ Waste time with blind retries"
echo ""
echo -e "${GREEN}Ready to demonstrate TeamCity's intelligence! 🎉${NC}"
