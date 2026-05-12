export interface GitHubAuthConfig {
  token: string;
}

export function getGitHubToken(): string {
  const token = process.env['GITHUB_TOKEN'];
  if (!token) {
    throw new Error(
      'GITHUB_TOKEN environment variable is required. ' +
        'Generate a token at https://github.com/settings/tokens with scopes: repo, workflow.',
    );
  }
  return token;
}

export function parseRepoUrl(repoUrl: string): { owner: string; repo: string } {
  const url = new URL(repoUrl);
  const parts = url.pathname.replace(/^\//, '').replace(/\.git$/, '').split('/');

  const owner = parts[0];
  const repo = parts[1];

  if (!owner || !repo) {
    throw new Error(
      `Invalid GitHub repository URL: ${repoUrl}. Expected format: https://github.com/owner/repo`,
    );
  }

  return { owner, repo };
}
