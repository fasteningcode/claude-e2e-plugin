# Contributing to ClaudeTest

Thanks for your interest in contributing! This guide covers everything you need to get started.

---

## Table of contents

- [Project overview](#project-overview)
- [Development setup](#development-setup)
- [Project structure](#project-structure)
- [Making changes](#making-changes)
- [Adding a new test framework](#adding-a-new-test-framework)
- [Adding a new CI integration](#adding-a-new-ci-integration)
- [Adding a new MCP tool](#adding-a-new-mcp-tool)
- [Testing](#testing)
- [Pull request process](#pull-request-process)
- [Publishing](#publishing)

---

## Project overview

ClaudeTest is a monorepo with three packages:

| Package | Purpose |
|---|---|
| `packages/mcp-server` | MCP server entry point — exposes 5 tools to Claude |
| `packages/playwright-agent` | Web test analysis and generation logic |
| `packages/appium-agent` | Mobile test analysis and generation logic |

The MCP server is the only published package (`@fasteningcode/claudetest`). The agent packages are internal workspace dependencies.

---

## Development setup

### Prerequisites

- Node.js 20+
- pnpm 9+
- A GitHub personal access token with `repo` and `workflow` scopes

### Install

```bash
git clone https://github.com/fasteningcode/claude-e2e-plugin
cd claude-enterprise-testing
pnpm install
```

### Build

```bash
pnpm build           # build all packages
pnpm --filter @fasteningcode/claudetest build   # build mcp-server only
```

### Run locally

```bash
export GITHUB_TOKEN=ghp_your_token

# HTTP mode (for Claude.ai / remote clients)
node packages/mcp-server/dist/index.js

# stdio mode (for Claude Code)
node packages/mcp-server/dist/index.js --stdio
```

### Connect to Claude Code

Add to `.claude/settings.json`:

```json
{
  "mcpServers": {
    "claudetest-dev": {
      "command": "node",
      "args": ["packages/mcp-server/dist/index.js", "--stdio"],
      "env": {
        "GITHUB_TOKEN": "ghp_your_token"
      }
    }
  }
}
```

---

## Project structure

```
packages/mcp-server/src/
├── auth/
│   └── github.ts          # Token extraction (Bearer header + env var fallback)
├── github/
│   └── client.ts          # Octokit wrapper with typed helper methods
├── tools/
│   ├── analyze-repo.ts    # analyze_repo tool handler
│   ├── create-pr.ts       # create_pr tool handler
│   ├── diagnose-failure.ts# diagnose_failure tool handler
│   ├── generate-tests.ts  # generate_tests tool handler
│   └── run-tests.ts       # run_tests tool handler
├── types.ts               # Zod schemas for all tool inputs
└── index.ts               # MCP server setup + HTTP/stdio transports
```

Each tool handler follows the same pattern:

```ts
// tools/my-tool.ts
import type { GitHubClient } from '../github/client.js';
import type { MyToolInput } from '../types.js';

export async function handleMyTool(
  input: MyToolInput,
  client: GitHubClient,
): Promise<MyToolResult> {
  // implementation
}
```

---

## Making changes

1. **Create a branch** from `main`:
   ```bash
   git checkout -b feat/my-feature
   ```

2. **Make your changes** — keep each commit focused on one thing

3. **Add or update tests** in `packages/*/src/__tests__/`

4. **Build and test**:
   ```bash
   pnpm build
   pnpm test
   ```

5. **Open a PR** — see [Pull request process](#pull-request-process)

---

## Adding a new test framework

To add support for a new framework (e.g. Cypress, Vue Test Utils, Flutter):

### 1. Extend the `test_type` enum in `types.ts`

```ts
// packages/mcp-server/src/types.ts
export const GenerateTestsInputSchema = z.object({
  ...
  test_type: z.enum(['playwright', 'appium', 'cypress']),  // add here
  ...
});
```

### 2. Create a new agent package (or extend an existing one)

```bash
mkdir -p packages/cypress-agent/src
```

Implement two files:
- `analyze.ts` — detect untested files for this framework
- `generate.ts` — generate test file content

Follow the pattern in `packages/playwright-agent/src/`.

### 3. Wire it into the generate-tests tool handler

```ts
// packages/mcp-server/src/tools/generate-tests.ts
import { handleGenerateCypressTests } from '@fasteningcode/claudetest-cypress';

case 'cypress':
  return handleGenerateCypressTests(input, client);
```

### 4. Add fixtures

Add a deliberately undertested sample app to `fixtures/` so the new framework can be validated end-to-end.

### 5. Update docs

- Add usage examples to `README.md`
- Update the tools table if input schema changed

---

## Adding a new CI integration

ClaudeTest currently supports GitHub Actions. To add GitLab CI, Bitbucket Pipelines, etc.:

### 1. Extend `GitHubClient` or create a new client

```ts
// packages/mcp-server/src/gitlab/client.ts
export class GitLabClient {
  constructor(private token: string) {}
  async getPipelineLogs(projectId: string, pipelineId: number): Promise<string> { ... }
}
```

### 2. Update `run_tests` and `diagnose_failure` tool handlers

Add a `ci_provider` field to the relevant Zod schemas in `types.ts` and branch on it in the tool handlers.

### 3. Update auth

The `extractToken` function in `index.ts` currently handles GitHub tokens. If your provider uses a different auth model, add a new extraction path.

---

## Adding a new MCP tool

1. **Define the input schema** in `types.ts`:
   ```ts
   export const MyToolInputSchema = z.object({
     repo_url: z.string(),
     // ...
   });
   export type MyToolInput = z.infer<typeof MyToolInputSchema>;
   ```

2. **Register the tool** in the `ListToolsRequestSchema` handler in `index.ts`:
   ```ts
   {
     name: 'my_tool',
     description: 'What it does, in one sentence.',
     inputSchema: {
       type: 'object',
       properties: { ... },
       required: [...],
     },
   }
   ```

3. **Create the handler** in `packages/mcp-server/src/tools/my-tool.ts`

4. **Wire it** in the `CallToolRequestSchema` handler in `index.ts`:
   ```ts
   case 'my_tool': {
     const input = MyToolInputSchema.parse(request.params.arguments);
     const result = await handleMyTool(input, client);
     return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
   }
   ```

5. **Write tests** in `packages/mcp-server/src/__tests__/`

6. **Update `mcp.json`** to declare the new tool

---

## Testing

```bash
pnpm test              # run all unit tests
pnpm test:watch        # watch mode during development
pnpm test:coverage     # generate coverage report
```

Tests live in `__tests__/` directories alongside source files. We use [Vitest](https://vitest.dev).

When adding a tool or modifying logic, add tests that:
- Cover the happy path with a mocked `GitHubClient`
- Cover error cases (invalid input, GitHub API failure)
- Use the fixture apps in `fixtures/` for integration-style tests

---

## Pull request process

1. **Title** — use conventional commits format: `feat:`, `fix:`, `docs:`, `chore:`
2. **Description** — explain what changed and why; link any related issues
3. **Tests** — all existing tests must pass; new behavior needs new tests
4. **Scope** — keep PRs focused; one feature or fix per PR

### PR checklist

- [ ] `pnpm build` passes
- [ ] `pnpm test` passes
- [ ] New/changed tools are documented in README
- [ ] `mcp.json` updated if tools changed
- [ ] No secrets or tokens committed

---

## Publishing

> This section is for maintainers.

### npm

```bash
# Bump version in packages/mcp-server/package.json
npm config set //registry.npmjs.org/:_authToken <token>
cd packages/mcp-server
npm publish --access public
```

### MCP Registry

```bash
# Update version in server.json to match npm
./bin/mcp-publisher publish   # or /tmp/mcp-publisher publish
```

The `mcp-publisher` binary can be downloaded from [github.com/modelcontextprotocol/registry/releases](https://github.com/modelcontextprotocol/registry/releases).

### Claude.ai connector

Any changes to OAuth config or server URL must be reported to Anthropic at integrations@anthropic.com.
