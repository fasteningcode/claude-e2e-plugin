import type { GitHubClient } from '../github/client.js';
import type { GenerateTestsInput, TestFile } from '../types.js';
export declare function handleGenerateTests(input: GenerateTestsInput, client: GitHubClient): Promise<{
    test_files: TestFile[];
    summary: string;
}>;
//# sourceMappingURL=generate-tests.d.ts.map