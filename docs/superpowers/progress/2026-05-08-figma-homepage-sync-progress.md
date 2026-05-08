# Figma Homepage Sync Progress

## Project State

- Branch: `figma-homepage-sync`
- Worktree: `D:\study\Web\Dflc\yinshua\.worktrees\figma-homepage-sync`
- Plan: `docs/superpowers/plans/2026-05-08-figma-homepage-sync.md`
- Source Figma file: `https://www.figma.com/design/6OAxl4rNtwYZ1CxwwKegIx`
- Current owner: Codex subagent-driven workflow
- Last updated: 2026-05-08

## Handoff Rules

- Continue work from this worktree, not the root `master` checkout.
- Keep this file updated after every implementation task and review gate.
- Do not change quote calculation behavior unless a separate plan is approved.
- Treat visible mojibake Chinese strings as defects and rewrite them from the Figma/project requirements.
- Every completed task should have:
  - implementation summary
  - verification command/result
  - reviewer status
  - commit hash

## Status Legend

- `Not Started`: No code changes yet.
- `In Progress`: Implementation is underway.
- `Needs Review`: Implementation done, waiting for spec/code review.
- `Needs Fix`: Review found issues.
- `Done`: Implemented, verified, reviewed, and committed.
- `Blocked`: Cannot continue without decision or external action.

## Master Checklist

| Task | Scope | Status | Owner | Commit | Notes |
| --- | --- | --- | --- | --- | --- |
| 0 | Worktree and progress tracking setup | Done | Codex | `e38e390` | Worktree created; progress doc added and committed. |
| 1 | Extract brand content and clean fallback data | Not Started | Pending subagent | Pending | `brandContent.ts`, `sampleData.ts`, `catalogContext.tsx`. |
| 2 | Build Figma-derived design system | Not Started | Pending subagent | Pending | Shared cards, printing visuals, global CSS tokens. |
| 3 | Replace client shell with Figma navigation/footer | Not Started | Pending subagent | Pending | `BrandShell.tsx`, `App.tsx`. |
| 4 | Implement Figma homepage | Not Started | Pending subagent | Pending | `HomeSections.tsx`, `Home.tsx`. |
| 5 | Restyle client subpages | Not Started | Pending subagent | Pending | Product, quote, history, member pages. |
| 6 | Align mini program with Figma mobile style | Not Started | Pending subagent | Pending | `apps/miniprogram` global and pages. |
| 7 | Content completeness and data backfill | Not Started | Pending subagent | Pending | API seeds/data only if needed. |
| 8 | Responsive and visual verification | Not Started | Pending subagent | Pending | Client build, browser checks, mini program checklist. |

## Current Checkpoint

### Completed

- User approved subagent-driven execution.
- `docs/superpowers/plans/2026-05-08-figma-homepage-sync.md` exists on this branch.
- `.worktrees/` and `worktrees/` are ignored by git.
- Isolated worktree created at `D:\study\Web\Dflc\yinshua\.worktrees\figma-homepage-sync`.
- Progress tracker committed in `e38e390`.
- Baseline client TypeScript check passed.
- Baseline client Vite build passed.

### Environment Notes

- This worktree does not contain `.tools` because it is ignored and project-local.
- The package script `apps/client build` references `..\..\.tools\node\node.exe`, so direct `pnpm --dir apps/client build` fails in the worktree.
- Use the root checkout Node for verification while developing in this worktree:
  - `D:\study\Web\Dflc\yinshua\.tools\node\node.exe apps/client/node_modules/typescript/bin/tsc --noEmit`
  - `D:\study\Web\Dflc\yinshua\.tools\node\node.exe apps/client/node_modules/vite/bin/vite.js build`

### Next Action

1. Dispatch Task 1 implementer subagent with the relevant plan excerpt.

## Review Log

| Date | Task | Review Type | Result | Reviewer Notes |
| --- | --- | --- | --- | --- |
| 2026-05-08 | 0 | Self-check | Done | Progress document created and committed. |

## Verification Log

| Date | Command | Result | Notes |
| --- | --- | --- | --- |
| 2026-05-08 | `git worktree add ... -b figma-homepage-sync` | Pass | Worktree created successfully. |
| 2026-05-08 | `pnpm --dir apps/client build` | Fail | Worktree lacks `.tools`; package script path cannot resolve. |
| 2026-05-08 | root Node + `tsc --noEmit` | Pass | Manual equivalent TypeScript baseline passed. |
| 2026-05-08 | root Node + `vite build` | Pass | Manual equivalent production build passed. |
