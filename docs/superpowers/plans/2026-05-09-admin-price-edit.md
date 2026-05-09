# Admin Price Edit Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add edit support for admin process prices and print prices.

**Architecture:** Keep the current admin page structure and reuse the existing create modals. Add backend `PUT` routes for both price resources, then call them from the admin UI when a row is being edited.

**Tech Stack:** NestJS, Prisma, React, Ant Design, Vite.

---

## Task 1: API Update Endpoints

**Files:**
- Modify: `apps/api/src/modules/admin/dto/admin-process.dto.ts`
- Modify: `apps/api/src/modules/admin/services/admin-processes.service.ts`
- Modify: `apps/api/src/modules/admin/controllers/admin-processes.controller.ts`

- [x] **Step 1: Add update DTO aliases**

Add `UpdateProcessPriceDto` and `UpdatePrintPriceDto` classes extending the create DTOs.

- [x] **Step 2: Add service update methods**

Add `updateProcessPrice(id, dto)` and `updatePrintPrice(id, dto)`. Each method loads the previous row, updates editable fields, records audit log, and returns the updated row.

- [x] **Step 3: Add controller PUT routes**

Add `PUT /admin/process-prices/:id` and `PUT /admin/print-prices/:id` with `admin:pricing` permission.

## Task 2: Admin UI Editing

**Files:**
- Modify: `apps/admin/src/pages/ProcessesPage.tsx`

- [x] **Step 1: Add edit state and open helpers**

Track `editing` row for both `ProcessPriceTable` and `PrintPriceTable`.

- [x] **Step 2: Reuse modal for create/edit**

When editing, prefill the form. Submit with `put()` when editing and `post()` when creating.

- [x] **Step 3: Add table operation buttons**

Add an `编辑` action column to both price tables when the user has `admin:pricing`.

## Task 3: Verification

**Files:**
- Modify: `docs/superpowers/plans/2026-05-09-admin-price-edit.md`

- [x] **Step 1: Build API**

Run `.\.tools\node\pnpm.CMD --dir apps/api build`.

- [x] **Step 2: Build admin**

Run `.\.tools\node\pnpm.CMD --dir apps/admin build`.

- [x] **Step 3: Commit**

Commit code and update this checklist.
