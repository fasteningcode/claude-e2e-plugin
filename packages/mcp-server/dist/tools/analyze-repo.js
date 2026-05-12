const TEST_FILE_PATTERNS = ['.test.ts', '.spec.ts', '.test.tsx', '.spec.tsx'];
const SOURCE_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx'];
const EXCLUDED_PATHS = ['node_modules', 'dist', '.next', 'coverage', '__tests__'];
function isSourceFile(path) {
    return (SOURCE_EXTENSIONS.some((ext) => path.endsWith(ext)) &&
        !TEST_FILE_PATTERNS.some((p) => path.includes(p)) &&
        !EXCLUDED_PATHS.some((excluded) => path.includes(excluded)));
}
function isTestFile(path) {
    return TEST_FILE_PATTERNS.some((p) => path.includes(p));
}
function inferTestPath(sourcePath) {
    const base = sourcePath.replace(/\.(ts|tsx|js|jsx)$/, '');
    return `${base}.test.ts`;
}
export async function handleAnalyzeRepo(input, client) {
    const branch = input.branch ?? 'main';
    const tree = await client.getFileTree(input.repo_url, branch);
    const allPaths = tree.map((e) => e.path);
    const filtered = input.paths
        ? allPaths.filter((p) => input.paths.some((prefix) => p.startsWith(prefix)))
        : allPaths;
    const sourceFiles = filtered.filter(isSourceFile);
    const testFiles = new Set(filtered.filter(isTestFile));
    const gaps = [];
    for (const sourcePath of sourceFiles) {
        const expectedTestPath = inferTestPath(sourcePath);
        const hasTest = testFiles.has(expectedTestPath) ||
            [...testFiles].some((t) => t.includes(sourcePath.split('/').pop()?.replace(/\.(ts|tsx|js|jsx)$/, '') ?? '') &&
                t !== sourcePath);
        if (!hasTest) {
            const isHighPriority = sourcePath.includes('page') ||
                sourcePath.includes('route') ||
                sourcePath.includes('api') ||
                sourcePath.includes('screen') ||
                sourcePath.includes('component');
            gaps.push({
                file_path: sourcePath,
                description: `No test file found for ${sourcePath}`,
                gap_type: 'missing_test_file',
                priority: isHighPriority ? 'high' : 'medium',
            });
        }
    }
    const summary = `Found ${gaps.length} coverage gap(s) across ${sourceFiles.length} source file(s). ` +
        `${gaps.filter((g) => g.priority === 'high').length} high priority.`;
    return { gaps, summary };
}
//# sourceMappingURL=analyze-repo.js.map