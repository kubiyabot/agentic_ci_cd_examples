import jetbrains.buildServer.configs.kotlin.*
import jetbrains.buildServer.configs.kotlin.buildSteps.*
import jetbrains.buildServer.configs.kotlin.triggers.*
import jetbrains.buildServer.configs.kotlin.buildFeatures.*

version = "2023.11"

project {
    buildType(FlakyTestDemo)
}

object FlakyTestDemo : BuildType({
    name = "Flaky Test Intelligence Demo"
    description = "Demonstrates TeamCity's intelligent flaky test detection"
    
    vcs {
        root(DslContext.settingsRoot)
    }
    
    steps {
        nodeJS {
            name = "Install Dependencies"
            shellScript = "npm install"
        }
        
        nodeJS {
            name = "Run Tests with Intelligence"
            shellScript = "npm run test:junit"
            
            // TeamCity automatically detects and handles test failures
            // No need for manual retry configuration
        }
    }
    
    features {
        // INTELLIGENT TEST FEATURES - Automatic, no configuration needed!
        
        // 1. Automatic Flaky Test Detection
        testHistory {
            // TeamCity automatically analyzes test history across builds
            // Identifies patterns of non-deterministic behavior
            // No manual configuration required
        }
        
        // 2. Test Intelligence 
        testIntelligence {
            // Automatically enabled
            // Detects flaky tests based on:
            // - Historical pass/fail patterns
            // - Statistical analysis across builds
            // - Environmental factors (agent, time, load)
        }
        
        // 3. Smart Test Retry
        automaticTestRetry {
            // Only retries detected flaky tests, not entire suite
            // Saves CI time and resources
            numberOfRetries = 2
            
            // Intelligent retry conditions
            retryFlakyTestsOnly = true
            
            // Continue build even if flaky tests fail
            continueOnFlakyTestFailure = true
        }
        
        // 4. Test Muting with Investigation
        testMuting {
            // Mute flaky tests while keeping them visible
            rules {
                mute {
                    // Automatically mute tests that fail >30% of the time
                    // but not 100% (those are real failures)
                    condition = "test.flakinessRate > 0.3 && test.flakinessRate < 1.0"
                    
                    // Assign to team member for investigation
                    investigationAssignee = "developer.responsible"
                    
                    // Keep running muted tests for visibility
                    continueRunning = true
                }
            }
        }
        
        // 5. Rich Test Reporting UI
        testReporting {
            // All of this is automatic in TeamCity's UI:
            
            // - Flaky test indicators with icons
            // - Flakiness percentage for each test
            // - Test history timeline showing patterns
            // - Failure correlation analysis
            // - Environmental factor analysis
            // - Statistical trends over time
            // - One-click test investigation assignment
            // - Muted test tracking with reasons
        }
        
        // 6. Build Failure Analysis
        buildFailureAnalysis {
            // Automatically distinguishes between:
            // - New test failures (likely real bugs)
            // - Known flaky test failures
            // - Infrastructure failures
            // - Compilation errors
            
            // Provides actionable insights in build log
        }
        
        // 7. Test Duration Analysis
        testDurationAnalysis {
            // Tracks test execution time
            // Identifies tests becoming slower (potential flakiness indicator)
            // Alerts on performance degradation
        }
        
        // 8. Parallel Test Execution with Intelligence
        parallelTests {
            // TeamCity intelligently schedules tests
            // Avoids running conflicting tests in parallel
            // Distributes based on historical execution time
            numberOfBatches = 4
        }
    }
    
    failureConditions {
        // Only fail build on genuine test failures, not flaky ones
        testFailure {
            // TeamCity's intelligence prevents flaky test failures from breaking builds
            stopBuildOnFailure = true
            
            // But only for non-flaky test failures
            excludeFlakyTests = true
        }
        
        // Set thresholds for investigation
        executionTimeoutMin = 10
        
        // Alert if flakiness increases
        customMetric {
            metric = "test.flakinessRate"
            threshold = 0.5
            description = "Alert if overall test flakiness exceeds 50%"
        }
    }
    
    // Build status is intelligent
    requirements {
        // TeamCity provides detailed status beyond pass/fail:
        // - "Passed" - All tests passed
        // - "Passed with known flaky failures" - Only flaky tests failed  
        // - "Failed" - Genuine test failures detected
        // - "Under Investigation" - Assigned flaky tests being fixed
    }
})

/*
 * TEAMCITY ADVANTAGES DEMONSTRATED:
 * 
 * 1. ✅ Automatic flaky test detection - no configuration needed
 * 2. ✅ Intelligent retry of only flaky tests
 * 3. ✅ Historical test analysis built-in
 * 4. ✅ Clear distinction between flaky and real failures
 * 5. ✅ Test muting with continued visibility
 * 6. ✅ Investigation assignment and tracking
 * 7. ✅ Rich UI with flakiness indicators and statistics
 * 8. ✅ Statistical analysis and pattern detection
 * 9. ✅ Environmental factor correlation
 * 10. ✅ No plugins or scripts required - it's all built-in!
 * 
 * The configuration above mostly uses pseudo-code to demonstrate
 * TeamCity's capabilities. In reality, most of these features are
 * enabled by default or with simple UI toggles - no code needed!
 */
