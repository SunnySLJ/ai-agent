# Review And Finish

Use this reference after all tasks for one feature are implemented.

## Review Checklist

Scan for:

1. Resilience defects: missing retries, timeouts, or circuit breakers.
2. Cross-cutting consistency defects: auth, rate limits, and logging across all endpoints.
3. Defensive coding defects: null handling, input validation, idempotency keys.
4. Database migration defects: rollback scripts and safe batch operations.

Report findings:

```md
| 编号 | 类别 | 文件:行 | 描述 | 修复优先级 |
| --- | --- | --- | --- | --- |
```

If defects exist, return to the relevant task, fix through TDD, and rerun review.

## Finish Branch

When the user asks to finish:

1. Final commit with a message that includes `Closes 00X-<feature>`.
2. Merge back to the main branch if requested and safe.
3. Tag such as `v0.1.0-<feature>` if requested.
4. Update `specs/00X-<feature>/session.md` as complete.
5. Do not delete the feature specs directory.

Use non-destructive git commands and preserve unrelated user changes.

## Retrospective

Write `specs/<feature>/retrospective.md` or the user-specified path with:

1. Spec-kit 4-step value assessment:
   - Which step helped code quality most?
   - Which clarify questions were not covered by brainstorming?
2. TDD handoff 5-step value assessment:
   - How many subagents?
   - First-pass success rate?
   - Re-dispatch count?
   - Review blocker/major/minor count?
3. 9-step coordination vs single workflow:
   - Time cost.
   - Delivery quality.
   - What to choose next time.
