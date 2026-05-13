# Getting Started with ClaudeTest

ClaudeTest connects Claude to your GitHub repositories so you can generate missing tests, diagnose CI failures, and open fix PRs — all from a single conversation.

---

## Quick setup (3 steps)

### Step 1 — Connect ClaudeTest to Claude.ai

1. Open [claude.ai](https://claude.ai) → **Settings** → **Integrations**
2. Find **ClaudeTest** and click **Connect**
3. Authorize GitHub access when prompted

ClaudeTest will request the following GitHub permissions:
- `repo` — read your source files and create branches
- `workflow` — trigger and read GitHub Actions runs

### Step 2 — Point Claude at your repository

```
Analyze https://github.com/your-org/your-app for missing test coverage
```

Claude will scan your codebase and return a prioritized list of untested flows — pages, routes, screens, and components ranked by risk.

### Step 3 — Generate and ship tests

```
Generate Playwright tests for the high-priority gaps you found
```

```
Open a PR with the generated tests on a branch called feat/claudetest-coverage
```

That's it. ClaudeTest creates the branch, commits the test files, and opens a PR with a review checklist.

---

## All 5 tools

| Tool | What to say | What happens |
|---|---|---|
| **Analyze Repository Coverage** | "Analyze github.com/org/repo for missing tests" | Returns prioritized `CoverageGap[]` report |
| **Generate Test Files** | "Generate Playwright tests for the gaps" | Writes Playwright or Appium test files |
| **Run CI Workflow** | "Run the test.yml workflow on my branch" | Triggers GitHub Actions, waits for result |
| **Diagnose CI Failure** | "Diagnose the failure in run 123456789" | Root cause + fix in plain English |
| **Create Pull Request** | "Open a PR with the tests on feat/claudetest" | Creates branch, commits files, opens PR |

---

## Mobile testing (Appium)

ClaudeTest generates cross-platform Appium tests for React Native, Flutter, and native iOS/Android apps.

```
Generate Appium tests for the untested screens in https://github.com/your-org/mobile-app
```

Generated tests cover both iOS and Android from a single test file using WebdriverIO.

---

## Diagnosing CI failures

When a GitHub Actions run fails, share the run ID:

```
Diagnose the failure in run 9876543210 in https://github.com/your-org/your-app
```

ClaudeTest reads the raw logs and returns:
- **Root cause** — exactly what failed and why
- **Affected files** — which file and line number
- **Suggested fix** — what to change to make it pass

---

## Self-hosted deployment

For teams that need to keep code inside their VPC:

```bash
docker run -p 3000:3000 \
  -e GITHUB_TOKEN=ghp_your_token \
  ghcr.io/fasteningcode/claudetest:latest
```

Full guide: [Self-hosted setup](./self-hosted.md)

---

## FAQ

**Does ClaudeTest store my code?**
No. Requests are stateless — your GitHub token and code are only used to fulfill the immediate request and are never stored.

**Which test frameworks are supported?**
Playwright (web) and Appium + WebdriverIO (mobile). Cypress, Vue Test Utils, and Flutter support are on the roadmap — contributions welcome.

**Which CI systems are supported?**
GitHub Actions. GitLab CI and Bitbucket Pipelines support are planned.

**Can I use it without Claude.ai?**
Yes — via [Claude Code](https://claude.ai/claude-code) with a local stdio connection, or any MCP-compatible client.

---

## Links

- [GitHub](https://github.com/fasteningcode/claude-e2e-plugin)
- [npm](https://www.npmjs.com/package/@fasteningcode/claudetest)
- [MCP Registry](https://registry.modelcontextprotocol.io)
- [Self-hosted setup](./self-hosted.md)
- [Contributing](../CONTRIBUTING.md)
