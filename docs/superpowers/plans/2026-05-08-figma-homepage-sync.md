# Figma Homepage Sync Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将 Figma 文件 `6OAxl4rNtwYZ1CxwwKegIx` 中的青岛东方丽彩包装印刷官网首页同步到本项目，并让 PC/H5、子页面、微信小程序保持同一套高端标签印刷品牌视觉。

**Architecture:** 以 `apps/client` 为主实现官网首页与 H5 子页面统一风格，抽取前台设计 token、通用模块数据和可复用 UI 组件；再把相同品牌 token 与内容映射到 `apps/miniprogram`。不改报价 API 的核心业务逻辑，只补齐前台展示内容、文案、视觉组件和必要的静态数据。

**Tech Stack:** React 19, React Router 7, Vite 6, TypeScript, CSS, 微信小程序 WXML/WXSS/JS, NestJS/Prisma 现有 API 数据模型。

---

## Source Design

- Figma file: `https://www.figma.com/design/6OAxl4rNtwYZ1CxwwKegIx`
- Primary desktop frame: `PC 端首页 / 1440`
- Mobile preview frame: `移动端首页预览 / 390`
- Specs frame: `设计规范与前端交付说明`

The implementation must follow the corrected Figma direction:

- Brand: 青岛东方丽彩包装印刷公司
- Visual language: industrial manufacturing + brand packaging + digital traceability
- Main colors: ink navy `#071A30`, deep navy `#0B1D34`, tech blue `#0A6CFF`, quote orange `#FF7A1A`, teal green `#00A886`, light surface `#F7FAFE`
- Main conversion: fast online quote
- Required homepage sections: navigation, hero, advantages, products, quote guide, industries, material/process, cases, quality/process, testimonials, CTA, footer

## Current Project Findings

- Frontend app lives in `apps/client`.
- Mini program lives in `apps/miniprogram`.
- API and admin already manage catalog, content, products, members, quote rules, and quote calculation.
- Current `apps/client/src/styles.css` uses an older dark/gold theme (`graphite`, `ivory`, `forest`), which conflicts with the Figma ink-blue/tech-blue/orange direction.
- Several source files currently contain mojibake Chinese strings, including `apps/client/src/App.tsx`, `apps/client/src/pages/Home.tsx`, `apps/client/src/pages/ProductList.tsx`, `apps/client/src/pages/Quote.tsx`, `apps/client/src/sampleData.ts`, and mini program WXML files. These must be rewritten as clean UTF-8 Chinese during implementation.

## File Structure

### Create

- `apps/client/src/brandContent.ts`
  - Owns homepage sections, product categories, industries, material/process labels, case content, quality promises, cooperation process, testimonials, footer content, and fallback brand copy.
- `apps/client/src/components/BrandShell.tsx`
  - Website header, desktop navigation, mobile navigation entry, shared footer, final CTA wrapper.
- `apps/client/src/components/PrintingVisuals.tsx`
  - CSS-only/Figma-inspired label roll, bottle label, QR code, CMYK dots, product thumbnail, material sample visuals.
- `apps/client/src/components/HomeSections.tsx`
  - Homepage section components: hero, advantages, product categories, quote guide, industries, material/process, cases, quality/process, testimonials, CTA.
- `apps/client/src/components/PageHero.tsx`
  - Shared subpage hero/banner component to make ProductList, ProductDetail, Quote, History, MemberCenter visually consistent.
- `apps/client/src/components/cards.tsx`
  - Shared `FeatureCard`, `ProductCategoryCard`, `CaseCard`, `IndustryCard`, `InfoChip`, and `ProcessStep`.

### Modify

- `apps/client/src/App.tsx`
  - Replace the old topbar/tabs shell with Figma-style fixed header and footer shell.
  - Keep existing routes.
- `apps/client/src/pages/Home.tsx`
  - Replace current homepage with Figma section order and content.
- `apps/client/src/pages/ProductList.tsx`
  - Apply the same page hero, card grid, filter chip style, and product content copy.
- `apps/client/src/pages/ProductDetail.tsx`
  - Apply subpage hero, product media panel, quote CTA, material/process detail panels.
- `apps/client/src/pages/Quote.tsx`
  - Preserve quote calculation behavior; restyle form as Figma quote-guide/form language and clean all Chinese labels.
- `apps/client/src/pages/History.tsx`
  - Apply same shell, card styling, empty state, and quote history typography.
- `apps/client/src/pages/MemberCenter.tsx`
  - Apply same shell, form/card styling, member/address text cleanup.
- `apps/client/src/sampleData.ts`
  - Replace mojibake fallback categories/products/templates with clean Chinese data matching the Figma product list.
- `apps/client/src/catalogContext.tsx`
  - Replace fallback notices with clean Chinese.
- `apps/client/src/styles.css`
  - Replace old theme with Figma-derived tokens and responsive layout system.
- `apps/miniprogram/app.wxss`
  - Replace dark/gold token set with Figma-derived mini program tokens.
- `apps/miniprogram/pages/index/index.wxml`
  - Reorder and rewrite homepage content to match Figma homepage sections in mobile-card form.
- `apps/miniprogram/pages/index/index.wxss`
  - Restyle mini program homepage to match mobile Figma preview.
- `apps/miniprogram/pages/product-list/*`
  - Align product filters/cards with Figma product-category style.
- `apps/miniprogram/pages/product-detail/*`
  - Align product detail with subpage style.
- `apps/miniprogram/pages/quote/*`
  - Align quote form with simplified Figma quote entry and preserve calculation flow.
- `apps/miniprogram/pages/history/*`
  - Align cards and empty states.
- `apps/miniprogram/pages/member/*`
  - Align member forms/cards.

### Verify

- `apps/client` build with `pnpm --dir apps/client build`
- Mini program files compile in WeChat DevTools; at minimum inspect WXML/WXSS syntax manually and keep no malformed tags.
- Optional API build only if content DTO/API files change: `pnpm --dir apps/api build`

---

## Task 1: Extract Brand Content and Clean Fallback Data

**Files:**

- Create: `apps/client/src/brandContent.ts`
- Modify: `apps/client/src/sampleData.ts`
- Modify: `apps/client/src/catalogContext.tsx`

- [ ] **Step 1: Add the brand content module**

Create `apps/client/src/brandContent.ts` with exported arrays and constants matching the Figma design:

```ts
export const brand = {
  companyName: '青岛东方丽彩包装印刷公司',
  shortName: '东方丽彩包装印刷',
  subtitle: '标签印刷 · 包装定制 · 数字溯源',
  phone: '400-000-0000',
  address: '青岛市包装印刷产业园区',
  recordNo: '鲁ICP备 xxxxxxxx 号',
};

export const navItems = [
  { label: '首页', href: '/' },
  { label: '产品中心', href: '/products' },
  { label: '标签定制', href: '/quote' },
  { label: '在线报价', href: '/quote' },
  { label: '案例展示', href: '/#cases' },
  { label: '工艺与设备', href: '/#craft' },
  { label: '关于我们', href: '/#quality' },
  { label: '联系我们', href: '/#contact' },
];

export const heroCopy = {
  kicker: '标签印刷 · 包装定制 · 数字溯源',
  title: '专业标签印刷与一物一码解决方案',
  subtitle:
    '提供不干胶标签、卷标、产品说明书、包装印刷、可变二维码、防伪标签等定制印刷服务，支持快速报价、批量生产与多行业应用。',
  points: ['24h 快速响应', '可打样确认', '多行业批量供货'],
};

export const advantages = [
  { mark: '¥', title: '快速报价', desc: '在线填写尺寸、材质、数量与工艺，快速获取专属报价。', color: '#FF7A1A' },
  { mark: 'M', title: '多种材质', desc: '铜版纸、哑银、PET、PP、合成纸、透明膜等。', color: '#0A6CFF' },
  { mark: 'UV', title: '工艺齐全', desc: '覆膜、烫金、击凸、局部 UV、模切、可变二维码。', color: '#00A886' },
  { mark: 'Q', title: '质量稳定', desc: '色彩精准、粘性可靠，批量一致性好，交付更安心。', color: '#6C5CE7' },
  { mark: 'C', title: '支持定制', desc: '尺寸、形状、材质、工艺和包装方式均可灵活定制。', color: '#09A7C7' },
  { mark: 'I', title: '多行业应用', desc: '覆盖食品、饮料、日化、医药、工业、电商和物流。', color: '#EC008C' },
];

export const productCategories = [
  { name: '不干胶标签', desc: '适用于食品、日化、工业等多场景。' },
  { name: '卷标标签', desc: '自动贴标、批量生产的稳定方案。' },
  { name: '食品饮料标签', desc: '耐冷藏、防潮、贴合瓶罐包装。' },
  { name: '日化美妆标签', desc: '强调质感、色彩与货架表现。' },
  { name: '医药保健标签', desc: '信息清晰，批量一致，可靠耐用。' },
  { name: '工业电子标签', desc: '耐磨、耐候、可追溯识别。' },
  { name: '防伪标签', desc: '提升品牌可信度与渠道管控能力。' },
  { name: '可变二维码 / 一物一码标签', desc: '可变二维码，支持溯源与营销。' },
  { name: '产品说明书', desc: '折页、说明书、随箱资料印刷。' },
  { name: '包装盒 / 宣传册印刷', desc: '品牌包装与宣传资料配套生产。' },
];

export const quoteSteps = [
  '选择产品类型、尺寸与材质',
  '填写数量、工艺与使用场景',
  '提交需求，客服快速确认报价',
];

export const industries = ['食品饮料', '日化美妆', '医药保健', '工业制造', '电子电器', '物流仓储', '农产品', '电商零售'];
export const materials = ['铜版纸', '合成纸', 'PET', 'PP', '哑银', '透明膜', '可移胶', '冷藏冷冻标签材质'];
export const crafts = ['覆亮膜', '覆哑膜', '烫金', '烫银', '击凸', '局部 UV', '模切异形', '可变二维码', '防伪工艺'];

export const cases = [
  { title: '食品瓶贴', industry: '食品饮料', material: 'PET + 覆亮膜', highlight: '冷藏环境粘性稳定' },
  { title: '化妆品标签', industry: '日化美妆', material: '透明膜 + 烫金', highlight: '提升货架质感' },
  { title: '茶叶包装标签', industry: '农产品礼盒', material: '铜版纸 + 击凸', highlight: '国风包装识别' },
  { title: '工业设备标签', industry: '工业制造', material: '哑银 PET', highlight: '耐磨耐候' },
  { title: '二维码溯源标签', industry: '一物一码', material: '可变数据印刷', highlight: '扫码追溯防伪' },
  { title: '宣传册 / 产品说明书', industry: '说明书印刷', material: '双胶纸 + 折页', highlight: '信息清晰易读' },
];

export const qualityItems = ['先进印刷设备', '严格色彩管理', '出货前质量检测', '支持打样确认', '批量生产稳定', '售后跟进服务'];
export const cooperationSteps = ['提交需求', '确认报价', '设计 / 文件检查', '打样确认', '批量生产', '质检发货', '售后服务'];

export const testimonials = [
  '沟通效率高，报价和打样反馈很快，适合新品上线节奏。',
  '批量标签颜色一致，贴标稳定，售后也能及时跟进。',
  '二维码标签数据准确，帮助我们做了渠道追溯和营销活动。',
];
```

- [ ] **Step 2: Rewrite fallback sample categories/products in clean Chinese**

Replace the mojibake strings in `apps/client/src/sampleData.ts` with product/category names from `productCategories`. Preserve the existing data shape and template IDs so quote logic remains compatible.

- [ ] **Step 3: Rewrite context notices**

In `apps/client/src/catalogContext.tsx`, replace:

```ts
const [notice, setNotice] = useState('姝ｅ湪璇诲彇浜у搧閰嶇疆');
```

with:

```ts
const [notice, setNotice] = useState('正在读取产品配置');
```

Also replace remote/fallback notices with:

```ts
setNotice('产品配置已同步');
setNotice('正在使用内置样例配置');
```

- [ ] **Step 4: Run client type check/build**

Run:

```bash
pnpm --dir apps/client build
```

Expected: TypeScript and Vite build complete without errors.

- [ ] **Step 5: Commit**

```bash
git add apps/client/src/brandContent.ts apps/client/src/sampleData.ts apps/client/src/catalogContext.tsx
git commit -m "feat: add printing brand content"
```

## Task 2: Build the Figma-Derived Design System

**Files:**

- Create: `apps/client/src/components/cards.tsx`
- Create: `apps/client/src/components/PrintingVisuals.tsx`
- Modify: `apps/client/src/styles.css`

- [ ] **Step 1: Add shared cards**

Create `apps/client/src/components/cards.tsx` with small presentational components. Props must stay content-agnostic so the same cards can be used on homepage and subpages.

```tsx
import type { ReactNode } from 'react';

export function SectionHeading({
  kicker,
  title,
  desc,
  action,
}: {
  kicker?: string;
  title: string;
  desc?: string;
  action?: ReactNode;
}) {
  return (
    <div className="lc-section-heading">
      <div>
        {kicker ? <p className="lc-kicker">{kicker}</p> : null}
        <h2>{title}</h2>
        {desc ? <p>{desc}</p> : null}
      </div>
      {action ? <div className="lc-section-action">{action}</div> : null}
    </div>
  );
}

export function FeatureCard({ mark, title, desc, color }: { mark: string; title: string; desc: string; color: string }) {
  return (
    <article className="lc-feature-card">
      <span className="lc-icon-badge" style={{ '--badge-color': color } as React.CSSProperties}>
        {mark}
      </span>
      <div>
        <h3>{title}</h3>
        <p>{desc}</p>
      </div>
    </article>
  );
}

export function InfoChip({ children }: { children: ReactNode }) {
  return <span className="lc-chip">{children}</span>;
}

export function ProcessStep({ index, title }: { index: number; title: string }) {
  return (
    <article className="lc-process-step">
      <span>{index}</span>
      <strong>{title}</strong>
    </article>
  );
}
```

- [ ] **Step 2: Add CSS-only printing visuals**

Create `apps/client/src/components/PrintingVisuals.tsx`:

```tsx
import type { Product } from '../types';

export function HeroPrintingVisual() {
  return (
    <div className="lc-hero-visual" aria-hidden="true">
      <div className="lc-roll lc-roll-large" />
      <div className="lc-bottle">
        <div className="lc-bottle-label">
          <strong>食品饮料标签</strong>
          <span>PET / PP / 铜版纸</span>
        </div>
      </div>
      <div className="lc-label-stack">
        {['c', 'm', 'y', 'o', 'g'].map((tone) => (
          <span key={tone} className={`lc-label-strip tone-${tone}`} />
        ))}
      </div>
      <QrVisual />
      <div className="lc-cmyk-dots">
        <span className="c" />
        <span className="m" />
        <span className="y" />
        <span className="k" />
      </div>
    </div>
  );
}

export function ProductVisual({ product, tone = 0 }: { product?: Product; tone?: number }) {
  if (product?.coverImage) {
    return <img className="lc-product-visual image" src={product.coverImage} alt={product.name} loading="lazy" />;
  }

  return (
    <div className={`lc-product-visual tone-${tone}`} aria-hidden="true">
      <div className="lc-product-label">
        <span />
        <span />
        <span />
      </div>
      <div className="lc-product-roll" />
    </div>
  );
}

export function QrVisual() {
  return (
    <div className="lc-qr">
      {Array.from({ length: 29 }).map((_, index) => (
        <span key={index} />
      ))}
    </div>
  );
}
```

- [ ] **Step 3: Replace global CSS tokens**

In `apps/client/src/styles.css`, replace the old dark/gold theme with Figma tokens:

```css
:root,
.app-shell {
  --font-sans: "Noto Sans SC", "PingFang SC", "Microsoft YaHei", Arial, sans-serif;
  --lc-ink: #071a30;
  --lc-navy: #0b1d34;
  --lc-blue: #0a6cff;
  --lc-orange: #ff7a1a;
  --lc-teal: #00a886;
  --lc-cyan: #09a7c7;
  --lc-bg: #f7fafe;
  --lc-bg-soft: #eef5ff;
  --lc-surface: #ffffff;
  --lc-text: #10223a;
  --lc-muted: #637287;
  --lc-border: #e3ecf7;
  --lc-shadow: 0 12px 28px -8px rgba(5, 23, 51, 0.1);
  --lc-shadow-strong: 0 24px 48px -10px rgba(5, 23, 51, 0.18);
  --lc-radius-card: 12px;
  --lc-radius-panel: 24px;
  font-family: var(--font-sans);
  color: var(--lc-text);
  background: linear-gradient(180deg, #f8fbff 0%, #eef5ff 100%);
}
```

Then add responsive primitives for:

- `.app-shell`
- `.lc-header`
- `.lc-container`
- `.lc-section`
- `.lc-button`
- `.lc-button.primary`
- `.lc-card`
- `.lc-section-heading`
- `.lc-grid-2`, `.lc-grid-3`, `.lc-grid-4`
- `.lc-hero-visual`
- `.lc-product-visual`
- mobile breakpoints at `1080px`, `780px`, `560px`

- [ ] **Step 4: Run visual smoke build**

Run:

```bash
pnpm --dir apps/client build
```

Expected: no CSS import or JSX type errors.

- [ ] **Step 5: Commit**

```bash
git add apps/client/src/components/cards.tsx apps/client/src/components/PrintingVisuals.tsx apps/client/src/styles.css
git commit -m "feat: add Figma printing design system"
```

## Task 3: Replace the Client Shell with Figma Navigation and Footer

**Files:**

- Create: `apps/client/src/components/BrandShell.tsx`
- Modify: `apps/client/src/App.tsx`

- [ ] **Step 1: Create the shell component**

Create `apps/client/src/components/BrandShell.tsx`:

```tsx
import { NavLink } from 'react-router-dom';
import { brand, navItems } from '../brandContent';

export function BrandHeader() {
  return (
    <header className="lc-header">
      <NavLink to="/" className="lc-logo" aria-label={`${brand.companyName}首页`}>
        <span>LC</span>
        <div>
          <strong>{brand.shortName}</strong>
          <small>Qingdao Label Printing</small>
        </div>
      </NavLink>
      <nav className="lc-nav" aria-label="主导航">
        {navItems.map((item) => (
          <NavLink key={item.label} to={item.href}>
            {item.label}
          </NavLink>
        ))}
      </nav>
      <NavLink className="lc-button primary lc-header-cta" to="/quote">
        立即报价
      </NavLink>
    </header>
  );
}

export function BrandFooter() {
  return (
    <footer id="contact" className="lc-footer">
      <div>
        <h2>{brand.companyName}</h2>
        <p>主营：标签印刷 / 卷标不干胶 / 产品说明书 / 包装印刷 / 防伪与一物一码标签</p>
      </div>
      <div className="lc-footer-contact">
        <span>电话：{brand.phone}</span>
        <span>地址：{brand.address}</span>
        <span>备案信息：{brand.recordNo}</span>
      </div>
      <div className="lc-footer-qr" aria-label="微信二维码占位">
        微信咨询
      </div>
    </footer>
  );
}
```

- [ ] **Step 2: Use the shell in App**

In `apps/client/src/App.tsx`, keep the `CatalogProvider` and route list, but replace the existing topbar and tabs with:

```tsx
import { Route, Routes } from 'react-router-dom';
import { BrandFooter, BrandHeader } from './components/BrandShell';
```

and:

```tsx
<main className="app-shell">
  <BrandHeader />
  <Routes>
    ...
  </Routes>
  <BrandFooter />
</main>
```

- [ ] **Step 3: Preserve routes**

Keep these route mappings unchanged:

```tsx
<Route path="/" element={<HomePage />} />
<Route path="/products" element={<ProductListPage />} />
<Route path="/products/:id" element={<ProductDetailPage />} />
<Route path="/quote" element={<QuotePage />} />
<Route path="/history" element={<HistoryPage />} />
<Route path="/member" element={<MemberCenterPage />} />
<Route path="*" element={<HomePage />} />
```

- [ ] **Step 4: Build**

Run:

```bash
pnpm --dir apps/client build
```

Expected: app builds and routes resolve.

- [ ] **Step 5: Commit**

```bash
git add apps/client/src/App.tsx apps/client/src/components/BrandShell.tsx
git commit -m "feat: apply Figma website shell"
```

## Task 4: Implement the Homepage from Figma

**Files:**

- Create: `apps/client/src/components/HomeSections.tsx`
- Modify: `apps/client/src/pages/Home.tsx`

- [ ] **Step 1: Create homepage section components**

Create `apps/client/src/components/HomeSections.tsx` using content from `brandContent.ts` and visuals from `PrintingVisuals.tsx`. Include these exports:

```tsx
export function HeroSection(): JSX.Element;
export function AdvantageSection(): JSX.Element;
export function ProductCategorySection(): JSX.Element;
export function QuoteGuideSection(): JSX.Element;
export function IndustrySection(): JSX.Element;
export function MaterialCraftSection(): JSX.Element;
export function CaseSection(): JSX.Element;
export function QualitySection(): JSX.Element;
export function TestimonialSection(): JSX.Element;
export function FinalCtaSection(): JSX.Element;
```

- [ ] **Step 2: Implement section order**

In `HomeSections.tsx`, the rendered order must match Figma:

1. Hero
2. Core advantages
3. Product categories
4. Quote guide
5. Industry solutions
6. Material and craft
7. Cases
8. Quality and cooperation process
9. Testimonials
10. Final CTA

- [ ] **Step 3: Replace HomePage**

Replace `apps/client/src/pages/Home.tsx` with:

```tsx
import {
  AdvantageSection,
  CaseSection,
  FinalCtaSection,
  HeroSection,
  IndustrySection,
  MaterialCraftSection,
  ProductCategorySection,
  QualitySection,
  QuoteGuideSection,
  TestimonialSection,
} from '../components/HomeSections';

export function HomePage() {
  return (
    <div className="lc-home">
      <HeroSection />
      <AdvantageSection />
      <ProductCategorySection />
      <QuoteGuideSection />
      <IndustrySection />
      <MaterialCraftSection />
      <CaseSection />
      <QualitySection />
      <TestimonialSection />
      <FinalCtaSection />
    </div>
  );
}
```

- [ ] **Step 4: Ensure homepage SEO hierarchy**

Use one `h1` in `HeroSection`. Use `h2` for every later module. Use `h3` for cards.

- [ ] **Step 5: Build**

Run:

```bash
pnpm --dir apps/client build
```

Expected: no missing imports and no JSX errors.

- [ ] **Step 6: Commit**

```bash
git add apps/client/src/pages/Home.tsx apps/client/src/components/HomeSections.tsx
git commit -m "feat: implement Figma homepage"
```

## Task 5: Restyle Client Subpages to Match the Homepage

**Files:**

- Create: `apps/client/src/components/PageHero.tsx`
- Modify: `apps/client/src/pages/ProductList.tsx`
- Modify: `apps/client/src/pages/ProductDetail.tsx`
- Modify: `apps/client/src/pages/Quote.tsx`
- Modify: `apps/client/src/pages/History.tsx`
- Modify: `apps/client/src/pages/MemberCenter.tsx`

- [ ] **Step 1: Create shared subpage hero**

Create `apps/client/src/components/PageHero.tsx`:

```tsx
import type { ReactNode } from 'react';

export function PageHero({
  kicker,
  title,
  desc,
  children,
}: {
  kicker: string;
  title: string;
  desc: string;
  children?: ReactNode;
}) {
  return (
    <section className="lc-page-hero">
      <div>
        <p className="lc-kicker">{kicker}</p>
        <h1>{title}</h1>
        <p>{desc}</p>
      </div>
      {children ? <div className="lc-page-hero-extra">{children}</div> : null}
    </section>
  );
}
```

- [ ] **Step 2: Product list**

Update `ProductListPage` to:

- Add `PageHero` with title `产品中心`
- Use Figma-style chips for category filtering
- Use product cards that match homepage product cards
- Clean all Chinese strings

- [ ] **Step 3: Product detail**

Update `ProductDetailPage` to:

- Add `PageHero` with product name
- Use a product visual/media panel
- Add quote CTA button `按此产品报价`
- Show material/process/template details in Figma-style cards
- Clean all Chinese strings

- [ ] **Step 4: Quote page**

Update `QuotePage` without changing calculation behavior:

- Add `PageHero` with title `在线报价`
- Keep product selection, dimensions, material, printing, process, delivery, environment, and result panel
- Restyle product selector, form sections, chips, and result panel with `.lc-card`, `.lc-form-grid`, `.lc-quote-result`
- Clean all labels and placeholder strings
- Keep `calculateQuote`, `saveQuote`, `createDefaultQuote`, and `normalizeQuoteInput` behavior

- [ ] **Step 5: History page**

Update `HistoryPage` to:

- Add `PageHero` with title `报价历史`
- Render history items as Figma-style quote cards
- Add readable empty state `暂无报价历史，您可以先提交一次报价需求。`

- [ ] **Step 6: Member center**

Update `MemberCenterPage` to:

- Add `PageHero` with title `会员中心`
- Restyle profile and address forms as Figma-style cards
- Clean all Chinese labels and notices

- [ ] **Step 7: Build**

Run:

```bash
pnpm --dir apps/client build
```

Expected: all routes build.

- [ ] **Step 8: Commit**

```bash
git add apps/client/src/components/PageHero.tsx apps/client/src/pages
git commit -m "feat: align client subpages with Figma style"
```

## Task 6: Align the Mini Program with the Figma Mobile Preview

**Files:**

- Modify: `apps/miniprogram/app.wxss`
- Modify: `apps/miniprogram/pages/index/index.wxml`
- Modify: `apps/miniprogram/pages/index/index.wxss`
- Modify: `apps/miniprogram/pages/product-list/index.wxml`
- Modify: `apps/miniprogram/pages/product-list/index.wxss`
- Modify: `apps/miniprogram/pages/product-detail/index.wxml`
- Modify: `apps/miniprogram/pages/product-detail/index.wxss`
- Modify: `apps/miniprogram/pages/quote/index.wxml`
- Modify: `apps/miniprogram/pages/quote/index.wxss`
- Modify: `apps/miniprogram/pages/history/index.wxml`
- Modify: `apps/miniprogram/pages/history/index.wxss`
- Modify: `apps/miniprogram/pages/member/index.wxml`
- Modify: `apps/miniprogram/pages/member/index.wxss`

- [ ] **Step 1: Replace mini program global tokens**

In `apps/miniprogram/app.wxss`, replace old dark/gold tokens with Figma mobile tokens:

```css
.page {
  --page-bg: linear-gradient(180deg, #f8fbff 0%, #eef5ff 100%);
  --panel-bg: #ffffff;
  --card-bg: #ffffff;
  --text-color: #10223a;
  --text-muted: #637287;
  --line-color: #e3ecf7;
  --accent-color: #ff7a1a;
  --blue-color: #0a6cff;
  --teal-color: #00a886;
  --shadow-card: 0 12rpx 32rpx rgba(5, 23, 51, 0.1);
  min-height: 100vh;
  padding: 24rpx;
  color: var(--text-color);
  background: var(--page-bg);
}
```

- [ ] **Step 2: Rewrite mini program homepage content**

In `pages/index/index.wxml`, reorder to:

1. Mini navigation/brand card
2. Hero with `专业标签印刷与一物一码解决方案`
3. Fast quote buttons
4. Core advantages
5. Product center
6. Quote guide
7. Material/craft chips
8. Cases
9. Bottom fixed CTA

- [ ] **Step 3: Restyle mini program homepage**

In `pages/index/index.wxss`, match the Figma mobile preview:

- `390px` equivalent card layout
- white cards on light blue background
- orange primary button
- blue secondary button
- compact product two-column grid
- fixed bottom quote/contact bar

- [ ] **Step 4: Align remaining mini program pages**

For each subpage:

- Keep existing JS data flow and event handlers
- Replace mojibake strings with clean Chinese
- Use card, chip, button, field, and page hero classes consistent with `app.wxss`

- [ ] **Step 5: Manual syntax pass**

Run:

```bash
rg "鍗|鎶|浜|绛|鐑|濂|TODO|TBD" apps/miniprogram
```

Expected: no mojibake strings remain unless they are intentional test fixtures.

- [ ] **Step 6: Commit**

```bash
git add apps/miniprogram
git commit -m "feat: align mini program with Figma mobile design"
```

## Task 7: Content Completeness and Data Backfill

**Files:**

- Modify: `apps/api/prisma/seed.ts`
- Modify: `database/seeds/dev.sql`
- Optional Modify: `apps/api/src/modules/catalog/catalog.service.ts`

- [ ] **Step 1: Check current seed sources**

Open:

```bash
Get-Content apps/api/prisma/seed.ts
Get-Content database/seeds/dev.sql
```

Confirm whether homepage branding, banners, company profile, product categories, products, materials, processes, and equipment showcases already seed production-like content.

- [ ] **Step 2: Backfill missing content**

If seed content is missing or mojibake, add:

- Branding: 青岛东方丽彩包装印刷公司
- Hero banner: 专业标签印刷与一物一码解决方案
- Product categories from Figma
- Materials from Figma
- Processes from Figma
- Company profile with phone/address placeholders
- Equipment/case showcase records for the six Figma cases

- [ ] **Step 3: Preserve API contract**

Do not change DTO fields unless required. Existing client expects:

```ts
CatalogHome {
  branding?: HomepageBranding | null;
  banners?: HomepageBanner[];
  companyProfile?: CompanyProfile | null;
  categories: ProductCategory[];
  categoryEquipmentShowcases?: CategoryEquipmentShowcase[];
  hotProducts: Product[];
  latestProducts: Product[];
}
```

- [ ] **Step 4: Build API if changed**

Run:

```bash
pnpm --dir apps/api build
```

Expected: Nest build completes.

- [ ] **Step 5: Commit**

```bash
git add apps/api/prisma/seed.ts database/seeds/dev.sql apps/api/src/modules/catalog/catalog.service.ts
git commit -m "feat: backfill Figma website content"
```

## Task 8: Responsive and Visual Verification

**Files:**

- Modify only if verification finds defects.

- [ ] **Step 1: Build client**

Run:

```bash
pnpm --dir apps/client build
```

Expected: pass.

- [ ] **Step 2: Start client dev server**

Run:

```bash
pnpm --dir apps/client dev
```

Expected: Vite serves at `http://127.0.0.1:5174`.

- [ ] **Step 3: Browser verification**

Open:

- `http://127.0.0.1:5174/`
- `http://127.0.0.1:5174/products`
- `http://127.0.0.1:5174/quote`
- `http://127.0.0.1:5174/history`
- `http://127.0.0.1:5174/member`

Check at widths:

- Desktop: `1440px`
- Tablet: `768px`
- Mobile: `390px`

- [ ] **Step 4: Visual acceptance checklist**

Confirm:

- Header resembles Figma: logo left, nav center, quote CTA right.
- Hero uses ink-blue/light-blue brand tone and label-roll visual.
- Homepage modules appear in Figma order.
- Product cards and case cards do not overlap.
- Quote area is prominent and easy to fill.
- Mobile layout stacks cleanly and has a clear quote CTA.
- Subpages no longer use old dark/gold visual language.
- No mojibake Chinese appears in visible UI.

- [ ] **Step 5: Mini program verification**

Open the project in WeChat DevTools and inspect:

- 首页
- 产品列表
- 产品详情
- 在线报价
- 报价历史
- 会员中心

Check:

- Text is readable Chinese.
- Cards use the same light blue/white/orange/blue visual language.
- Bottom CTA does not cover form submit controls.
- Product cards remain readable on narrow screens.

- [ ] **Step 6: Final commit**

```bash
git status --short
git add apps/client apps/miniprogram apps/api database docs
git commit -m "feat: sync website UI with Figma design"
```

## Risks and Decisions

- **Figma screenshot validation may be limited by Figma Starter MCP quotas.** Use the visible Figma file and browser screenshots as the source of truth if MCP screenshot calls are unavailable.
- **Current mojibake is high risk.** Treat all affected frontend strings as unsafe and rewrite them from source requirements/Figma content rather than editing the mojibake text in place.
- **Do not rewrite quote calculation logic.** This work is visual/content synchronization. Quote math changes require a separate plan.
- **Do not add heavy image dependencies.** The Figma file uses stylized label-roll visuals; CSS/SVG-like primitives are enough unless real product photos already exist in `images/` or remote content.

## Self-Review

- Spec coverage: homepage, navigation, products, quote guide, industries, materials/crafts, cases, quality, workflow, testimonials, CTA, footer, PC/H5/mobile/mini program, and subpage style unification are covered.
- Placeholder scan: no `TBD` or `TODO` remains in task instructions.
- Type consistency: all new React components use existing React/TypeScript conventions and existing route/data types.
- Verification: client build, optional API build, browser checks, mini program manual checks, and mojibake scan are included.
