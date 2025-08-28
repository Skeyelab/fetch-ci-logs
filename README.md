# Fetch CI Logs

[![npm version](https://badge.fury.io/js/fetch-ci-logs.svg)](https://badge.fury.io/js/fetch-ci-logs)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A powerful CLI tool to download GitHub Actions logs for CI workflows. Perfect for developers who need quick access to CI logs.

## 🚀 Quick Start

### Install Globally
```bash
npm install -g fetch-ci-logs
```

### Basic Usage
```bash
# Set your GitHub token
export GITHUB_TOKEN=your_github_token_here

# Download latest CI logs
fetch-ci-logs fetch-logs

# Push and wait for CI, then download logs
fetch-ci-logs after-push
```



## 📦 Installation

### Global Installation (Recommended)
```bash
npm install -g fetch-ci-logs
```

### Local Installation
```bash
npm install --save-dev fetch-ci-logs
```

### Manual Installation
```bash
git clone https://github.com/Skeyelab/fetch-ci-logs.git
cd fetch-ci-logs
npm install
npm link  # for global usage
```

## 🎯 Use Cases



### 👥 Developers
- Quick access to CI logs without opening browser
- Automated log collection for debugging
- CI/CD pipeline debugging
- Team collaboration on CI issues

### 🔧 DevOps & CI/CD
- Automated log collection in scripts
- Integration with monitoring systems
- Debugging deployment pipelines

## 📖 Usage

### Commands

#### `fetch-logs` - Download CI Logs
```bash
fetch-ci-logs fetch-logs [options]
```

**Options:**
- `-w, --workflow <workflow>` - Workflow file name (default: ci.yml)
- `-r, --repo <repo>` - Repository in owner/repo format (auto-detected)
- `-i, --run-id <runId>` - Specific run ID to download
- `--wait` - Wait for workflow run to appear
- `--wait-for-completion` - Wait for run to complete
- `--timeout <seconds>` - Wait timeout (default: 300)
- `--interval <seconds>` - Polling interval (default: 5)

**Examples:**
```bash
# Download latest CI logs
fetch-ci-logs fetch-logs

# Download logs for specific workflow
fetch-ci-logs fetch-logs --workflow deploy.yml

# Wait for CI to complete then download
fetch-ci-logs fetch-logs --wait-for-completion

# Download specific run
fetch-ci-logs fetch-logs --run-id 123456789
```

#### `after-push` - Push & Fetch CI Logs
```bash
fetch-ci-logs after-push [options]
```

**Options:**
- `-r, --remote <remote>` - Git remote (default: origin)
- `-b, --branch <branch>` - Branch to push (auto-detected)
- `--skip-push` - Skip git push
- `-w, --workflow <workflow>` - Workflow file name
- `--wait-for-completion` - Wait for run to complete
- `--timeout <seconds>` - Wait timeout

**Examples:**
```bash
# Push current branch and wait for CI
fetch-ci-logs after-push

# Push specific branch to specific remote
fetch-ci-logs after-push --remote upstream --branch feature-branch

# Just wait for CI without pushing
fetch-ci-logs after-push --skip-push
```



### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `GITHUB_TOKEN` | GitHub personal access token | **Required** |
| `GITHUB_REPO` | Repository in "owner/repo" format | Auto-detected |
| `CI_WORKFLOW` | Workflow file name | `ci.yml` |
| `RUN_ID` | Specific run ID to download | Latest run |
| `WAIT_FOR_RUN` | Wait for workflow run to appear | `false` |
| `WAIT_FOR_COMPLETION` | Wait for run to complete | `false` |
| `WAIT_TIMEOUT` | Timeout in seconds | `300` |
| `WAIT_INTERVAL` | Polling interval in seconds | `5` |
| `SKIP_PUSH` | Skip git push in after-push | `false` |

### Programmatic Usage

```javascript
const { fetchLogs, afterPush } = require('fetch-ci-logs');

// Download logs programmatically
await fetchLogs({
  workflow: 'ci.yml',
  repo: 'owner/repo',
  waitForCompletion: true
});

// Push and fetch logs
await afterPush({
  remote: 'origin',
  branch: 'main',
  waitForCompletion: true
});
```

## 📁 Output Structure

Logs are saved in the following structure:
```
log/ci/
└── 123456789-abc1234/
    ├── run_123456789.zip          # Combined run logs
    ├── run_123456789_metadata.json # Run metadata
    ├── job_987654321_test.log     # Individual job logs
    ├── job_987654322_build.log
    └── job_987654323_deploy.log
```

## 🔐 Authentication

You need a GitHub personal access token with the following permissions:
- `actions: read` - to read workflow runs and download logs

**Create a token:**
1. Go to [GitHub Settings > Personal Access Tokens](https://github.com/settings/personal-access-tokens/tokens)
2. Generate a new token with `Actions` read permission
3. Set as environment variable: `export GITHUB_TOKEN=your_token_here`

## 🛠️ Development

### Setup
```bash
git clone https://github.com/Skeyelab/fetch-ci-logs.git
cd fetch-ci-logs
npm install
```

### Testing
```bash
npm test
npm run test:watch
```

### Linting
```bash
npm run lint
npm run lint:fix
```

### Building
```bash
npm run prepare  # runs lint and test
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Run tests: `npm test`
5. Commit your changes: `git commit -m 'Add amazing feature'`
6. Push to the branch: `git push origin feature/amazing-feature`
7. Open a Pull Request

## 📝 Changelog

See [CHANGELOG.md](CHANGELOG.md) for version history.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🚀 Automated Releases

This project uses GitHub Actions for automated npm publishing. There are two ways to trigger releases:

### Option 1: Manual Release (Recommended)

1. **Push your changes** to the main branch
2. **Go to GitHub Actions** → **Release & Publish to npm**
3. **Click "Run workflow"** and select version type (patch/minor/major)
4. **Workflow will:**
   - Bump version automatically
   - Run tests and linting
   - Publish to npm
   - Create Git tag
   - Create GitHub release

### Option 2: Release via Git Tag

1. **Update version manually:**
   ```bash
   npm run release:patch   # or release:minor / release:major
   ```

2. **Commit and push changes:**
   ```bash
   git add package.json package-lock.json
   git commit -m "chore: bump version to x.x.x"
   git push origin main
   ```

3. **Create a GitHub release:**
   - Go to GitHub → Releases → Create new release
   - Tag: `vx.x.x` (must match package.json version)
   - Publish release

4. **GitHub Actions will automatically publish to npm**

### Setup Required

1. **Create npm token:**
   ```bash
   npm login
   # Get token from: https://www.npmjs.com/settings/tokens
   ```

2. **Add to GitHub Secrets:**
   - Go to repository Settings → Secrets and variables → Actions
   - Add: `NPM_TOKEN` = your npm token

### Release Scripts

```bash
npm run release:patch   # 1.0.0 → 1.0.1
npm run release:minor   # 1.0.0 → 1.1.0
npm run release:major   # 1.0.0 → 2.0.0
```

## 🙏 Acknowledgments

- Inspired by the Ruby Rake task from [coinbase_futures_bot](https://github.com/Skeyelab/coinbase_futures_bot)
- Built for developers who need fast CI log access
- Thanks to the GitHub Actions team for the excellent API

## 📞 Support

- 📧 **Email**: eric@skeyelab.com
- 🐛 **Issues**: [GitHub Issues](https://github.com/Skeyelab/fetch-ci-logs/issues)
- 📖 **Documentation**: [GitHub Wiki](https://github.com/Skeyelab/fetch-ci-logs/wiki)

---

**Made with ❤️ for developers**
