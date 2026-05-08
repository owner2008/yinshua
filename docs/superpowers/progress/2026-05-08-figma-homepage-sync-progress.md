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
| 0 | Worktree and progress tracking setup | In Progress | Codex | Pending | Worktree created; this progress doc added. |
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

### Next Action

1. Commit this progress tracking document.
2. Run a baseline client build if available in this worktree.
3. Dispatch Task 1 implementer subagent with the relevant plan excerpt.

## Review Log

| Date | Task | Review Type | Result | Reviewer Notes |
| --- | --- | --- | --- | --- |
| 2026-05-08 | 0 | Self-check | In Progress | Progress document created; commit pending. |

## Verification Log

| Date | Command | Result | Notes |
| --- | --- | --- | --- |
| 2026-05-08 | `git worktree add ... -b figma-homepage-sync` | Pass | Worktree created successfully. |
