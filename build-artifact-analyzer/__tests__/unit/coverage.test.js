/**
 * Coverage Analyzer Tests
 */

const { CoverageAnalyzer } = require('../../src/analyzers/coverage');

describe('CoverageAnalyzer', () => {
  let analyzer;

  beforeEach(() => {
    analyzer = new CoverageAnalyzer({
      lineThreshold: 80,
      branchThreshold: 70,
      functionThreshold: 80
    });
  });

  describe('analyze', () => {
    it('should throw on missing coverage data', () => {
      expect(() => analyzer.analyze(null)).toThrow('No coverage data provided');
    });

    it('should extract summary from total', () => {
      const coverageData = {
        total: {
          lines: { pct: 85 },
          branches: { pct: 72 },
          functions: { pct: 90 },
          statements: { pct: 84 }
        }
      };

      const result = analyzer.analyze(coverageData);

      expect(result.summary.lines).toBe(85);
      expect(result.summary.branches).toBe(72);
      expect(result.summary.functions).toBe(90);
    });

    it('should return all analysis sections', () => {
      const coverageData = {
        total: {
          lines: { pct: 85 },
          branches: { pct: 72 },
          functions: { pct: 90 },
          statements: { pct: 84 }
        }
      };

      const result = analyzer.analyze(coverageData);

      expect(result).toHaveProperty('summary');
      expect(result).toHaveProperty('fileDetails');
      expect(result).toHaveProperty('uncoveredAreas');
      expect(result).toHaveProperty('riskAreas');
      expect(result).toHaveProperty('meetsThresholds');
      expect(result).toHaveProperty('recommendations');
    });
  });

  describe('checkThresholds', () => {
    it('should pass when all thresholds met', () => {
      const summary = {
        lines: 85,
        branches: 75,
        functions: 90,
        statements: 85
      };

      const result = analyzer.checkThresholds(summary);

      expect(result.overall).toBe(true);
      expect(result.lines).toBe(true);
      expect(result.branches).toBe(true);
    });

    it('should fail when threshold not met', () => {
      const summary = {
        lines: 70, // Below 80 threshold
        branches: 75,
        functions: 90,
        statements: 85
      };

      const result = analyzer.checkThresholds(summary);

      expect(result.overall).toBe(false);
      expect(result.lines).toBe(false);
    });
  });

  describe('analyzeFiles', () => {
    it('should skip total key', () => {
      const coverageData = {
        total: { lines: { pct: 85 } },
        'src/file.js': {
          s: { 1: 1, 2: 0 },
          f: { 1: 1 },
          b: { 1: [1, 0] }
        }
      };

      const result = analyzer.analyzeFiles(coverageData);

      expect(result.every(f => f.path !== 'total')).toBe(true);
    });

    it('should sort by priority (lowest coverage first)', () => {
      const coverageData = {
        'high-coverage.js': {
          s: { 1: 1, 2: 1, 3: 1, 4: 1 }, // 100% statements
          f: { 1: 1, 2: 1 }, // 100% functions
          b: { 1: [1, 1] } // 100% branches
        },
        'low-coverage.js': {
          s: { 1: 1, 2: 0, 3: 0, 4: 0 }, // 25% statements
          f: { 1: 1, 2: 0 }, // 50% functions
          b: { 1: [1, 0], 2: [0, 0] } // 25% branches
        }
      };

      const result = analyzer.analyzeFiles(coverageData);

      // Lower coverage files should come first
      expect(result[0].path).toBe('low-coverage.js');
    });
  });

  describe('identifyRiskAreas', () => {
    it('should identify high risk areas', () => {
      const fileDetails = [
        { path: 'critical.js', priority: 25, functions: 20, branches: 30 },
        { path: 'safe.js', priority: 85, functions: 90, branches: 80 }
      ];

      const result = analyzer.identifyRiskAreas(fileDetails);

      expect(result).toHaveLength(1);
      expect(result[0].file).toBe('critical.js');
      expect(result[0].risk).toBe('high');
    });

    it('should provide function coverage recommendation', () => {
      const fileDetails = [
        { path: 'low-func.js', priority: 40, functions: 30, branches: 60 }
      ];

      const result = analyzer.identifyRiskAreas(fileDetails);

      expect(result[0].recommendation).toContain('untested functions');
    });

    it('should provide branch coverage recommendation', () => {
      const fileDetails = [
        { path: 'low-branch.js', priority: 40, functions: 80, branches: 30 }
      ];

      const result = analyzer.identifyRiskAreas(fileDetails);

      expect(result[0].recommendation).toContain('branch coverage');
    });
  });

  describe('generateRecommendations', () => {
    it('should recommend action for low line coverage', () => {
      const summary = { lines: 70, branches: 80, functions: 90, statements: 85 };

      const result = analyzer.generateRecommendations({
        summary,
        fileDetails: [],
        uncoveredAreas: { functions: [], branches: [], lines: [] }
      });

      expect(result.some(r => r.type === 'LINE_COVERAGE')).toBe(true);
    });

    it('should recommend action for critical files', () => {
      const summary = { lines: 90, branches: 80, functions: 90, statements: 90 };
      const fileDetails = [
        { path: 'critical.js', priority: 20 },
        { path: 'another.js', priority: 25 }
      ];

      const result = analyzer.generateRecommendations({
        summary,
        fileDetails,
        uncoveredAreas: { functions: [], branches: [], lines: [] }
      });

      expect(result.some(r => r.type === 'LOW_COVERAGE_FILES')).toBe(true);
    });

    it('should recommend action for many untested functions', () => {
      const summary = { lines: 90, branches: 80, functions: 70, statements: 90 };
      const uncoveredAreas = {
        functions: Array(15).fill({ file: 'x.js', name: 'fn' }),
        branches: [],
        lines: []
      };

      const result = analyzer.generateRecommendations({
        summary,
        fileDetails: [],
        uncoveredAreas
      });

      expect(result.some(r => r.type === 'UNTESTED_FUNCTIONS')).toBe(true);
    });
  });
});
