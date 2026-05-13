# Example: Analyze a repo and generate tests

This walkthrough shows the full ClaudeTest workflow on a real Next.js app.

## 1. Analyze for coverage gaps

```
Analyze https://github.com/your-org/your-nextjs-app for missing test coverage
```

**ClaudeTest returns:**
```json
[
  { "priority": "high",   "path": "src/app/checkout/page.tsx",   "reason": "No tests for checkout flow" },
  { "priority": "high",   "path": "src/app/auth/login/page.tsx", "reason": "No tests for login flow" },
  { "priority": "medium", "path": "src/components/CartItem.tsx",  "reason": "Component has no test file" }
]
```

## 2. Generate Playwright tests for high-priority gaps

```
Generate Playwright tests for the high-priority gaps you found
```

**ClaudeTest creates:**
- `tests/checkout.spec.ts` — end-to-end checkout flow
- `tests/auth.spec.ts` — login, logout, and error states

## 3. Open a PR

```
Open a PR with the generated tests on a branch called feat/claudetest-coverage
```

**ClaudeTest:**
1. Creates branch `feat/claudetest-coverage`
2. Commits the test files
3. Opens a PR with a checklist of what was covered

## 4. Diagnose a CI failure

When the PR's CI fails, share the run ID:

```
Diagnose the failure in run 9876543210 in https://github.com/your-org/your-nextjs-app
```

**ClaudeTest returns:**
```
Root cause: The checkout test times out because the payment iframe takes >30s to load.
Affected file: tests/checkout.spec.ts, line 42
Fix: Increase the `waitForSelector` timeout to 60000ms or mock the payment provider.
```
