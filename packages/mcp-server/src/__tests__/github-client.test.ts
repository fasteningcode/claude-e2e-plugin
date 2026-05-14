import { describe, it, expect, vi, beforeEach } from 'vitest';

import { GitHubClient } from '../github/client.js';

vi.mock('@octokit/rest', () => {
  const mockOctokit = {
    repos: {
      get: vi.fn(),
      getContent: vi.fn(),
      createOrUpdateFileContents: vi.fn(),
    },
    git: {
      getTree: vi.fn(),
      getRef: vi.fn(),
      getCommit: vi.fn(),
      createRef: vi.fn(),
    },
    pulls: {
      create: vi.fn(),
    },
    actions: {
      createWorkflowDispatch: vi.fn(),
      getWorkflowRun: vi.fn(),
      downloadWorkflowRunLogs: vi.fn(),
      listWorkflowRuns: vi.fn(),
    },
  };
  return { Octokit: vi.fn(() => mockOctokit) };
});

import { Octokit } from '@octokit/rest';

function getMockOctokit(): ReturnType<typeof Octokit> {
  return (Octokit as unknown as ReturnType<typeof vi.fn>).mock.results[0]
    ?.value;
}

describe('GitHubClient', () => {
  let client: GitHubClient;

  beforeEach(() => {
    vi.clearAllMocks();
    client = new GitHubClient('test-token');
  });

  describe('getRepo', () => {
    it('returns owner, repo, and default_branch', async () => {
      const mock = getMockOctokit();
      vi.mocked(mock.repos.get).mockResolvedValueOnce({
        data: { default_branch: 'main' },
      } as never);

      const result = await client.getRepo('https://github.com/acme/my-app');

      expect(result).toEqual({ owner: 'acme', repo: 'my-app', default_branch: 'main' });
      expect(mock.repos.get).toHaveBeenCalledWith({ owner: 'acme', repo: 'my-app' });
    });

    it('throws on invalid repo URL', async () => {
      await expect(client.getRepo('https://github.com/onlyone')).rejects.toThrow(
        'Invalid GitHub repository URL',
      );
    });
  });

  describe('getFileTree', () => {
    it('resolves branch → commit → tree SHA before calling getTree', async () => {
      const mock = getMockOctokit();
      vi.mocked(mock.git.getRef).mockResolvedValueOnce({
        data: { object: { sha: 'commit-sha-abc' } },
      } as never);
      vi.mocked(mock.git.getCommit).mockResolvedValueOnce({
        data: { tree: { sha: 'tree-sha-xyz' } },
      } as never);
      vi.mocked(mock.git.getTree).mockResolvedValueOnce({
        data: {
          tree: [
            { path: 'src/app.ts', type: 'blob', sha: 'abc' },
            { path: 'src', type: 'tree', sha: 'def' },
            { path: 'src/utils.ts', type: 'blob', sha: 'ghi' },
          ],
        },
      } as never);

      const result = await client.getFileTree('https://github.com/acme/my-app', 'main');

      expect(mock.git.getRef).toHaveBeenCalledWith({ owner: 'acme', repo: 'my-app', ref: 'heads/main' });
      expect(mock.git.getCommit).toHaveBeenCalledWith({ owner: 'acme', repo: 'my-app', commit_sha: 'commit-sha-abc' });
      expect(mock.git.getTree).toHaveBeenCalledWith(expect.objectContaining({ tree_sha: 'tree-sha-xyz' }));
      expect(result).toHaveLength(2);
      expect(result.every((e) => e.type === 'blob')).toBe(true);
    });
  });

  describe('getFileContent', () => {
    it('decodes base64 file content', async () => {
      const mock = getMockOctokit();
      const encoded = Buffer.from('export const x = 1;').toString('base64');
      vi.mocked(mock.repos.getContent).mockResolvedValueOnce({
        data: { type: 'file', content: encoded, sha: 'abc123' },
      } as never);

      const result = await client.getFileContent(
        'https://github.com/acme/my-app',
        'src/app.ts',
        'main',
      );

      expect(result.content).toBe('export const x = 1;');
      expect(result.sha).toBe('abc123');
    });

    it('throws when path is a directory', async () => {
      const mock = getMockOctokit();
      vi.mocked(mock.repos.getContent).mockResolvedValueOnce({
        data: [{ type: 'dir', name: 'src' }],
      } as never);

      await expect(
        client.getFileContent('https://github.com/acme/my-app', 'src', 'main'),
      ).rejects.toThrow('is not a file');
    });
  });

  describe('createBranch', () => {
    it('creates a ref from the base branch sha', async () => {
      const mock = getMockOctokit();
      vi.mocked(mock.git.getRef).mockResolvedValueOnce({
        data: { object: { sha: 'deadbeef' } },
      } as never);
      vi.mocked(mock.git.createRef).mockResolvedValueOnce({} as never);

      await client.createBranch('https://github.com/acme/my-app', 'feat/new-tests', 'main');

      expect(mock.git.createRef).toHaveBeenCalledWith({
        owner: 'acme',
        repo: 'my-app',
        ref: 'refs/heads/feat/new-tests',
        sha: 'deadbeef',
      });
    });
  });

  describe('createPr', () => {
    it('returns pr number and html_url', async () => {
      const mock = getMockOctokit();
      vi.mocked(mock.pulls.create).mockResolvedValueOnce({
        data: { number: 42, html_url: 'https://github.com/acme/my-app/pull/42' },
      } as never);

      const result = await client.createPr(
        'https://github.com/acme/my-app',
        'Add Playwright tests',
        'feat/new-tests',
        'main',
        'Generated by ClaudeTest',
      );

      expect(result).toEqual({
        number: 42,
        html_url: 'https://github.com/acme/my-app/pull/42',
      });
    });
  });

  describe('getWorkflowRun', () => {
    it('returns normalized run status', async () => {
      const mock = getMockOctokit();
      vi.mocked(mock.actions.getWorkflowRun).mockResolvedValueOnce({
        data: {
          id: 123,
          status: 'completed',
          conclusion: 'failure',
          html_url: 'https://github.com/acme/my-app/actions/runs/123',
          created_at: '2026-01-01T00:00:00Z',
          updated_at: '2026-01-01T00:05:00Z',
        },
      } as never);

      const result = await client.getWorkflowRun('https://github.com/acme/my-app', 123);

      expect(result.id).toBe(123);
      expect(result.status).toBe('completed');
      expect(result.conclusion).toBe('failure');
    });
  });
});
