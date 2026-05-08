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
| 1 | Extract brand content and clean fallback data | Done | Codex | `b923ba4`, `0e4a708` | Brand constants and clean fallback sample data implemented; local spec/quality review passed. |
| 2 | Build Figma-derived design system | Done | Codex | `801e099` | Shared cards, printing visuals, and `.lc-*` CSS tokens/classes added; local review passed. |
| 3 | Replace client shell with Figma navigation/footer | Done | Codex | `6ae1783` | `BrandShell.tsx`, `App.tsx`; TypeScript and Vite passed. |
| 4 | Implement Figma homepage | Done | Codex | `5ae9b38` | `Home.tsx`, `brandContent.ts`, homepage `.lc-*` styles; TypeScript and Vite passed. |
| 5 | Restyle client subpages | Done | Codex | Pending | Product, quote, history, member pages aligned with Figma style; TypeScript, Vite, and mojibake scan passed. |
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
- Task 1A brand constants added in `apps/client/src/brandContent.ts`.
- Task 1A TypeScript and Vite verification passed.
- Task 1B fallback sample data rewritten in clean Chinese while preserving quote template relationships.
- Task 1B TypeScript and Vite verification passed.
- Task 1 local spec compliance review passed.
- Task 1 local code quality review passed.
- Task 2 shared card components and printing visual components added.
- Task 2 Figma-derived `.lc-*` CSS token and component classes added without deleting legacy styles.
- Task 2 TypeScript and Vite verification passed.
- Task 2 local spec/code quality review passed.
- Task 3 client shell replaced with Figma-style sticky navigation and footer.
- Task 3 TypeScript and Vite verification passed.
- Task 4 homepage rebuilt with Hero, advantages, products, quote guide/form, industries, materials/crafts, cases, quality/process, testimonials, and CTA.
- Task 4 brand content and printing visual text rewritten in clean Chinese.
- Task 4 TypeScript and Vite verification passed.
- Task 5 shared subpage hero added.
- Task 5 product list, product detail, quote, history, and member center pages restyled to Figma visual language.
- Task 5 quote calculation and save behavior preserved while visible labels and form sections were cleaned.
- Task 5 TypeScript, Vite, and client mojibake scan passed.

### Environment Notes

- This worktree does not contain `.tools` because it is ignored and project-local.
- The package script `apps/client build` references `..\..\.tools\node\node.exe`, so direct `pnpm --dir apps/client build` fails in the worktree.
- Use the root checkout Node for verification while developing in this worktree:
  - `D:\study\Web\Dflc\yinshua\.tools\node\node.exe apps/client/node_modules/typescript/bin/tsc --noEmit`
  - `D:\study\Web\Dflc\yinshua\.tools\node\node.exe apps/client/node_modules/vite/bin/vite.js build`

### Next Action

1. Start Task 6: align mini program mobile style.

## Review Log

| Date | Task | Review Type | Result | Reviewer Notes |
| --- | --- | --- | --- | --- |
| 2026-05-08 | 0 | Self-check | Done | Progress document created and committed. |
| 2026-05-08 | 1A | Self-check | Pass | Added Figma brand constants; `catalogContext` notices are already clean Chinese. |
| 2026-05-08 | 1B | Self-check | Pass | Rewrote fallback categories/products/templates with clean Chinese and kept template relationships valid. |
| 2026-05-08 | 1 | Spec compliance | Pass | Required exports exist; fallback products/templates remain compatible; catalog notices are clean Chinese. |
| 2026-05-08 | 1 | Code quality | Pass | Changes are scoped, typed, and buildable. Terminal display may show mojibake due shell encoding, but TypeScript/Vite pass. |
| 2026-05-08 | 2 | Self-check | Pass | New design-system files are scoped to shared cards, printing visuals, and `.lc-*` CSS classes. |
| 2026-05-08 | 2 | Spec/code quality | Pass | Buildable, scoped additions; legacy styles retained to avoid mid-migration breakage. |
| 2026-05-08 | 3 | Self-check | Pass | Shell now uses `BrandHeader`/`BrandFooter`; old encoded header copy removed from `App.tsx`. |
| 2026-05-08 | 3 | Spec/code quality | Pass | Navigation/footer match requested structure, preserve existing routes, and remain responsive. |
| 2026-05-08 | 4 | Self-check | Pass | Required homepage sections are represented with Figma-derived copy, layout, and reusable visual primitives. |
| 2026-05-08 | 4 | Spec/code quality | Pass | Homepage covers all required homepage modules and keeps quote flow routed to the existing quote page. |
| 2026-05-08 | 5 | Self-check | Pass | Client subpages now share `PageHero`, `.lc-card`, Figma form styling, clean Chinese copy, and existing quote behavior. |
| 2026-05-08 | 5 | Spec/code quality | Pass | Product, detail, quote, history, and member routes build; no visible mojibake pattern remains under `apps/client/src`. |

## Verification Log

| Date | Command | Result | Notes |
| --- | --- | --- | --- |
| 2026-05-08 | `git worktree add ... -b figma-homepage-sync` | Pass | Worktree created successfully. |
| 2026-05-08 | `pnpm --dir apps/client build` | Fail | Worktree lacks `.tools`; package script path cannot resolve. |
| 2026-05-08 | root Node + `tsc --noEmit` | Pass | Manual equivalent TypeScript baseline passed. |
| 2026-05-08 | root Node + `vite build` | Pass | Manual equivalent production build passed. |
| 2026-05-08 | Task 1A root Node + `tsc --noEmit` | Pass | Brand constants compile. |
| 2026-05-08 | Task 1A root Node + `vite build` | Pass | Production build remains green. |
| 2026-05-08 | Task 1B root Node + `tsc --noEmit` | Pass | Clean fallback data type-checks. |
| 2026-05-08 | Task 1B root Node + `vite build` | Pass | Production build remains green after sample data rewrite. |
| 2026-05-08 | Task 2 root Node + `tsc --noEmit` | Pass | Shared components type-check. |
| 2026-05-08 | Task 2 root Node + `vite build` | Pass | Production build remains green after `.lc-*` CSS additions. |
| 2026-05-08 | Task 3 root Node + `tsc --noEmit` | Pass | Figma shell components type-check. |
| 2026-05-08 | Task 3 root Node + `vite build` | Pass | Production build remains green after shell replacement. |
| 2026-05-08 | Task 4 root Node + `tsc --noEmit` | Pass | Homepage modules and clean brand content type-check. |
| 2026-05-08 | Task 4 root Node + `vite build` | Pass | Production build remains green after homepage replacement. |
| 2026-05-08 | Task 5 root Node + `tsc --noEmit` | Pass | Subpage Figma restyle type-checks. |
| 2026-05-08 | Task 5 root Node + `vite build` | Pass | Production build remains green after subpage restyle. |
| 2026-05-08 | Task 5 `rg` mojibake scan under `apps/client/src` | Pass | No configured mojibake patterns found. |
