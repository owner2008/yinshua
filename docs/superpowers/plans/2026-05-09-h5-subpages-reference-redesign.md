# H5 Subpages Reference Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bring all H5 subpages into the same mobile visual system as the approved H5 homepage while preserving existing PC layouts and all business behavior.

**Architecture:** Add shared mobile-only shell styles and lightweight mobile-only helpers, then progressively apply them to product, detail, quote, contact, member, and history pages. Existing React routes and API calls stay intact; mobile-specific changes are CSS-first with minimal markup additions where needed.

**Tech Stack:** React, React Router, Vite, CSS media queries, existing API helpers, existing `CatalogProvider`, existing product/member/quote data flow.

---

## Scope

Mobile H5 pages to align:

- `/products`
- `/products/:id`
- `/quote`
- `/member`
- `/history`
- `/contact`

Must keep:

- PC desktop layouts.
- Existing member center behavior.
- Existing history page behavior.
- Existing quote calculation and save behavior.
- Existing API routes and admin deployment.
- Existing H5 homepage already implemented in `apps/client/src/pages/Home.tsx`.

## Design Direction

Follow the approved H5 homepage and `D:\study\Web\Dflc\yinshua\images\index.png`:

- Compact mobile top spacing.
- White and light-blue page backgrounds.
- Small section headings instead of large PC hero typography.
- Rounded white cards with subtle shadows.
- Dense product grids and horizontally scrollable selectors where useful.
- Fixed bottom navigation for H5 subpages.
- Mobile CTAs should be thumb-friendly and not overlap content.

## File Structure

**Create:**

- `apps/client/src/components/H5Chrome.tsx`
  - Shared H5 page header and bottom tab bar.
  - Keeps subpages visually consistent.

**Modify:**

- `apps/client/src/pages/ProductList.tsx`
  - Add H5 page chrome and mobile product list grouping.

- `apps/client/src/pages/ProductDetail.tsx`
  - Add H5 page chrome and mobile detail cards.

- `apps/client/src/pages/Quote.tsx`
  - Keep quote logic; add mobile page chrome and stronger mobile layout rules.

- `apps/client/src/pages/MemberCenter.tsx`
  - Keep profile/address logic; add mobile page chrome and mobile cards.

- `apps/client/src/pages/History.tsx`
  - Keep quote history logic; add mobile page chrome and mobile list styles.

- `apps/client/src/pages/Contact.tsx`
  - Add H5 page chrome and compact contact cards.

- `apps/client/src/styles.css`
  - Add H5 shared chrome styles and subpage mobile overrides.

**Do Not Modify:**

- `apps/api/**`
- `apps/admin/**`
- `apps/miniprogram/**`
- `deploy/nas/**`

## Task 1: Shared H5 Chrome Component

**Files:**

- Create: `apps/client/src/components/H5Chrome.tsx`
- Modify: `apps/client/src/styles.css`

- [x] **Step 1: Create shared H5 chrome component**

Create `apps/client/src/components/H5Chrome.tsx`:

```tsx
import { Link, NavLink } from 'react-router-dom';

export function H5PageChrome({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="lc-h5-page-chrome" aria-label={title}>
      <div className="lc-h5-page-bar">
        <Link to="/" className="lc-h5-page-brand" aria-label="东方丽彩印刷首页">
          <span>LC</span>
          <strong>东方丽彩印刷</strong>
        </Link>
        <button className="lc-h5-page-menu" type="button" aria-label="打开菜单">
          <span />
          <span />
          <span />
        </button>
      </div>
      <section className="lc-h5-page-title">
        <p>Qingdao Label Printing</p>
        <h1>{title}</h1>
        {subtitle ? <span>{subtitle}</span> : null}
      </section>
    </div>
  );
}

export function H5TabBar() {
  return (
    <nav className="lc-h5-tabbar" aria-label="H5 底部导航">
      <NavLink to="/" end>
        首页
      </NavLink>
      <NavLink to="/products">产品</NavLink>
      <NavLink to="/quote">报价</NavLink>
      <NavLink to="/history">历史</NavLink>
      <NavLink to="/member">我的</NavLink>
    </nav>
  );
}
```

- [x] **Step 2: Add shared H5 chrome CSS**

Append to `apps/client/src/styles.css`:

```css
.lc-h5-page-chrome,
.lc-h5-tabbar {
  display: none;
}

@media (max-width: 640px) {
  .lc-subpage {
    padding-top: 0;
    padding-bottom: calc(72px + env(safe-area-inset-bottom));
    background: #f6f9ff;
  }

  .lc-subpage .lc-page-hero {
    display: none;
  }

  .app-shell:has(.lc-subpage) > .lc-header,
  .app-shell:has(.lc-subpage) > .lc-footer {
    display: none;
  }

  .lc-h5-page-chrome {
    display: block;
    background: #f6f9ff;
  }

  .lc-h5-page-bar {
    position: sticky;
    top: 0;
    z-index: 50;
    display: flex;
    height: 58px;
    align-items: center;
    justify-content: space-between;
    padding: 0 16px;
    background: #ffffff;
    box-shadow: 0 8px 24px rgb(7 26 48 / 8%);
  }

  .lc-h5-page-brand {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    color: #10243d;
    text-decoration: none;
  }

  .lc-h5-page-brand span {
    display: grid;
    width: 28px;
    height: 28px;
    place-items: center;
    border-radius: 50%;
    color: #ffffff;
    font-size: 10px;
    font-weight: 900;
    background: conic-gradient(from 30deg, #0a6cff, #00a886, #ffca28, #ff7a1a, #0a6cff);
  }

  .lc-h5-page-brand strong {
    font-size: 15px;
  }

  .lc-h5-page-menu {
    display: grid;
    width: 36px;
    height: 36px;
    gap: 4px;
    place-content: center;
    border: 0;
    background: transparent;
  }

  .lc-h5-page-menu span {
    display: block;
    width: 21px;
    height: 2px;
    border-radius: 999px;
    background: #0a6cff;
  }

  .lc-h5-page-title {
    margin: 12px 12px 0;
    padding: 20px 18px;
    border-radius: 18px;
    color: #ffffff;
    background:
      radial-gradient(circle at 90% 10%, rgb(255 255 255 / 22%), transparent 32%),
      linear-gradient(135deg, #145ec7, #0a6cff);
    box-shadow: 0 14px 30px rgb(10 108 255 / 18%);
  }

  .lc-h5-page-title p,
  .lc-h5-page-title h1,
  .lc-h5-page-title span {
    margin: 0;
  }

  .lc-h5-page-title p {
    color: rgb(255 255 255 / 72%);
    font-size: 11px;
    font-weight: 800;
  }

  .lc-h5-page-title h1 {
    margin-top: 6px;
    font-size: 24px;
    line-height: 1.2;
  }

  .lc-h5-page-title span {
    display: block;
    margin-top: 8px;
    color: rgb(255 255 255 / 82%);
    font-size: 13px;
    line-height: 1.5;
  }

  .lc-h5-tabbar {
    position: fixed;
    right: 0;
    bottom: 0;
    left: 0;
    z-index: 70;
    display: grid;
    grid-template-columns: repeat(5, minmax(0, 1fr));
    padding: 7px 8px calc(7px + env(safe-area-inset-bottom));
    border-radius: 18px 18px 0 0;
    background: #ffffff;
    box-shadow: 0 -12px 28px rgb(7 26 48 / 16%);
  }

  .lc-h5-tabbar a {
    display: flex;
    min-height: 42px;
    align-items: center;
    justify-content: center;
    border-radius: 12px;
    color: #6a7c92;
    font-size: 12px;
    font-weight: 900;
    text-decoration: none;
  }

  .lc-h5-tabbar a.active {
    color: #0a6cff;
    background: rgb(10 108 255 / 9%);
  }
}
```

- [x] **Step 3: Run typecheck**

```powershell
D:\study\Web\Dflc\yinshua\.tools\node\node.exe apps\client\node_modules\typescript\bin\tsc -p apps\client\tsconfig.json --noEmit
```

Expected: exit code `0`.

- [x] **Step 4: Commit**

```powershell
git -c safe.directory=D:/study/Web/Dflc/yinshua/.worktrees/figma-homepage-sync add apps/client/src/components/H5Chrome.tsx apps/client/src/styles.css
git -c safe.directory=D:/study/Web/Dflc/yinshua/.worktrees/figma-homepage-sync commit -m "feat: add h5 subpage chrome"
```

## Task 2: Product List And Product Detail H5 Layout

**Files:**

- Modify: `apps/client/src/pages/ProductList.tsx`
- Modify: `apps/client/src/pages/ProductDetail.tsx`
- Modify: `apps/client/src/styles.css`

- [x] **Step 1: Add H5 chrome to product list**

In `ProductList.tsx`, import:

```tsx
import { H5PageChrome, H5TabBar } from '../components/H5Chrome';
```

Inside the top-level returned `.lc-subpage`, add `H5PageChrome` before the existing `PageHero` or equivalent hero:

```tsx
<H5PageChrome title="产品中心" subtitle="标签、卷标、不干胶、说明书与包装印刷" />
```

Add `<H5TabBar />` before the closing top-level `</div>`.

- [x] **Step 2: Add H5 chrome to product detail**

In `ProductDetail.tsx`, import:

```tsx
import { H5PageChrome, H5TabBar } from '../components/H5Chrome';
```

Inside the top-level returned `.lc-subpage`, add:

```tsx
<H5PageChrome title="产品详情" subtitle="查看产品应用、材质和报价模板" />
```

Add `<H5TabBar />` before the closing top-level `</div>`.

- [x] **Step 3: Add product H5 CSS**

Append:

```css
@media (max-width: 640px) {
  .lc-subpage .lc-section {
    padding: 22px 0;
  }

  .lc-subpage-product-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
  }

  .lc-subpage-product-grid .lc-product-card {
    padding: 10px;
    border-radius: 14px;
    box-shadow: 0 8px 18px rgb(7 26 48 / 7%);
  }

  .lc-subpage-product-grid .lc-product-visual {
    height: 96px;
    border-radius: 10px;
  }

  .lc-subpage-product-grid h3 {
    margin: 8px 0 4px;
    font-size: 14px;
    line-height: 1.25;
  }

  .lc-subpage-product-grid p {
    display: none;
  }

  .lc-subpage-product-grid .lc-card-actions {
    margin-top: 8px;
  }

  .lc-subpage-product-grid .lc-card-actions a {
    font-size: 12px;
  }

  .lc-detail-layout {
    gap: 16px;
  }

  .lc-detail-media,
  .lc-detail-media img {
    min-height: 220px;
  }

  .lc-detail-copy {
    padding: 2px;
  }
}
```

- [x] **Step 4: Build**

```powershell
D:\study\Web\Dflc\yinshua\.tools\node\node.exe node_modules\vite\bin\vite.js build
```

Expected from `apps/client`: exit code `0`.

- [x] **Step 5: Commit**

```powershell
git -c safe.directory=D:/study/Web/Dflc/yinshua/.worktrees/figma-homepage-sync add apps/client/src/pages/ProductList.tsx apps/client/src/pages/ProductDetail.tsx apps/client/src/styles.css
git -c safe.directory=D:/study/Web/Dflc/yinshua/.worktrees/figma-homepage-sync commit -m "feat: apply h5 layout to product pages"
```

## Task 3: Contact Page H5 Layout

**Files:**

- Modify: `apps/client/src/pages/Contact.tsx`
- Modify: `apps/client/src/styles.css`

- [x] **Step 1: Add H5 chrome**

In `Contact.tsx`, import:

```tsx
import { H5PageChrome, H5TabBar } from '../components/H5Chrome';
```

Inside the top-level `.lc-subpage`, add:

```tsx
<H5PageChrome title="联系我们" subtitle="公司简介、联系方式、产品与设备展示" />
```

Add `<H5TabBar />` before closing the top-level wrapper.

- [x] **Step 2: Add contact H5 CSS**

Append:

```css
@media (max-width: 640px) {
  .lc-contact-layout {
    gap: 14px;
  }

  .lc-contact-intro,
  .lc-contact-card {
    padding: 18px;
    border-radius: 16px;
  }

  .lc-contact-card dl {
    gap: 10px;
  }

  .lc-official-gallery {
    gap: 12px;
  }

  .lc-official-gallery .lc-card {
    border-radius: 14px;
    overflow: hidden;
  }

  .lc-official-gallery img {
    height: 132px;
  }
}
```

- [x] **Step 3: Build**

Run frontend build from `apps/client`. Expected: exit code `0`.

- [ ] **Step 4: Commit**

```powershell
git -c safe.directory=D:/study/Web/Dflc/yinshua/.worktrees/figma-homepage-sync add apps/client/src/pages/Contact.tsx apps/client/src/styles.css
git -c safe.directory=D:/study/Web/Dflc/yinshua/.worktrees/figma-homepage-sync commit -m "feat: apply h5 layout to contact page"
```

## Task 4: Quote Page H5 Layout

**Files:**

- Modify: `apps/client/src/pages/Quote.tsx`
- Modify: `apps/client/src/styles.css`

- [x] **Step 1: Add H5 chrome**

In `Quote.tsx`, import:

```tsx
import { H5PageChrome, H5TabBar } from '../components/H5Chrome';
```

Inside the top-level `.lc-subpage`, add:

```tsx
<H5PageChrome title="在线报价" subtitle="选择产品、尺寸、材质与工艺后生成参考报价" />
```

Add `<H5TabBar />` before closing the top-level wrapper.

- [x] **Step 2: Add quote H5 CSS**

Append:

```css
@media (max-width: 640px) {
  .lc-quote-page {
    width: calc(100% - 24px);
    gap: 14px;
    padding-bottom: 28px;
  }

  .lc-product-selector {
    gap: 10px;
    padding: 0 0 10px;
  }

  .lc-product-selector button {
    flex-basis: 156px;
    padding: 10px;
    border-radius: 14px;
  }

  .lc-product-selector .lc-product-visual {
    height: 92px;
  }

  .lc-form-panel,
  .lc-selected-product,
  .lc-quote-result {
    padding: 18px;
    border-radius: 16px;
  }

  .lc-form-panel .lc-section-heading h2 {
    font-size: 20px;
  }

  .lc-form-grid {
    gap: 12px;
  }

  .field input,
  .field select,
  .field textarea {
    min-height: 44px;
    border-radius: 12px;
  }
}
```

- [x] **Step 3: Build**

Run frontend build from `apps/client`. Expected: exit code `0`.

- [ ] **Step 4: Commit**

```powershell
git -c safe.directory=D:/study/Web/Dflc/yinshua/.worktrees/figma-homepage-sync add apps/client/src/pages/Quote.tsx apps/client/src/styles.css
git -c safe.directory=D:/study/Web/Dflc/yinshua/.worktrees/figma-homepage-sync commit -m "feat: apply h5 layout to quote page"
```

## Task 5: Member And History H5 Layout

**Files:**

- Modify: `apps/client/src/pages/MemberCenter.tsx`
- Modify: `apps/client/src/pages/History.tsx`
- Modify: `apps/client/src/styles.css`

- [ ] **Step 1: Add H5 chrome to member center**

In `MemberCenter.tsx`, import:

```tsx
import { H5PageChrome, H5TabBar } from '../components/H5Chrome';
```

Inside top-level `.lc-subpage`, add:

```tsx
<H5PageChrome title="会员中心" subtitle="维护客户资料、地址与常用联系信息" />
```

Add `<H5TabBar />` before closing top-level wrapper.

- [ ] **Step 2: Add H5 chrome to history page**

In `History.tsx`, import:

```tsx
import { H5PageChrome, H5TabBar } from '../components/H5Chrome';
```

Inside top-level `.lc-subpage`, add:

```tsx
<H5PageChrome title="报价历史" subtitle="查看已保存的标签印刷报价记录" />
```

Add `<H5TabBar />` before closing top-level wrapper.

- [ ] **Step 3: Add member/history H5 CSS**

Append:

```css
@media (max-width: 640px) {
  .lc-member-layout,
  .lc-history-list {
    gap: 14px;
  }

  .lc-member-panel,
  .lc-history-card,
  .lc-address-card {
    padding: 18px;
    border-radius: 16px;
  }

  .lc-history-card {
    grid-template-columns: 1fr;
  }

  .lc-history-price {
    justify-items: start;
  }

  .lc-member-actions,
  .lc-history-actions {
    display: grid;
    grid-template-columns: 1fr;
  }

  .lc-member-actions .lc-button,
  .lc-history-actions .lc-button {
    width: 100%;
  }
}
```

- [ ] **Step 4: Build**

Run frontend build from `apps/client`. Expected: exit code `0`.

- [ ] **Step 5: Commit**

```powershell
git -c safe.directory=D:/study/Web/Dflc/yinshua/.worktrees/figma-homepage-sync add apps/client/src/pages/MemberCenter.tsx apps/client/src/pages/History.tsx apps/client/src/styles.css
git -c safe.directory=D:/study/Web/Dflc/yinshua/.worktrees/figma-homepage-sync commit -m "feat: apply h5 layout to member and history pages"
```

## Task 6: Final Verification

**Files:**

- Modify: none unless verification shows issues.

- [ ] **Step 1: Typecheck**

```powershell
D:\study\Web\Dflc\yinshua\.tools\node\node.exe apps\client\node_modules\typescript\bin\tsc -p apps\client\tsconfig.json --noEmit
```

Expected: exit code `0`.

- [ ] **Step 2: Build**

From `apps/client`:

```powershell
D:\study\Web\Dflc\yinshua\.tools\node\node.exe node_modules\vite\bin\vite.js build
```

Expected: `✓ built` and exit code `0`.

- [ ] **Step 3: Local mobile check**

Open `http://127.0.0.1:5174/` and check these routes at 390px width:

```text
/
/products
/products/1
/quote
/member
/history
/contact
```

Expected:

- No horizontal scroll.
- H5 chrome appears on subpages.
- H5 homepage remains as approved.
- Bottom tabbar appears on subpages.
- Existing business flows still render.

- [ ] **Step 4: Desktop check**

Open the same routes at desktop width.

Expected:

- PC header and footer still appear.
- PC subpage heroes still appear.
- No H5 tabbar appears.

- [ ] **Step 5: Commit polish if needed**

Only if verification required additional CSS fixes:

```powershell
git -c safe.directory=D:/study/Web/Dflc/yinshua/.worktrees/figma-homepage-sync add apps/client/src
git -c safe.directory=D:/study/Web/Dflc/yinshua/.worktrees/figma-homepage-sync commit -m "fix: polish h5 subpage layout"
```

## Acceptance Criteria

- H5 subpages visually match the approved H5 homepage style.
- `/member` and `/history` remain present and functional.
- `/quote` retains calculation and save flow.
- `/products` and `/products/:id` retain catalog API behavior.
- PC layout remains unchanged.
- Typecheck and production build pass.
- Latest `apps/client/dist` is ready for NAS upload.

## Self-Review

- Spec coverage: All six subpage routes are covered.
- Placeholder scan: No unresolved placeholders remain.
- Type consistency: `H5PageChrome` and `H5TabBar` names are used consistently.
- Scope check: This plan covers H5 subpages only; it does not redesign admin or WeChat mini program.
