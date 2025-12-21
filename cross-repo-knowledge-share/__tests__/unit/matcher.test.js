/**
 * Pattern Matcher Tests
 */

const { PatternMatcher } = require('../../src/learnings/matcher');

describe('PatternMatcher', () => {
  let matcher;

  beforeEach(() => {
    matcher = new PatternMatcher();
  });

  describe('findApplicablePatterns', () => {
    it('should find matching patterns', () => {
      const orgPatterns = [
        { name: 'jest_mocking', applicableTo: ['jest', 'javascript'] },
        { name: 'pytest_fixtures', applicableTo: ['pytest', 'python'] }
      ];

      const repoContext = {
        technologies: ['javascript'],
        frameworks: ['jest'],
        hasTests: true
      };

      const applicable = matcher.findApplicablePatterns(orgPatterns, repoContext);

      expect(applicable.length).toBeGreaterThan(0);
      expect(applicable[0].name).toBe('jest_mocking');
    });

    it('should sort by match score', () => {
      const orgPatterns = [
        { name: 'low_match', applicableTo: ['ruby'] },
        { name: 'high_match', applicableTo: ['javascript', 'node'] }
      ];

      const repoContext = {
        technologies: ['javascript', 'node'],
        frameworks: [],
        hasTests: true
      };

      const applicable = matcher.findApplicablePatterns(orgPatterns, repoContext);

      if (applicable.length >= 2) {
        expect(applicable[0].matchScore).toBeGreaterThanOrEqual(applicable[1].matchScore);
      }
    });

    it('should exclude non-applicable patterns', () => {
      const orgPatterns = [
        { name: 'ruby_pattern', applicableTo: ['ruby', 'rails'] }
      ];

      const repoContext = {
        technologies: ['javascript'],
        frameworks: ['react'],
        hasTests: true
      };

      const applicable = matcher.findApplicablePatterns(orgPatterns, repoContext);

      expect(applicable.length).toBe(0);
    });
  });

  describe('matchPattern', () => {
    it('should match when technologies align', () => {
      const pattern = {
        applicableTo: ['javascript', 'typescript'],
        type: 'TEST_PATTERN'
      };

      const repoContext = {
        technologies: ['javascript'],
        frameworks: [],
        hasTests: true
      };

      const match = matcher.matchPattern(pattern, repoContext);

      expect(match.applicable).toBe(true);
      expect(match.score).toBeGreaterThan(0);
    });

    it('should not match when technologies differ', () => {
      const pattern = {
        applicableTo: ['python', 'django'],
        type: 'TEST_PATTERN'
      };

      const repoContext = {
        technologies: ['javascript'],
        frameworks: ['react'],
        hasTests: true
      };

      const match = matcher.matchPattern(pattern, repoContext);

      expect(match.score).toBeLessThan(0.5);
    });

    it('should include match reason', () => {
      const pattern = {
        applicableTo: ['jest', 'javascript'],
        effectiveness: 'high',
        type: 'TEST_PATTERN'
      };

      const repoContext = {
        technologies: ['javascript'],
        frameworks: ['jest'],
        hasTests: true
      };

      const match = matcher.matchPattern(pattern, repoContext);

      expect(match.reason).toContain('Matches');
    });
  });

  describe('matchTechnologies', () => {
    it('should calculate score based on overlap', () => {
      const result = matcher.matchTechnologies(
        ['javascript', 'typescript', 'node'],
        ['javascript', 'node']
      );

      expect(result.score).toBeCloseTo(0.67, 1);
      expect(result.matches).toContain('javascript');
      expect(result.matches).toContain('node');
    });

    it('should handle empty repo technologies', () => {
      const result = matcher.matchTechnologies(['javascript'], []);

      expect(result.score).toBe(0.5); // Unknown, assume partial
    });

    it('should handle no matches', () => {
      const result = matcher.matchTechnologies(['ruby'], ['javascript']);

      expect(result.score).toBe(0);
      expect(result.matches).toHaveLength(0);
    });
  });

  describe('checkTypeRelevance', () => {
    it('should return high relevance for test patterns when tests exist', () => {
      const relevance = matcher.checkTypeRelevance('TEST_PATTERN', { hasTests: true });
      expect(relevance).toBe(1.0);
    });

    it('should return low relevance for test patterns when no tests', () => {
      const relevance = matcher.checkTypeRelevance('TEST_PATTERN', { hasTests: false });
      expect(relevance).toBe(0.3);
    });

    it('should always return high relevance for quality patterns', () => {
      const relevance = matcher.checkTypeRelevance('QUALITY_PATTERN', {});
      expect(relevance).toBe(1.0);
    });
  });

  describe('suggestAdaptations', () => {
    it('should suggest React-specific adaptations', () => {
      const pattern = { name: 'mocking' };
      const repoContext = { frameworks: ['react'] };

      const adaptations = matcher.suggestAdaptations(pattern, repoContext);

      expect(adaptations.some(a => a.suggestion.includes('React'))).toBe(true);
    });

    it('should suggest pnpm-specific caching', () => {
      const pattern = { name: 'dependency_caching' };
      const repoContext = { packageManager: 'pnpm' };

      const adaptations = matcher.suggestAdaptations(pattern, repoContext);

      expect(adaptations.some(a => a.suggestion.includes('pnpm'))).toBe(true);
    });

    it('should suggest database cleanup for test isolation', () => {
      const pattern = { name: 'test_isolation' };
      const repoContext = { hasDatabase: true };

      const adaptations = matcher.suggestAdaptations(pattern, repoContext);

      expect(adaptations.some(a => a.suggestion.includes('database'))).toBe(true);
    });
  });

  describe('checkFlakyPatternApplies', () => {
    it('should detect time dependency in code', () => {
      const pattern = { name: 'time_dependency' };
      const code = 'const now = new Date();';

      expect(matcher.checkFlakyPatternApplies(pattern, code)).toBe(true);
    });

    it('should not flag time dependency with fake timers', () => {
      const pattern = { name: 'time_dependency' };
      const code = 'jest.useFakeTimers(); const now = new Date();';

      expect(matcher.checkFlakyPatternApplies(pattern, code)).toBe(false);
    });

    it('should detect random values', () => {
      const pattern = { name: 'random_values' };
      const code = 'const x = Math.random();';

      expect(matcher.checkFlakyPatternApplies(pattern, code)).toBe(true);
    });
  });

  describe('generateApplicationInstructions', () => {
    it('should generate steps for test_isolation', () => {
      const pattern = { name: 'test_isolation', type: 'TEST_PATTERN' };
      const repoContext = {};

      const instructions = matcher.generateApplicationInstructions(pattern, repoContext);

      expect(instructions.steps.length).toBeGreaterThan(0);
      expect(instructions.steps.some(s => s.includes('beforeEach'))).toBe(true);
    });

    it('should generate examples', () => {
      const pattern = { name: 'test_isolation', type: 'TEST_PATTERN' };
      const repoContext = {};

      const instructions = matcher.generateApplicationInstructions(pattern, repoContext);

      expect(instructions.examples.length).toBeGreaterThan(0);
    });

    it('should add warning for flaky patterns', () => {
      const pattern = { name: 'time_dependency', type: 'FLAKY_PATTERN' };
      const repoContext = {};

      const instructions = matcher.generateApplicationInstructions(pattern, repoContext);

      expect(instructions.warnings.length).toBeGreaterThan(0);
      expect(instructions.warnings[0]).toContain('anti-pattern');
    });
  });
});
