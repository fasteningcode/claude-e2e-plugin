import { Octokit } from '@octokit/rest';

import { parseRepoUrl } from '../auth/github.js';

export interface FileTreeEntry {
  path: string;
  type: 'blob' | 'tree';
  sha: string;
}

export interface FileContent {
  path: string;
  content: string;
  sha: string;
}

export interface WorkflowRunStatus {
  id: number;
  status: string | null;
  conclusion: string | null;
  html_url: string;
  created_at: string;
  updated_at: string;
}

export class GitHubClient {
  private octokit: Octokit;

  constructor(token: string) {
    this.octokit = new Octokit({ auth: token });
  }

  async getRepo(repoUrl: string): Promise<{ owner: string; repo: string; default_branch: string }> {
    const { owner, repo } = parseRepoUrl(repoUrl);
    const { data } = await this.octokit.repos.get({ owner, repo });
    return { owner, repo, default_branch: data.default_branch };
  }

  async getFileTree(repoUrl: string, branch: string): Promise<FileTreeEntry[]> {
    const { owner, repo } = parseRepoUrl(repoUrl);

    // Resolve branch → commit SHA → tree SHA (passing a branch name directly to getTree is unreliable)
    const { data: refData } = await this.octokit.git.getRef({
      owner,
      repo,
      ref: `heads/${branch}`,
    });
    const commitSha = refData.object.sha;

    const { data: commitData } = await this.octokit.git.getCommit({
      owner,
      repo,
      commit_sha: commitSha,
    });
    const treeSha = commitData.tree.sha;

    const { data } = await this.octokit.git.getTree({
      owner,
      repo,
      tree_sha: treeSha,
      recursive: '1',
    });
    return (data.tree as FileTreeEntry[]).filter((e) => e.type === 'blob');
  }

  async getFileContent(repoUrl: string, path: string, ref: string): Promise<FileContent> {
    const { owner, repo } = parseRepoUrl(repoUrl);
    const { data } = await this.octokit.repos.getContent({ owner, repo, path, ref });

    if (Array.isArray(data) || data.type !== 'file') {
      throw new Error(`${path} is not a file`);
    }

    const content = Buffer.from(data.content, 'base64').toString('utf-8');
    return { path, content, sha: data.sha };
  }

  async createBranch(repoUrl: string, branchName: string, fromBranch: string): Promise<void> {
    const { owner, repo } = parseRepoUrl(repoUrl);
    const { data: refData } = await this.octokit.git.getRef({
      owner,
      repo,
      ref: `heads/${fromBranch}`,
    });
    await this.octokit.git.createRef({
      owner,
      repo,
      ref: `refs/heads/${branchName}`,
      sha: refData.object.sha,
    });
  }

  async createOrUpdateFile(
    repoUrl: string,
    path: string,
    content: string,
    message: string,
    branch: string,
  ): Promise<void> {
    const { owner, repo } = parseRepoUrl(repoUrl);
    const encodedContent = Buffer.from(content).toString('base64');

    let existingSha: string | undefined;
    try {
      const { data } = await this.octokit.repos.getContent({ owner, repo, path, ref: branch });
      if (!Array.isArray(data) && data.type === 'file') {
        existingSha = data.sha;
      }
    } catch (err: unknown) {
      const status = (err as { status?: number }).status;
      if (status !== 404) throw err; // only swallow "file doesn't exist yet"
    }

    await this.octokit.repos.createOrUpdateFileContents({
      owner,
      repo,
      path,
      message,
      content: encodedContent,
      branch,
      ...(existingSha ? { sha: existingSha } : {}),
    });
  }

  async createPr(
    repoUrl: string,
    title: string,
    head: string,
    base: string,
    body: string,
  ): Promise<{ number: number; html_url: string }> {
    const { owner, repo } = parseRepoUrl(repoUrl);
    const { data } = await this.octokit.pulls.create({ owner, repo, title, head, base, body });
    return { number: data.number, html_url: data.html_url };
  }

  async triggerWorkflow(repoUrl: string, workflowId: string, branch: string): Promise<void> {
    const { owner, repo } = parseRepoUrl(repoUrl);
    await this.octokit.actions.createWorkflowDispatch({
      owner,
      repo,
      workflow_id: workflowId,
      ref: branch,
    });
  }

  async getWorkflowRun(repoUrl: string, runId: number): Promise<WorkflowRunStatus> {
    const { owner, repo } = parseRepoUrl(repoUrl);
    const { data } = await this.octokit.actions.getWorkflowRun({ owner, repo, run_id: runId });
    return {
      id: data.id,
      status: data.status ?? null,
      conclusion: data.conclusion ?? null,
      html_url: data.html_url,
      created_at: data.created_at,
      updated_at: data.updated_at,
    };
  }

  async getWorkflowRunLogs(repoUrl: string, runId: number): Promise<string> {
    const { owner, repo } = parseRepoUrl(repoUrl);
    const response = await this.octokit.actions.downloadWorkflowRunLogs({
      owner,
      repo,
      run_id: runId,
    });
    return typeof response.data === 'string' ? response.data : JSON.stringify(response.data);
  }

  async getLatestWorkflowRun(
    repoUrl: string,
    workflowId: string,
    branch: string,
  ): Promise<WorkflowRunStatus | null> {
    const { owner, repo } = parseRepoUrl(repoUrl);
    const { data } = await this.octokit.actions.listWorkflowRuns({
      owner,
      repo,
      workflow_id: workflowId,
      branch,
      per_page: 1,
    });
    const run = data.workflow_runs[0];
    if (!run) return null;
    return {
      id: run.id,
      status: run.status ?? null,
      conclusion: run.conclusion ?? null,
      html_url: run.html_url,
      created_at: run.created_at,
      updated_at: run.updated_at,
    };
  }
}
