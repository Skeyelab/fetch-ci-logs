const { truthyEnv, autodetectRepo, GitHubClient } = require('../lib/index');

// Mock child_process
jest.mock('child_process', () => ({
  execSync: jest.fn()
}));

describe('Utility Functions', () => {
  describe('truthyEnv', () => {
    test('should return false for null/undefined', () => {
      expect(truthyEnv(null)).toBe(false);
      expect(truthyEnv(undefined)).toBe(false);
    });

    test('should return true for truthy values', () => {
      expect(truthyEnv('1')).toBe(true);
      expect(truthyEnv('true')).toBe(true);
      expect(truthyEnv('yes')).toBe(true);
      expect(truthyEnv('on')).toBe(true);
      expect(truthyEnv('y')).toBe(true);
    });

    test('should return false for falsy values', () => {
      expect(truthyEnv('0')).toBe(false);
      expect(truthyEnv('false')).toBe(false);
      expect(truthyEnv('no')).toBe(false);
      expect(truthyEnv('off')).toBe(false);
      expect(truthyEnv('n')).toBe(false);
    });
  });

  describe('autodetectRepo', () => {
    beforeEach(() => {
      // Clear any existing env var
      delete process.env.GITHUB_REPO;
    });

    test('should return env var if set', async () => {
      process.env.GITHUB_REPO = 'test/repo';
      const result = await autodetectRepo();
      expect(result).toBe('test/repo');
    });

    test('should parse SSH git URL', async () => {
      const { execSync } = require('child_process');
      execSync.mockReturnValue('git@github.com:owner/repo.git');

      const result = await autodetectRepo();
      expect(result).toBe('owner/repo');
    });

    test('should parse HTTPS git URL', async () => {
      const { execSync } = require('child_process');
      execSync.mockReturnValue('https://github.com/owner/repo.git');

      const result = await autodetectRepo();
      expect(result).toBe('owner/repo');
    });
  });
});

describe('GitHubClient', () => {
  const mockToken = 'mock-token';
  let client;

  beforeEach(() => {
    client = new GitHubClient(mockToken);
  });

  test('should create axios client with correct config', () => {
    expect(client.client.defaults.baseURL).toBe('https://api.github.com');
    expect(client.client.defaults.headers.Authorization).toBe(`Bearer ${mockToken}`);
    expect(client.client.defaults.headers.Accept).toBe('application/vnd.github+json');
    expect(client.client.defaults.headers['X-GitHub-Api-Version']).toBe('2022-11-28');
    expect(client.client.defaults.headers['User-Agent']).toBe('fetch-ci-logs/1.0.0');
  });

  describe('fetchJson', () => {
    test('should make GET request and return data', async () => {
      const mockData = { test: 'data' };
      client.client.get = jest.fn().mockResolvedValue({ data: mockData });

      const result = await client.fetchJson('/test/path');
      expect(result).toEqual(mockData);
      expect(client.client.get).toHaveBeenCalledWith('/test/path');
    });
  });
});

// Integration test example (would need nock for HTTP mocking)
describe('fetchLogs (Integration)', () => {
  beforeEach(() => {
    // Set up test environment
    process.env.GITHUB_TOKEN = 'test-token';
    process.env.GITHUB_REPO = 'test/repo';
  });

  afterEach(() => {
    // Clean up
    delete process.env.GITHUB_TOKEN;
    delete process.env.GITHUB_REPO;
  });

  test('should require GITHUB_TOKEN', async () => {
    delete process.env.GITHUB_TOKEN;
    const { fetchLogs } = require('../lib/index');

    await expect(fetchLogs()).rejects.toThrow('GITHUB_TOKEN (or GH_TOKEN) is required');
  });

  test('should require GITHUB_REPO', async () => {
    delete process.env.GITHUB_REPO;
    // Mock execSync to throw an error to simulate no git repo
    const { execSync } = require('child_process');
    execSync.mockImplementation(() => {
      throw new Error('git command failed');
    });

    const { fetchLogs } = require('../lib/index');

    await expect(fetchLogs()).rejects.toThrow('GITHUB_REPO could not be determined');
  });

  // Note: Full integration tests would require nock to mock GitHub API responses
});
