module.exports = {
  // Use our global setup file to fix flaky test patterns
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],

  // Test configuration
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.ts', '**/__tests__/**/*.test.js'],

  // Coverage configuration
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],

  // Increased timeouts for integration tests
  testTimeout: 10000,

  // Mock configuration
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,

  // Transform configuration for TypeScript
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },

  // Module resolution
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },

  // Verbose output for debugging flaky tests
  verbose: true,
};