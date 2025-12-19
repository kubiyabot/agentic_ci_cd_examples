#!/usr/bin/env python3
"""
Repository Test File Analyzer
Analyzes test files and categorizes them as stable, flaky, or outdated.
"""

import os
import re
import json
import subprocess
from pathlib import Path
from datetime import datetime, timedelta
from typing import Dict, List, Tuple, Any
import fnmatch

class TestFileAnalyzer:
    def __init__(self, repo_path: str = "."):
        self.repo_path = Path(repo_path)
        self.test_files = []
        self.analysis_results = {
            "stable": [],
            "flaky": [],
            "outdated": [],
            "unknown": []
        }
        
        # Patterns that indicate different test types
        self.flaky_indicators = [
            "Math.random", "setTimeout", "setInterval", "Date()", "new Date",
            "process.env", "NODE_ENV", "environment", "time", "random",
            "flaky", "FLAKY", "intermittent", "unstable", "fails sometimes",
            "depends on", "environment-dependent", "timing", "race condition"
        ]
        
        self.outdated_indicators = [
            "TODO", "FIXME", "deprecated", "outdated", "old", "OLD", "OUTDATED",
            "needs update", "broken", "disabled", "skip", "pending",
            "wrong assertions", "no longer", "legacy"
        ]
        
        self.stable_indicators = [
            "STABLE", "stable", "should always pass", "deterministic",
            "unit test", "pure function", "predictable"
        ]

    def find_test_files(self) -> List[Path]:
        """Find all test files in the repository."""
        test_patterns = [
            "**/*.test.*",
            "**/*.spec.*", 
            "**/*test*",
            "**/*spec*",
            "**/test/**/*",
            "**/tests/**/*",
            "**/__tests__/**/*"
        ]
        
        test_files = set()
        
        for pattern in test_patterns:
            for file_path in self.repo_path.glob(pattern):
                if file_path.is_file() and file_path.suffix in ['.js', '.ts', '.jsx', '.tsx', '.py']:
                    test_files.add(file_path)
        
        return sorted(list(test_files))

    def analyze_file_content(self, file_path: Path) -> Dict[str, Any]:
        """Analyze the content of a test file."""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
        except Exception as e:
            return {"error": str(e), "content": ""}
        
        analysis = {
            "file_path": str(file_path),
            "size": len(content),
            "lines": len(content.split('\n')),
            "flaky_score": 0,
            "outdated_score": 0,
            "stable_score": 0,
            "indicators": {
                "flaky": [],
                "outdated": [],
                "stable": []
            },
            "content_preview": content[:500] + "..." if len(content) > 500 else content
        }
        
        # Check for flaky indicators
        for indicator in self.flaky_indicators:
            if indicator.lower() in content.lower():
                analysis["flaky_score"] += 1
                analysis["indicators"]["flaky"].append(indicator)
        
        # Check for outdated indicators
        for indicator in self.outdated_indicators:
            if indicator.lower() in content.lower():
                analysis["outdated_score"] += 1
                analysis["indicators"]["outdated"].append(indicator)
        
        # Check for stable indicators
        for indicator in self.stable_indicators:
            if indicator.lower() in content.lower():
                analysis["stable_score"] += 1
                analysis["indicators"]["stable"].append(indicator)
        
        # Additional analysis based on file path
        path_str = str(file_path).lower()
        if "flaky" in path_str or "unstable" in path_str:
            analysis["flaky_score"] += 5
            analysis["indicators"]["flaky"].append("flaky in path")
        
        if "integration" in path_str:
            analysis["flaky_score"] += 1  # Integration tests tend to be more flaky
            analysis["indicators"]["flaky"].append("integration test")
        
        if "unit" in path_str:
            analysis["stable_score"] += 2  # Unit tests tend to be more stable
            analysis["indicators"]["stable"].append("unit test")
        
        return analysis

    def get_file_metadata(self, file_path: Path) -> Dict[str, Any]:
        """Get metadata about the file (timestamps, git info, etc.)."""
        metadata = {}
        
        try:
            stat = file_path.stat()
            metadata["size_bytes"] = stat.st_size
            metadata["modified_time"] = datetime.fromtimestamp(stat.st_mtime).isoformat()
            metadata["created_time"] = datetime.fromtimestamp(stat.st_ctime).isoformat()
            
            # Check if file is old (more than 6 months)
            six_months_ago = datetime.now() - timedelta(days=180)
            if datetime.fromtimestamp(stat.st_mtime) < six_months_ago:
                metadata["is_old"] = True
            else:
                metadata["is_old"] = False
                
        except Exception as e:
            metadata["error"] = str(e)
        
        # Try to get git information
        try:
            # Get last commit date for this file
            result = subprocess.run(
                ["git", "log", "-1", "--format=%ci", "--", str(file_path)],
                capture_output=True, text=True, cwd=self.repo_path
            )
            if result.returncode == 0 and result.stdout.strip():
                metadata["last_git_commit"] = result.stdout.strip()
            
            # Get number of commits for this file
            result = subprocess.run(
                ["git", "rev-list", "--count", "HEAD", "--", str(file_path)],
                capture_output=True, text=True, cwd=self.repo_path
            )
            if result.returncode == 0 and result.stdout.strip():
                metadata["git_commit_count"] = int(result.stdout.strip())
                
        except Exception as e:
            metadata["git_error"] = str(e)
        
        return metadata

    def categorize_test_file(self, analysis: Dict[str, Any], metadata: Dict[str, Any]) -> str:
        """Categorize a test file as stable, flaky, or outdated."""
        flaky_score = analysis["flaky_score"]
        outdated_score = analysis["outdated_score"]
        stable_score = analysis["stable_score"]
        
        # Strong indicators override others
        if flaky_score >= 3 or "flaky" in str(analysis["file_path"]).lower():
            return "flaky"
        
        if outdated_score >= 2 or "outdated" in analysis.get("indicators", {}).get("outdated", []):
            return "outdated"
        
        # Check file age
        if metadata.get("is_old", False) and outdated_score > 0:
            return "outdated"
        
        # If it has stable indicators and no flaky ones
        if stable_score >= 2 and flaky_score == 0:
            return "stable"
        
        # Integration tests with some flaky indicators
        if "integration" in str(analysis["file_path"]).lower() and flaky_score > 0:
            return "flaky"
        
        # Unit tests are generally stable
        if "unit" in str(analysis["file_path"]).lower() and flaky_score < 2:
            return "stable"
        
        # Default categorization
        if flaky_score > outdated_score and flaky_score > stable_score:
            return "flaky"
        elif outdated_score > stable_score:
            return "outdated"
        elif stable_score > 0:
            return "stable"
        else:
            return "unknown"

    def analyze_repository(self) -> Dict[str, Any]:
        """Perform complete analysis of the repository."""
        print("🔍 Finding test files...")
        test_files = self.find_test_files()
        print(f"Found {len(test_files)} test files")
        
        results = {
            "summary": {
                "total_files": len(test_files),
                "stable": 0,
                "flaky": 0,
                "outdated": 0,
                "unknown": 0
            },
            "files": {
                "stable": [],
                "flaky": [],
                "outdated": [],
                "unknown": []
            },
            "analysis_metadata": {
                "analyzed_at": datetime.now().isoformat(),
                "repository_path": str(self.repo_path)
            }
        }
        
        for file_path in test_files:
            print(f"📝 Analyzing {file_path}")
            
            # Analyze file content
            content_analysis = self.analyze_file_content(file_path)
            
            # Get file metadata
            metadata = self.get_file_metadata(file_path)
            
            # Categorize the file
            category = self.categorize_test_file(content_analysis, metadata)
            
            # Combine all analysis data
            file_data = {
                **content_analysis,
                "metadata": metadata,
                "category": category,
                "relative_path": str(file_path.relative_to(self.repo_path))
            }
            
            # Add to results
            results["files"][category].append(file_data)
            results["summary"][category] += 1
        
        return results

    def generate_report(self, results: Dict[str, Any]) -> str:
        """Generate a human-readable report."""
        report = []
        report.append("=" * 80)
        report.append("🧪 TEST FILE ANALYSIS REPORT")
        report.append("=" * 80)
        report.append("")
        
        # Summary
        summary = results["summary"]
        report.append("📊 SUMMARY:")
        report.append(f"   Total test files: {summary['total_files']}")
        report.append(f"   ✅ Stable:       {summary['stable']} ({summary['stable']/summary['total_files']*100:.1f}%)")
        report.append(f"   ⚠️  Flaky:        {summary['flaky']} ({summary['flaky']/summary['total_files']*100:.1f}%)")
        report.append(f"   📅 Outdated:     {summary['outdated']} ({summary['outdated']/summary['total_files']*100:.1f}%)")
        report.append(f"   ❓ Unknown:      {summary['unknown']} ({summary['unknown']/summary['total_files']*100:.1f}%)")
        report.append("")
        
        # Detailed breakdown by category
        for category in ["stable", "flaky", "outdated", "unknown"]:
            files = results["files"][category]
            if not files:
                continue
                
            emoji = {"stable": "✅", "flaky": "⚠️", "outdated": "📅", "unknown": "❓"}[category]
            report.append(f"{emoji} {category.upper()} TEST FILES ({len(files)} files):")
            report.append("-" * 50)
            
            for file_data in files:
                report.append(f"📁 {file_data['relative_path']}")
                report.append(f"   Lines: {file_data['lines']}, Size: {file_data['size']} chars")
                
                if file_data.get('indicators'):
                    for indicator_type, indicators in file_data['indicators'].items():
                        if indicators:
                            report.append(f"   {indicator_type.title()} indicators: {', '.join(indicators[:3])}")
                
                if file_data.get('metadata', {}).get('is_old'):
                    report.append("   ⏰ File is older than 6 months")
                
                report.append("")
        
        # Recommendations
        report.append("🎯 RECOMMENDATIONS:")
        report.append("-" * 30)
        
        if summary['flaky'] > 0:
            report.append(f"• Fix {summary['flaky']} flaky test(s) to improve CI reliability")
            report.append("  - Consider mocking time-dependent functions")
            report.append("  - Remove random elements from tests")
            report.append("  - Use deterministic test data")
        
        if summary['outdated'] > 0:
            report.append(f"• Update or remove {summary['outdated']} outdated test(s)")
            report.append("  - Review and fix broken assertions")
            report.append("  - Update tests to match current implementation")
            report.append("  - Remove obsolete tests")
        
        if summary['unknown'] > 0:
            report.append(f"• Review {summary['unknown']} test(s) with unclear categorization")
        
        report.append("")
        report.append(f"Report generated at: {results['analysis_metadata']['analyzed_at']}")
        
        return "\n".join(report)

def main():
    """Main function to run the analysis."""
    analyzer = TestFileAnalyzer()
    
    print("🚀 Starting test file analysis...")
    results = analyzer.analyze_repository()
    
    # Generate and save detailed JSON report
    with open("test_analysis_detailed.json", "w") as f:
        json.dump(results, f, indent=2)
    print("📄 Detailed JSON report saved to: test_analysis_detailed.json")
    
    # Generate and save human-readable report
    report = analyzer.generate_report(results)
    with open("test_analysis_report.txt", "w") as f:
        f.write(report)
    print("📄 Human-readable report saved to: test_analysis_report.txt")
    
    # Also print the report to console
    print("\n" + report)
    
    return results

if __name__ == "__main__":
    results = main()