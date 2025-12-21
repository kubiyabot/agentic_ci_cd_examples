/**
 * Pattern Detector Tests
 */

const { PatternDetector } = require('../../src/patterns/detector');

describe('PatternDetector', () => {
  let detector;

  beforeEach(() => {
    detector = new PatternDetector();
  });

  describe('detectTestFramework', () => {
    it('should detect Jest', () => {
      const packageJson = {
        devDependencies: { jest: '^29.0.0' }
      };

      const patterns = detector.detectTestFramework(packageJson);

      expect(patterns).toHaveLength(1);
      expect(patterns[0].name).toBe('jest');
      expect(patterns[0].applicableTo).toContain('javascript');
    });

    it('should detect Mocha', () => {
      const packageJson = {
        devDependencies: { mocha: '^10.0.0' }
      };

      const patterns = detector.detectTestFramework(packageJson);

      expect(patterns.some(p => p.name === 'mocha')).toBe(true);
    });

    it('should detect multiple frameworks', () => {
      const packageJson = {
        devDependencies: {
          jest: '^29.0.0',
          vitest: '^0.34.0'
        }
      };

      const patterns = detector.detectTestFramework(packageJson);

      expect(patterns.length).toBeGreaterThan(1);
    });

    it('should return empty for no frameworks', () => {
      const packageJson = { dependencies: {} };

      const patterns = detector.detectTestFramework(packageJson);

      expect(patterns).toHaveLength(0);
    });
  });

  describe('detectQualityPatterns', () => {
    it('should detect ESLint', () => {
      const packageJson = {
        devDependencies: { eslint: '^8.0.0' }
      };

      const patterns = detector.detectQualityPatterns(packageJson);

      expect(patterns.some(p => p.name === 'static_analysis')).toBe(true);
    });

    it('should detect Prettier', () => {
      const packageJson = {
        devDependencies: { prettier: '^3.0.0' }
      };

      const patterns = detector.detectQualityPatterns(packageJson);

      expect(patterns.some(p => p.name === 'code_formatting')).toBe(true);
    });

    it('should detect TypeScript', () => {
      const packageJson = {
        devDependencies: { typescript: '^5.0.0' }
      };

      const patterns = detector.detectQualityPatterns(packageJson);

      expect(patterns.some(p => p.name === 'type_checking')).toBe(true);
    });

    it('should detect pre-commit hooks', () => {
      const packageJson = {
        devDependencies: { husky: '^8.0.0' }
      };

      const patterns = detector.detectQualityPatterns(packageJson);

      expect(patterns.some(p => p.name === 'pre_commit_hooks')).toBe(true);
    });
  });

  describe('detectTestPatterns', () => {
    it('should detect mocking patterns', () => {
      const testCode = `
        jest.mock('./api');
        jest.spyOn(console, 'log');
      `;

      const patterns = detector.detectTestPatterns(testCode);

      expect(patterns.some(p => p.name === 'mocking')).toBe(true);
    });

    it('should detect snapshot testing', () => {
      const testCode = `
        expect(component).toMatchSnapshot();
      `;

      const patterns = detector.detectTestPatterns(testCode);

      expect(patterns.some(p => p.name === 'snapshot_testing')).toBe(true);
    });

    it('should detect async testing', () => {
      const testCode = `
        it('should work', async () => {
          const result = await fetchData();
          expect(result).toBeDefined();
        });
      `;

      const patterns = detector.detectTestPatterns(testCode);

      expect(patterns.some(p => p.name === 'async_testing')).toBe(true);
    });

    it('should detect test isolation', () => {
      const testCode = `
        beforeEach(() => {
          setup();
        });
        afterEach(() => {
          cleanup();
        });
      `;

      const patterns = detector.detectTestPatterns(testCode);

      expect(patterns.some(p => p.name === 'test_isolation')).toBe(true);
    });

    it('should detect parameterized tests', () => {
      const testCode = `
        test.each([[1, 2], [3, 4]])('adds %i + %i', (a, b) => {
          expect(a + b).toBeDefined();
        });
      `;

      const patterns = detector.detectTestPatterns(testCode);

      expect(patterns.some(p => p.name === 'parameterized_tests')).toBe(true);
    });
  });

  describe('detectFlakyPatterns', () => {
    it('should detect time dependency', () => {
      const testCode = `
        const now = new Date();
        expect(now.getHours()).toBe(9);
      `;

      const patterns = detector.detectFlakyPatterns(testCode);

      expect(patterns.some(p => p.name === 'time_dependency')).toBe(true);
    });

    it('should not flag time dependency with fake timers', () => {
      const testCode = `
        jest.useFakeTimers();
        const now = new Date();
        expect(now).toBeDefined();
      `;

      const patterns = detector.detectFlakyPatterns(testCode);

      expect(patterns.some(p => p.name === 'time_dependency')).toBe(false);
    });

    it('should detect random values', () => {
      const testCode = `
        const value = Math.random();
        expect(value).toBeGreaterThan(0.5);
      `;

      const patterns = detector.detectFlakyPatterns(testCode);

      expect(patterns.some(p => p.name === 'random_values')).toBe(true);
    });

    it('should detect hardcoded ports', () => {
      const testCode = `
        const server = app.listen(3000);
      `;

      const patterns = detector.detectFlakyPatterns(testCode);

      expect(patterns.some(p => p.name === 'hardcoded_ports')).toBe(true);
    });

    it('should detect timing delays', () => {
      const testCode = `
        await new Promise(r => setTimeout(r, 1000));
        expect(result).toBeDefined();
      `;

      const patterns = detector.detectFlakyPatterns(testCode);

      expect(patterns.some(p => p.name === 'timing_delays')).toBe(true);
    });
  });

  describe('toShareablePattern', () => {
    it('should add metadata to pattern', () => {
      const pattern = {
        type: 'TEST_PATTERN',
        name: 'mocking',
        applicableTo: ['jest']
      };

      const repoContext = { repository: 'test-repo' };

      const shareable = detector.toShareablePattern(pattern, repoContext);

      expect(shareable.discoveredIn).toBe('test-repo');
      expect(shareable.discoveredDate).toBeDefined();
      expect(shareable.confidence).toBeGreaterThan(0);
      expect(shareable.shareScope).toBeDefined();
    });
  });

  describe('calculateConfidence', () => {
    it('should return high confidence for established patterns', () => {
      const pattern = { name: 'mocking' };
      expect(detector.calculateConfidence(pattern)).toBe(0.9);
    });

    it('should return medium confidence for moderate patterns', () => {
      const pattern = { name: 'snapshot_testing' };
      expect(detector.calculateConfidence(pattern)).toBe(0.7);
    });

    it('should return low confidence for unknown patterns', () => {
      const pattern = { name: 'unknown_pattern' };
      expect(detector.calculateConfidence(pattern)).toBe(0.5);
    });
  });

  describe('determineShareScope', () => {
    it('should return ORG for org-wide patterns', () => {
      expect(detector.determineShareScope({ name: 'dependency_caching' })).toBe('ORG');
      expect(detector.determineShareScope({ name: 'pre_commit_hooks' })).toBe('ORG');
    });

    it('should return TEAM for team-specific patterns', () => {
      expect(detector.determineShareScope({ name: 'snapshot_testing' })).toBe('TEAM');
    });
  });
});
