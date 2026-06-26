# Feature 008 Plan

## Files

```text
docs/application-conversion-kit.md
docs/job-market-hangzhou.md
docs/interview-kit.md
docs/templates/boss-message.md
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
