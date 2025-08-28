# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-08-28

### Added
- **Initial release** of fetch-github-logs - a CLI tool to download GitHub Actions logs
- **Core functionality**:
  - `fetch-logs` command to download CI logs for specific workflows
  - `after-push` command to push code and automatically fetch logs
  - `auto-debug` command for AI-powered CI debugging workflow
- **AI Assistant Integration**:
  - Perfect for AI code editors to debug CI failures
  - Automated log collection for debugging workflows
  - Real-time CI monitoring and log retrieval
- **Flexible Configuration**:
  - Environment variable support (`GITHUB_TOKEN`, `GITHUB_REPO`, etc.)
  - Auto-detection of repository from git remote
  - Customizable timeouts and polling intervals
  - Support for waiting for CI completion
- **Robust Features**:
  - Download both combined ZIP logs and individual job logs
  - Save run metadata as JSON for analysis
  - Handle GitHub API rate limits and redirects
  - Comprehensive error handling and logging
- **Developer Experience**:
  - Clean CLI interface with Commander.js
  - Programmatic API for library usage
  - Comprehensive documentation and examples
  - TypeScript-ready structure for future expansion
- **Quality Assurance**:
  - ESLint configuration for code quality
  - Jest test suite with unit and integration tests
  - GitHub Actions CI/CD pipeline
  - Automated publishing to npm registry

### Technical Details
- **Language**: Node.js (ES2021+)
- **Dependencies**: axios, commander
- **Testing**: Jest with comprehensive test coverage
- **CI/CD**: GitHub Actions with multi-Node.js version testing
- **Package**: Published to npm registry for easy installation

### Use Cases
- **AI Debugging**: Primary use case for AI assistants debugging CI failures
- **Developer Workflow**: Quick access to CI logs without browser navigation
- **DevOps**: Automated log collection in CI/CD pipelines
- **Team Collaboration**: Share and analyze CI logs across team members

### Migration Notes
- This is the initial release, no migration needed
- Ported from Ruby Rake task with enhanced Node.js features
- All functionality from original Ruby version preserved and enhanced

---

**Repository**: [https://github.com/Skeyelab/fetch-github-logs](https://github.com/Skeyelab/fetch-github-logs)
**NPM Package**: [https://www.npmjs.com/package/fetch-github-logs](https://www.npmjs.com/package/fetch-github-logs)
**Issues**: [https://github.com/Skeyelab/fetch-github-logs/issues](https://github.com/Skeyelab/fetch-github-logs/issues)
