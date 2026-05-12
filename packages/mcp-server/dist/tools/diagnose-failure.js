const ERROR_PATTERNS = [
    { pattern: /Error: (.+)/g, label: 'Error' },
    { pattern: /FAIL (.+\.spec\.[tj]sx?)/g, label: 'Failing test file' },
    { pattern: /✕ (.+)/g, label: 'Failed test' },
    { pattern: /× (.+)/g, label: 'Failed test' },
    { pattern: /AssertionError: (.+)/g, label: 'Assertion failed' },
    { pattern: /TypeError: (.+)/g, label: 'Type error' },
    { pattern: /Cannot find module '(.+)'/g, label: 'Missing module' },
    { pattern: /Timeout exceeded/g, label: 'Timeout' },
    { pattern: /locator\.(.+) exceeded/g, label: 'Playwright timeout' },
];
const FILE_PATTERN = /([a-zA-Z0-9_\-./]+\.(ts|tsx|js|jsx|spec\.ts|test\.ts))/g;
export async function handleDiagnoseFailure(input, client) {
    const run = await client.getWorkflowRun(input.repo_url, input.run_id);
    let logs = '';
    try {
        logs = await client.getWorkflowRunLogs(input.repo_url, input.run_id);
    }
    catch {
        logs = `Unable to fetch logs for run ${input.run_id}`;
    }
    const errorMessages = [];
    for (const { pattern, label } of ERROR_PATTERNS) {
        const matches = [...logs.matchAll(pattern)];
        for (const match of matches.slice(0, 5)) {
            errorMessages.push(`[${label}] ${match[1] ?? match[0]}`);
        }
    }
    const affectedFiles = [...new Set([...logs.matchAll(FILE_PATTERN)].map((m) => m[1] ?? ''))].filter(Boolean);
    const rootCause = inferRootCause(logs, errorMessages);
    const suggestedFix = inferFix(rootCause, logs);
    return {
        run_id: input.run_id,
        status: run.conclusion === 'cancelled' ? 'cancelled' : 'failure',
        root_cause: rootCause,
        affected_files: affectedFiles.slice(0, 10),
        error_messages: errorMessages.slice(0, 10),
        suggested_fix: suggestedFix,
    };
}
function inferRootCause(logs, errors) {
    if (logs.includes('Cannot find module')) {
        return 'Missing dependency or incorrect import path';
    }
    if (logs.includes('Timeout exceeded') || logs.includes('locator')) {
        return 'Test timeout — element not found or page load too slow';
    }
    if (logs.includes('AssertionError')) {
        return 'Assertion failed — expected value does not match actual value';
    }
    if (logs.includes('TypeError')) {
        return 'Type error — possible null/undefined access or wrong argument type';
    }
    if (errors.length > 0) {
        return errors[0] ?? 'Unknown error';
    }
    return 'Unknown failure — review the full logs for details';
}
function inferFix(rootCause, _logs) {
    if (rootCause.includes('Missing dependency')) {
        return 'Run `pnpm install` and verify all import paths are correct.';
    }
    if (rootCause.includes('timeout')) {
        return 'Increase the test timeout or add explicit waits (waitForSelector, waitForLoadState).';
    }
    if (rootCause.includes('Assertion failed')) {
        return 'Check the expected vs actual values in the failing assertion and update the test or the source code accordingly.';
    }
    if (rootCause.includes('Type error')) {
        return 'Add null checks or fix the argument types passed to the failing function.';
    }
    return 'Review the error messages above and check the affected files for recent changes.';
}
//# sourceMappingURL=diagnose-failure.js.map