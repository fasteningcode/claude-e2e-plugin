# ClaudeTest

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

### 1. Connect the plugin

Open Claude and find **ClaudeTest** in the plugins directory at `claude.com/plugins`. Click **Connect** and authorize GitHub access.

For self-hosted setup, see [docs/self-hosted.md](docs/self-hosted.md).

### 2. Analyze your repo for coverage gaps

```
Analyze https://github.com/your-org/your-app for missing test coverage
```

Claude returns a prioritized list — high priority for pages, routes, and screens; medium for components.

### 3. Generate tests

```
Generate Playwright tests for the high-priority gaps you found
```

or for mobile:

```
Generate Appium tests for the untested screens in https://github.com/your-org/your-mobile-app
```

### 4. Open a PR

```
Open a PR with the generated tests on a branch called feat/claudetest
```

Claude creates the branch, commits the test files, and opens a PR with a review checklist.

### 5. Diagnose a CI failure

When a run fails, share the run ID or URL:

```
Diagnose the failure in run 123456789 in https://github.com/your-org/your-app
```

Claude reads the logs and tells you exactly what broke and how to fix it.

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

## Repository structure

```
claude-enterprise-testing/
├── packages/
│   ├── mcp-server/              # MCP plugin entry point + all 5 tools
│   │   └── src/
│   │       ├── auth/            # GitHub token handling
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
└── mcp.json                     # Plugin manifest for claude.com/plugins
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

## Development

### Prerequisites

- Node.js 20+
- pnpm 9+

### Setup

```bash
git clone https://github.com/your-org/claude-enterprise-testing
cd claude-enterprise-testing
pnpm install
```

### Run tests

```bash
pnpm test              # run all unit tests
pnpm test:watch        # watch mode
pnpm test:coverage     # with coverage report
```

### Build all packages

```bash
pnpm build
```

### Run the MCP server locally

```bash
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

---

## Self-hosted deployment

Run ClaudeTest inside your own VPC — no data leaves your infrastructure.

```bash
# Using Docker Compose
cp .env.example .env
# Set GITHUB_TOKEN in .env
docker compose -f docker/docker-compose.yml up -d
```

Full guide: [docs/self-hosted.md](docs/self-hosted.md)

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

1. Fork the repo and create a branch: `git checkout -b feat/your-feature`
2. Make your changes with tests: `pnpm test`
3. Open a pull request

All contributions welcome — new framework support (Vue, Flutter, Angular), new CI integrations (GitLab CI, Bitbucket Pipelines), cloud device farm support (BrowserStack, Sauce Labs).

---

## License

MIT
