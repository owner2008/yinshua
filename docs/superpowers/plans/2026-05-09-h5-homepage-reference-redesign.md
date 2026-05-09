# H5 Homepage Reference Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a mobile-only H5 homepage that closely follows `D:\study\Web\Dflc\yinshua\images\index.png` while keeping the existing PC homepage, subpages, member center, history page, API, and admin deployment intact.

**Architecture:** Add a dedicated mobile homepage layer inside the existing React client, shown only on small screens. Reuse existing brand/product data and local images, but introduce H5-specific sections, navigation, and bottom CTA so the mobile homepage matches the reference instead of being a compressed PC layout.

**Tech Stack:** React, React Router, Vite, CSS media queries, existing `brandContent.ts` data, existing static assets under `apps/client/public`.

---

## Reference Summary

The source reference image is `D:\study\Web\Dflc\yinshua\images\index.png`.

The H5 target has these visual features:

- White mobile header with logo on the left and a blue hamburger icon on the right.
- Compact blue-white hero banner with title `专业印刷 品质传递价值`, short category copy, equipment/product composite visual, carousel dots, and light blue background.
- Product center as small icon/image cards in a 3-column grid.
- Fixed bottom CTA bar with three actions: `在线咨询`, `立即报价`, `拨打电话`.
- Optional lower homepage sections: advantage icons, case cards, quick quote band, and news cards, all compressed for mobile scanning.
- PC layout remains unchanged.

## File Structure

**Modify:**

- `apps/client/src/pages/Home.tsx`
  - Add a mobile-only homepage branch inside `HomePage`.
  - Keep existing PC homepage markup intact.
  - Add H5 sections with predictable class names: `lc-h5-home`, `lc-h5-header`, `lc-h5-hero`, `lc-h5-products`, `lc-h5-bottom-cta`.

- `apps/client/src/styles.css`
  - Add H5-only styles.
  - Hide `.lc-h5-home` on desktop and hide the current `.lc-home-desktop` on mobile.
  - Tune mobile typography, product cards, bottom CTA, and safe-area padding.

- `apps/client/src/brandContent.ts`
  - Add small H5-specific curated arrays if needed: product shortcuts, bottom CTA copy, and mobile hero badges.
  - Do not change existing exports used by PC pages unless strictly necessary.

**Optional Modify:**

- `apps/client/src/components/BrandShell.tsx`
  - If the global header conflicts with H5 reference, hide global header on mobile homepage only via a body/page class or CSS selector.

**Do Not Modify:**

- `apps/client/src/pages/History.tsx`
- `apps/client/src/pages/MemberCenter.tsx`
- `apps/client/src/pages/Quote.tsx`
- `apps/admin/**`
- `apps/api/**`
- `deploy/nas/**`

## Task 1: Preserve Current Homepage As Desktop-Only

**Files:**

- Modify: `apps/client/src/pages/Home.tsx`
- Modify: `apps/client/src/styles.css`

- [ ] **Step 1: Wrap the existing homepage markup**

In `apps/client/src/pages/Home.tsx`, wrap the current returned markup in a desktop container:

```tsx
return (
  <>
    <div className="lc-home lc-home-desktop">
      {/* keep all existing desktop homepage sections exactly as they are */}
    </div>
    <MobileHomePage />
  </>
);
```

Expected: all existing PC homepage content is still present inside `.lc-home-desktop`.

- [ ] **Step 2: Add a placeholder mobile component below `HomePage`**

Add this component in the same file:

```tsx
function MobileHomePage() {
  return (
    <div className="lc-h5-home" aria-label="东方丽彩印刷 H5 首页">
      <div className="lc-h5-placeholder">H5 首页开发中</div>
    </div>
  );
}
```

- [ ] **Step 3: Add visibility CSS**

Append near the mobile homepage styles in `apps/client/src/styles.css`:

```css
.lc-h5-home {
  display: none;
}

@media (max-width: 640px) {
  .lc-home-desktop {
    display: none;
  }

  .lc-h5-home {
    display: block;
    min-height: 100vh;
    padding-bottom: calc(86px + env(safe-area-inset-bottom));
    color: var(--lc-text);
    background: #f6f9ff;
  }
}
```

- [ ] **Step 4: Verify desktop still works**

Run:

```powershell
D:\study\Web\Dflc\yinshua\.tools\node\node.exe apps\client\node_modules\typescript\bin\tsc -p apps\client\tsconfig.json --noEmit
```

Expected: command exits with code `0`.

- [ ] **Step 5: Commit**

```powershell
git -c safe.directory=D:/study/Web/Dflc/yinshua/.worktrees/figma-homepage-sync add apps/client/src/pages/Home.tsx apps/client/src/styles.css
git -c safe.directory=D:/study/Web/Dflc/yinshua/.worktrees/figma-homepage-sync commit -m "feat: add mobile homepage shell"
```

## Task 2: Build H5 Header And Hero

**Files:**

- Modify: `apps/client/src/pages/Home.tsx`
- Modify: `apps/client/src/styles.css`

- [ ] **Step 1: Replace placeholder with H5 header and hero**

In `MobileHomePage`, replace the placeholder with:

```tsx
function MobileHomePage() {
  return (
    <div className="lc-h5-home" aria-label="东方丽彩印刷 H5 首页">
      <header className="lc-h5-header">
        <Link to="/" className="lc-h5-brand" aria-label="东方丽彩印刷首页">
          <span className="lc-h5-logo-mark">LC</span>
          <strong>东方丽彩印刷</strong>
        </Link>
        <button className="lc-h5-menu" type="button" aria-label="打开菜单">
          <span />
          <span />
          <span />
        </button>
      </header>

      <section className="lc-h5-hero">
        <div className="lc-h5-hero-copy">
          <h1>
            专业印刷 <span>品质传递价值</span>
          </h1>
          <p>标签 · 卷标 · 不干胶 · 产品说明书 · 包装 · 宣传册</p>
          <p>可变二维码 · 一物一码标签等印刷产品</p>
        </div>
        <div className="lc-h5-hero-media">
          <img src="/official/qddflc/equipment-uv-line.jpg" alt="标签印刷设备与产品展示" />
        </div>
        <div className="lc-h5-dots" aria-hidden="true">
          <span className="active" />
          <span />
          <span />
        </div>
      </section>
    </div>
  );
}
```

- [ ] **Step 2: Add H5 header CSS**

Add:

```css
@media (max-width: 640px) {
  .lc-h5-header {
    position: sticky;
    top: 0;
    z-index: 50;
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 58px;
    padding: 0 16px;
    background: #ffffff;
    box-shadow: 0 8px 24px rgb(7 26 48 / 8%);
  }

  .lc-h5-brand {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    color: #10243d;
    text-decoration: none;
  }

  .lc-h5-logo-mark {
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

  .lc-h5-brand strong {
    font-size: 15px;
    line-height: 1;
  }

  .lc-h5-menu {
    display: grid;
    gap: 4px;
    width: 36px;
    height: 36px;
    place-content: center;
    border: 0;
    background: transparent;
  }

  .lc-h5-menu span {
    display: block;
    width: 21px;
    height: 2px;
    border-radius: 999px;
    background: #0a6cff;
  }
}
```

- [ ] **Step 3: Add H5 hero CSS**

Add:

```css
@media (max-width: 640px) {
  .lc-h5-hero {
    position: relative;
    overflow: hidden;
    padding: 28px 18px 20px;
    background:
      radial-gradient(circle at 18% 18%, rgb(255 255 255 / 90%), transparent 34%),
      linear-gradient(135deg, #eef6ff 0%, #dcecff 100%);
  }

  .lc-h5-hero-copy h1 {
    margin: 0;
    color: #071a30;
    font-size: 24px;
    line-height: 1.24;
    font-weight: 950;
  }

  .lc-h5-hero-copy h1 span {
    color: #0a54d6;
  }

  .lc-h5-hero-copy p {
    margin: 7px 0 0;
    color: #243b55;
    font-size: 12px;
    line-height: 1.45;
    font-weight: 700;
  }

  .lc-h5-hero-media {
    margin-top: 14px;
  }

  .lc-h5-hero-media img {
    display: block;
    width: 100%;
    height: 170px;
    border-radius: 14px;
    object-fit: cover;
    object-position: center;
  }

  .lc-h5-dots {
    display: flex;
    justify-content: center;
    gap: 6px;
    margin-top: 12px;
  }

  .lc-h5-dots span {
    width: 7px;
    height: 7px;
    border-radius: 999px;
    background: #c8d5e6;
  }

  .lc-h5-dots .active {
    width: 18px;
    background: #0a6cff;
  }
}
```

- [ ] **Step 4: Verify locally**

Run:

```powershell
D:\study\Web\Dflc\yinshua\.tools\node\node.exe node_modules\vite\bin\vite.js build
```

From `apps/client`, expected: build exits with code `0`.

- [ ] **Step 5: Commit**

```powershell
git -c safe.directory=D:/study/Web/Dflc/yinshua/.worktrees/figma-homepage-sync add apps/client/src/pages/Home.tsx apps/client/src/styles.css
git -c safe.directory=D:/study/Web/Dflc/yinshua/.worktrees/figma-homepage-sync commit -m "feat: add h5 hero reference layout"
```

## Task 3: Build H5 Product Center Grid

**Files:**

- Modify: `apps/client/src/pages/Home.tsx`
- Modify: `apps/client/src/styles.css`

- [ ] **Step 1: Add product shortcut data inside `MobileHomePage`**

At the start of `MobileHomePage`, before `return`, add:

```tsx
const h5Products = productCategories.slice(0, 7);
```

- [ ] **Step 2: Add product section after hero**

Add after `</section>` for `.lc-h5-hero`:

```tsx
<section className="lc-h5-section lc-h5-products">
  <div className="lc-h5-section-title">
    <h2>产品中心</h2>
    <p>为客户提供一站式印刷解决方案</p>
  </div>
  <div className="lc-h5-product-grid">
    {h5Products.map((item) => (
      <Link className="lc-h5-product-card" to="/products" key={item.name}>
        <img src={item.imageUrl} alt={item.name} />
        <strong>{item.name}</strong>
      </Link>
    ))}
  </div>
</section>
```

- [ ] **Step 3: Add product grid CSS**

Add:

```css
@media (max-width: 640px) {
  .lc-h5-section {
    padding: 22px 14px;
    background: #ffffff;
  }

  .lc-h5-section-title {
    text-align: center;
  }

  .lc-h5-section-title h2 {
    margin: 0;
    color: #10243d;
    font-size: 20px;
    line-height: 1.2;
    font-weight: 950;
  }

  .lc-h5-section-title p {
    margin: 7px 0 0;
    color: #6a7c92;
    font-size: 12px;
  }

  .lc-h5-product-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 9px;
    margin-top: 18px;
  }

  .lc-h5-product-card {
    display: grid;
    min-height: 104px;
    padding: 9px 7px 10px;
    border: 1px solid #e7edf5;
    border-radius: 10px;
    color: #10243d;
    background: #ffffff;
    text-align: center;
    text-decoration: none;
    box-shadow: 0 8px 18px rgb(7 26 48 / 7%);
  }

  .lc-h5-product-card img {
    width: 100%;
    height: 58px;
    border-radius: 8px;
    object-fit: cover;
  }

  .lc-h5-product-card strong {
    align-self: end;
    margin-top: 8px;
    font-size: 12px;
    line-height: 1.25;
  }
}
```

- [ ] **Step 4: Verify 3-column layout at 375px**

Open:

```text
http://127.0.0.1:5174/
```

Use a 375px mobile viewport. Expected: product cards render in 3 columns and do not overflow horizontally.

- [ ] **Step 5: Commit**

```powershell
git -c safe.directory=D:/study/Web/Dflc/yinshua/.worktrees/figma-homepage-sync add apps/client/src/pages/Home.tsx apps/client/src/styles.css
git -c safe.directory=D:/study/Web/Dflc/yinshua/.worktrees/figma-homepage-sync commit -m "feat: add h5 product center grid"
```

## Task 4: Add H5 Advantage, Cases, And Quick Quote Sections

**Files:**

- Modify: `apps/client/src/pages/Home.tsx`
- Modify: `apps/client/src/styles.css`

- [ ] **Step 1: Add advantage strip**

After the product section, add:

```tsx
<section className="lc-h5-advantages">
  <h2>选择东方丽彩的 <span>4</span> 大优势</h2>
  <div>
    {advantages.slice(0, 4).map((item) => (
      <article key={item.title}>
        <span>{item.mark}</span>
        <strong>{item.title}</strong>
        <p>{item.desc}</p>
      </article>
    ))}
  </div>
</section>
```

- [ ] **Step 2: Add cases section**

Add:

```tsx
<section className="lc-h5-section lc-h5-cases">
  <div className="lc-h5-section-title">
    <h2>案例展示</h2>
    <p>为众多行业客户提供优质印刷产品和服务</p>
  </div>
  <div className="lc-h5-case-list">
    {cases.slice(0, 4).map((item) => (
      <article key={item.title}>
        <img src={item.imageUrl} alt={item.title} />
        <strong>{item.title}</strong>
      </article>
    ))}
  </div>
  <Link className="lc-h5-more" to="/products">
    查看更多案例
  </Link>
</section>
```

- [ ] **Step 3: Add quick quote band**

Add:

```tsx
<section className="lc-h5-quote-band">
  <div>
    <strong>快速报价</strong>
    <span>3 分钟获取专属方案</span>
  </div>
  <Link to="/quote">立即报价</Link>
</section>
```

- [ ] **Step 4: Add CSS**

Add:

```css
@media (max-width: 640px) {
  .lc-h5-advantages {
    padding: 24px 14px;
    color: #ffffff;
    background: linear-gradient(135deg, #145ec7, #0b4aa4);
  }

  .lc-h5-advantages h2 {
    margin: 0;
    text-align: center;
    font-size: 19px;
    line-height: 1.3;
  }

  .lc-h5-advantages h2 span {
    color: #ffca28;
    font-size: 30px;
  }

  .lc-h5-advantages > div {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 10px;
    margin-top: 20px;
  }

  .lc-h5-advantages article {
    display: grid;
    justify-items: center;
    text-align: center;
  }

  .lc-h5-advantages article span {
    display: grid;
    width: 42px;
    height: 42px;
    place-items: center;
    border: 1px solid rgb(255 255 255 / 55%);
    border-radius: 50%;
    font-size: 12px;
    font-weight: 900;
  }

  .lc-h5-advantages article strong {
    margin-top: 9px;
    font-size: 12px;
    line-height: 1.2;
  }

  .lc-h5-advantages article p {
    display: none;
  }

  .lc-h5-case-list {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
    margin-top: 18px;
  }

  .lc-h5-case-list article {
    display: grid;
    gap: 8px;
  }

  .lc-h5-case-list img {
    width: 100%;
    height: 96px;
    border-radius: 10px;
    object-fit: cover;
  }

  .lc-h5-case-list strong {
    color: #10243d;
    font-size: 12px;
    line-height: 1.3;
    text-align: center;
  }

  .lc-h5-more {
    display: flex;
    width: 168px;
    height: 34px;
    align-items: center;
    justify-content: center;
    margin: 18px auto 0;
    border: 1px solid #0a6cff;
    border-radius: 999px;
    color: #0a6cff;
    font-size: 12px;
    font-weight: 800;
    text-decoration: none;
  }

  .lc-h5-quote-band {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 18px 16px;
    color: #ffffff;
    background: linear-gradient(135deg, #145ec7, #0a6cff);
  }

  .lc-h5-quote-band strong,
  .lc-h5-quote-band span {
    display: block;
  }

  .lc-h5-quote-band strong {
    font-size: 22px;
  }

  .lc-h5-quote-band span {
    margin-top: 3px;
    font-size: 13px;
  }

  .lc-h5-quote-band a {
    display: inline-flex;
    min-width: 104px;
    height: 42px;
    align-items: center;
    justify-content: center;
    border-radius: 999px;
    color: #ffffff;
    background: #ff9f1a;
    font-size: 14px;
    font-weight: 900;
    text-decoration: none;
  }
}
```

- [ ] **Step 5: Commit**

```powershell
git -c safe.directory=D:/study/Web/Dflc/yinshua/.worktrees/figma-homepage-sync add apps/client/src/pages/Home.tsx apps/client/src/styles.css
git -c safe.directory=D:/study/Web/Dflc/yinshua/.worktrees/figma-homepage-sync commit -m "feat: add h5 homepage sections"
```

## Task 5: Add Fixed Bottom CTA

**Files:**

- Modify: `apps/client/src/pages/Home.tsx`
- Modify: `apps/client/src/styles.css`

- [ ] **Step 1: Add bottom CTA after homepage sections**

Inside `MobileHomePage`, before the closing `</div>`, add:

```tsx
<nav className="lc-h5-bottom-cta" aria-label="H5 快捷操作">
  <a href={`tel:${brand.mobile}`}>在线咨询</a>
  <Link className="primary" to="/quote">立即报价</Link>
  <a href={`tel:${brand.mobile}`}>拨打电话</a>
</nav>
```

Ensure `brand` is imported from `../brandContent` if it is not already imported.

- [ ] **Step 2: Add bottom CTA CSS**

Add:

```css
@media (max-width: 640px) {
  .lc-h5-bottom-cta {
    position: fixed;
    right: 0;
    bottom: 0;
    left: 0;
    z-index: 70;
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    overflow: hidden;
    padding-bottom: env(safe-area-inset-bottom);
    border-radius: 16px 16px 0 0;
    box-shadow: 0 -12px 28px rgb(7 26 48 / 18%);
  }

  .lc-h5-bottom-cta a {
    display: flex;
    min-height: 48px;
    align-items: center;
    justify-content: center;
    color: #ffffff;
    background: #0a6cff;
    font-size: 13px;
    font-weight: 900;
    text-decoration: none;
  }

  .lc-h5-bottom-cta .primary {
    background: #ff9f1a;
  }

  .lc-h5-bottom-cta a:last-child {
    background: #00a886;
  }
}
```

- [ ] **Step 3: Verify sticky CTA**

Open `http://127.0.0.1:5174/` at 390px width.

Expected:

- CTA stays fixed at the bottom.
- CTA does not cover final content because `.lc-h5-home` has bottom padding.
- Buttons are readable and do not wrap awkwardly.

- [ ] **Step 4: Commit**

```powershell
git -c safe.directory=D:/study/Web/Dflc/yinshua/.worktrees/figma-homepage-sync add apps/client/src/pages/Home.tsx apps/client/src/styles.css
git -c safe.directory=D:/study/Web/Dflc/yinshua/.worktrees/figma-homepage-sync commit -m "feat: add h5 fixed bottom cta"
```

## Task 6: H5 Local Verification And NAS Handoff

**Files:**

- Modify: none unless verification exposes issues.

- [ ] **Step 1: Run typecheck**

```powershell
D:\study\Web\Dflc\yinshua\.tools\node\node.exe apps\client\node_modules\typescript\bin\tsc -p apps\client\tsconfig.json --noEmit
```

Expected: exit code `0`.

- [ ] **Step 2: Build frontend**

From `apps/client`:

```powershell
D:\study\Web\Dflc\yinshua\.tools\node\node.exe node_modules\vite\bin\vite.js build
```

Expected: `✓ built` and exit code `0`.

- [ ] **Step 3: Preview locally**

Start local preview if not already running:

```powershell
Start-Process -FilePath "D:\study\Web\Dflc\yinshua\.tools\node\node.exe" -ArgumentList "node_modules\vite\bin\vite.js --host 127.0.0.1 --port 5174" -WorkingDirectory "D:\study\Web\Dflc\yinshua\.worktrees\figma-homepage-sync\apps\client" -WindowStyle Hidden
```

Open:

```text
http://127.0.0.1:5174/
```

Expected at mobile widths:

- Header matches the reference: logo left, menu right.
- Hero visually resembles the H5 reference image.
- Product center is compact and readable.
- Bottom CTA is fixed.
- No horizontal scrolling.

- [ ] **Step 4: Check desktop is unchanged**

Open the same URL at desktop width.

Expected:

- Existing PC homepage still renders.
- No H5 header or bottom CTA is visible.

- [ ] **Step 5: Build upload instructions**

After final build, upload:

```text
D:\study\Web\Dflc\yinshua\.worktrees\figma-homepage-sync\apps\client\dist
```

to NAS:

```text
qddflc-web/dist
```

If `qddflc-web/dist/admin` exists, preserve it before replacing the frontend dist and copy it back after upload.

- [ ] **Step 6: Commit final verification note if CSS was adjusted**

Only if additional fixes were needed:

```powershell
git -c safe.directory=D:/study/Web/Dflc/yinshua/.worktrees/figma-homepage-sync add apps/client/src/pages/Home.tsx apps/client/src/styles.css
git -c safe.directory=D:/study/Web/Dflc/yinshua/.worktrees/figma-homepage-sync commit -m "fix: polish h5 homepage reference layout"
```

## Acceptance Criteria

- At viewport widths `360px`, `375px`, `390px`, and `414px`, the H5 homepage follows the reference image structure.
- H5 homepage uses a dedicated mobile header and fixed bottom CTA.
- H5 product center displays compact cards and does not overflow horizontally.
- Existing PC homepage remains unchanged at desktop widths.
- Existing routes remain accessible: `/products`, `/quote`, `/member`, `/history`, `/contact`.
- Typecheck and production build pass.
- NAS upload instructions are clear enough for a later worker to continue.

## Self-Review

- Spec coverage: The plan covers mobile header, hero, product grid, advantages, cases, quote band, bottom CTA, desktop preservation, verification, and NAS handoff.
- Placeholder scan: No unresolved placeholder tasks remain.
- Type consistency: Class names and component names are consistent across tasks.
- Scope check: This plan only covers H5 homepage implementation. It does not redesign subpages or the WeChat mini program.
