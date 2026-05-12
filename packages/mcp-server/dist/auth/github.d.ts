export interface GitHubAuthConfig {
    token: string;
}
export declare function getGitHubToken(): string;
export declare function parseRepoUrl(repoUrl: string): {
    owner: string;
    repo: string;
};
//# sourceMappingURL=github.d.ts.map