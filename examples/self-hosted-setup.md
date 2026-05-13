# Example: Self-hosted setup inside a VPC

For teams that can't send code to external services, ClaudeTest can run entirely inside your own infrastructure.

## Architecture

```
Your VPC
├── Claude (claude.ai or Claude API)
└── ClaudeTest MCP server (Docker)
    └── GitHub Enterprise / GitHub.com via VPN
```

## 1. Pull the Docker image

```bash
docker pull ghcr.io/fasteningcode/claudetest:latest
```

## 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env`:
```bash
GITHUB_TOKEN=ghp_your_enterprise_token
PORT=3000
```

## 3. Run with Docker Compose

```bash
docker compose -f docker/docker-compose.yml up -d
```

Verify it's running:
```bash
curl http://localhost:3000/health
# {"status":"ok","name":"claudetest"}
```

## 4. Point Claude Code at your local server

In `.claude/settings.json`:
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

Or for the HTTP server running in Docker, use the remote MCP endpoint:
```
http://localhost:3000/mcp
```

## 5. GitHub Enterprise

If your org uses GitHub Enterprise, set the base URL in your token scope and ensure your `GITHUB_TOKEN` has access to the GHE instance. The Octokit client will use the token as-is against your configured GitHub endpoint.

## Security notes

- The server never stores tokens — each request reads the `Authorization` header fresh
- No code or test output is sent to external services in self-hosted mode
- All GitHub API calls are made server-side using your token
