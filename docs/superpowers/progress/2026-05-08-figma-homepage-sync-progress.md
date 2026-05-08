# Figma Homepage Sync Progress

Date: 2026-05-08
Branch: `figma-homepage-sync`
Worktree: `D:\study\Web\Dflc\yinshua\.worktrees\figma-homepage-sync`
Plan: `docs/superpowers/plans/2026-05-08-figma-homepage-sync.md`

## Overall Status

| Task | Scope | Status | Commit | Notes |
| --- | --- | --- | --- | --- |
| 0 | Worktree and baseline | Done | `2baaa3c` | Isolated worktree created and tracked |
| 1 | Baseline verification | Done | `97251b4` | Client TypeScript/build baseline verified |
| 2 | Brand content constants | Done | `9e61182` | Printing business content cleaned and centralized |
| 3 | Figma design system shell | Done | `ee39c55` | Shared shell, tokens and navigation added |
| 4 | Homepage implementation | Done | `88aab5e` | Homepage aligned with Figma structure and conversion modules |
| 5 | Client subpages | Done | `c9de431` | Product, quote, history and member pages restyled |
| 6 | Mini program mobile style | Done | `0f24754` | Mini program homepage, product, quote and account pages aligned |
| 7 | Content completeness and data backfill | Done | `8a47554` | API and SQL seed data rewritten for label printing business |
| 8 | Final verification and handoff | Done | `5b8b510` | Final client/API verification completed |
| 9 | Browser visual QA for retained pages | Done | Pending commit | History/member pages retained and polished after browser check |
| 10 | Homepage visual fidelity and product imagery pass | Done | Pending commit | Reworked product imagery, quality control and trust modules |
| 11 | Subpage typography refinement | Done | Pending commit | Reduced oversized functional page titles and section headings |

## Completed Details

### Task 0 - Worktree and baseline

- Created the `figma-homepage-sync` branch/worktree.
- Added this progress tracker so future contributors can continue from an explicit checklist.

### Task 1 - Baseline verification

- Verified the client app could type-check and build before Figma implementation work.
- Confirmed the existing client structure and routing.

### Task 2 - Brand content constants

- Added clean brand/product/process/application/case content for:
  - Label printing
  - Roll labels
  - Food and beverage labels
  - Daily chemical and beauty labels
  - Medical and health labels
  - Industrial and electronic labels
  - Anti-counterfeit labels
  - Variable QR code and one-item-one-code labels
  - Manuals, packaging boxes and brochure printing

### Task 3 - Figma design system shell

- Added shared brand shell, navigation, footer, CTA behavior and responsive rules.
- Added Figma-inspired color, spacing, surface, shadow and component styling.

### Task 4 - Homepage implementation

- Implemented the homepage modules required by the Figma brief:
  - Hero
  - Core advantages
  - Product categories
  - Three-step quote guide
  - Industry applications
  - Materials and processes
  - Case studies
  - Quality assurance
  - Cooperation flow
  - Testimonials and brand trust
  - Bottom CTA

### Task 5 - Client subpages

- Added `apps/client/src/components/PageHero.tsx`.
- Restyled:
  - `apps/client/src/pages/ProductList.tsx`
  - `apps/client/src/pages/ProductDetail.tsx`
  - `apps/client/src/pages/Quote.tsx`
  - `apps/client/src/pages/History.tsx`
  - `apps/client/src/pages/MemberCenter.tsx`
  - `apps/client/src/quoteRequirements.ts`
  - `apps/client/src/quoteFeeNotes.ts`
  - `apps/client/src/styles.css`
- Preserved quote calculation and history behavior while replacing old visual language.
- Important requirement:
  - The supplied Figma file does not include the history page or member center page.
  - These two pages must be retained in the project and kept visually consistent with the new Figma-inspired website style.
  - Do not remove `/history` or `/member` routes during later Figma fidelity work.
- Verification:
  - Client `tsc --noEmit`: passed
  - Client `vite build`: passed
  - Client source mojibake scan: passed

### Task 6 - Mini Program Mobile Style

- Restyled the mini program around the same blue/white/orange professional label-printing system.
- Updated:
  - `apps/miniprogram/app.wxss`
  - `apps/miniprogram/utils/sample-data.js`
  - `apps/miniprogram/pages/index/index.js`
  - `apps/miniprogram/pages/index/index.wxml`
  - `apps/miniprogram/pages/index/index.wxss`
  - `apps/miniprogram/pages/product-list/index.wxml`
  - `apps/miniprogram/pages/product-detail/index.wxml`
  - `apps/miniprogram/pages/history/index.wxml`
  - `apps/miniprogram/pages/member/index.wxml`
  - `apps/miniprogram/pages/quote/index.js`
  - `apps/miniprogram/pages/quote/index.wxml`
- Verification:
  - Mini program JS syntax check: passed
  - Mini program mojibake scan: passed
  - Client `tsc --noEmit`: passed
  - Client `vite build`: passed

### Task 7 - Content Completeness and Data Backfill

- Rewrote `apps/api/prisma/seed.ts`.
- Rewrote `database/seeds/dev.sql`.
- Seed data now covers:
  - Homepage banners and brand content
  - Product categories and product records
  - Product templates/options
  - Materials and material prices
  - Processes and process prices
  - Print prices
  - Quote rules
  - Member levels
  - Case/equipment/content entries
  - Initial admin account and permissions
- Verification:
  - `D:\study\Web\Dflc\yinshua\.tools\node\node.exe apps\api\node_modules\prisma\build\index.js generate --schema apps\api\prisma\schema.prisma`: passed
  - `D:\study\Web\Dflc\yinshua\.tools\node\pnpm.CMD --dir apps/api build`: passed
- Note:
  - Some shell read/diff commands against files with large Chinese content triggered a Windows sandbox refresh error after the Prisma generation step. The build completed successfully after regenerating Prisma Client.

## Next Tasks

### Task 8 - Final Verification and Handoff

- Status: Done
- Final verification:
  - `D:\study\Web\Dflc\yinshua\.tools\node\node.exe apps\client\node_modules\typescript\bin\tsc -p apps\client\tsconfig.json --noEmit`: passed
  - `D:\study\Web\Dflc\yinshua\.tools\node\node.exe node_modules\vite\bin\vite.js build` from `apps/client`: passed
  - `D:\study\Web\Dflc\yinshua\.tools\node\node.exe apps\api\node_modules\prisma\build\index.js generate --schema apps\api\prisma\schema.prisma`: passed
  - `D:\study\Web\Dflc\yinshua\.tools\node\pnpm.CMD --dir apps/api build`: passed
- Handoff notes:
  - Client website, subpages, mini program, and seed data now share the same high-end label-printing brand direction.
  - Follow-up implementation can start from API integration, admin content editing, quote submission persistence, or pixel QA against the original Figma frame.

### Task 9 - Browser Visual QA for Retained Pages

- Status: Done
- Reason:
  - The supplied Figma file does not include history and member center screens, but these routes are required by the existing product.
- Browser checks:
  - `http://127.0.0.1:5174/#/`
  - `http://127.0.0.1:5174/#/products`
  - `http://127.0.0.1:5174/#/quote`
  - `http://127.0.0.1:5174/#/history`
  - `http://127.0.0.1:5174/#/member`
- Findings and fixes:
  - `/history` and `/member` were present, but API fallback displayed raw `HTTP 500` copy when the API service was unavailable.
  - Replaced raw API error text with user-friendly offline/service-unavailable notices.
  - Added global light background overrides so retained subpages do not leak the old dark/gold theme.
- Verification:
  - Browser route scan confirmed the five routes render expected headings.
  - Browser route scan found no raw `HTTP 500` on `/history` or `/member`.
  - Browser route scan found no visible mojibake markers in the checked routes.
  - Browser console error check returned no errors.
  - Client `tsc -p apps/client/tsconfig.json --noEmit`: passed.
  - Client `vite build`: passed.

### Task 10 - Homepage Visual Fidelity and Product Imagery Pass

- Status: Done
- Reason:
  - Manual review found the homepage still differed from the Figma direction in several high-impact modules.
  - Product/case areas used too many abstract placeholder visuals and did not show real packaging/label products.
- Changes:
  - Added network product imagery for product categories and case cards.
  - Added fallback product image mapping by product code so product list/detail/quote pages can show product photos when API data has no image.
  - Reworked `工厂实力与品控流程，支撑稳定交付` into a stronger factory visual module with production photo, quality stats, six quality cards and a cooperation timeline.
  - Reworked `被企业客户信任的稳定印刷服务` into a centered trust module with testimonials and industry logo wall.
- Image sources used:
  - Pexels product/packaging/factory images from free-use pages.
  - Pexels commercial-use reference: all photos and videos can be used for commercial projects, subject to depicted third-party rights.
- Verification:
  - Network image URL checks returned HTTP 200 for the selected product/factory images.
  - Browser homepage scan confirmed 17 image nodes after the update.
  - Browser scans for `/`, `/products`, `/quote`, `/history`, `/member` found no raw `HTTP 500`, no mojibake markers and no old theme words.
  - Browser console error check returned no errors.
  - Client `tsc -p apps/client/tsconfig.json --noEmit`: passed.
  - Client `vite build`: passed.

### Task 11 - Subpage Typography Refinement

- Status: Done
- Reason:
  - Manual review found some subpage titles were too large for functional pages.
  - The shared `PageHero` inherited a homepage-like title scale.
- Changes:
  - Scoped subpage hero title scale from `clamp(36px, 5vw, 62px)` down to `clamp(30px, 3.2vw, 46px)`.
  - Added mobile-specific subpage title limits at `28px - 36px`.
  - Reduced subpage section heading scale and card heading scale for product detail, quote, history and member center pages.
  - Added a dedicated member center panel title scale.
- Verification:
  - Browser route scan checked `/products`, `/quote`, `/history`, `/member`.
  - Browser scan confirmed expected headings remain visible.
  - Browser scan found no raw `HTTP 500`, no mojibake markers and no old theme words.
  - Browser console error check returned no errors.
  - Client `tsc -p apps/client/tsconfig.json --noEmit`: passed.
  - Client `vite build`: passed.
