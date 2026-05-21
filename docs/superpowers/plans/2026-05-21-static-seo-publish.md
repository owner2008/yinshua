# Static SEO Publish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a backend-powered static SEO publishing flow so admin-managed products and content can generate crawler-friendly HTML, sitemap, and robots files.

**Architecture:** The API owns static generation because it can read current database content after admins update products, banners, showcases, and company profile. The admin UI calls a protected publish endpoint and displays the generated file count and output directory. Generated files are written to `STATIC_SITE_OUTPUT_DIR` or `../client/dist` by default.

**Tech Stack:** NestJS, Prisma, Node `fs/promises`, React admin app, Ant Design, TypeScript node test runner.

---

### Task 1: API Static Publisher

**Files:**
- Create: `apps/api/src/modules/admin/services/static-site-publisher.service.ts`
- Create: `apps/api/src/modules/admin/services/static-site-publisher.service.test.ts`
- Create: `apps/api/src/modules/admin/controllers/admin-static-site.controller.ts`
- Modify: `apps/api/src/modules/admin/admin.module.ts`

- [ ] **Step 1: Write failing tests**

Create tests that instantiate the publisher with an in-memory content source and temp output directory. Assert that publishing creates `index.html`, `products/index.html`, `products/1/index.html`, `applications/index.html`, `cases/index.html`, `contact/index.html`, `sitemap.xml`, and `robots.txt`, and that product detail HTML contains a title, description, h1, canonical, and JSON-LD.

- [ ] **Step 2: Run tests and confirm failure**

Run: `..\..\.tools\node\node.exe --import tsx --test src/modules/admin/services/static-site-publisher.service.test.ts`

- [ ] **Step 3: Implement publisher**

Implement `StaticSitePublisherService.publish()` to read active products, categories, company profile, homepage branding, banners, and category showcases from Prisma, then generate static files. Use simple escaped HTML templates and an atomic directory write into the configured output directory.

- [ ] **Step 4: Add protected admin endpoint**

Add `POST /api/admin/static-site/publish`, guarded by `AdminAuthGuard` and `admin:content`, returning `{ outputDir, files, generatedAt }`.

- [ ] **Step 5: Run tests and typecheck**

Run the focused API test, then `..\..\.tools\node\node.exe .\node_modules\typescript\bin\tsc --noEmit`.

### Task 2: Admin Publish UI

**Files:**
- Modify: `apps/admin/src/pages/ContentManagementPage.tsx`
- Modify: `apps/admin/src/types.ts`

- [ ] **Step 1: Add result type**

Add `StaticSitePublishResult` with `outputDir`, `files`, and `generatedAt`.

- [ ] **Step 2: Add publish action**

Add a “发布静态 SEO 页面” button to the content management header area. It calls `post<StaticSitePublishResult>('/admin/static-site/publish', {})`, shows loading state, and displays the generated file count.

- [ ] **Step 3: Build admin**

Run: `..\..\.tools\node\node.exe .\node_modules\typescript\bin\tsc --noEmit && ..\..\.tools\node\node.exe .\node_modules\vite\bin\vite.js build`

### Task 3: Final Verification

**Files:**
- No new files.

- [ ] **Step 1: Run API checks**

Run focused publisher test and API typecheck.

- [ ] **Step 2: Run admin build**

Run admin build command.

- [ ] **Step 3: Review git diff**

Confirm only intended API/admin files and this plan changed.
