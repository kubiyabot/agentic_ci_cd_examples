# Security Policy

## Overview

This repository contains example implementations for Kubiya's agentic CI/CD platform. Most projects use up-to-date, secure dependencies. However, the `vulnerability-scanner` directory contains **intentionally vulnerable dependencies** for demonstration purposes.

## Secure Projects

The following projects have been updated with secure dependency versions:

- ✅ **flakyTests** - axios upgraded to 1.12.0
- ✅ **smart-test-selection** - express upgraded to 4.21.2
- ✅ **fleaky-tests-circleci** - uses current dependencies
- ✅ **build-artifact-analyzer** - lodash 4.17.21+
- ✅ **incident-learning-pipeline** - axios 1.12.0, express 4.21.2
- ✅ **cross-repo-knowledge-share** - lodash 4.17.21+
- ✅ **performance-regression-detector** - lodash 4.17.21+

## ⚠️ Intentionally Vulnerable Project

### vulnerability-scanner

**DO NOT deploy this to production!**

This project contains outdated dependencies with known CVEs to demonstrate security scanning capabilities:

| Package | Version | CVEs | Severity |
|---------|---------|------|----------|
| jsonwebtoken | 8.5.1 | CVE-2022-23529, CVE-2022-23539, CVE-2022-23541, CVE-2022-23540 | **CRITICAL** |
| minimist | 1.2.5 | CVE-2021-44906 | **CRITICAL** |
| lodash | 4.17.20 | CVE-2020-8203 | **HIGH** |
| axios | 0.21.1 | Multiple SSRF/ReDoS | **HIGH** |
| shell-quote | 1.7.2 | Command Injection | **HIGH** |
| underscore | 1.12.0 | Arbitrary Code Execution | **HIGH** |
| express | 4.17.1 | Multiple | **MEDIUM** |
| moment | 2.29.1 | ReDoS | **MEDIUM** |
| node-fetch | 2.6.1 | Information Exposure | **MEDIUM** |
| serialize-javascript | 4.0.0 | XSS | **MEDIUM** |

**Purpose**: This project demonstrates how Kubiya's AI agents can automatically detect, analyze, and remediate security vulnerabilities using tools like Trivy and npm audit.

## Reporting a Security Issue

If you discover a security vulnerability in this repository (outside of the intentional vulnerabilities in `vulnerability-scanner`), please report it to:

**Email**: security@kubiya.ai

Please include:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if available)

We will respond within 48 hours and provide a timeline for remediation.

## Security Best Practices

When using these examples in your own projects:

1. **Dependency Scanning**: Run `npm audit` regularly
2. **Automated Updates**: Enable Dependabot or Renovate
3. **CI/CD Integration**: Add security scanning to your pipelines
4. **Review Dependencies**: Regularly review and update dependencies
5. **Secrets Management**: Never commit secrets to version control

## CVE Remediation Guide

### Critical Vulnerabilities

**jsonwebtoken (CVE-2022-23529)**
```bash
npm install jsonwebtoken@^9.0.0
```

**minimist (CVE-2021-44906)**
```bash
npm install minimist@^1.2.6
```

### High Vulnerabilities

**lodash (CVE-2020-8203)**
```bash
npm install lodash@^4.17.21
```

**axios (Multiple CVEs)**
```bash
npm install axios@^1.12.0
```

### Running Security Scans

**npm audit**
```bash
npm audit
npm audit fix --force
```

**Trivy**
```bash
brew install trivy
trivy fs . --severity HIGH,CRITICAL
```

**Snyk**
```bash
npm install -g snyk
snyk test
```

## Automated Remediation with Kubiya

This repository demonstrates how Kubiya can automatically:

1. Scan for vulnerabilities
2. Analyze results with organizational context
3. Create PRs with fixes
4. Learn from remediation patterns

See the [vulnerability-scanner](./vulnerability-scanner/) directory for implementation details.

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| main    | :white_check_mark: |
| < 1.0   | :x:                |

## Security Updates

Security updates are tracked in this repository via:
- GitHub Dependabot alerts (enabled)
- npm audit in CI/CD pipelines
- Manual security reviews

---

Last updated: December 2024
