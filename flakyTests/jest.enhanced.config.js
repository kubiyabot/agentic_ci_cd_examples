/**
 * Enhanced Jest Configuration for Flaky Test Remediation
 * This configuration includes all optimizations to prevent flaky behavior
 */

module.exports = {
  // Basic configuration
  testEnvironment: 'node',

  // Test file patterns - include enhanced tests, exclude flaky ones
  testMatch: [
    '**/tests/**/*.test.js',
    '!**/tests/flaky-tests.test.js', // Exclude original flaky tests
    '**/tests/enhanced-fixed-tests.test.js', // Include enhanced fixes
    '**/tests/fixed-flaky-tests.test.js'     // Include original fixes
  ],

  // Performance and reliability settings
  testTimeout: 30000,    // Generous timeout for complex tests
  maxWorkers: 1,         // Sequential execution to prevent race conditions
  maxConcurrency: 1,     // Limit concurrent test suites

  // Setup files for deterministic behavior
  setupFilesAfterEnv: [
    '<rootDir>/tests/setup/deterministic-test-setup.js'
  ],

  // Global test variables
  globals: {
    'TEST_TIMEOUT': 10000,
    'DETERMINISTIC_MODE': true,
    'MOCK_DATA_PATH': '<rootDir>/tests/fixtures',
    'ENABLE_PERFORMANCE_MONITORING': true
  },

  // Module resolution
  moduleDirectories: ['node_modules', '<rootDir>'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@tests/(.*)$': '<rootDir>/tests/$1'
  },

  // Transform configuration
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest'
  },

  // Coverage configuration
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'src/**/*.{js,ts}',
    'tests/setup/**/*.{js,ts}',
    '!tests/flaky-tests.test.js',
    '!tests/regression-tests.test.js'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },

  // Reporter configuration for enhanced feedback
  reporters: [
    'default',
    ['jest-junit', {
      outputDirectory: './test-results',
      outputName: 'junit-enhanced.xml',
      uniqueOutputName: false,
      classNameTemplate: '{classname}',
      titleTemplate: '{title}',
      ancestorSeparator: ' › ',
      usePathForSuiteName: true,
      addFileAttribute: true,
      includeShortConsoleOutput: true
    }],
    ['jest-html-reporters', {
      publicPath: './test-results',
      filename: 'enhanced-test-report.html',
      expand: true,
      hideIcon: false,
      pageTitle: 'Enhanced Test Results',
      logoImg: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSI+PC9zdmc+',
      inlineSource: true
    }]
  ],

  // Error handling and debugging
  errorOnDeprecated: true,
  verbose: true,
  silent: false,
  bail: false,

  // Mock configuration
  clearMocks: true,
  restoreMocks: true,
  resetMocks: false,

  // Automatically restore mock state between every test
  restoreMocks: true,

  // Custom test environment for enhanced reliability
  testEnvironmentOptions: {
    customExportConditions: ['node', 'node-addons'],
  },

  // Enhanced test result processing
  testResultsProcessor: '<rootDir>/tests/setup/enhanced-test-processor.js',

  // Snapshot configuration
  updateSnapshot: false,

  // Watch mode configuration
  watchPlugins: [
    'jest-watch-typeahead/filename',
    'jest-watch-typeahead/testname',
    '<rootDir>/tests/setup/watch-plugin-flaky-detector.js'
  ],

  // Custom matchers and utilities
  setupFiles: [
    '<rootDir>/tests/setup/jest-environment-setup.js'
  ],

  // Collect additional metadata
  collectCoverage: true,
  coverageReporters: [
    'text',
    'lcov',
    'html',
    'json',
    'clover'
  ],

  // Performance optimization
  cacheDirectory: '<rootDir>/.jest-cache',

  // Custom test sequencing for stability
  testSequencer: '<rootDir>/tests/setup/deterministic-test-sequencer.js',

  // Memory management
  detectOpenHandles: true,
  detectLeaks: false,
  forceExit: true,

  // Test filtering for CI/CD
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/build/',
    '<rootDir>/dist/',
    '<rootDir>/tests/flaky-tests.test.js' // Explicitly ignore flaky tests
  ],

  // Notification configuration for development
  notify: false,
  notifyMode: 'failure-change',

  // Project configuration
  displayName: {
    name: 'Enhanced Test Suite',
    color: 'blue'
  },

  // Custom transformations
  transformIgnorePatterns: [
    'node_modules/(?!(.*\\.mjs$))'
  ],

  // Test retry configuration for rare edge cases
  retryTimes: 0, // Don't retry - tests should be deterministic

  // Additional Jest configuration for enhanced reliability
  injectGlobals: true,
  resetModules: false,

  // Custom matchers for enhanced testing
  setupFilesAfterEnv: [
    '<rootDir>/tests/setup/deterministic-test-setup.js',
    '<rootDir>/tests/setup/custom-matchers.js'
  ]
};