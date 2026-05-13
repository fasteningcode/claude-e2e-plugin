#!/usr/bin/env node
import express from 'express';
import type { Request, Response } from 'express';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

import { getGitHubToken } from './auth/github.js';
import { GitHubClient } from './github/client.js';
import {
  AnalyzeRepoInputSchema,
  CreatePrInputSchema,
  DiagnoseFailureInputSchema,
  GenerateTestsInputSchema,
  RunTestsInputSchema,
} from './types.js';
import { handleAnalyzeRepo } from './tools/analyze-repo.js';
import { handleCreatePr } from './tools/create-pr.js';
import { handleDiagnoseFailure } from './tools/diagnose-failure.js';
import { handleGenerateTests } from './tools/generate-tests.js';
import { handleRunTests } from './tools/run-tests.js';

function toErrorContent(err: unknown): { content: Array<{ type: string; text: string }>; isError: boolean } {
  const message = err instanceof Error ? err.message : String(err);
  return { content: [{ type: 'text', text: `Error: ${message}` }], isError: true };
}

function extractToken(req: Request): string | null {
  const auth = req.headers['authorization'];
  if (auth?.startsWith('Bearer ')) return auth.slice(7);
  return process.env['GITHUB_TOKEN'] ?? null;
}

function createServer(token: string): Server {
  const server = new Server(
    { name: 'claudetest', version: '0.0.1' },
    { capabilities: { tools: {} } },
  );

  // eslint-disable-next-line @typescript-eslint/require-await
  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: [
      {
        name: 'analyze_repo',
        title: 'Analyze Repository Coverage',
        description:
          'Scan a GitHub repository to identify untested flows and coverage gaps. Returns a structured report of what needs tests.',
        annotations: {
          readOnlyHint: true,
          destructiveHint: false,
          idempotentHint: true,
          openWorldHint: true,
        },
        inputSchema: {
          type: 'object',
          properties: {
            repo_url: { type: 'string', description: 'GitHub repository URL' },
            branch: { type: 'string', description: 'Branch to analyze (default: main)' },
            paths: {
              type: 'array',
              items: { type: 'string' },
              description: 'Specific paths to analyze (optional)',
            },
          },
          required: ['repo_url'],
        },
      },
      {
        name: 'generate_tests',
        title: 'Generate Test Files',
        description:
          'Generate Playwright (web) or Appium (mobile) test files for specified source files. Returns file contents — use create_pr to commit them.',
        annotations: {
          readOnlyHint: true,
          destructiveHint: false,
          idempotentHint: true,
          openWorldHint: true,
        },
        inputSchema: {
          type: 'object',
          properties: {
            repo_url: { type: 'string', description: 'GitHub repository URL' },
            file_paths: {
              type: 'array',
              items: { type: 'string' },
              description: 'Source file paths to generate tests for',
            },
            test_type: {
              type: 'string',
              enum: ['playwright', 'appium'],
              description: 'Type of tests to generate',
            },
            branch: { type: 'string', description: 'Branch to read from (default: main)' },
          },
          required: ['repo_url', 'file_paths', 'test_type'],
        },
      },
      {
        name: 'run_tests',
        title: 'Run CI Workflow',
        description:
          'Trigger a GitHub Actions workflow run and wait for results. Returns the run status and summary.',
        annotations: {
          readOnlyHint: false,
          destructiveHint: false,
          idempotentHint: false,
          openWorldHint: true,
        },
        inputSchema: {
          type: 'object',
          properties: {
            repo_url: { type: 'string', description: 'GitHub repository URL' },
            workflow_id: {
              type: 'string',
              description: 'GitHub Actions workflow file name or ID (e.g. test.yml)',
            },
            branch: { type: 'string', description: 'Branch to run workflow on (default: main)' },
            timeout_ms: {
              type: 'number',
              description: 'Max wait time in milliseconds (default: 300000)',
            },
          },
          required: ['repo_url', 'workflow_id'],
        },
      },
      {
        name: 'diagnose_failure',
        title: 'Diagnose CI Failure',
        description:
          'Analyze a failed GitHub Actions run. Returns a plain-English diagnosis: root cause, affected files, and a suggested fix.',
        annotations: {
          readOnlyHint: true,
          destructiveHint: false,
          idempotentHint: true,
          openWorldHint: true,
        },
        inputSchema: {
          type: 'object',
          properties: {
            repo_url: { type: 'string', description: 'GitHub repository URL' },
            run_id: { type: 'number', description: 'GitHub Actions workflow run ID' },
          },
          required: ['repo_url', 'run_id'],
        },
      },
      {
        name: 'create_pr',
        title: 'Create Pull Request',
        description:
          'Create a GitHub pull request with specified files on a new branch. Used to deliver generated tests back to the repository.',
        annotations: {
          readOnlyHint: false,
          destructiveHint: false,
          idempotentHint: false,
          openWorldHint: true,
        },
        inputSchema: {
          type: 'object',
          properties: {
            repo_url: { type: 'string', description: 'GitHub repository URL' },
            branch: { type: 'string', description: 'New branch name for the PR' },
            title: { type: 'string', description: 'Pull request title' },
            files: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  path: { type: 'string' },
                  content: { type: 'string' },
                },
                required: ['path', 'content'],
              },
              description: 'Files to commit',
            },
            base_branch: {
              type: 'string',
              description: 'Base branch to merge into (default: main)',
            },
          },
          required: ['repo_url', 'branch', 'title', 'files'],
        },
      },
    ],
  }));

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const client = new GitHubClient(token);

    try {
      switch (request.params.name) {
        case 'analyze_repo': {
          const input = AnalyzeRepoInputSchema.parse(request.params.arguments);
          const result = await handleAnalyzeRepo(input, client);
          return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
        }
        case 'generate_tests': {
          const input = GenerateTestsInputSchema.parse(request.params.arguments);
          const result = await handleGenerateTests(input, client);
          return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
        }
        case 'run_tests': {
          const input = RunTestsInputSchema.parse(request.params.arguments);
          const result = await handleRunTests(input, client);
          return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
        }
        case 'diagnose_failure': {
          const input = DiagnoseFailureInputSchema.parse(request.params.arguments);
          const result = await handleDiagnoseFailure(input, client);
          return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
        }
        case 'create_pr': {
          const input = CreatePrInputSchema.parse(request.params.arguments);
          const result = await handleCreatePr(input, client);
          return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
        }
        default:
          return toErrorContent(new Error(`Unknown tool: ${request.params.name}`));
      }
    } catch (err) {
      return toErrorContent(err);
    }
  });

  return server;
}

// eslint-disable-next-line @typescript-eslint/require-await
async function startHttp(): Promise<void> {
  const app = express();
  app.use(express.json());

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', name: 'claudetest', auth: 'per-request Bearer token or GITHUB_TOKEN env' });
  });

  async function handleMcp(req: Request, res: Response): Promise<void> {
    const token = extractToken(req);
    if (!token) {
      res.status(401).json({
        error: 'GitHub token required. Pass Authorization: Bearer <token> or set GITHUB_TOKEN.',
      });
      return;
    }
    /* eslint-disable @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any */
    const transport = new StreamableHTTPServerTransport({} as any);
    const server = createServer(token);
    await server.connect(transport as any);
    /* eslint-enable @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any */
    await transport.handleRequest(req, res, req.body);
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    res.on('finish', () => server.close());
  }

  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  app.post('/mcp', handleMcp);
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  app.get('/mcp', handleMcp);

  const port = parseInt(process.env['PORT'] ?? '3000', 10);
  app.listen(port, '0.0.0.0', () => {
    console.log(`ClaudeTest MCP server listening on port ${port}`);
  });
}

function startStdio(): void {
  const token = getGitHubToken();
  const transport = new StdioServerTransport();
  const server = createServer(token);
  void server.connect(transport);
}

const useStdio =
  process.argv.includes('--stdio') || process.env['MCP_TRANSPORT'] === 'stdio';

if (useStdio) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  startStdio();
  process.on('uncaughtException', (err: unknown) => {
    console.error('ClaudeTest MCP server error:', err);
    process.exit(1);
  });
} else {
  startHttp().catch((err: unknown) => {
    console.error('ClaudeTest MCP server error:', err);
    process.exit(1);
  });
}
