/**
 * Pattern Matcher
 * Matches organizational patterns to current repository context
 */

class PatternMatcher {
  constructor() {
    this.matchCache = new Map();
  }

  /**
   * Find applicable patterns from org knowledge for current repo
   */
  findApplicablePatterns(orgPatterns, repoContext) {
    const applicable = [];

    for (const pattern of orgPatterns) {
      const match = this.matchPattern(pattern, repoContext);
      if (match.applicable) {
        applicable.push({
          ...pattern,
          matchScore: match.score,
          matchReason: match.reason,
          adaptations: match.adaptations
        });
      }
    }

    // Sort by match score
    return applicable.sort((a, b) => b.matchScore - a.matchScore);
  }

  /**
   * Match a single pattern against repo context
   */
  matchPattern(pattern, repoContext) {
    const applicableTo = pattern.applicableTo || [];

    // Check technology match
    const techMatch = this.matchTechnologies(applicableTo, repoContext.technologies);

    // Check framework match
    const frameworkMatch = this.matchFrameworks(applicableTo, repoContext.frameworks);

    // Check pattern type relevance
    const typeRelevance = this.checkTypeRelevance(pattern.type, repoContext);

    // Calculate overall score
    const score = (techMatch.score * 0.4) + (frameworkMatch.score * 0.4) + (typeRelevance * 0.2);

    if (score < 0.3) {
      return { applicable: false, score };
    }

    return {
      applicable: true,
      score,
      reason: this.buildMatchReason(techMatch, frameworkMatch, pattern),
      adaptations: this.suggestAdaptations(pattern, repoContext)
    };
  }

  matchTechnologies(patternTechs, repoTechs) {
    if (!repoTechs || repoTechs.length === 0) {
      return { score: 0.5, matches: [] }; // Unknown, assume partial match
    }

    const matches = patternTechs.filter(t =>
      repoTechs.some(rt => rt.toLowerCase() === t.toLowerCase())
    );

    return {
      score: matches.length / Math.max(patternTechs.length, 1),
      matches
    };
  }

  matchFrameworks(patternFrameworks, repoFrameworks) {
    if (!repoFrameworks || repoFrameworks.length === 0) {
      return { score: 0.5, matches: [] };
    }

    const matches = patternFrameworks.filter(f =>
      repoFrameworks.some(rf => rf.toLowerCase() === f.toLowerCase())
    );

    return {
      score: matches.length / Math.max(patternFrameworks.length, 1),
      matches
    };
  }

  checkTypeRelevance(patternType, repoContext) {
    const relevanceMap = {
      'TEST_PATTERN': repoContext.hasTests ? 1.0 : 0.3,
      'CI_PATTERN': repoContext.hasCI ? 1.0 : 0.5,
      'QUALITY_PATTERN': 1.0, // Always relevant
      'FLAKY_PATTERN': repoContext.hasTests ? 1.0 : 0.2,
      'TEST_FRAMEWORK': repoContext.hasTests ? 1.0 : 0.5
    };

    return relevanceMap[patternType] || 0.5;
  }

  buildMatchReason(techMatch, frameworkMatch, pattern) {
    const reasons = [];

    if (techMatch.matches.length > 0) {
      reasons.push(`Matches technologies: ${techMatch.matches.join(', ')}`);
    }

    if (frameworkMatch.matches.length > 0) {
      reasons.push(`Matches frameworks: ${frameworkMatch.matches.join(', ')}`);
    }

    if (pattern.effectiveness === 'high') {
      reasons.push('High effectiveness pattern');
    }

    return reasons.join('. ');
  }

  suggestAdaptations(pattern, repoContext) {
    const adaptations = [];

    // Suggest framework-specific adaptations
    if (pattern.name === 'mocking' && repoContext.frameworks?.includes('react')) {
      adaptations.push({
        type: 'FRAMEWORK_SPECIFIC',
        suggestion: 'Consider using React Testing Library mocks'
      });
    }

    if (pattern.name === 'dependency_caching' && repoContext.packageManager === 'pnpm') {
      adaptations.push({
        type: 'TOOL_SPECIFIC',
        suggestion: 'Use pnpm store path for caching'
      });
    }

    if (pattern.name === 'test_isolation' && repoContext.hasDatabase) {
      adaptations.push({
        type: 'ENVIRONMENT',
        suggestion: 'Include database cleanup in teardown'
      });
    }

    return adaptations;
  }

  /**
   * Check if a flaky pattern applies to current code
   */
  checkFlakyPatternApplies(flakyPattern, codeSnippet) {
    const checks = {
      'time_dependency': () =>
        codeSnippet.includes('new Date()') && !codeSnippet.includes('useFakeTimers'),
      'random_values': () =>
        codeSnippet.includes('Math.random()'),
      'hardcoded_ports': () =>
        /:\s*\d{4,5}/.test(codeSnippet),
      'timing_delays': () =>
        codeSnippet.includes('setTimeout') || codeSnippet.includes('sleep')
    };

    const check = checks[flakyPattern.name];
    return check ? check() : false;
  }

  /**
   * Generate application instructions for a pattern
   */
  generateApplicationInstructions(pattern, repoContext) {
    const instructions = {
      pattern: pattern.name,
      steps: [],
      examples: [],
      warnings: []
    };

    switch (pattern.name) {
      case 'test_isolation':
        instructions.steps = [
          'Add beforeEach() hook for test setup',
          'Add afterEach() hook for cleanup',
          'Reset all mocks between tests',
          'Clear any shared state'
        ];
        instructions.examples = [
          'beforeEach(() => { jest.clearAllMocks(); });',
          'afterEach(() => { cleanup(); });'
        ];
        break;

      case 'dependency_caching':
        instructions.steps = [
          'Configure cache key based on lock file hash',
          'Set appropriate cache paths',
          'Add cache restore before install',
          'Add cache save after install'
        ];
        break;

      case 'mocking':
        instructions.steps = [
          'Identify external dependencies',
          'Create mock implementations',
          'Use jest.mock() for module mocking',
          'Use jest.spyOn() for partial mocking'
        ];
        break;

      default:
        instructions.steps = ['Apply pattern as documented'];
    }

    // Add warnings based on context
    if (pattern.type === 'FLAKY_PATTERN') {
      instructions.warnings.push('This is an anti-pattern - fix it, do not replicate');
    }

    return instructions;
  }
}

module.exports = { PatternMatcher };
