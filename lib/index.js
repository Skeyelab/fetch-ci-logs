const axios = require('axios');
const fs = require('fs');
const fsPromises = require('fs').promises;
const path = require('path');
const { execSync } = require('child_process');

// Utility functions
function truthyEnv(value) {
  if (value === null || value === undefined) return false;
  return ['1', 'true', 'yes', 'on', 'y'].includes(value.toString().trim().toLowerCase());
}

async function autodetectRepo() {
  try {
    const origin = execSync('git remote get-url origin 2>/dev/null', { encoding: 'utf8' }).trim();
    if (!origin) return process.env.GITHUB_REPO || '';

    // Handle SSH (git@github.com:owner/repo.git) and HTTPS (https://github.com/owner/repo.git)
    const match = origin.match(/github\.com[/:]([^/]+)\/([^/.]+)(?:\.git)?$/);
    return match ? `${match[1]}/${match[2]}` : '';
  } catch (error) {
    return process.env.GITHUB_REPO || '';
  }
}

function currentHeadSha() {
  try {
    return execSync('git rev-parse HEAD 2>/dev/null', { encoding: 'utf8' }).trim();
  } catch (error) {
    return '';
  }
}

function currentBranch() {
  try {
    return execSync('git rev-parse --abbrev-ref HEAD 2>/dev/null', { encoding: 'utf8' }).trim();
  } catch (error) {
    return '';
  }
}

// GitHub API client
class GitHubClient {
  constructor(token) {
    this.client = axios.create({
      baseURL: 'https://api.github.com',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        'User-Agent': 'fetch-ci-logs/1.0.0'
      }
    });
  }

  async fetchJson(path) {
    const response = await this.client.get(path);
    return response.data;
  }

  async downloadWithRedirects(path, destPath) {
    const response = await this.client.get(path, { responseType: 'stream' });

    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.location;
      if (location) {
        // Follow redirect without auth (signed URL)
        const redirectResponse = await axios.get(location, { responseType: 'stream' });
        await this.saveStreamToFile(redirectResponse.data, destPath);
      }
    } else {
      await this.saveStreamToFile(response.data, destPath);
    }
  }

  async saveStreamToFile(stream, destPath) {
    return new Promise((resolve, reject) => {
      const writer = fs.createWriteStream(destPath);
      stream.pipe(writer);
      writer.on('finish', resolve);
      writer.on('error', reject);
    });
  }
}

// Main functions
async function locateWorkflowRun(client, repo, workflow, headSha) {
  try {
    const response = await client.fetchJson(`/repos/${repo}/actions/workflows/${workflow}/runs?per_page=50`);
    const runs = response.workflow_runs || [];
    return runs.find(run => run.head_sha === headSha) || runs[0];
  } catch (error) {
    console.error('Error locating workflow run:', error.message);
    return null;
  }
}

async function waitForRun(client, repo, workflow, headSha, waitTimeout = 300, waitInterval = 5) {
  const deadline = Date.now() + (waitTimeout * 1000);
  let run = null;

  while (Date.now() < deadline) {
    run = await locateWorkflowRun(client, repo, workflow, headSha);
    if (run) break;

    console.log(`⏳ Waiting for workflow run... (${Math.ceil((deadline - Date.now()) / 1000)}s remaining)`);
    await new Promise(resolve => setTimeout(resolve, waitInterval * 1000));
  }

  return run;
}

async function waitForCompletion(client, repo, runId, waitTimeout = 300, waitInterval = 5) {
  const deadline = Date.now() + (waitTimeout * 1000);

  while (Date.now() < deadline) {
    const runMeta = await client.fetchJson(`/repos/${repo}/actions/runs/${runId}`);
    const { status, conclusion } = runMeta;

    if (status === 'completed') {
      console.log(`✅ Run completed with conclusion=${conclusion}`);
      return true;
    }

    console.log(`⏳ Waiting for completion... status=${status} (${Math.ceil((deadline - Date.now()) / 1000)}s remaining)`);
    await new Promise(resolve => setTimeout(resolve, waitInterval * 1000));
  }

  console.log('⏰ Wait timeout exceeded');
  return false;
}

async function fetchLogs(options = {}) {
  const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN || process.env.GH_PAT;
  if (!token || !token.trim()) {
    throw new Error('GITHUB_TOKEN (or GH_TOKEN) is required');
  }

  const workflow = options.workflow || process.env.GITHUB_WORKFLOW || 'build.yml';
  const repo = options.repo || process.env.GITHUB_REPO || await autodetectRepo();
  if (!repo || !repo.trim()) {
    throw new Error('GITHUB_REPO could not be determined');
  }

  const headSha = process.env.GIT_SHA || currentHeadSha();
  let runId = options.runId || process.env.RUN_ID;

  const client = new GitHubClient(token);

  if (!runId) {
    console.log(`🔍 Looking for workflow run for ${workflow} in ${repo}...`);

    let run;
    if (options.waitForRun) {
      run = await waitForRun(client, repo, workflow, headSha,
        options.waitTimeout || 300,
        options.waitInterval || 5);
    } else {
      run = await locateWorkflowRun(client, repo, workflow, headSha);
    }

    if (!run) {
      throw new Error(`No workflow runs found for ${workflow} in ${repo}`);
    }

    runId = run.id.toString();
    const { run_number, status, conclusion, created_at } = run;
    console.log(`📋 Found run #${run_number} (id ${runId}) status=${status} conclusion=${conclusion} created_at=${created_at}`);
  } else {
    console.log(`🎯 Using provided RUN_ID=${runId}`);
  }

  // Create destination directory
  const destDir = path.join('log', 'ci', `${runId}-${headSha.substring(0, 7)}`);
  await fsPromises.mkdir(destDir, { recursive: true });

  // Download combined run logs (zip)
  const runZipPath = path.join(destDir, `run_${runId}.zip`);
  console.log('📥 Downloading run logs...');
  await client.downloadWithRedirects(`/repos/${repo}/actions/runs/${runId}/logs`, runZipPath);
  console.log(`💾 Saved run logs ZIP => ${runZipPath}`);

  // Optionally wait for completion
  if (options.waitForCompletion) {
    console.log(`⏳ Waiting for run ${runId} to complete...`);
    await waitForCompletion(client, repo, runId,
      options.waitTimeout || 300,
      options.waitInterval || 5);
  }

  // Save run metadata
  const runMeta = await client.fetchJson(`/repos/${repo}/actions/runs/${runId}`);
  const metadataPath = path.join(destDir, `run_${runId}_metadata.json`);
  await fsPromises.writeFile(metadataPath, JSON.stringify(runMeta, null, 2));
  console.log(`📄 Saved run metadata => ${metadataPath}`);

  // Download individual job logs
  try {
    const jobsResponse = await client.fetchJson(`/repos/${repo}/actions/runs/${runId}/jobs`);
    const jobs = jobsResponse.jobs || [];

    console.log(`📋 Downloading ${jobs.length} job logs...`);
    for (const job of jobs) {
      const jobId = job.id;
      const jobName = job.name;
      const safeName = jobName.replace(/[^a-zA-Z0-9_.-]+/g, '_');
      const jobLogPath = path.join(destDir, `job_${jobId}_${safeName}.log`);

      await client.downloadWithRedirects(`/repos/${repo}/actions/jobs/${jobId}/logs`, jobLogPath);
      console.log(`📄 Saved job log => ${jobLogPath}`);
    }
  } catch (error) {
    console.warn('⚠️ Could not download individual job logs:', error.message);
  }

  console.log(`🎉 All logs saved under ${destDir}`);
}

async function afterPush(options = {}) {
  const remote = options.remote || process.env.GIT_REMOTE || 'origin';
  const branch = options.branch || process.env.GIT_BRANCH || currentBranch();

  if (!branch || !branch.trim()) {
    throw new Error('Unable to determine git branch');
  }

  if (!options.skipPush) {
    console.log(`🚀 Pushing ${branch} to ${remote}...`);
    try {
      execSync(`git push ${remote} ${branch}`, { stdio: 'inherit' });
    } catch (error) {
      throw new Error(`git push failed for ${remote} ${branch}`);
    }
  } else {
    console.log('⏭️ SKIP_PUSH=1 set; skipping git push');
  }

  // Set environment variables for fetch_logs
  const originalEnv = { ...process.env };
  process.env.WAIT = '1';
  process.env.WAIT_FOR_RUN = '1';
  if (options.waitForCompletion) {
    process.env.WAIT_FOR_COMPLETION = '1';
  }

  try {
    // Call fetch_logs
    await fetchLogs(options);
  } finally {
    // Restore original environment
    process.env = originalEnv;
  }
}

module.exports = {
  fetchLogs,
  afterPush,
  GitHubClient,
  truthyEnv,
  autodetectRepo,
  currentHeadSha,
  currentBranch
};
