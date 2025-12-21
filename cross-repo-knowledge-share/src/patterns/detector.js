/**
 * Pattern Detector
 * Identifies common patterns in codebases that can be shared across repositories
 */

class PatternDetector {
  constructor() {
    this.patterns = [];
  }

  /**
   * Detect test framework patterns
   */
  detectTestFramework(packageJson) {
    const patterns = [];
    const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };

    if (deps.jest) {
      patterns.push({
        type: 'TEST_FRAMEWORK',
        name: 'jest',
        version: deps.jest,
        applicableTo: ['javascript', 'typescript', 'react', 'node']
      });
    }

    if (deps.mocha) {
      patterns.push({
        type: 'TEST_FRAMEWORK',
        name: 'mocha',
        version: deps.mocha,
        applicableTo: ['javascript', 'node']
      });
    }

    if (deps.vitest) {
      patterns.push({
        type: 'TEST_FRAMEWORK',
        name: 'vitest',
        version: deps.vitest,
        applicableTo: ['javascript', 'typescript', 'vue', 'vite']
      });
    }

    if (deps.pytest || deps['pytest-asyncio']) {
      patterns.push({
        type: 'TEST_FRAMEWORK',
        name: 'pytest',
        applicableTo: ['python']
      });
    }

    return patterns;
  }

  /**
   * Detect CI/CD patterns
   */
  detectCIPatterns(config) {
    const patterns = [];

    if (!config) return patterns;

    // Parallel job detection
    if (config.workflows) {
      for (const [name, workflow] of Object.entries(config.workflows)) {
        if (workflow.jobs && workflow.jobs.length > 2) {
          patterns.push({
            type: 'CI_PATTERN',
            name: 'parallel_jobs',
            description: 'Multiple jobs running in parallel',
            effectiveness: 'high',
            applicableTo: ['circleci', 'github-actions']
          });
          break;
        }
      }
    }

    // Caching pattern
    const configStr = JSON.stringify(config);
    if (configStr.includes('cache') || configStr.includes('restore_cache')) {
      patterns.push({
        type: 'CI_PATTERN',
        name: 'dependency_caching',
        description: 'Caching dependencies between builds',
        effectiveness: 'high',
        applicableTo: ['circleci', 'github-actions', 'gitlab-ci']
      });
    }

    // Matrix builds
    if (configStr.includes('matrix') || configStr.includes('parameters')) {
      patterns.push({
        type: 'CI_PATTERN',
        name: 'matrix_builds',
        description: 'Testing across multiple configurations',
        effectiveness: 'medium',
        applicableTo: ['circleci', 'github-actions']
      });
    }

    return patterns;
  }

  /**
   * Detect code quality patterns
   */
  detectQualityPatterns(packageJson) {
    const patterns = [];
    const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
    const scripts = packageJson.scripts || {};

    // Linting
    if (deps.eslint || deps.tslint) {
      patterns.push({
        type: 'QUALITY_PATTERN',
        name: 'static_analysis',
        tool: deps.eslint ? 'eslint' : 'tslint',
        description: 'Static code analysis for JavaScript/TypeScript',
        effectiveness: 'high',
        applicableTo: ['javascript', 'typescript']
      });
    }

    // Formatting
    if (deps.prettier) {
      patterns.push({
        type: 'QUALITY_PATTERN',
        name: 'code_formatting',
        tool: 'prettier',
        description: 'Consistent code formatting',
        effectiveness: 'medium',
        applicableTo: ['javascript', 'typescript', 'css', 'json']
      });
    }

    // Type checking
    if (deps.typescript) {
      patterns.push({
        type: 'QUALITY_PATTERN',
        name: 'type_checking',
        tool: 'typescript',
        description: 'Static type checking',
        effectiveness: 'high',
        applicableTo: ['typescript']
      });
    }

    // Pre-commit hooks
    if (deps.husky || deps['lint-staged']) {
      patterns.push({
        type: 'QUALITY_PATTERN',
        name: 'pre_commit_hooks',
        tool: deps.husky ? 'husky' : 'lint-staged',
        description: 'Automated checks before commit',
        effectiveness: 'high',
        applicableTo: ['git', 'javascript', 'typescript']
      });
    }

    return patterns;
  }

  /**
   * Detect testing patterns from test files
   */
  detectTestPatterns(testCode) {
    const patterns = [];

    // Mock patterns
    if (testCode.includes('jest.mock') || testCode.includes('jest.spyOn')) {
      patterns.push({
        type: 'TEST_PATTERN',
        name: 'mocking',
        description: 'Using mocks for external dependencies',
        effectiveness: 'high',
        applicableTo: ['jest', 'unit_tests']
      });
    }

    // Snapshot testing
    if (testCode.includes('toMatchSnapshot') || testCode.includes('toMatchInlineSnapshot')) {
      patterns.push({
        type: 'TEST_PATTERN',
        name: 'snapshot_testing',
        description: 'Using snapshots for output verification',
        effectiveness: 'medium',
        applicableTo: ['jest', 'react']
      });
    }

    // Async patterns
    if (testCode.includes('async') && testCode.includes('await')) {
      patterns.push({
        type: 'TEST_PATTERN',
        name: 'async_testing',
        description: 'Testing asynchronous code',
        effectiveness: 'high',
        applicableTo: ['jest', 'mocha', 'async_code']
      });
    }

    // Test isolation
    if (testCode.includes('beforeEach') && testCode.includes('afterEach')) {
      patterns.push({
        type: 'TEST_PATTERN',
        name: 'test_isolation',
        description: 'Proper setup/teardown for isolated tests',
        effectiveness: 'high',
        applicableTo: ['jest', 'mocha', 'vitest']
      });
    }

    // Parameterized tests
    if (testCode.includes('test.each') || testCode.includes('it.each')) {
      patterns.push({
        type: 'TEST_PATTERN',
        name: 'parameterized_tests',
        description: 'Data-driven test cases',
        effectiveness: 'medium',
        applicableTo: ['jest']
      });
    }

    return patterns;
  }

  /**
   * Detect flaky test patterns (anti-patterns)
   */
  detectFlakyPatterns(testCode) {
    const patterns = [];

    // Time-dependent
    if (testCode.includes('new Date()') && !testCode.includes('jest.useFakeTimers')) {
      patterns.push({
        type: 'FLAKY_PATTERN',
        name: 'time_dependency',
        description: 'Tests depend on current time without mocking',
        severity: 'high',
        fix: 'Use jest.useFakeTimers() or mock Date'
      });
    }

    // Random values
    if (testCode.includes('Math.random()') && !testCode.includes('seed')) {
      patterns.push({
        type: 'FLAKY_PATTERN',
        name: 'random_values',
        description: 'Tests use random values without seeding',
        severity: 'high',
        fix: 'Seed random or use deterministic values'
      });
    }

    // Hardcoded ports
    if (testCode.match(/:\s*\d{4,5}/)) {
      patterns.push({
        type: 'FLAKY_PATTERN',
        name: 'hardcoded_ports',
        description: 'Tests use hardcoded ports that may conflict',
        severity: 'medium',
        fix: 'Use dynamic port allocation'
      });
    }

    // Sleep/delays
    if (testCode.includes('setTimeout') || testCode.includes('sleep')) {
      patterns.push({
        type: 'FLAKY_PATTERN',
        name: 'timing_delays',
        description: 'Tests rely on timing delays',
        severity: 'medium',
        fix: 'Use waitFor() or polling instead'
      });
    }

    return patterns;
  }

  /**
   * Generate shareable pattern from detection
   */
  toShareablePattern(pattern, repoContext) {
    return {
      ...pattern,
      discoveredIn: repoContext.repository,
      discoveredDate: new Date().toISOString(),
      confidence: this.calculateConfidence(pattern),
      shareScope: this.determineShareScope(pattern)
    };
  }

  calculateConfidence(pattern) {
    // Higher confidence for well-established patterns
    const highConfidence = ['mocking', 'test_isolation', 'dependency_caching'];
    const mediumConfidence = ['snapshot_testing', 'matrix_builds'];

    if (highConfidence.includes(pattern.name)) return 0.9;
    if (mediumConfidence.includes(pattern.name)) return 0.7;
    return 0.5;
  }

  determineShareScope(pattern) {
    // Determine if pattern should be shared org-wide or repo-specific
    const orgWidePatterns = [
      'dependency_caching',
      'pre_commit_hooks',
      'static_analysis',
      'test_isolation'
    ];

    return orgWidePatterns.includes(pattern.name) ? 'ORG' : 'TEAM';
  }
}

module.exports = { PatternDetector };
