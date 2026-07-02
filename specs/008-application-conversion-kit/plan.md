# Feature 008 Plan

## Files

```text
docs/10-application-conversion-kit.md
docs/08-job-market-hangzhou.md
docs/12-interview-kit.md
docs/templates/T03-boss-message.md
README.md
specs/008-application-conversion-kit/
```

## Approach

This is a documentation feature. It should not change production code.

Inputs:

- Current repo implementation and README files.
- Existing job market, portfolio, and interview docs.
- BOSS search entry URLs for Hangzhou role keywords.

Outputs:

- A single conversion kit that turns project artifacts into job-search actions.
- Cross-links from README and existing docs.

## Source Snapshot

Use BOSS search URLs as live entry points because individual listings change quickly and may require login.

## Verification

- `git diff --check`
- `rg -n "application-conversion-kit|SunnySLJ/ai-agent|AI Agent|RAG" README.md docs`
- `git status --short --branch`
