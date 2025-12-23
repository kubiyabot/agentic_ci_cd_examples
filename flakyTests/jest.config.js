module.exports = {
  testEnvironment: 'node',

  // Test file patterns
  testMatch: [
    '**/tests/**/*.test.js',
    '!**/tests/flaky-tests.test.js', // Exclude original flaky tests
    '!**/tests/teamcity-pattern-tests.test.js' // Keep for demo purposes
  ],

  // Coverage configuration
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'src/**/*.js',
    'tests/**/*.js',
    '!tests/flaky-tests.test.js' // Exclude flaky tests from coverage
  ],

  // Performance and reliability settings
  testTimeout: 10000, // 10 second timeout
  maxWorkers: 1, // Run tests sequentially to prevent race conditions

  // Setup files
  setupFilesAfterEnv: ['<rootDir>/tests/setup/jest.setup.js'],

  // Reporters
  reporters: [
    'default',
    ['jest-junit', {
      outputDirectory: './test-results',
      outputName: 'junit.xml',
      uniqueOutputName: 'false',
      classNameTemplate: '{classname}',
      titleTemplate: '{title}',
      ancestorSeparator: ' › ',
      usePathForSuiteName: 'true'
    }]
  ],

  // Module paths and aliases
  moduleDirectories: ['node_modules', '<rootDir>'],

  // Clear mocks between tests
  clearMocks: true,
  restoreMocks: true,

  // Test result processor for flaky test detection
  testResultsProcessor: '<rootDir>/tests/setup/flaky-test-detector.js',

  // Error handling
  errorOnDeprecated: true,

  // Verbose output for better debugging
  verbose: true,

  // Fail fast on first test failure for development
  bail: false, // Set to 1 for development, false for CI

  // Global test variables
  globals: {
    'TEST_TIMEOUT': 5000,
    'MOCK_DATA_PATH': '<rootDir>/tests/fixtures'
  }
};