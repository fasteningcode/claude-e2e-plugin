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
export declare class GitHubClient {
    private octokit;
    constructor(token: string);
    getRepo(repoUrl: string): Promise<{
        owner: string;
        repo: string;
        default_branch: string;
    }>;
    getFileTree(repoUrl: string, branch: string): Promise<FileTreeEntry[]>;
    getFileContent(repoUrl: string, path: string, ref: string): Promise<FileContent>;
    createBranch(repoUrl: string, branchName: string, fromBranch: string): Promise<void>;
    createOrUpdateFile(repoUrl: string, path: string, content: string, message: string, branch: string): Promise<void>;
    createPr(repoUrl: string, title: string, head: string, base: string, body: string): Promise<{
        number: number;
        html_url: string;
    }>;
    triggerWorkflow(repoUrl: string, workflowId: string, branch: string): Promise<void>;
    getWorkflowRun(repoUrl: string, runId: number): Promise<WorkflowRunStatus>;
    getWorkflowRunLogs(repoUrl: string, runId: number): Promise<string>;
    getLatestWorkflowRun(repoUrl: string, workflowId: string, branch: string): Promise<WorkflowRunStatus | null>;
}
//# sourceMappingURL=client.d.ts.map