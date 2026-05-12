import type { GitHubClient } from '../github/client.js';
import type { RunTestsInput, WorkflowRunResult } from '../types.js';

const POLL_INTERVAL_MS = 10_000;
const TERMINAL_STATUSES = new Set(['completed', 'cancelled', 'timed_out']);

export async function handleRunTests(
  input: RunTestsInput,
  client: GitHubClient,
): Promise<WorkflowRunResult> {
  const branch = input.branch ?? 'main';
  const timeoutMs = input.timeout_ms ?? 300_000;

  await client.triggerWorkflow(input.repo_url, input.workflow_id, branch);

  // Wait briefly for GitHub to register the new run
  await sleep(3_000);

  const startTime = Date.now();

  while (Date.now() - startTime < timeoutMs) {
    const run = await client.getLatestWorkflowRun(input.repo_url, input.workflow_id, branch);

    if (run && TERMINAL_STATUSES.has(run.status ?? '')) {
      const conclusion = run.conclusion ?? 'unknown';
      return {
        run_id: run.id,
        status: conclusion === 'success' ? 'success' : 'failure',
        conclusion,
        html_url: run.html_url,
        duration_ms: Date.now() - startTime,
      };
    }

    await sleep(POLL_INTERVAL_MS);
  }

  const finalRun = await client.getLatestWorkflowRun(input.repo_url, input.workflow_id, branch);
  return {
    run_id: finalRun?.id ?? 0,
    status: 'timed_out',
    conclusion: null,
    html_url: finalRun?.html_url ?? '',
    duration_ms: timeoutMs,
  };
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
