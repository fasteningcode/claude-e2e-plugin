# Privacy Policy

**Last updated: May 13, 2026**

## Overview

ClaudeTest ("the Service") is an MCP server that connects Claude to GitHub repositories to generate tests, diagnose CI failures, and open pull requests.

## Data We Access

When you use ClaudeTest, it reads the following data from GitHub via your OAuth token:

- Repository source files (to identify coverage gaps and generate tests)
- GitHub Actions workflow run logs (to diagnose CI failures)
- Repository metadata (branch names, commit SHAs)

## Data We Do NOT Store

ClaudeTest operates with a **stateless, per-request architecture**:

- Your GitHub token is used only for the duration of a single request and is never persisted.
- Source code, test files, and workflow logs are processed in memory and discarded immediately after each response.
- No user data, code, or credentials are written to disk or stored in any database.

## Data We Write (on your behalf)

When you ask ClaudeTest to open a pull request, it creates:

- A new branch in the specified repository
- Commit(s) containing the generated test files
- A GitHub pull request targeting the branch you specify

All writes are performed using your own GitHub OAuth token and are visible in your GitHub account.

## Third-Party Services

ClaudeTest connects exclusively to the **GitHub API** (`api.github.com`). No data is sent to any other third-party service or AI model.

## Security

- All communication between the Claude client and the ClaudeTest MCP server is encrypted over HTTPS/TLS.
- All communication between the MCP server and the GitHub API is encrypted over HTTPS/TLS.
- GitHub OAuth tokens are transmitted in request headers and never logged.

## Your Rights

Because ClaudeTest does not store any personal data, there is no data to request, correct, or delete. You can revoke ClaudeTest's GitHub access at any time from your [GitHub OAuth Apps settings](https://github.com/settings/applications).

## Contact

For questions about this privacy policy, open an issue at:  
https://github.com/fasteningcode/claude-e2e-plugin/issues

Or email: aadhithbose@live.com
