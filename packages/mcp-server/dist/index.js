#!/usr/bin/env node
import express from 'express';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { CallToolRequestSchema, ListToolsRequestSchema, } from '@modelcontextprotocol/sdk/types.js';
import { getGitHubToken } from './auth/github.js';
import { GitHubClient } from './github/client.js';
import { AnalyzeRepoInputSchema, CreatePrInputSchema, DiagnoseFailureInputSchema, GenerateTestsInputSchema, RunTestsInputSchema, } from './types.js';
import { handleAnalyzeRepo } from './tools/analyze-repo.js';
import { handleCreatePr } from './tools/create-pr.js';
import { handleDiagnoseFailure } from './tools/diagnose-failure.js';
import { handleGenerateTests } from './tools/generate-tests.js';
import { handleRunTests } from './tools/run-tests.js';
function toErrorContent(err) {
    const message = err instanceof Error ? err.message : String(err);
    return { content: [{ type: 'text', text: `Error: ${message}` }], isError: true };
}
function createServer() {
    const server = new Server({ name: 'claudetest', version: '0.0.1' }, { capabilities: { tools: {} } });
    server.setRequestHandler(ListToolsRequestSchema, async () => ({
        tools: [
            {
                name: 'analyze_repo',
                description: 'Scan a GitHub repository to identify untested flows and coverage gaps. Returns a structured report of what needs tests.',
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
                description: 'Generate Playwright (web) or Appium (mobile) test files for specified source files. Returns file contents — use create_pr to commit them.',
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
                description: 'Trigger a GitHub Actions workflow run and wait for results. Returns the run status and summary.',
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
                description: 'Analyze a failed GitHub Actions run. Returns a plain-English diagnosis: root cause, affected files, and a suggested fix.',
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
                description: 'Create a GitHub pull request with specified files on a new branch. Used to deliver generated tests back to the repository.',
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
        let token;
        try {
            token = getGitHubToken();
        }
        catch (err) {
            return toErrorContent(err);
        }
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
        }
        catch (err) {
            return toErrorContent(err);
        }
    });
    return server;
}
async function startHttp() {
    const app = express();
    app.use(express.json());
    app.get('/health', (_req, res) => {
        res.json({ status: 'ok', name: 'claudetest' });
    });
    app.post('/mcp', async (req, res) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const transport = new StreamableHTTPServerTransport({});
        const server = createServer();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await server.connect(transport);
        await transport.handleRequest(req, res, req.body);
        res.on('finish', () => server.close());
    });
    app.get('/mcp', async (req, res) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const transport = new StreamableHTTPServerTransport({});
        const server = createServer();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await server.connect(transport);
        await transport.handleRequest(req, res);
    });
    const port = parseInt(process.env['PORT'] ?? '3000', 10);
    app.listen(port, '0.0.0.0', () => {
        console.log(`ClaudeTest MCP server listening on port ${port}`);
    });
}
async function startStdio() {
    const transport = new StdioServerTransport();
    const server = createServer();
    await server.connect(transport);
}
const useStdio = process.argv.includes('--stdio') || process.env['MCP_TRANSPORT'] === 'stdio';
if (useStdio) {
    startStdio().catch((err) => {
        console.error('ClaudeTest MCP server error:', err);
        process.exit(1);
    });
}
else {
    startHttp().catch((err) => {
        console.error('ClaudeTest MCP server error:', err);
        process.exit(1);
    });
}
//# sourceMappingURL=index.js.map