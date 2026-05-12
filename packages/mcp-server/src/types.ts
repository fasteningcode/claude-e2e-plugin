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
    .array(
      z.object({
        path: z.string(),
        content: z.string(),
      }),
    )
    .min(1)
    .describe('Files to commit'),
  base_branch: z.string().optional().default('main').describe('Base branch to merge into'),
});

export type AnalyzeRepoInput = z.infer<typeof AnalyzeRepoInputSchema>;
export type GenerateTestsInput = z.infer<typeof GenerateTestsInputSchema>;
export type RunTestsInput = z.infer<typeof RunTestsInputSchema>;
export type DiagnoseFailureInput = z.infer<typeof DiagnoseFailureInputSchema>;
export type CreatePrInput = z.infer<typeof CreatePrInputSchema>;

export interface CoverageGap {
  file_path: string;
  description: string;
  gap_type: 'missing_test_file' | 'uncovered_flow' | 'missing_assertions';
  priority: 'high' | 'medium' | 'low';
}

export interface TestFile {
  path: string;
  content: string;
  test_type: 'playwright' | 'appium';
}

export interface DiagnosisReport {
  run_id: number;
  status: 'failure' | 'cancelled' | 'timed_out';
  root_cause: string;
  affected_files: string[];
  error_messages: string[];
  suggested_fix: string;
}

export interface WorkflowRunResult {
  run_id: number;
  status: 'success' | 'failure' | 'cancelled' | 'timed_out';
  conclusion: string | null;
  html_url: string;
  duration_ms: number;
}

export interface PullRequestResult {
  pr_number: number;
  html_url: string;
  title: string;
  branch: string;
}
