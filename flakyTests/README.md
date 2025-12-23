# Flaky Test Demo: TeamCity vs Jenkins

This demo project showcases the dramatic difference between TeamCity's intelligent flaky test detection and Jenkins' manual approach.

## 🎯 What This Demo Shows

### Test Suites Included

1. **Flaky Tests** (`tests/flaky-tests.test.js`)
   - Race condition tests (fail ~30% of the time)
   - Resource-dependent tests (fail under load)
   - Network-dependent tests (simulate timeouts)
   - Order-dependent tests (fail when run in parallel)
   - Time-sensitive tests (fail at certain times)

2. **Stable Tests** (`tests/stable-tests.test.js`)
   - Always pass - demonstrates TeamCity can identify truly stable tests

3. **Regression Tests** (`tests/regression-tests.test.js`)
   - Always fail - demonstrates TeamCity distinguishes real bugs from flaky tests

## 🚀 Quick Start - TeamCity Cloud (Recommended)

### Step 1: Sign up for TeamCity Cloud (2 minutes)
```bash
# No installation needed!
# Go to: https://www.jetbrains.com/teamcity/cloud/
# Click "Start Free Trial"
# Sign up with email or GitHub
```

### Step 2: Create New Project
1. Click "Create Project"
2. Connect your Git repository (or use the provided demo)
3. TeamCity auto-detects the Node.js project
4. Click "Create"

### Step 3: Run the Build
1. Click "Run" on your build configuration
2. Watch as tests execute
3. After 2-3 builds, see the magic:
   - Flaky tests get special indicators 🔄
   - Flakiness percentages appear
   - Test history shows patterns
   - Build stays green despite flaky failures!

### What You'll See in TeamCity

After running the build 3-5 times, TeamCity will show:

- **Flaky Test Indicators**: Special icons next to non-deterministic tests
- **Flakiness Rate**: "Fails 32% of the time" annotations
- **Smart Build Status**: "Passed with known flaky failures" vs "Failed"
- **Test History Graph**: Visual timeline of each test's behavior
- **Investigation Assignment**: One-click "Assign to Developer" for flaky tests
- **Muted Tests Tab**: Flaky tests moved here but still running

## 🔧 Jenkins Comparison (Manual Setup Required)

### Step 1: Run Jenkins with Docker
```bash
# Start Jenkins
docker run -d \
  -p 8080:8080 \
  -p 50000:50000 \
  -v jenkins_home:/var/jenkins_home \
  --name jenkins \
  jenkins/jenkins:lts

# Get initial admin password
docker exec jenkins cat /var/jenkins_home/secrets/initialAdminPassword
```

### Step 2: Configure Jenkins (10-15 minutes)
1. Navigate to http://localhost:8080
2. Install suggested plugins
3. Install additional plugins:
   - NodeJS Plugin
   - Test Results Analyzer (for basic test history)
   - Flaky Test Handler (for manual flaky marking)
4. Configure NodeJS installation in Global Tools

### Step 3: Create Pipeline Job
1. New Item → Pipeline
2. Paste the provided `Jenkinsfile`
3. Run the build multiple times

### What You'll See in Jenkins

- **No Flaky Detection**: All failures treated the same
- **Blind Retries**: Entire test suite re-runs
- **Manual Investigation**: Click through builds to find patterns
- **No Built-in Intelligence**: Need plugins + custom scripts
- **Poor Visibility**: Test results buried in logs

## 📊 The Comparison

| Feature | TeamCity | Jenkins |
|---------|----------|---------|
| **Setup Time** | 2 minutes (Cloud) | 15+ minutes (self-hosted) |
| **Flaky Test Detection** | ✅ Automatic | ❌ Requires plugins |
| **Intelligent Retry** | ✅ Only flaky tests | ❌ Entire suite |
| **Historical Analysis** | ✅ Built-in with UI | ❌ Manual or scripted |
| **Test Categorization** | ✅ Flaky/Stable/Failed | ❌ Pass/Fail only |
| **Investigation Tracking** | ✅ Native feature | ❌ External tracking |
| **Muting with Visibility** | ✅ Supported | ❌ Tests disabled entirely |
| **Statistical Analysis** | ✅ Automatic | ❌ DIY with scripts |
| **UI Test Intelligence** | ✅ Rich visualizations | ❌ Basic reports |

## 🎪 Demo Script for Presentations

### Act 1: Show the Problem (Jenkins)
1. Run build in Jenkins
2. Watch random tests fail
3. Re-run entire pipeline
4. Show lack of visibility into which tests are flaky
5. Demonstrate time wasted on investigation

### Act 2: Show the Solution (TeamCity)
1. Run same tests in TeamCity
2. After 3 builds, show flaky test indicators
3. Demonstrate how build passes despite flaky failures
4. Show test history and patterns
5. Assign investigation to team member
6. Show time saved with intelligent retries

### Act 3: The "Wow" Moment
1. Introduce a new genuine bug (uncomment a line in regression tests)
2. TeamCity immediately flags it as a NEW failure, not flaky
3. Jenkins treats it the same as any other failure
4. Show how TeamCity's intelligence accelerates debugging

## 🔬 Understanding the Test Behaviors

### Why Tests Are Flaky

The demo includes realistic flaky test patterns:

```javascript
// Race Condition Example
test('async operation without proper wait', async () => {
  let value = null;
  setTimeout(() => {
    value = 'completed';
  }, Math.random() * 100); // Random delay
  
  await new Promise(resolve => setTimeout(resolve, 50));
  expect(value).toBe('completed'); // Fails if timeout hasn't completed
});
```

### How TeamCity Detects Them

TeamCity analyzes:
1. **Pass/Fail Patterns**: Test fails 30% of builds → likely flaky
2. **Failure Clustering**: Fails on specific agents → environment issue
3. **Time Correlation**: Fails at certain times → time-dependent
4. **Change Correlation**: Started failing after unrelated change → flaky

## 📈 Metrics That Matter

After running this demo, you can show stakeholders:

- **Time Saved**: 5-10 minutes per build not re-running stable tests
- **Confidence Restored**: Developers trust green builds again
- **MTTR Reduced**: 40% faster issue identification
- **Productivity Gain**: Less context switching from false alarms

## 🎬 Recording Your Demo

For maximum impact:

1. **Split Screen**: Jenkins on left, TeamCity on right
2. **Run Simultaneously**: Show same commit building on both
3. **Highlight Differences**:
   - Jenkins: Manual investigation, confusion, wasted time
   - TeamCity: Automatic detection, clear categorization, quick resolution
4. **Show the UI**: TeamCity's test report is the star of the show

## 💡 Pro Tips

1. **Run builds 5+ times** before demo to establish flakiness patterns
2. **Use TeamCity's REST API** to show flakiness data programmatically
3. **Set up notifications** to show how TeamCity alerts differ for flaky vs real failures
4. **Create a dashboard** showing flakiness trends over time

## 🚦 Success Criteria

Your demo is successful when viewers say:

> "I had no idea we were wasting so much time on flaky tests!"

> "TeamCity actually knows which tests are problematic?"

> "We need this intelligence in our CI/CD pipeline!"

## 📚 Learn More

- [TeamCity Test Intelligence Docs](https://www.jetbrains.com/help/teamcity/test-intelligence.html)
- [Migration Planning Kit](https://www.jetbrains.com/teamcity/migration/)
- [TeamCity Cloud Free Trial](https://www.jetbrains.com/teamcity/cloud/)

---

**Remember**: The goal isn't to bash Jenkins—it's to show how TeamCity's modern, intelligent approach solves real problems that waste developer time and erode confidence in CI/CD pipelines.
