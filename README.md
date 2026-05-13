---
title: ClaudeTest
emoji: 🧪
colorFrom: blue
colorTo: purple
sdk: docker
pinned: false
app_port: 7860
---

# ClaudeTest

[![npm version](https://img.shields.io/npm/v/@fasteningcode/claudetest)](https://www.npmjs.com/package/@fasteningcode/claudetest)
[![MCP Registry](https://img.shields.io/badge/MCP%20Registry-io.github.fasteningcode%2Fclaudetest-blue)](https://registry.modelcontextprotocol.io)
[![license](https://img.shields.io/npm/l/@fasteningcode/claudetest)](./LICENSE)
[![pnpm](https://img.shields.io/badge/maintained%20with-pnpm-cc00ff)](https://pnpm.io)
[![codecov](https://codecov.io/gh/fasteningcode/claude-e2e-plugin/branch/main/graph/badge.svg)](https://codecov.io/gh/fasteningcode/claude-e2e-plugin)

Enterprise-grade Playwright (web) and Appium (mobile) test automation plugin for Claude.

Connect your GitHub repository and let Claude generate missing tests, diagnose CI failures, and open fix PRs — all from a single conversation.

---

## Features

- **Test generation** — Claude scans your codebase and writes Playwright (web) or Appium (mobile) tests for untested flows
- **CI diagnosis** — paste a failed GitHub Actions run ID and get a plain-English root cause + fix suggestion
- **Auto PR** — generated tests are committed to a new branch and opened as a pull request
- **Cross-platform mobile** — Appium tests cover iOS and Android from the same test file
- **Self-hostable** — run inside your own VPC with Docker; no code leaves your infrastructure

---

## How it works

```
You → Claude → ClaudeTest MCP server → GitHub API / GitHub Actions
                                      ↓
                              Playwright / Appium test files
                                      ↓
                              Pull request on your repo
```

ClaudeTest is a [Model Context Protocol (MCP)](https://modelcontextprotocol.io) server. Claude calls it as a tool during your conversation, using your GitHub token to read repos, trigger workflows, and open PRs.

---

## Quickstart

### Claude.ai (remote — easiest)

1. Open [claude.ai](https://claude.ai) → **Settings** → **Integrations**
2. Find **ClaudeTest** and click **Connect**
3. Authorize GitHub access when prompted

### Claude Code (via npx)

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

### Claude Code (from source)

```bash
git clone https://github.com/fasteningcode/claude-e2e-plugin
cd claude-enterprise-testing
pnpm install && pnpm build
export GITHUB_TOKEN=ghp_your_token
node packages/mcp-server/dist/index.js
```

Then point Claude Code at it in `.claude/settings.json`:

```json
{
  "mcpServers": {
    "claudetest": {
      "command": "node",
      "args": ["packages/mcp-server/dist/index.js"],
      "env": {
        "GITHUB_TOKEN": "ghp_your_token"
      }
    }
  }
}
```

### Self-hosted (Docker)

```bash
cp .env.example .env          # set GITHUB_TOKEN in .env
docker compose -f docker/docker-compose.yml up -d
```

Full guide: [docs/self-hosted.md](docs/self-hosted.md)

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

## MCP Tools Reference

| Tool | Input | What it does |
|---|---|---|
| `analyze_repo` | `repo_url`, `branch?`, `paths?` | Scans codebase, returns `CoverageGap[]` report |
| `generate_tests` | `repo_url`, `file_paths[]`, `test_type` | Writes Playwright or Appium test files |
| `run_tests` | `repo_url`, `workflow_id`, `branch?` | Triggers GitHub Actions, polls until complete |
| `diagnose_failure` | `repo_url`, `run_id` | Parses CI logs, returns root cause + fix |
| `create_pr` | `repo_url`, `branch`, `title`, `files[]` | Creates branch, commits files, opens PR |

---

## Installation

```bash
npm i @fasteningcode/claudetest
```

**npm:** [@fasteningcode/claudetest](https://www.npmjs.com/package/@fasteningcode/claudetest)  
**MCP Registry:** [io.github.fasteningcode/claudetest](https://registry.modelcontextprotocol.io)

---

## Repository structure

```
claude-enterprise-testing/
├── packages/
│   ├── mcp-server/              # MCP server entry point + all 5 tools
│   │   └── src/
│   │       ├── auth/            # GitHub token handling (per-request Bearer)
│   │       ├── github/          # Octokit wrapper
│   │       ├── tools/           # Tool handlers (one file per tool)
│   │       └── types.ts         # Shared Zod schemas + TypeScript types
│   ├── playwright-agent/        # Web test analysis + generation
│   │   └── src/
│   │       ├── analyze.ts       # Detects untested pages/components/routes
│   │       └── generate.ts      # Writes Playwright test files
│   └── appium-agent/            # Mobile test analysis + generation
│       └── src/
│           ├── analyze.ts       # Detects untested screens/navigation
│           └── generate.ts      # Writes Appium test files (iOS + Android)
├── fixtures/
│   ├── web-app/                 # Next.js fixture app (deliberately untested flows)
│   └── mobile-app/              # React Native fixture app (deliberately untested flows)
├── docker/
│   ├── Dockerfile               # Multi-stage production build
│   └── docker-compose.yml       # Self-hosted stack
├── docs/
│   ├── quickstart.md            # 5-minute setup guide
│   └── self-hosted.md           # VPC / Docker deployment guide
├── mcp.json                     # Claude.ai connector manifest
└── server.json                  # MCP Registry manifest
```

---

## Tech stack

| Layer | Technology |
|---|---|
| Plugin protocol | [Model Context Protocol](https://modelcontextprotocol.io) |
| Language | TypeScript (Node.js 20+) |
| Web testing | [Playwright](https://playwright.dev) |
| Mobile testing | [Appium](https://appium.io) + [WebdriverIO](https://webdriver.io) |
| GitHub integration | [Octokit](https://github.com/octokit/rest.js) |
| Schema validation | [Zod](https://zod.dev) |
| Test runner | [Vitest](https://vitest.dev) |
| Package manager | [pnpm](https://pnpm.io) workspaces |

---

## GitHub permissions required

| Scope | Reason |
|---|---|
| `repo` read | Read source files and file tree |
| `repo` write | Create branches and commit test files |
| `workflow` write | Trigger and read GitHub Actions runs |
| `pull_requests` write | Open PRs with generated tests |

---

## Contributing

We welcome contributions! Please read [CONTRIBUTING.md](CONTRIBUTING.md) for the full guide.

**Quick summary:**
1. Fork the repo and create a branch: `git checkout -b feat/your-feature`
2. Make your changes with tests: `pnpm test`
3. Open a pull request against `main`

**Great areas to contribute:**
- New framework support (Vue, Angular, Flutter, Cypress)
- New CI integrations (GitLab CI, Bitbucket Pipelines, CircleCI)
- Cloud device farm support (BrowserStack, Sauce Labs, LambdaTest)
- Improved test generation heuristics

---

## License

MIT
