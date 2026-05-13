# @fasteningcode/claudetest

> Enterprise-grade Playwright (web) and Appium (mobile) test automation for Claude.  
> Generate missing tests, diagnose CI failures, and open fix PRs — all from a single conversation.

[![npm version](https://img.shields.io/npm/v/@fasteningcode/claudetest)](https://www.npmjs.com/package/@fasteningcode/claudetest)
[![license](https://img.shields.io/npm/l/@fasteningcode/claudetest)](./LICENSE)

---

## What it does

ClaudeTest is a [Model Context Protocol (MCP)](https://modelcontextprotocol.io) server that gives Claude direct access to your GitHub repositories and CI pipeline.

```
You → Claude → ClaudeTest MCP → GitHub API / GitHub Actions
                                ↓
                        Playwright / Appium test files
                                ↓
                        Pull request on your repo
```

---

## Tools

| Tool | What it does |
|---|---|
| `analyze_repo` | Scans your repo and returns a prioritized list of untested flows |
| `generate_tests` | Writes Playwright (web) or Appium (mobile) test files |
| `run_tests` | Triggers a GitHub Actions workflow and waits for results |
| `diagnose_failure` | Reads CI logs and explains the root cause in plain English |
| `create_pr` | Commits generated tests to a new branch and opens a PR |

---

## Quickstart

### Claude.ai (remote)

Find **ClaudeTest** in the Claude.ai integrations directory, click **Connect**, and authorize GitHub access.

### Claude Code (local)

```bash
npx @fasteningcode/claudetest --stdio
```

Add to `.claude/settings.json`:

```json
{
  "mcpServers": {
    "claudetest": {
      "command": "npx",
      "args": ["@fasteningcode/claudetest", "--stdio"],
      "env": {
        "GITHUB_TOKEN": "ghp_your_token"
      }
    }
  }
}
```

### Self-hosted (Docker)

```bash
docker run -p 3000:3000 \
  -e GITHUB_TOKEN=ghp_your_token \
  ghcr.io/fasteningcode/claudetest:latest
```

---

## Example conversations

**Analyze a repo for coverage gaps**
```
Analyze https://github.com/your-org/your-app for missing test coverage
```

**Generate Playwright tests**
```
Generate Playwright tests for the high-priority gaps you found
```

**Generate Appium tests**
```
Generate Appium tests for the untested screens in https://github.com/your-org/mobile-app
```

**Diagnose a CI failure**
```
Diagnose the failure in run 123456789 in https://github.com/your-org/your-app
```

**Open a PR with generated tests**
```
Open a PR with the generated tests on a branch called feat/claudetest
```

---

## GitHub permissions required

| Scope | Reason |
|---|---|
| `repo` read | Read source files and file tree |
| `repo` write | Create branches and commit test files |
| `workflow` write | Trigger and read GitHub Actions runs |
| `pull_requests` write | Open PRs with generated tests |

---

## Auth

**Remote (Claude.ai):** ClaudeTest uses OAuth — Claude.ai manages the GitHub token flow for you.

**Local / self-hosted:** Set `GITHUB_TOKEN` environment variable with a [personal access token](https://github.com/settings/tokens) with `repo` and `workflow` scopes.

---

## Links

- [GitHub](https://github.com/fasteningcode/claude-e2e-plugin)
- [Self-hosted setup](https://github.com/fasteningcode/claude-e2e-plugin/blob/main/docs/self-hosted.md)
- [MCP Protocol](https://modelcontextprotocol.io)

---

## License

MIT
