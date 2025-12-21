/**
 * Coverage Analyzer
 * Analyzes code coverage reports and identifies gaps
 */

class CoverageAnalyzer {
  constructor(options = {}) {
    this.thresholds = {
      lines: options.lineThreshold || 80,
      branches: options.branchThreshold || 70,
      functions: options.functionThreshold || 80,
      statements: options.statementThreshold || 80
    };
  }

  analyze(coverageData) {
    if (!coverageData) {
      throw new Error('No coverage data provided');
    }

    const summary = this.extractSummary(coverageData);
    const fileDetails = this.analyzeFiles(coverageData);
    const uncoveredAreas = this.findUncoveredAreas(coverageData);
    const riskAreas = this.identifyRiskAreas(fileDetails);

    return {
      summary,
      fileDetails,
      uncoveredAreas,
      riskAreas,
      meetsThresholds: this.checkThresholds(summary),
      recommendations: this.generateRecommendations({ summary, fileDetails, uncoveredAreas })
    };
  }

  extractSummary(coverageData) {
    // Handle both JSON summary format and detailed format
    if (coverageData.total) {
      return {
        lines: coverageData.total.lines?.pct || 0,
        branches: coverageData.total.branches?.pct || 0,
        functions: coverageData.total.functions?.pct || 0,
        statements: coverageData.total.statements?.pct || 0
      };
    }

    // Calculate from file-level data
    let totalLines = 0, coveredLines = 0;
    let totalBranches = 0, coveredBranches = 0;
    let totalFunctions = 0, coveredFunctions = 0;
    let totalStatements = 0, coveredStatements = 0;

    for (const file of Object.values(coverageData)) {
      if (file.s) { // Statement coverage
        totalStatements += Object.keys(file.s).length;
        coveredStatements += Object.values(file.s).filter(v => v > 0).length;
      }
      if (file.b) { // Branch coverage
        for (const branches of Object.values(file.b)) {
          totalBranches += branches.length;
          coveredBranches += branches.filter(v => v > 0).length;
        }
      }
      if (file.f) { // Function coverage
        totalFunctions += Object.keys(file.f).length;
        coveredFunctions += Object.values(file.f).filter(v => v > 0).length;
      }
    }

    return {
      lines: totalLines > 0 ? (coveredLines / totalLines * 100) : 0,
      branches: totalBranches > 0 ? (coveredBranches / totalBranches * 100) : 0,
      functions: totalFunctions > 0 ? (coveredFunctions / totalFunctions * 100) : 0,
      statements: totalStatements > 0 ? (coveredStatements / totalStatements * 100) : 0
    };
  }

  analyzeFiles(coverageData) {
    const files = [];

    // Skip 'total' key if present
    for (const [filePath, data] of Object.entries(coverageData)) {
      if (filePath === 'total') continue;
      if (!data || typeof data !== 'object') continue;

      const fileStats = this.calculateFileStats(data);
      files.push({
        path: filePath,
        ...fileStats,
        priority: this.calculatePriority(fileStats)
      });
    }

    // Sort by priority (lowest coverage first)
    return files.sort((a, b) => a.priority - b.priority);
  }

  calculateFileStats(fileData) {
    const stats = {
      lines: 0,
      branches: 0,
      functions: 0,
      statements: 0,
      uncoveredLines: []
    };

    if (fileData.s) {
      const total = Object.keys(fileData.s).length;
      const covered = Object.values(fileData.s).filter(v => v > 0).length;
      stats.statements = total > 0 ? (covered / total * 100) : 100;

      // Find uncovered statement lines
      if (fileData.statementMap) {
        for (const [id, count] of Object.entries(fileData.s)) {
          if (count === 0 && fileData.statementMap[id]) {
            stats.uncoveredLines.push(fileData.statementMap[id].start.line);
          }
        }
      }
    }

    if (fileData.b) {
      let total = 0, covered = 0;
      for (const branches of Object.values(fileData.b)) {
        total += branches.length;
        covered += branches.filter(v => v > 0).length;
      }
      stats.branches = total > 0 ? (covered / total * 100) : 100;
    }

    if (fileData.f) {
      const total = Object.keys(fileData.f).length;
      const covered = Object.values(fileData.f).filter(v => v > 0).length;
      stats.functions = total > 0 ? (covered / total * 100) : 100;
    }

    return stats;
  }

  calculatePriority(stats) {
    // Lower is higher priority (needs attention)
    return (stats.lines + stats.branches + stats.functions + stats.statements) / 4;
  }

  findUncoveredAreas(coverageData) {
    const uncovered = {
      functions: [],
      branches: [],
      lines: []
    };

    for (const [filePath, data] of Object.entries(coverageData)) {
      if (filePath === 'total' || !data) continue;

      // Uncovered functions
      if (data.f && data.fnMap) {
        for (const [id, count] of Object.entries(data.f)) {
          if (count === 0 && data.fnMap[id]) {
            uncovered.functions.push({
              file: filePath,
              name: data.fnMap[id].name,
              line: data.fnMap[id].decl?.start?.line
            });
          }
        }
      }

      // Uncovered branches
      if (data.b && data.branchMap) {
        for (const [id, counts] of Object.entries(data.b)) {
          counts.forEach((count, idx) => {
            if (count === 0 && data.branchMap[id]) {
              uncovered.branches.push({
                file: filePath,
                type: data.branchMap[id].type,
                line: data.branchMap[id].loc?.start?.line,
                branch: idx
              });
            }
          });
        }
      }
    }

    return uncovered;
  }

  identifyRiskAreas(fileDetails) {
    // Files with low coverage that might be critical
    return fileDetails
      .filter(f => f.priority < 50) // Less than 50% average coverage
      .map(f => ({
        file: f.path,
        coverage: f.priority.toFixed(1) + '%',
        risk: f.priority < 30 ? 'high' : 'medium',
        recommendation: f.functions < 50
          ? 'Many untested functions - add unit tests'
          : f.branches < 50
          ? 'Low branch coverage - add edge case tests'
          : 'Increase overall test coverage'
      }));
  }

  checkThresholds(summary) {
    return {
      lines: summary.lines >= this.thresholds.lines,
      branches: summary.branches >= this.thresholds.branches,
      functions: summary.functions >= this.thresholds.functions,
      statements: summary.statements >= this.thresholds.statements,
      overall: summary.lines >= this.thresholds.lines &&
               summary.branches >= this.thresholds.branches &&
               summary.functions >= this.thresholds.functions &&
               summary.statements >= this.thresholds.statements
    };
  }

  generateRecommendations({ summary, fileDetails, uncoveredAreas }) {
    const recommendations = [];

    // Overall coverage
    if (summary.lines < this.thresholds.lines) {
      recommendations.push({
        severity: 'high',
        type: 'LINE_COVERAGE',
        message: `Line coverage ${summary.lines.toFixed(1)}% below ${this.thresholds.lines}% threshold`,
        action: 'Add tests for uncovered code paths'
      });
    }

    if (summary.branches < this.thresholds.branches) {
      recommendations.push({
        severity: 'medium',
        type: 'BRANCH_COVERAGE',
        message: `Branch coverage ${summary.branches.toFixed(1)}% below ${this.thresholds.branches}% threshold`,
        action: 'Add tests for conditional branches and edge cases'
      });
    }

    // Specific files
    const criticalFiles = fileDetails.filter(f => f.priority < 30);
    if (criticalFiles.length > 0) {
      recommendations.push({
        severity: 'high',
        type: 'LOW_COVERAGE_FILES',
        message: `${criticalFiles.length} files have critical low coverage (<30%)`,
        files: criticalFiles.map(f => f.path),
        action: 'Prioritize testing these files'
      });
    }

    // Untested functions
    if (uncoveredAreas.functions.length > 10) {
      recommendations.push({
        severity: 'medium',
        type: 'UNTESTED_FUNCTIONS',
        message: `${uncoveredAreas.functions.length} functions have no test coverage`,
        action: 'Add unit tests for critical functions'
      });
    }

    return recommendations;
  }
}

module.exports = { CoverageAnalyzer };
