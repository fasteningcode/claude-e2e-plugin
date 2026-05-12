import type { GitHubClient } from '../github/client.js';
import type { RunTestsInput, WorkflowRunResult } from '../types.js';

const POLL_INTERVAL_MS = 10_000;
function conclusionToStatus(conclusion: string | null): WorkflowRunResult['status'] {
  switch (conclusion) {
    case 'success': return 'success';
    case 'cancelled': return 'cancelled';
    case 'timed_out': return 'timed_out';
    default: return 'failure';
  }
}

export async function handleRunTests(
  input: RunTestsInput,
  client: GitHubClient,
): Promise<WorkflowRunResult> {
  const branch = input.branch ?? 'main';
  const timeoutMs = input.timeout_ms ?? 300_000;
  const dispatchedAt = new Date().toISOString();

  await client.triggerWorkflow(input.repo_url, input.workflow_id, branch);

  // Wait briefly for GitHub to register the new run
  await sleep(3_000);

  const startTime = Date.now();

  while (Date.now() - startTime < timeoutMs) {
    const run = await client.getLatestWorkflowRun(input.repo_url, input.workflow_id, branch);

    // Only consider runs that were created after we dispatched, to avoid picking up a prior run
    if (run && run.created_at >= dispatchedAt && run.status === 'completed') {
      return {
        run_id: run.id,
        status: conclusionToStatus(run.conclusion),
        conclusion: run.conclusion,
        html_url: run.html_url,
        duration_ms: Date.now() - startTime,
      };
    }

    const remaining = timeoutMs - (Date.now() - startTime);
    if (remaining <= 0) break;
    await sleep(Math.min(POLL_INTERVAL_MS, remaining));
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
