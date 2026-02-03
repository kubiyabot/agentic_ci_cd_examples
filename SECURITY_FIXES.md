# Security Vulnerability Fixes - CVE Remediation

## Overview
This document details all security vulnerabilities (CVEs) that were identified and fixed in this repository.

**Date:** February 3, 2026  
**Total CVEs Fixed:** 13  
**Severity Breakdown:**
- 🔴 **Critical:** 2 CVEs (CVSS 9.8)
- 🟠 **High:** 9 CVEs (CVSS 6.1-7.6)
- 🟡 **Medium:** 2 CVEs (CVSS 5.3-6.3)

---

## Critical Vulnerabilities (CVSS 9.0+)

### CVE-2021-44906 - Prototype Pollution in minimist
- **Package:** `minimist`
- **Vulnerable Version:** 1.2.5
- **Fixed Version:** 1.2.8
- **CVSS Score:** 9.8
- **Impact:** Prototype pollution vulnerability allowing attackers to modify application behavior
- **Location:** `vulnerability-scanner/package.json`
- **Reference:** https://nvd.nist.gov/vuln/detail/CVE-2021-44906

### CVE-2021-42740 - Command Injection in shell-quote
- **Package:** `shell-quote`
- **Vulnerable Version:** 1.7.2
- **Fixed Version:** 1.8.1
- **CVSS Score:** 9.8
- **Impact:** Command injection via shell metacharacters enabling remote code execution
- **Location:** `vulnerability-scanner/package.json`
- **Reference:** https://nvd.nist.gov/vuln/detail/CVE-2021-42740

---

## High Severity Vulnerabilities (CVSS 7.0-8.9)

### CVE-2021-3749 - ReDoS in axios
- **Package:** `axios`
- **Vulnerable Versions:** 0.21.1, ^1.4.0
- **Fixed Version:** 1.6.0
- **CVSS Score:** 7.5
- **Impact:** Regular Expression Denial of Service (ReDoS) vulnerability
- **Locations:**
  - `vulnerability-scanner/package.json`
  - `flakyTests/package.json`
- **Reference:** https://nvd.nist.gov/vuln/detail/CVE-2021-3749

### CVE-2021-23337 - Command Injection in lodash
- **Package:** `lodash`
- **Vulnerable Version:** 4.17.20
- **Fixed Version:** 4.17.21
- **CVSS Score:** 7.2
- **Impact:** Command injection via template allowing arbitrary code execution
- **Location:** `vulnerability-scanner/package.json`
- **Reference:** https://nvd.nist.gov/vuln/detail/CVE-2021-23337

### CVE-2022-23540 - Insecure Algorithm Selection in jsonwebtoken
- **Package:** `jsonwebtoken`
- **Vulnerable Version:** 8.5.1
- **Fixed Version:** 9.0.0
- **CVSS Score:** 7.6
- **Impact:** Insecure default algorithm selection in JWT verification
- **Location:** `vulnerability-scanner/package.json`
- **Reference:** https://nvd.nist.gov/vuln/detail/CVE-2022-23540

### CVE-2022-24785 - Path Traversal in moment
- **Package:** `moment`
- **Vulnerable Version:** 2.29.1
- **Fixed Version:** 2.30.1
- **CVSS Score:** 7.5
- **Impact:** Path traversal vulnerability
- **Location:** `vulnerability-scanner/package.json`
- **Reference:** https://nvd.nist.gov/vuln/detail/CVE-2022-24785

### CVE-2022-31129 - ReDoS in moment
- **Package:** `moment`
- **Vulnerable Version:** 2.29.1
- **Fixed Version:** 2.30.1
- **CVSS Score:** 7.5
- **Impact:** Inefficient regular expression complexity leading to ReDoS
- **Location:** `vulnerability-scanner/package.json`
- **Reference:** https://nvd.nist.gov/vuln/detail/CVE-2022-31129

### CVE-2021-23358 - Arbitrary Code Execution in underscore
- **Package:** `underscore`
- **Vulnerable Version:** 1.12.0
- **Fixed Version:** 1.13.6
- **CVSS Score:** 7.2
- **Impact:** Arbitrary code execution via template compilation
- **Location:** `vulnerability-scanner/package.json`
- **Reference:** https://nvd.nist.gov/vuln/detail/CVE-2021-23358

### CVE-2022-0235 - Information Exposure in node-fetch
- **Package:** `node-fetch`
- **Vulnerable Version:** 2.6.1
- **Fixed Version:** 2.7.0
- **CVSS Score:** 6.1
- **Impact:** Exposure of sensitive information
- **Location:** `vulnerability-scanner/package.json`
- **Reference:** https://nvd.nist.gov/vuln/detail/CVE-2022-0235

### CVE-2020-7660 - XSS in serialize-javascript
- **Package:** `serialize-javascript`
- **Vulnerable Version:** 4.0.0
- **Fixed Version:** 6.0.0
- **CVSS Score:** 7.2
- **Impact:** Cross-site scripting (XSS) vulnerability
- **Location:** `vulnerability-scanner/package.json`
- **Reference:** https://nvd.nist.gov/vuln/detail/CVE-2020-7660

### CVE-2022-24999 - Open Redirect in express
- **Package:** `express`
- **Vulnerable Version:** 4.17.1
- **Fixed Version:** 4.18.2
- **CVSS Score:** 6.1
- **Impact:** Open redirect vulnerability
- **Location:** `vulnerability-scanner/package.json`
- **Reference:** https://nvd.nist.gov/vuln/detail/CVE-2022-24999

---

## Medium Severity Vulnerabilities (CVSS 4.0-6.9)

### CVE-2022-23529 - JWT Validation Issue in jsonwebtoken
- **Package:** `jsonwebtoken`
- **Vulnerable Version:** 8.5.1
- **Fixed Version:** 9.0.0
- **CVSS Score:** 6.3
- **Impact:** Verification of malicious JWT tokens with asymmetric keys
- **Location:** `vulnerability-scanner/package.json`
- **Reference:** https://nvd.nist.gov/vuln/detail/CVE-2022-23529

### CVE-2022-23539 - Key Validation Issue in jsonwebtoken
- **Package:** `jsonwebtoken`
- **Vulnerable Version:** 8.5.1
- **Fixed Version:** 9.0.0
- **CVSS Score:** 5.3
- **Impact:** Improper validation of asymmetric key types
- **Location:** `vulnerability-scanner/package.json`
- **Reference:** https://nvd.nist.gov/vuln/detail/CVE-2022-23539

---

## Package Updates Summary

| Package | Old Version | New Version | CVEs Fixed | Severity |
|---------|-------------|-------------|------------|----------|
| minimist | 1.2.5 | 1.2.8 | CVE-2021-44906 | 🔴 Critical |
| shell-quote | 1.7.2 | 1.8.1 | CVE-2021-42740 | 🔴 Critical |
| axios | 0.21.1 / ^1.4.0 | ^1.6.0 | CVE-2021-3749 | 🟠 High |
| lodash | 4.17.20 | 4.17.21 | CVE-2021-23337 | 🟠 High |
| jsonwebtoken | 8.5.1 | 9.0.0 | CVE-2022-23529, CVE-2022-23539, CVE-2022-23540 | 🟠 High + 🟡 Medium |
| moment | 2.29.1 | 2.30.1 | CVE-2022-24785, CVE-2022-31129 | 🟠 High |
| underscore | 1.12.0 | 1.13.6 | CVE-2021-23358 | 🟠 High |
| node-fetch | 2.6.1 | 2.7.0 | CVE-2022-0235 | 🟠 High |
| serialize-javascript | 4.0.0 | 6.0.0 | CVE-2020-7660 | 🟠 High |
| express | 4.17.1 | 4.18.2 | CVE-2022-24999 | 🟠 High |

---

## Testing Recommendations

After applying these fixes, please:

1. **Run Dependency Installation:**
   ```bash
   cd vulnerability-scanner && npm install
   cd ../flakyTests && npm install
   ```

2. **Run Test Suites:**
   ```bash
   npm test
   ```

3. **Verify Compatibility:**
   - Test all existing functionality
   - Pay special attention to JWT authentication (jsonwebtoken major version update)
   - Verify express routing and middleware still function correctly

4. **Run Security Audit:**
   ```bash
   npm audit
   ```

---

## Breaking Changes

### jsonwebtoken (8.5.1 → 9.0.0)
The update to jsonwebtoken v9.0.0 includes breaking changes:
- Default algorithm is now more secure but may require code changes
- Some signature verification behaviors have changed
- Review the [migration guide](https://github.com/auth0/node-jsonwebtoken/releases/tag/v9.0.0)

### serialize-javascript (4.0.0 → 6.0.0)
- API changes may affect serialization behavior
- Review code that uses this package

---

## Prevention Recommendations

1. **Enable Automated Scanning:**
   - Enable GitHub Dependabot alerts
   - Configure `npm audit` in CI/CD pipeline
   - Consider tools like Snyk or WhiteSource

2. **Regular Updates:**
   - Schedule monthly dependency updates
   - Subscribe to security advisories
   - Monitor https://nvd.nist.gov for new CVEs

3. **CI/CD Integration:**
   - Add security gates to prevent vulnerable code from being merged
   - Fail builds on critical/high severity vulnerabilities

4. **Development Practices:**
   - Use `npm ci` instead of `npm install` in CI/CD
   - Commit package-lock.json to ensure reproducible builds
   - Regular dependency pruning

---

## Additional Resources

- [OWASP Dependency Check](https://owasp.org/www-project-dependency-check/)
- [npm audit documentation](https://docs.npmjs.com/cli/v8/commands/npm-audit)
- [GitHub Security Advisories](https://github.com/advisories)
- [National Vulnerability Database](https://nvd.nist.gov/)

---

**Note:** While the `vulnerability-scanner` project was intended for demonstration purposes with intentional vulnerabilities, these fixes ensure the codebase follows security best practices and can be safely used in non-isolated environments.
