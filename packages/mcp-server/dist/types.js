import { z } from 'zod';
export const AnalyzeRepoInputSchema = z.object({
    repo_url: z.string().url().describe('GitHub repository URL'),
    branch: z.string().optional().default('main').describe('Branch to analyze'),
    paths: z.array(z.string()).optional().describe('Specific paths to analyze (defaults to all)'),
});
export const GenerateTestsInputSchema = z.object({
    repo_url: z.string().url().describe('GitHub repository URL'),
    file_paths: z.array(z.string()).min(1).describe('Source file paths to generate tests for'),
    test_type: z.enum(['playwright', 'appium']).describe('Type of tests to generate'),
    branch: z.string().optional().default('main'),
});
export const RunTestsInputSchema = z.object({
    repo_url: z.string().url().describe('GitHub repository URL'),
    workflow_id: z.string().describe('GitHub Actions workflow file name or ID'),
    branch: z.string().optional().default('main'),
    timeout_ms: z.number().optional().default(300000).describe('Max wait time in milliseconds'),
});
export const DiagnoseFailureInputSchema = z.object({
    repo_url: z.string().url().describe('GitHub repository URL'),
    run_id: z.number().describe('GitHub Actions workflow run ID'),
});
export const CreatePrInputSchema = z.object({
    repo_url: z.string().url().describe('GitHub repository URL'),
    branch: z.string().describe('New branch name for the PR'),
    title: z.string().describe('Pull request title'),
    files: z
        .array(z.object({
        path: z.string(),
        content: z.string(),
    }))
        .min(1)
        .describe('Files to commit'),
    base_branch: z.string().optional().default('main').describe('Base branch to merge into'),
});
//# sourceMappingURL=types.js.map