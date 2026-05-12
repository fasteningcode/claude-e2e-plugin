import { Octokit } from '@octokit/rest';
import { parseRepoUrl } from '../auth/github.js';
export class GitHubClient {
    octokit;
    constructor(token) {
        this.octokit = new Octokit({ auth: token });
    }
    async getRepo(repoUrl) {
        const { owner, repo } = parseRepoUrl(repoUrl);
        const { data } = await this.octokit.repos.get({ owner, repo });
        return { owner, repo, default_branch: data.default_branch };
    }
    async getFileTree(repoUrl, branch) {
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
        return data.tree.filter((e) => e.type === 'blob');
    }
    async getFileContent(repoUrl, path, ref) {
        const { owner, repo } = parseRepoUrl(repoUrl);
        const { data } = await this.octokit.repos.getContent({ owner, repo, path, ref });
        if (Array.isArray(data) || data.type !== 'file') {
            throw new Error(`${path} is not a file`);
        }
        const content = Buffer.from(data.content, 'base64').toString('utf-8');
        return { path, content, sha: data.sha };
    }
    async createBranch(repoUrl, branchName, fromBranch) {
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
    async createOrUpdateFile(repoUrl, path, content, message, branch) {
        const { owner, repo } = parseRepoUrl(repoUrl);
        const encodedContent = Buffer.from(content).toString('base64');
        let existingSha;
        try {
            const { data } = await this.octokit.repos.getContent({ owner, repo, path, ref: branch });
            if (!Array.isArray(data) && data.type === 'file') {
                existingSha = data.sha;
            }
        }
        catch (err) {
            const status = err.status;
            if (status !== 404)
                throw err; // only swallow "file doesn't exist yet"
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
    async createPr(repoUrl, title, head, base, body) {
        const { owner, repo } = parseRepoUrl(repoUrl);
        const { data } = await this.octokit.pulls.create({ owner, repo, title, head, base, body });
        return { number: data.number, html_url: data.html_url };
    }
    async triggerWorkflow(repoUrl, workflowId, branch) {
        const { owner, repo } = parseRepoUrl(repoUrl);
        await this.octokit.actions.createWorkflowDispatch({
            owner,
            repo,
            workflow_id: workflowId,
            ref: branch,
        });
    }
    async getWorkflowRun(repoUrl, runId) {
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
    async getWorkflowRunLogs(repoUrl, runId) {
        const { owner, repo } = parseRepoUrl(repoUrl);
        const response = await this.octokit.actions.downloadWorkflowRunLogs({
            owner,
            repo,
            run_id: runId,
        });
        return typeof response.data === 'string' ? response.data : JSON.stringify(response.data);
    }
    async getLatestWorkflowRun(repoUrl, workflowId, branch) {
        const { owner, repo } = parseRepoUrl(repoUrl);
        const { data } = await this.octokit.actions.listWorkflowRuns({
            owner,
            repo,
            workflow_id: workflowId,
            branch,
            per_page: 1,
        });
        const run = data.workflow_runs[0];
        if (!run)
            return null;
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
//# sourceMappingURL=client.js.map