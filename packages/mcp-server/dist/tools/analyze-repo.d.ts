import type { GitHubClient } from '../github/client.js';
import type { AnalyzeRepoInput, CoverageGap } from '../types.js';
export declare function handleAnalyzeRepo(input: AnalyzeRepoInput, client: GitHubClient): Promise<{
    gaps: CoverageGap[];
    summary: string;
}>;
//# sourceMappingURL=analyze-repo.d.ts.map