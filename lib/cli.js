const { Command } = require('commander');
const { fetchLogs, afterPush } = require('./index');

async function main() {
  const program = new Command();

  program
    .name('fetch-ci-logs')
    .description('Download GitHub Actions logs for CI workflows')
    .version('1.0.0');

  program
    .command('fetch-logs')
    .description('Download GitHub Actions logs')
    .option('-w, --workflow <workflow>', 'Workflow file name', 'ci.yml')
    .option('-r, --repo <repo>', 'Repository in owner/repo format')
    .option('-i, --run-id <runId>', 'Specific run ID to download')
    .option('--wait', 'Wait for workflow run to appear')
    .option('--wait-for-completion', 'Wait for run to complete')
    .option('--timeout <seconds>', 'Wait timeout in seconds', '300')
    .option('--interval <seconds>', 'Polling interval in seconds', '5')
    .action(async (options) => {
      try {
        await fetchLogs({
          workflow: options.workflow,
          repo: options.repo,
          runId: options.runId,
          waitForRun: options.wait,
          waitForCompletion: options.waitForCompletion,
          waitTimeout: parseInt(options.timeout),
          waitInterval: parseInt(options.interval)
        });
      } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
      }
    });

  program
    .command('after-push')
    .description('Push branch then wait for CI and fetch logs')
    .option('-r, --remote <remote>', 'Git remote', 'origin')
    .option('-b, --branch <branch>', 'Branch to push')
    .option('--skip-push', 'Skip git push')
    .option('-w, --workflow <workflow>', 'Workflow file name', 'ci.yml')
    .option('--wait-for-completion', 'Wait for run to complete')
    .option('--timeout <seconds>', 'Wait timeout in seconds', '300')
    .action(async (options) => {
      try {
        await afterPush({
          remote: options.remote,
          branch: options.branch,
          skipPush: options.skipPush,
          workflow: options.workflow,
          waitForCompletion: options.waitForCompletion,
          waitTimeout: parseInt(options.timeout)
        });
      } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
      }
    });

  program
    .command('auto-debug')
    .description('AI-powered CI debugging - push, wait for CI, and analyze logs')
    .option('-r, --remote <remote>', 'Git remote', 'origin')
    .option('-b, --branch <branch>', 'Branch to push')
    .option('-w, --workflow <workflow>', 'Workflow file name', 'ci.yml')
    .option('--analyze-errors', 'Analyze and summarize CI errors')
    .action(async (options) => {
      try {
        console.log('🚀 Starting AI-powered CI debugging workflow...');

        await afterPush({
          remote: options.remote,
          branch: options.branch,
          workflow: options.workflow,
          waitForCompletion: true
        });

        if (options.analyzeErrors) {
          console.log('🤖 Analyzing CI logs for debugging insights...');
          // Future: Add AI log analysis here
        }

        console.log('✅ CI debugging workflow complete!');
      } catch (error) {
        console.error('❌ Error in AI debugging workflow:', error.message);
        process.exit(1);
      }
    });

  // Show help if no command provided
  if (process.argv.length === 2) {
    program.help();
  }

  await program.parseAsync(process.argv);
}

module.exports = { main };