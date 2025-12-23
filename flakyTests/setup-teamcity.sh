#!/bin/bash

# Quick setup script for TeamCity integration

echo "🚀 Setting up Flaky Test Demo for TeamCity"
echo "==========================================="
echo ""

# Check if git is initialized
if [ ! -d .git ]; then
    echo "Initializing git repository..."
    git init
    git add .
    git commit -m "Initial commit: Flaky test demo for TeamCity article"
fi

echo "📋 Next Steps:"
echo ""
echo "1. Create a GitHub repository (if not already done):"
echo "   Go to: https://github.com/new"
echo "   Name: flaky-test-demo"
echo "   Make it public for easy TeamCity integration"
echo ""
echo "2. Push to GitHub:"
echo "   git remote add origin https://github.com/YOUR_USERNAME/flaky-test-demo.git"
echo "   git push -u origin main"
echo ""
echo "3. In TeamCity (your screenshot shows you're already logged in):"
echo ""
echo "   a. Click 'Projects' → 'Create project'"
echo "   b. Choose 'From a repository URL'"
echo "   c. Enter your GitHub URL"
echo "   d. TeamCity will auto-detect the Node.js configuration"
echo ""
echo "4. Configure Build Steps (if not auto-detected):"
echo ""
echo "   Step 1: Node.js"
echo "   - Command: install"
echo ""
echo "   Step 2: Node.js"  
echo "   - Command: run test:junit"
echo ""
echo "5. Add Build Feature:"
echo "   - Type: XML Report Processing"
echo "   - Report type: JUnit"
echo "   - Report paths: +:**/junit.xml"
echo ""
echo "6. Run the build 5+ times to see:"
echo "   ✅ Tests marked as 'Ignored' (flaky)"
echo "   ✅ Failure percentages (like '22s 134ms' in your screenshot)"
echo "   ✅ Build status: Success despite failures"
echo "   ✅ Test categories: Success/Failure/Ignored"
echo ""
echo "7. What you'll see after 5 builds:"
echo ""
echo "   Similar to your screenshot:"
echo "   - InternalCommandDocumentationTest testResourceName: Failure → Ignored (flaky)"
echo "   - SystemInfopageDocSourceTest: Mixed Success/Failure → Pattern detected"
echo "   - IntegrationTest: Intermittent failures → Marked as flaky"
echo ""
echo "📸 Perfect moments for screenshots:"
echo "   - Build #1: All failures look the same"
echo "   - Build #3: Patterns emerging"
echo "   - Build #5: Full flaky detection active"
echo "   - Build #10: Historical data and trends"
echo ""

# Create a simple runner script for TeamCity
cat > run-tests-teamcity.sh << 'EOF'
#!/bin/bash
# TeamCity test runner

echo "##teamcity[testSuiteStarted name='FlakyTestDemo']"

# Install dependencies
npm install

# Run tests with JUnit output
npm run test:junit

# Check if junit.xml was created
if [ -f test-results/junit.xml ]; then
    echo "##teamcity[importData type='junit' path='test-results/junit.xml']"
fi

echo "##teamcity[testSuiteFinished name='FlakyTestDemo']"
EOF

chmod +x run-tests-teamcity.sh

echo "✅ Setup complete! TeamCity runner script created: run-tests-teamcity.sh"
echo ""
echo "🎯 To match your TeamCity screenshot exactly:"
echo "   - Your tests will show similar patterns"
echo "   - Duration times will vary (like 22s, 34ms, etc.)"
echo "   - Status will show: Failure → Ignored (flaky) → Success"
echo ""
echo "Ready to demonstrate TeamCity's intelligent test detection! 🎉"
