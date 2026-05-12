import { z } from 'zod';
export declare const AnalyzeRepoInputSchema: z.ZodObject<{
    repo_url: z.ZodString;
    branch: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    paths: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    branch: string;
    repo_url: string;
    paths?: string[] | undefined;
}, {
    repo_url: string;
    branch?: string | undefined;
    paths?: string[] | undefined;
}>;
export declare const GenerateTestsInputSchema: z.ZodObject<{
    repo_url: z.ZodString;
    file_paths: z.ZodArray<z.ZodString, "many">;
    test_type: z.ZodEnum<["playwright", "appium"]>;
    branch: z.ZodDefault<z.ZodOptional<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    branch: string;
    repo_url: string;
    file_paths: string[];
    test_type: "playwright" | "appium";
}, {
    repo_url: string;
    file_paths: string[];
    test_type: "playwright" | "appium";
    branch?: string | undefined;
}>;
export declare const RunTestsInputSchema: z.ZodObject<{
    repo_url: z.ZodString;
    workflow_id: z.ZodString;
    branch: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    timeout_ms: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
}, "strip", z.ZodTypeAny, {
    branch: string;
    workflow_id: string;
    repo_url: string;
    timeout_ms: number;
}, {
    workflow_id: string;
    repo_url: string;
    branch?: string | undefined;
    timeout_ms?: number | undefined;
}>;
export declare const DiagnoseFailureInputSchema: z.ZodObject<{
    repo_url: z.ZodString;
    run_id: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    run_id: number;
    repo_url: string;
}, {
    run_id: number;
    repo_url: string;
}>;
export declare const CreatePrInputSchema: z.ZodObject<{
    repo_url: z.ZodString;
    branch: z.ZodString;
    title: z.ZodString;
    files: z.ZodArray<z.ZodObject<{
        path: z.ZodString;
        content: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        content: string;
        path: string;
    }, {
        content: string;
        path: string;
    }>, "many">;
    base_branch: z.ZodDefault<z.ZodOptional<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    branch: string;
    title: string;
    repo_url: string;
    files: {
        content: string;
        path: string;
    }[];
    base_branch: string;
}, {
    branch: string;
    title: string;
    repo_url: string;
    files: {
        content: string;
        path: string;
    }[];
    base_branch?: string | undefined;
}>;
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
//# sourceMappingURL=types.d.ts.map