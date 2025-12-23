pipeline {
    agent any
    
    tools {
        nodejs 'NodeJS-18' // Assumes NodeJS is configured in Jenkins
    }
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        
        stage('Install Dependencies') {
            steps {
                sh 'npm install'
            }
        }
        
        stage('Run Tests - Attempt 1') {
            steps {
                script {
                    try {
                        sh 'npm run test:junit'
                    } catch (Exception e) {
                        echo "First test run failed, attempting retry..."
                        currentBuild.result = 'UNSTABLE'
                    }
                }
            }
        }
        
        stage('Run Tests - Retry') {
            when {
                expression { currentBuild.result == 'UNSTABLE' }
            }
            steps {
                script {
                    // Blind retry - no intelligence about which tests are flaky
                    retry(2) {
                        sh 'npm run test:junit'
                    }
                }
            }
        }
        
        stage('Publish Test Results') {
            always {
                junit 'test-results/junit.xml'
                
                // Basic test report - no flaky test detection
                publishHTML([
                    allowMissing: false,
                    alwaysLinkToLastBuild: true,
                    keepAll: true,
                    reportDir: 'coverage',
                    reportFiles: 'index.html',
                    reportName: 'Coverage Report'
                ])
            }
        }
    }
    
    post {
        always {
            echo "Build completed with status: ${currentBuild.result}"
            
            // Manual workaround to track "potentially flaky" tests
            script {
                def testResults = junit testResults: 'test-results/junit.xml', skipPublishingChecks: true
                
                // This is where you'd need custom scripting to track flaky tests
                // Jenkins doesn't provide this out of the box
                if (testResults.failCount > 0) {
                    echo "Failed tests detected - may need manual investigation for flakiness"
                    echo "No automatic flaky test detection available"
                    echo "Developers must manually check test history across builds"
                }
            }
        }
        
        failure {
            echo "Build failed - check if failures are consistent or flaky"
            // No built-in way to distinguish between flaky and real failures
        }
        
        unstable {
            echo "Build unstable - likely flaky tests, but cannot confirm automatically"
        }
    }
}

/* 
 * JENKINS LIMITATIONS DEMONSTRATED:
 * 
 * 1. No built-in flaky test detection
 * 2. Blind retries of entire test suite
 * 3. No historical test analysis
 * 4. Manual investigation required for each failure
 * 5. No distinction between flaky and genuine failures
 * 6. Requires plugins or custom scripts for basic flaky test handling
 * 7. No intelligent retry mechanism
 * 8. No test muting with continued visibility
 * 
 * To add basic flaky test detection in Jenkins, you would need:
 * - Test Results Analyzer Plugin
 * - Flaky Test Handler Plugin  
 * - Custom Groovy scripts
 * - Manual threshold configuration
 * - Additional database to track test history
 */
