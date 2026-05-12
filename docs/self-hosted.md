# Self-Hosted Deployment

Run ClaudeTest inside your own VPC for air-gapped or compliance-sensitive environments.

## Prerequisites

- Docker 24+
- A GitHub App or Personal Access Token with `repo` and `workflow` scopes

## Quick start

```bash
# Pull the image
docker pull ghcr.io/your-org/claudetest:latest

# Run with your GitHub token
docker run -e GITHUB_TOKEN=ghp_your_token ghcr.io/your-org/claudetest:latest
```

## Docker Compose

```bash
cp .env.example .env
# Edit .env and set GITHUB_TOKEN

docker compose -f docker/docker-compose.yml up -d
```

## Environment variables

| Variable | Required | Description |
|---|---|---|
| `GITHUB_TOKEN` | Yes | GitHub PAT with `repo` and `workflow` scopes |
| `NODE_ENV` | No | Set to `production` (default) |

## Connecting to Claude

Once running, configure the MCP server URL in your Claude settings:

```json
{
  "mcpServers": {
    "claudetest": {
      "command": "node",
      "args": ["/path/to/packages/mcp-server/dist/index.js"],
      "env": {
        "GITHUB_TOKEN": "your-token"
      }
    }
  }
}
```

Or connect via HTTP if you exposed the server on a port.
