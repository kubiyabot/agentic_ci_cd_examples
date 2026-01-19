/**
 * Jest Configuration for Stable Tests
 * Optimized for deterministic, reliable test execution
 */

module.exports = {
  // Use the V8 coverage provider for better performance
  coverageProvider: 'v8',
  
  // Test environment
  testEnvironment: 'node',
  
  // Test match patterns - only stable tests
  testMatch: [
    '**/*-FIXED.test.js',
    '**/*-FIXED.test.ts',
    '**/__tests__/stable/**/*.test.ts',
    '**/__tests__/stable/**/*.test.js',
    '**/tests/stable-tests.test.js',
    '**/tests/enhanced-fixed-tests.test.js',
    '**/tests/fixed-flaky-tests.test.js'
  ],
  
  // File extensions
  moduleFileExtensions: ['js', 'ts', 'tsx', 'json'],
  
  // Transform TypeScript files
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: {
        esModuleInterop: true,
        allowSyntheticDefaultImports: true
      }
    }]
  },
  
  // Setup files
  setupFilesAfterEnv: ['<rootDir>/jest.setup.stable.js'],
  
  // Coverage configuration
  collectCoverageFrom: [
    '**/*.{js,ts}',
    '!**/*.config.js',
    '!**/node_modules/**',
    '!**/dist/**',
    '!**/coverage/**'
  ],
  
  // Thresholds for stable tests should be high
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  
  // Timeout - stable tests should be fast
  testTimeout: 5000, // 5 seconds max per test
  
  // Run tests serially for consistency (can enable parallel later)
  maxWorkers: 1,
  
  // Bail on first failure for faster feedback
  bail: false, // Set to true if you want to stop on first failure
  
  // Verbose output
  verbose: true,
  
  // Clear mocks between tests
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
  
  // Detect open handles (helps find cleanup issues)
  detectOpenHandles: true,
  
  // Force exit after tests complete
  forceExit: false, // Should be false - tests should clean up properly
  
  // Reporters
  reporters: [
    'default',
    ['jest-junit', {
      outputDirectory: './test-results',
      outputName: 'stable-tests-results.xml',
      classNameTemplate: '{classname}',
      titleTemplate: '{title}',
      ancestorSeparator: ' › ',
      usePathForSuiteName: true
    }]
  ],
  
  // Module name mapper for aliases
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@tests/(.*)$': '<rootDir>/__tests__/$1'
  },
  
  // Global setup/teardown
  // globalSetup: '<rootDir>/jest.global-setup.js',
  // globalTeardown: '<rootDir>/jest.global-teardown.js',
  
  // Error on deprecated APIs
  errorOnDeprecated: true,
  
  // Notify on completion (optional)
  notify: false,
  
  // Display individual test results
  displayName: {
    name: 'STABLE-TESTS',
    color: 'green'
  }
};
