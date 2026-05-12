# ClaudeTest — Quickstart

Connect your GitHub repo to Claude in under 5 minutes.

## 1. Install the plugin

Open Claude and search for **ClaudeTest** in the plugins directory, or visit `claude.com/plugins`.

Click **Connect** and authorize GitHub access (scopes: `repo`, `workflow`).

## 2. Analyze your repo

```
Analyze https://github.com/your-org/your-app for missing test coverage
```

Claude will scan your codebase and return a prioritized list of coverage gaps.

## 3. Generate tests

```
Generate Playwright tests for the files with high-priority gaps
```

Claude will write test files tailored to your framework (Next.js, React, Vue, etc.).

## 4. Open a PR

```
Open a PR with the generated tests on a branch called feat/claudetest-generated
```

Claude creates the branch, commits the files, and opens a PR for your team to review.

## 5. Diagnose a failure

When a CI run fails, paste the run URL or run ID:

```
Diagnose the failure in run 123456789 in https://github.com/your-org/your-app
```

Claude reads the logs, identifies the root cause, and suggests a fix.

---

## Self-hosted deployment

See [self-hosted.md](./self-hosted.md) for running ClaudeTest inside your own VPC.

## Required GitHub permissions

| Permission | Why |
|---|---|
| `repo` read | Read source files and file trees |
| `repo` write | Create branches and commit files |
| `workflow` write | Trigger and read GitHub Actions runs |
| `pull_requests` write | Open PRs with generated tests |
