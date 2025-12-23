# Screenshot Requirements for TeamCity Article

## Essential Screenshots (Priority Order)

### 1. The Problem - First Build Failure (Both Tools)
**Filename:** `01-initial-failure-both.png`
**Caption:** "Initial test failures look identical in both TeamCity and Jenkins - no indication which tests are flaky"
**What to capture:**
- Split screen or side-by-side comparison
- Both showing red/failed builds
- Focus on the confusion this creates

### 2. TeamCity's Flaky Test Detection After 5 Builds
**Filename:** `02-teamcity-flaky-detection.png`
**Caption:** "After just 5 builds, TeamCity automatically identifies flaky tests with clear visual indicators"
**What to capture:**
- Tests tab in TeamCity
- Flaky test icons (lightning bolt or similar)
- "Flaky" labels
- Percentage failure rates (e.g., "Fails 33% of the time")
- Mix of flaky (yellow), failed (red), and passed (green) tests

### 3. Jenkins After 5 Builds - No Intelligence
**Filename:** `03-jenkins-no-detection.png`
**Caption:** "Jenkins after the same 5 builds - no flaky test detection, just a list of passes and failures"
**What to capture:**
- Basic Jenkins test report
- No categorization
- All failures look the same
- Developer has no idea which failures are flaky

### 4. TeamCity Test History Timeline
**Filename:** `04-teamcity-test-history.png`
**Caption:** "TeamCity's test history reveals patterns - this test fails 30% of the time, clearly flaky"
**What to capture:**
- Single test's history view
- Graph showing pass/fail pattern over time
- Statistical analysis panel
- "Flakiness rate: 30%" or similar metric
- Pattern visualization (green/red dots on timeline)

### 5. TeamCity Build Status Intelligence
**Filename:** `05-teamcity-smart-status.png`
**Caption:** "Build remains green despite flaky test failures - TeamCity knows the difference"
**What to capture:**
- Build overview page
- Green checkmark or "Success" status
- Note saying "Build successful with 3 known flaky test failures"
- Build #10 or higher to show pattern recognition

### 6. Jenkins Retry Configuration Complexity
**Filename:** `06-jenkins-retry-config.png`
**Caption:** "Jenkins requires complex pipeline scripts and plugins for basic retry logic"
**What to capture:**
- Jenkinsfile with retry blocks
- Plugin configuration page
- Highlight the manual scripting required
- Show at least 10-15 lines of retry logic code

### 7. TeamCity Investigation Assignment
**Filename:** `07-teamcity-investigation.png`
**Caption:** "One-click investigation assignment ensures flaky tests don't get ignored"
**What to capture:**
- Investigation modal or panel
- Dropdown showing team members
- "Assign to developer" button
- Investigation reason field
- Shows accountability and tracking

### 8. Side-by-Side Test Categories
**Filename:** `08-test-categories-comparison.png`
**Caption:** "TeamCity categorizes tests intelligently while Jenkins shows only pass/fail"
**What to capture:**
- TeamCity side: Flaky (5), Failed (3), Passed (29)
- Jenkins side: Passed (29), Failed (8)
- Same test suite, different insights

### 9. TeamCity Muted Tests with Visibility
**Filename:** `09-teamcity-muted-tests.png`
**Caption:** "Muted flaky tests continue running in TeamCity, maintaining visibility while preventing build failures"
**What to capture:**
- Muted tests tab
- Tests still showing results
- "Muted but still running" indicator
- Reason for muting displayed

### 10. Real Failure Detection
**Filename:** `10-new-failure-detection.png`
**Caption:** "When a genuine bug is introduced, TeamCity immediately identifies it as a new failure, not flaky"
**What to capture:**
- New test failure highlighted differently
- "New failure in build #15" indicator
- Clear distinction from flaky failures
- Alert or notification about new failure

## Optional But Impactful Screenshots

### 11. Setup Time Comparison
**Filename:** `11-setup-comparison.png`
**Caption:** "TeamCity Cloud: 2 minutes to intelligence. Jenkins: 15+ minutes just to basic functionality"
**What to capture:**
- TeamCity Cloud signup page (simple)
- Jenkins plugin installation page (complex)
- Clock or timer showing time difference

### 12. Flakiness Trend Graph
**Filename:** `12-flakiness-trends.png`
**Caption:** "TeamCity tracks flakiness trends over time, helping teams identify systemic issues"
**What to capture:**
- Graph showing flakiness rate over weeks/months
- Trend lines for different test suites
- Improvement after fixes applied

### 13. Environmental Correlation
**Filename:** `13-environmental-factors.png`
**Caption:** "TeamCity correlates failures with environmental factors like build agents and time of day"
**What to capture:**
- Test failure analysis showing:
  - "Fails 80% on Agent-2"
  - "Fails during business hours"
  - "Memory-related failures"

### 14. ROI Dashboard
**Filename:** `14-roi-metrics.png`
**Caption:** "Real metrics from teams using TeamCity: 40% reduction in debugging time, 25% faster deployments"
**What to capture:**
- Before/after metrics
- Time saved calculations
- Developer productivity improvements

## Screenshot Annotation Guidelines

### Colors to Use:
- **Red boxes**: Highlight problems or failures
- **Green boxes**: Highlight solutions or successes
- **Yellow/Orange boxes**: Highlight flaky indicators
- **Blue arrows**: Direct attention to key features

### Annotations to Add:
1. **For flaky indicators**: "Automatically detected"
2. **For percentages**: "No manual calculation needed"
3. **For Jenkins scripts**: "Complex manual configuration"
4. **For TeamCity UI**: "Zero configuration required"

## Screenshot Capture Tips

### Browser Settings:
```bash
# Consistent window size
# Chrome DevTools → Device Toolbar → Responsive
# Set to: 1920 x 1080

# Clear cache between tools
# Chrome → More Tools → Clear Browsing Data

# Disable browser extensions
# Use Incognito/Private mode for clean UI
```

### TeamCity Preparation:
```bash
# Run builds with this pattern for best results:
Build 1: 8 failures (mix of flaky and real)
Build 2: 5 failures (different ones)
Build 3: 6 failures (some repeating)
Build 4: 4 failures (pattern emerging)
Build 5: 5 failures (flaky tests identified)
```

### File Naming Convention:
```
XX-description-tool.png
Where:
- XX = Two-digit number (01, 02, etc.)
- description = brief description with hyphens
- tool = teamcity, jenkins, or both
```

## Checklist Before Submitting Article

- [ ] All 10 essential screenshots captured
- [ ] Screenshots are high resolution (at least 1920x1080)
- [ ] Annotations added where needed
- [ ] Captions match the narrative flow
- [ ] File sizes optimized (under 500KB each)
- [ ] Screenshots show realistic data (not "Test 1", "Test 2")
- [ ] No sensitive information visible
- [ ] Consistent UI theme across screenshots
- [ ] Clear visual story from problem to solution
