---
name: shuang-cut
description: >-
  中文：本地视频剪映粗剪执行器；从本地视频文件夹和素材库生成安全、可审查的 Mac 剪映草稿。
  English: Local Jianying rough-cut executor that creates a safe, reviewable Mac Jianying draft from a local video folder and asset library.
---

# Auto Jianying Cut

Create a new reviewable Mac Jianying rough-cut draft from a local video folder. Never modify an existing Jianying draft in place.

## Required inputs

Ask for any missing input before running commands:

- local video folder path;
- local asset library path;
- editing mode: `conservative`, `balanced`, or `aggressive`;
- new draft name;
- whether this should be a `--dry-run`.

## Safety rules

- Default to `--dry-run` unless the user explicitly asks to create a draft.
- Never overwrite an existing draft.
- If Jianying schema verification has not been completed, do not create a real draft.
- Keep the media manifest, decision JSON, matched asset JSON, and review report for every run.
- Use local cliproxy GPT-5.5 only; do not require Doubao.
- If cliproxy fails, stop and report the failure instead of guessing output.

## Workflow

1. Validate paths and mode.
2. Run the CLI with fake adapters first if the user is testing setup.
3. For live runs, `CLIPROXY_BASE_URL` and `CLIPROXY_MODEL` are optional overrides. Defaults are local `http://127.0.0.1:3000` and `gpt-5.5`.
4. Run:

```bash
jianying-auto-cut run \
  --video-folder "<video-folder-path>" \
  --asset-library "<asset-library-path>" \
  --mode balanced \
  --draft-name "<new-draft-name>" \
  --artifact-root artifacts \
  --dry-run
```

5. Show the user the output artifact paths.
6. Ask the user to review `review.md` before any non-dry-run draft creation.

## Editing mode guidance

- `conservative`: minimal cuts, lowest risk.
- `balanced`: default, moderate rough-cut automation.
- `aggressive`: highest time savings, highest review burden.
