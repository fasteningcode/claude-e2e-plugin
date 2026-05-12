import { describe, it, expect, vi, beforeEach } from 'vitest';

import { handleAnalyzeRepo } from '../tools/analyze-repo.js';
import { handleGenerateTests } from '../tools/generate-tests.js';
import { handleRunTests } from '../tools/run-tests.js';
import { handleDiagnoseFailure } from '../tools/diagnose-failure.js';
import { handleCreatePr } from '../tools/create-pr.js';
import type { GitHubClient } from '../github/client.js';

function makeMockClient(overrides: Partial<GitHubClient> = {}): GitHubClient {
  return {
    getRepo: vi.fn(),
    getFileTree: vi.fn(),
    getFileContent: vi.fn(),
    createBranch: vi.fn(),
    createOrUpdateFile: vi.fn(),
    createPr: vi.fn(),
    triggerWorkflow: vi.fn(),
    getWorkflowRun: vi.fn(),
    getWorkflowRunLogs: vi.fn(),
    getLatestWorkflowRun: vi.fn(),
    ...overrides,
  } as unknown as GitHubClient;
}

describe('handleAnalyzeRepo', () => {
  it('identifies source files with no corresponding test file', async () => {
    const client = makeMockClient({
      getFileTree: vi.fn().mockResolvedValue([
        { path: 'src/pages/login.tsx', type: 'blob', sha: 'a' },
        { path: 'src/utils/format.ts', type: 'blob', sha: 'b' },
        { path: 'src/pages/login.spec.ts', type: 'blob', sha: 'c' },
      ]),
    });

    const result = await handleAnalyzeRepo(
      { repo_url: 'https://github.com/acme/app', branch: 'main' },
      client,
    );

    expect(result.gaps).toHaveLength(1);
    expect(result.gaps[0]?.file_path).toBe('src/utils/format.ts');
  });

  it('marks page/route files as high priority', async () => {
    const client = makeMockClient({
      getFileTree: vi.fn().mockResolvedValue([
        { path: 'src/pages/checkout.tsx', type: 'blob', sha: 'a' },
      ]),
    });

    const { gaps } = await handleAnalyzeRepo(
      { repo_url: 'https://github.com/acme/app', branch: 'main' },
      client,
    );

    expect(gaps[0]?.priority).toBe('high');
  });

  it('filters by paths when provided', async () => {
    const client = makeMockClient({
      getFileTree: vi.fn().mockResolvedValue([
        { path: 'src/pages/login.tsx', type: 'blob', sha: 'a' },
        { path: 'lib/utils.ts', type: 'blob', sha: 'b' },
      ]),
    });

    const { gaps } = await handleAnalyzeRepo(
      { repo_url: 'https://github.com/acme/app', branch: 'main', paths: ['src/'] },
      client,
    );

    expect(gaps.every((g) => g.file_path.startsWith('src/'))).toBe(true);
  });
});

describe('handleGenerateTests', () => {
  it('generates playwright test with .spec.ts extension', async () => {
    const client = makeMockClient({
      getFileContent: vi.fn().mockResolvedValue({
        path: 'src/pages/login.tsx',
        content: 'export const LoginPage = () => <div />;',
        sha: 'abc',
      }),
    });

    const result = await handleGenerateTests(
      {
        repo_url: 'https://github.com/acme/app',
        file_paths: ['src/pages/login.tsx'],
        test_type: 'playwright',
        branch: 'main',
      },
      client,
    );

    expect(result.test_files).toHaveLength(1);
    expect(result.test_files[0]?.path).toBe('src/pages/login.spec.ts');
    expect(result.test_files[0]?.content).toContain("from '@playwright/test'");
  });

  it('generates appium test with .appium.test.ts extension', async () => {
    const client = makeMockClient({
      getFileContent: vi.fn().mockResolvedValue({
        path: 'src/screens/HomeScreen.tsx',
        content: 'export const HomeScreen = () => null;',
        sha: 'abc',
      }),
    });

    const result = await handleGenerateTests(
      {
        repo_url: 'https://github.com/acme/app',
        file_paths: ['src/screens/HomeScreen.tsx'],
        test_type: 'appium',
        branch: 'main',
      },
      client,
    );

    expect(result.test_files[0]?.path).toBe('src/screens/HomeScreen.appium.test.ts');
    expect(result.test_files[0]?.content).toContain("from 'webdriverio'");
  });
});

describe('handleDiagnoseFailure', () => {
  it('identifies missing module as root cause', async () => {
    const client = makeMockClient({
      getWorkflowRun: vi.fn().mockResolvedValue({
        id: 123,
        status: 'completed',
        conclusion: 'failure',
        html_url: 'https://github.com/acme/app/actions/runs/123',
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-01-01T00:01:00Z',
      }),
      getWorkflowRunLogs: vi.fn().mockResolvedValue(
        "Error: Cannot find module '@/components/Button'\n    at src/pages/login.tsx:5",
      ),
    });

    const report = await handleDiagnoseFailure(
      { repo_url: 'https://github.com/acme/app', run_id: 123 },
      client,
    );

    expect(report.root_cause).toContain('Missing dependency');
    expect(report.suggested_fix).toContain('pnpm install');
  });

  it('identifies timeout as root cause', async () => {
    const client = makeMockClient({
      getWorkflowRun: vi.fn().mockResolvedValue({
        id: 456,
        status: 'completed',
        conclusion: 'failure',
        html_url: 'https://github.com/acme/app/actions/runs/456',
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-01-01T00:01:00Z',
      }),
      getWorkflowRunLogs: vi.fn().mockResolvedValue('Timeout exceeded after 30000ms'),
    });

    const report = await handleDiagnoseFailure(
      { repo_url: 'https://github.com/acme/app', run_id: 456 },
      client,
    );

    expect(report.root_cause).toContain('timeout');
  });
});

describe('handleRunTests', () => {
  it('returns success when run completes with success conclusion', async () => {
    const futureDate = new Date(Date.now() + 5000).toISOString();
    const client = makeMockClient({
      triggerWorkflow: vi.fn().mockResolvedValue(undefined),
      getLatestWorkflowRun: vi.fn().mockResolvedValue({
        id: 789,
        status: 'completed',
        conclusion: 'success',
        html_url: 'https://github.com/acme/app/actions/runs/789',
        created_at: futureDate,
        updated_at: futureDate,
      }),
    });

    const result = await handleRunTests(
      { repo_url: 'https://github.com/acme/app', workflow_id: 'test.yml', branch: 'main', timeout_ms: 30000 },
      client,
    );

    expect(result.status).toBe('success');
    expect(result.run_id).toBe(789);
  });

  it('returns failure when conclusion is failure', async () => {
    const futureDate = new Date(Date.now() + 5000).toISOString();
    const client = makeMockClient({
      triggerWorkflow: vi.fn().mockResolvedValue(undefined),
      getLatestWorkflowRun: vi.fn().mockResolvedValue({
        id: 790,
        status: 'completed',
        conclusion: 'failure',
        html_url: 'https://github.com/acme/app/actions/runs/790',
        created_at: futureDate,
        updated_at: futureDate,
      }),
    });

    const result = await handleRunTests(
      { repo_url: 'https://github.com/acme/app', workflow_id: 'test.yml', branch: 'main', timeout_ms: 30000 },
      client,
    );

    expect(result.status).toBe('failure');
  });

  it('ignores runs created before dispatch (correlation check)', async () => {
    const oldDate = new Date(Date.now() - 60000).toISOString();
    const getLatestWorkflowRun = vi.fn().mockResolvedValue({
      id: 100,
      status: 'completed',
      conclusion: 'success',
      html_url: 'https://github.com/acme/app/actions/runs/100',
      created_at: oldDate,
      updated_at: oldDate,
    });

    const client = makeMockClient({
      triggerWorkflow: vi.fn().mockResolvedValue(undefined),
      getLatestWorkflowRun,
    });

    const result = await handleRunTests(
      { repo_url: 'https://github.com/acme/app', workflow_id: 'test.yml', branch: 'main', timeout_ms: 100 },
      client,
    );

    expect(result.status).toBe('timed_out');
  }, 10000);
});

describe('handleCreatePr', () => {
  it('creates branch, commits files, and opens PR', async () => {
    const createBranch = vi.fn().mockResolvedValue(undefined);
    const createOrUpdateFile = vi.fn().mockResolvedValue(undefined);
    const createPr = vi.fn().mockResolvedValue({
      number: 42,
      html_url: 'https://github.com/acme/app/pull/42',
    });

    const client = makeMockClient({ createBranch, createOrUpdateFile, createPr });

    const result = await handleCreatePr(
      {
        repo_url: 'https://github.com/acme/app',
        branch: 'feat/generated-tests',
        title: 'Add Playwright tests',
        files: [{ path: 'tests/login.spec.ts', content: 'test code' }],
        base_branch: 'main',
      },
      client,
    );

    expect(createBranch).toHaveBeenCalledWith(
      'https://github.com/acme/app',
      'feat/generated-tests',
      'main',
    );
    expect(createOrUpdateFile).toHaveBeenCalledTimes(1);
    expect(result.pr_number).toBe(42);
    expect(result.html_url).toBe('https://github.com/acme/app/pull/42');
  });
});
