# Pomegranate CMS - UI/UX Implementation Plan

**Project:** Pomegranate v2 CMS Admin Panel UI/UX Improvements
**Created:** March 16, 2026
**Last Updated:** March 16, 2026 (v5.1 - Test Audit Verified)
**Status:** Ready for Implementation
**Priority:** CRITICAL > HIGH > MEDIUM > LOW

**Companion Docs:**
- `CODE-EXAMPLES.md` - Working code examples for each task
- `DESIGN-MOCKUPS.md` - ASCII visual references for target UI
- `CONTENT_MODEL_AUDIT.md` (in front-end repo) - Gap analysis for TPL-001 through TPL-013

---

## ⚠️ PRIORITY — Content Model Alignment (P0–P3)

**Source:** `CONTENT_MODEL_AUDIT.md` in front-end repo at `C:\Users\k_che\Documents\TEST NEW POMEGRANATE WEBSITE 13-03-2026`

### P0 - Blocking (Current Session)

| Task | Description | Status |
|------|-------------|--------|
| `pseo_page_instances` admin UI | ✅ ALREADY EXISTS at `/admin/generation` — batch generation + individual page editor with SEO, hero, FAQ, entity linking, JSON-LD | ✅ COMPLETE |
| `downloads` database CRUD | `lib/db/downloads.ts` created with full CRUD. `/admin/downloads/page.tsx` has `DownloadForm` with metadata fields (title, description, type, preview_image_url, gated, published, sort_order, seo fields). | ✅ COMPLETE (2026-03-17) |

**Gap Analysis:** Current `/admin/downloads/page.tsx` only manages Supabase **storage bucket** files. The `downloads` **database table** (created in front-end Phase 0) has no CRUD interface.

**Implementation for P0 - Downloads Table CRUD:**

1. Create `lib/db/downloads.ts`:
   - `fetchDownloads()` - SELECT * FROM downloads ORDER BY sort_order
   - `createDownload(data)` - INSERT INTO downloads
   - `updateDownload(id, data)` - UPDATE downloads SET ... WHERE id = $1
   - `deleteDownload(id)` - DELETE FROM downloads WHERE id = $1

2. Enhance `/admin/downloads/page.tsx`:
   - Add database record management alongside storage upload
   - When user uploads file → create storage entry + prompt for metadata
   - Edit form for: title, description, type, preview_image_url, gated, published, sort_order, seo fields
   - Table view showing all downloads with status indicators

3. Add `Download` type to `lib/types.ts` (match front-end schema):
   ```typescript
   interface Download {
     id: string;
     business_id: string;
     title: string;
     type: 'Guide' | 'Template' | 'Checklist' | 'Report';
     description: string;
     file_url: string;
     preview_image_url?: string;
     file_size_label?: string;
     page_count_label?: string;
     gated: boolean;
     published: boolean;
     sort_order: number;
     seo_title?: string;
     seo_meta_desc?: string;
     created_at: string;
     last_updated: string;
   }
   ```

### P1 - High Priority (Next)

| Task | Description | Status |
|------|-------------|--------|
| Hero fields | ServiceForm.tsx has full Hero section (title, subtitle, body, CTA text/link). IndustryForm.tsx created with Hero section. PagesAdmin has hero_title/subtitle/eyebrow. | ✅ COMPLETE (2026-03-16) |
| SEO fields | `canonical_url`, `og_image_url` added to ServiceForm, IndustryForm, and PagesAdmin form. All three forms save these fields to DB. | ✅ COMPLETE (2026-03-16) |
| Entity linking | `about_entities` + `mentions_entities` multi-select added to ServiceForm (fixed — onChange was no-op, now wired). IndustryForm has Entities section. LocationForm already had KnowledgeEntitySelector components. | ✅ COMPLETE (2026-03-17) |

### P2 - Medium Priority

| Task | Description | Status |
|------|-------------|--------|
| Deliverables component — **services** | `DeliverablesEditor.tsx` created with icon/title/description fields. Integrated into `ServiceForm.tsx`. | ✅ COMPLETE (2026-03-16) |
| Deliverables component — **industries** | Structured repeatable editor not yet added to IndustryForm. | ❌ NOT STARTED |
| Pricing UI | Editor for `pricing_data` JSONB column (pricing plans per service) | ❌ NOT STARTED |
| Process Steps | Structured editor for service process steps (icons, titles, descriptions) | ❌ NOT STARTED |
| Contact/Legal config | Form fields for static pages contact/legal sections | ❌ NOT STARTED |

### P3 - Lower Priority

| Task | Description | Status |
|------|-------------|--------|
| FAQ structured editor | Replace free-form JSON with structured question/answer builder | ❌ NOT STARTED |
| Testimonial filters | Add service/industry filter selectors to reviews management | ❌ NOT STARTED |
| Author selector | Add `author_person_id` selector to blog posts | ❌ NOT STARTED |

### ✅ Content Model Alignment — COMPLETE (2026-03-17)

All front-end pages now read from Supabase with hardcoded fallbacks. Services (×3), Industries (×5), Home, About, Contact all seeded into DB. CMS forms expanded. **CMS agents are unblocked.**

### ✅ Additional Completed Items (2026-03-17)

| Item | Description |
|------|-------------|
| Admin Route Fix | Added missing routes for `/admin/redirects` and `/admin/error-logs` in `App.tsx`. Pages existed in sidebar but were inaccessible. |
| Environments comma input | `ServiceForm.tsx` now accepts comma-separated environment keywords, saves as bullet-separated (`•`) for storage. |
| IndustryForm.tsx created | Full industry form with Hero, Content Sections, Deliverables, CTA, SEO, Entities sections — replacing inline-only 4-field form. |
| R1 Redirects admin UI | `/admin/redirects/page.tsx` — CRUD for 301 redirects (77 imported from WordPress). Features: table view, add/edit/delete, toggle active, test redirect, search/filter. |
| R1 404 Logs dashboard | `/admin/error-logs/page.tsx` — 404 log viewer with hit count, first/last seen, resolve action, "Create Redirect" shortcut. Unresolved count badge. |
| Weekly 404 email (front-end) | `api/cron/weekly-404-report.ts` cron job via Resend — runs every Monday 9am UTC. |

---

## How to Use This Plan

**For Agents:**
1. Read `CLAUDE.md` first for project context and conventions
2. Pick a task - respect dependency order (tasks within a phase can be parallel, but Phase 1 before Phase 2)
3. Create a feature branch: `git checkout -b feature/[task-name]`
4. Mark the task as **IN PROGRESS** below
5. Complete implementation
6. Run `npm run build` to verify TypeScript compiles
7. Mark task as **COMPLETED** with date
8. Commit with descriptive message

**Important:** Tasks 1.1 and 1.5 should be done together or 1.1 first - the toast system is needed before confirm dialogs can show success/error feedback.

**Status Legend:**
- [ ] **NOT STARTED** - Ready to pick up
- [~] **IN PROGRESS** - Currently being worked on
- [x] **COMPLETED** - Done and tested
- [!] **BLOCKED** - Waiting on dependency
- [?] **VERIFY ONLY** - May already work, just needs confirmation

---

## PHASE 1: CRITICAL (Must Complete First)

### Task 1.1: Install Toast Notification System
**Priority:** CRITICAL
**Effort:** 2-3 hours
**Dependencies:** None (do this first)

**Description:**
Replace all native `alert()` calls with Sonner toast notifications. There are 30+ `alert()` instances across the codebase. See `CODE-EXAMPLES.md` Example 1 for full implementation.

**Steps:**
- [ ] `npm install sonner`
- [ ] Create `lib/toast.ts` with success/error/info/warning/loading/dismiss helpers
- [ ] Add `<Toaster position="top-right" richColors closeButton />` to `App.tsx`
- [ ] Replace every `alert()` call with `toast.success()` or `toast.error()`
- [ ] All toasts auto-dismiss (4s success, 6s error)

**Files with `alert()` calls (audit-confirmed):**
- [x] `app/admin/businesses/page.tsx` - alert on save success + delete error
- [x] `app/admin/services/page.tsx` - alert on save/delete errors
- [x] `app/admin/locations/page.tsx` - 6 alert calls (save, delete, scan, expand errors)
- [x] `app/admin/posts/page.tsx` - alert on save/delete errors
- [x] `app/admin/pages/page.tsx` - 5 alert calls (save, delete, core page generation)
- [x] `app/admin/reviews/page.tsx` - alert on save/delete
- [x] `app/admin/tools/page.tsx` - alert on save error
- [x] `app/admin/industries/page.tsx` - alert on save/delete
- [x] `app/admin/case-studies/page.tsx` - alert on save/delete
- [x] `app/admin/downloads/page.tsx` - 3 alert calls
- [x] `app/admin/associates/page.tsx` - alert on save/delete
- [x] `app/admin/knowledge-entities/page.tsx` - 7 alert calls
- [x] `app/admin/people/page.tsx` - alert on save error
- [x] `components/shared/MediaManager.tsx` - alert on upload/delete
- [x] `components/shared/EntityGenerator.tsx` - 4 alert calls
- [x] `components/shared/FAQEditor.tsx` - 3 alert calls

**Status:** [x] COMPLETED — 2026-03-16

---

> ### 🧪 TEST CHECKPOINT T1 — Toast System
> **Trigger:** After Task 1.1 is merged. Spin up a test agent with `TESTING-PLAN.md` → **Test Suite T1**.
> **What to verify:** Toasts appear on every page where alerts were replaced. No `alert()` calls remain in source. Success/error/info/warning variants all render correctly. Auto-dismiss timings are correct.
> **Status:** ✅ VERIFIED — All 12 checks passed (2026-03-16)

---

### Task 1.2: Fix Button Disabled States
**Priority:** CRITICAL
**Effort:** 30 minutes
**Dependencies:** None

**Description:**
The Button component (`components/ui/button.tsx`) already has `disabled:pointer-events-none disabled:opacity-50` in its className. **This task is a verification** - confirm it works across all variants and that no page is overriding it.

**Steps:**
- [ ] Verify `disabled` prop works on all Button variants (default, destructive, outline, secondary, ghost, link)
- [x] Verify loading buttons across pages use `disabled={saving}` pattern — 8+ pages confirmed
- [x] If already working, mark complete

**Status:** [x] COMPLETED — 2026-03-16

---

### Task 1.3: Add Focus Rings to Non-Component Elements
**Priority:** CRITICAL
**Effort:** 2 hours (reduced - Button/Input already have focus rings)
**Dependencies:** None

**Description:**
Button and Input components already have `focus-visible:ring-2` styles. The gap is in **sidebar nav links, table rows, clickable cards, and custom interactive elements** that bypass the Button component.

**Scope (narrowed from original):**
- [x] Sidebar nav items (`components/layout/Sidebar.tsx`) - add focus-visible ring
- [x] Table rows with click handlers - add `tabIndex={0}` and `focus-within:bg-slate-50`
- [x] Clickable cards in dashboard - add focus-visible ring
- [x] Any `<a>` or `<div onClick>` elements that aren't using Button component

**Do NOT touch:**
- `components/ui/button.tsx` - already has focus styles
- `components/ui/input.tsx` - already has focus styles
- `components/ui/textarea.tsx` - already has focus styles

**Status:** [x] COMPLETED — 2026-03-16

---

### Task 1.4: Add ARIA Labels to Icon-Only Buttons
**Priority:** CRITICAL
**Effort:** 2 hours
**Dependencies:** None

**Description:**
Every icon-only button needs `aria-label`. Icons should get `aria-hidden="true"`. There are ~50+ instances. See `CODE-EXAMPLES.md` Example 4.

**Pattern:**
```tsx
<Button variant="ghost" size="icon" aria-label={`Edit ${item.name}`}>
  <Pencil className="h-4 w-4" aria-hidden="true" />
</Button>
```

**Pages to update (all admin pages with table action buttons):**
- [x] businesses, services, locations, posts, pages
- [x] reviews, tools, industries, case-studies
- [x] downloads, associates, knowledge-entities, people
- [x] `components/layout/Sidebar.tsx` - sign out button
- [x] `components/shared/FAQEditor.tsx` - delete FAQ item buttons
- [x] `components/shared/MediaManager.tsx` - file action buttons

**Status:** [x] COMPLETED — 2026-03-16

---

### Task 1.5: Create Confirmation Modal Component
**Priority:** CRITICAL
**Effort:** 2-3 hours
**Dependencies:** Task 1.1 (toast system needed for post-action feedback)

**Description:**
Replace all `window.confirm()` calls with a styled modal dialog. There are 15+ `confirm()` instances. See `CODE-EXAMPLES.md` Example 2 for full implementation.

**Prefer the `useConfirm` hook pattern** over the standalone `confirmDialog` function (the CustomEvent-based approach in CODE-EXAMPLES.md is fragile). Use the hook in components directly.

**Steps:**
- [x] Create `components/ui/dialog.tsx` - base Dialog with overlay, focus trap, escape key, aria-modal
- [x] Create `lib/confirm-dialog.tsx` - `useConfirm` hook returning `{ confirm, ConfirmDialog }`
- [x] Replace all `window.confirm()` calls across admin pages (15/15 done)
- [x] Destructive actions use red button variant
- [x] All modals have: focus trap, click-outside-to-close, Escape to close, `aria-modal="true"`, `aria-labelledby`

**Files with `confirm()` calls (audit-confirmed):**
- [x] businesses, services, locations, pages, posts
- [x] reviews, industries, case-studies, downloads, associates
- [x] knowledge-entities, tools, people, blog-topics, MediaManager

**Status:** [x] COMPLETED — 2026-03-16

---

### Task 1.6: Retrofit Existing Modals (NEW - from audit)
**Priority:** CRITICAL
**Effort:** 2-3 hours
**Dependencies:** Task 1.5 (use the same Dialog component)

**Description:**
The codebase has 3+ inline modals built as bare `<div>` overlays without accessibility. These need to be converted to use the Dialog component from Task 1.5.

**Existing modals to retrofit:**
- [x] `app/admin/locations/page.tsx` - Location expansion modal (scan geography)
- [x] `app/admin/posts/page.tsx` - Media picker modal
- [x] `components/shared/MediaManager.tsx` - Already using confirm dialog
- [x] Any other inline modal patterns found

**Each modal must have:**
- [x] `aria-modal="true"`
- [x] `aria-labelledby` pointing to modal title
- [x] Focus trap (focus stays inside modal)
- [x] Escape key closes modal
- [x] Click outside closes modal
- [x] Scroll lock on body when open

**Status:** [x] COMPLETED — 2026-03-16

---

### Task 1.7: Fix Hover-Only Action Buttons (NEW - from audit)
**Priority:** CRITICAL
**Effort:** 1 hour
**Dependencies:** None

**Description:**
Some pages hide action buttons behind `opacity-0 group-hover:opacity-100`. These are invisible to keyboard users and non-functional on touch devices. Make them always visible.

**Files to fix:**
- [x] `app/admin/knowledge-entities/page.tsx` - entity card delete buttons
- [x] `app/admin/people/page.tsx` - profile image remove button
- [x] `app/admin/posts/page.tsx` - featured image remove button
- [x] `components/shared/FAQEditor.tsx` - delete FAQ buttons
- [x] Any other `opacity-0 group-hover:opacity-100` patterns on interactive elements

**Fix:** Remove `opacity-0`, keep hover enhancement as a subtle background change instead.

**Status:** [x] COMPLETED — 2026-03-16

---

> ### 🧪 TEST CHECKPOINT T2 — Phase 1 Complete
> **Trigger:** After Tasks 1.2, 1.3, 1.4, 1.5, 1.6, and 1.7 are all merged. Spin up a test agent with `TESTING-PLAN.md` → **Test Suite T2**.
> **What to verify:** All `window.confirm()` replaced with modal dialogs. Modals have focus trap, Escape key, click-outside-close. All icon-only buttons have `aria-label`. Hover-only buttons are always visible. Button disabled states work. Focus rings visible on sidebar nav and custom elements.
> **Status:** ✅ VERIFIED — All 18 checks passed (2026-03-16)

---

## PHASE 2: HIGH PRIORITY

### Task 2.1: Create Skeleton Screen Components
**Priority:** HIGH
**Effort:** 4-5 hours
**Dependencies:** None

**Description:**
Every admin page shows a centered `Loader2` spinner during loading. Replace with skeleton screens that match the page layout. See `CODE-EXAMPLES.md` Example 3.

**Components to create in `components/ui/skeleton.tsx` and `components/shared/skeletons.tsx`:**
- [x] Base `Skeleton` component (pulse animation bar)
- [x] `TableSkeleton` - header + rows matching table layout
- [x] `CardSkeleton` - matching entity card layout
- [x] `FormSkeleton` - matching form field layout
- [x] `PageHeaderSkeleton` - title + description + action button
- [x] `DashboardStatsSkeleton` - matching dashboard cards

**Pages to update (replace `Loader2` spinner with appropriate skeleton):**
- [x] Dashboard, businesses, services, locations
- [x] posts, pages, reviews, tools
- [x] industries, case-studies, downloads, associates
- [x] knowledge-entities, people, blog-topics
- [x] redirects, error-logs, generation

**Status:** [x] COMPLETED — 2026-03-16

> ### 🧪 TEST CHECKPOINT T3 — Skeleton Screens
> **Trigger:** After Task 2.1 is merged. Spin up a test agent with `TESTING-PLAN.md` → **Test Suite T3**.
> **What to verify:** Every admin page shows a skeleton (not a centered spinner) during initial load. Skeletons match the page layout (table vs card vs form). No layout shift when data loads in.

---

### Task 2.2: Implement Form Validation with Inline Errors
**Priority:** HIGH
**Effort:** 6-8 hours
**Dependencies:** Task 1.1 (toast for submit-time error summary)

**Description:**
Zero inline validation exists. Forms fail silently. Add Zod schemas (already installed) with real-time validation on blur. See `CODE-EXAMPLES.md` Example 6.

**Steps:**
- [ ] Create `lib/validation/business.ts` - Zod schema for business form
- [ ] Create `lib/validation/service.ts` - Zod schema for service form
- [ ] Create `lib/validation/location.ts` - Zod schema for location form
- [ ] Create `components/forms/ValidatedInput.tsx` - input with error display, `aria-invalid`, `aria-describedby`
- [ ] Add required field indicators (`*`) to all required fields
- [ ] Validate on blur, show inline errors below fields
- [ ] Error summary toast on submit if invalid
- [ ] Red border on invalid fields, green on valid

**Status:** [ ] NOT STARTED

> ### 🧪 TEST CHECKPOINT T4 — Form Validation
> **Trigger:** After Task 2.2 is merged. Spin up a test agent with `TESTING-PLAN.md` → **Test Suite T4**.
> **What to verify:** Required fields show inline errors on blur. Submitting an empty form shows error summary toast. `aria-invalid` set on invalid fields. Red/green border states render. Business, Service, and Location forms all validate correctly.

---

### Task 2.3: Add Form Progress Indicator
**Priority:** LOW (downgraded from HIGH - forms aren't complex enough to justify)
**Effort:** 3-4 hours
**Dependencies:** Task 2.2

**Description:**
Add step indicators to long forms. **Deprioritized** because current forms are single-page and not long enough to warrant multi-step UX. Revisit if forms grow.

**Status:** [ ] NOT STARTED (deprioritized)

---

### Task 2.4: Improve Table Functionality
**Priority:** HIGH
**Effort:** 5-6 hours
**Dependencies:** None

**Description:**
Add sorting, filtering, and pagination to data tables.

**Steps:**
- [ ] Create `components/ui/data-table.tsx` with sort/filter/pagination
- [ ] Column sorting with chevron indicators
- [ ] Client-side search filter
- [ ] Pagination with items-per-page selector
- [ ] Empty search state message

**Tables to update:**
- [ ] Services, Locations, Pages, Posts, People, Downloads

**Status:** [ ] NOT STARTED

---

### Task 2.5: Create Reusable Modal/Dialog Component
**Priority:** HIGH
**Effort:** 3-4 hours
**Dependencies:** Task 1.5 (may already be created there - extend if needed)

**Description:**
If Task 1.5 creates a basic Dialog, this task extends it with size variants, scroll lock, and animations. If Task 1.5 already covers everything, merge into 1.5.

**Additional features beyond Task 1.5:**
- [ ] Size variants (sm, md, lg, xl)
- [ ] Scroll lock when open
- [ ] Enter/exit animations
- [ ] Nested dialog support (modal over modal)

**Status:** [ ] NOT STARTED

---

### Task 2.6: Standardize Error Display (NEW - from audit)
**Priority:** HIGH
**Effort:** 2-3 hours
**Dependencies:** Task 1.1

**Description:**
Error handling is inconsistent: some pages use `alert()`, some use state, some just `console.error()`. The businesses page shows raw SQL errors to users. Standardize.

**Steps:**
- [ ] Create error display utility that sanitizes technical errors into user-friendly messages
- [ ] Never show raw SQL/database errors to users
- [ ] Create `components/shared/ErrorBanner.tsx` for page-level errors
- [ ] Pattern: try/catch > toast.error(user-friendly message) > console.error(technical details)
- [ ] Remove `setDetailedError` patterns that expose internals

**Status:** [ ] NOT STARTED

---

### Task 2.7: Tab Component Accessibility (NEW - from audit)
**Priority:** HIGH
**Effort:** 2 hours
**Dependencies:** None

**Description:**
Posts and Pages use tab interfaces (`activeTab` state) with conditional CSS visibility. These need proper ARIA roles.

**Steps:**
- [ ] Add `role="tablist"` to tab container
- [ ] Add `role="tab"`, `aria-selected`, `aria-controls` to each tab button
- [ ] Add `role="tabpanel"`, `aria-labelledby`, `id` to each panel
- [ ] Replace `display:none` / visibility toggling with `aria-hidden` where appropriate

**Files to update:**
- [ ] `app/admin/posts/page.tsx` - content/SEO/FAQ tabs
- [ ] `app/admin/pages/page.tsx` - content/SEO tabs
- [ ] Any other tab interfaces

**Status:** [ ] NOT STARTED

---

## PHASE 3: MEDIUM PRIORITY

### Task 3.1: Implement Dark Mode
**Priority:** MEDIUM
**Effort:** 6-8 hours
**Dependencies:** All Phase 1 tasks (UI must be stable first)

**Description:**
Add dark mode toggle. See `DESIGN-MOCKUPS.md` Design 9 for color palette.

**Steps:**
- [ ] Dark mode toggle in sidebar header
- [ ] System preference detection
- [ ] Persist choice in localStorage
- [ ] Update all components with `dark:` Tailwind variants
- [ ] Colors: bg slate-900/800, text slate-100/300, borders slate-700

**Status:** [ ] NOT STARTED

---

### Task 3.2: Create Tooltip Component
**Priority:** MEDIUM
**Effort:** 2-3 hours
**Dependencies:** None

**Description:**
Add tooltips to icon buttons and status indicators for additional context.

**Status:** [ ] NOT STARTED

---

### Task 3.3: Add Keyboard Shortcuts
**Priority:** MEDIUM
**Effort:** 3-4 hours
**Dependencies:** None

**Description:**
Add keyboard shortcuts for power users. See `CODE-EXAMPLES.md` Example 8.

**Shortcuts:** Ctrl/Cmd+S (save), ? (help), Ctrl/Cmd+K (command palette), Escape (close modals)

**Status:** [ ] NOT STARTED

---

### Task 3.4: Create Command Palette
**Priority:** MEDIUM
**Effort:** 5-6 hours
**Dependencies:** Task 3.3

**Description:**
Ctrl/Cmd+K command palette for quick navigation and actions.

**Status:** [ ] NOT STARTED

---

### Task 3.5: Improve Empty States
**Priority:** MEDIUM
**Effort:** 3-4 hours
**Dependencies:** None

**Description:**
Enhance empty states with better messaging and CTAs. See `DESIGN-MOCKUPS.md` Design 6.

**Status:** [ ] NOT STARTED

---

## PHASE 4: LOW PRIORITY

### Task 4.1: Basic Responsive Layout
**Priority:** LOW
**Effort:** 4-6 hours

**Description:**
Sidebar hamburger menu, horizontal table scroll, stacked forms on mobile. May not be needed for admin-only CMS.

**Decision:** Pending

**Status:** [ ] NOT STARTED

---

## Quality Assurance Checklist

Before marking any task complete, verify:

**Code Quality:**
- [ ] `npm run build` passes (TypeScript compiles)
- [ ] No console errors in browser
- [ ] Follows existing code patterns (Tailwind, React hooks, Supabase client)

**Accessibility:**
- [ ] Tab through all interactive elements - focus visible
- [ ] Screen reader: all buttons/inputs have labels
- [ ] Color contrast meets WCAG AA (4.5:1 text, 3:1 large text)

**UX:**
- [ ] Loading states show skeleton or spinner (never blank)
- [ ] Errors show user-friendly toast (never raw SQL)
- [ ] Success actions show confirmation toast
- [ ] No layout shifts during loading

---

## Progress Tracker

| Phase | Tasks | Completed | Progress |
|-------|-------|-----------|----------|
| P0: Content Model | 2 | 2 | 100% ✅ |
| P1: Content Model | 3 | 3 | 100% ✅ |
| P2: Content Model | 5 | 1 | 20% |
| P3: Content Model | 3 | 0 | 0% |
| Phase 1: Critical | 7 | 7 | 100% ✅ |
| Phase 2: High | 7 | 0 | 0% |
| Phase 3: Medium | 5 | 0 | 0% |
| Phase 4: Low | 1 | 0 | 0% |
| **TOTAL** | **33** | **13** | **39%** |

> **CMS agents are unblocked as of 2026-03-17.** Content Model Alignment (P0+P1) is complete. P2/P3 items and all UI/UX phases (1–4) are ready to start.

---

## Recommended Execution Order

This is the optimal order accounting for dependencies:

**Content Model Alignment (P0-P3):**
1. **P0: Downloads CRUD** - Add database management to `/admin/downloads`
2. **P1: Hero fields** - Add hero component fields to forms
3. **P1: SEO fields** - Add canonical_url, og_image_url to all content types
4. **P1: Entity linking** - Add about_entities/mentions_entities selectors
5. **P2: Deliverables** - Structured repeatable component
6. **P2: Pricing UI** - Editor for pricing_data JSONB
7. **P2: Process Steps** - Structured editor for service processes
8. **P2: Contact/Legal** - Form fields for static pages
9. **P3: FAQ editor** - Structured question/answer builder
10. **P3: Testimonial filters** - Service/industry filter selectors
11. **P3: Author selector** - Blog post author_person_id

**UI/UX Improvements (Phase 1-4):**
1. **Task 1.1** - Toast system (unblocks everything else)
2. **Task 1.5** - Confirm dialog (paired with toast, replaces confirm())
3. **Task 1.7** - Fix hover-only buttons (quick win)
4. **Task 1.2** - Verify button disabled states (quick win)
5. **Task 1.4** - ARIA labels (high impact, no dependencies)
6. **Task 1.6** - Retrofit existing modals (uses Dialog from 1.5)
7. **Task 1.3** - Focus rings on non-component elements
8. **Task 2.1** - Skeleton screens
9. **Task 2.7** - Tab accessibility
10. **Task 2.6** - Standardize error display
11. **Task 2.2** - Form validation
12. **Task 2.4** - Table functionality
13. **Task 2.5** - Extended dialog features
14. Phase 3 tasks in any order
15. Phase 4 if needed

---

## Resources

**Already Installed:** Tailwind CSS, Lucide React (icons), Zod (validation), React Hook Form
**To Install:** Sonner (`npm install sonner`)
**Optional:** Radix UI (for Tooltip/advanced components)

**Reference Docs:**
- `CODE-EXAMPLES.md` - Implementation patterns for each task
- `DESIGN-MOCKUPS.md` - Visual targets for UI components

---

## Front-End Website Alignment

> **IMPORTANT:** This CMS shares a Supabase backend with the pomegranate public website at `C:\Users\k_che\Documents\TEST NEW POMEGRANATE WEBSITE 13-03-2026`. Both projects write to/read from the same database. Coordinate carefully.

### Shared Supabase Tables (DO NOT change schemas without coordinating)

The front-end reads from these tables via `@supabase/supabase-js` anon key (read-only, RLS enforced):
- `blog_posts` — Blog hub + individual post pages
- `services` — SEO Services, Web Design, SEO Training pages (inc. `keyword_cycling_blocks`, `pricing_data` JSONB)
- `industries` — 5 industry vertical pages
- `target_locations` + `pseo_page_instances` — Location + local service pages
- `free_tools` — Free Tools Hub
- `downloads` — Downloads page
- `reviews` — Testimonials across service/industry/home pages
- `pages` — Static page metadata + keyword cycling
- `associates` — "Trusted By" partner logos
- `pricing_plans` — Pricing cards on service pages
- `redirects` — 301 redirect resolution (checked in front-end SPA router)
- `subscribers` — Mailing list sign-ups
- `media_metadata` — Image alt text/metadata

### Rules for CMS Agents

1. **Never rename DB columns** without checking the front-end hooks in `src/hooks/` (e.g. `useBlogPosts.ts`, `useReviews.ts`, `useService.ts`, `useLocation.ts`, `useDownloads.ts`, `useFreeTools.ts`, `usePage.ts`, `usePricingPlans.ts`, `useRedirects.ts`).
2. **Never drop or modify RLS policies** — the front-end relies on anon-read with `published=true` filters.
3. **Content saved in CMS must render cleanly** in the front-end's React Markdown renderer (`react-markdown`). Avoid HTML in blog post `content_body` — use Markdown only.
4. **Keyword cycling blocks** use this JSONB shape: `[{ prefix: "...", keywords: ["...", "..."] }]`. The front-end TypewriterSection component consumes this directly.
5. **Image URLs** — Blog images are in Supabase Storage bucket `blog-images`. Downloads in bucket `downloads`. Use public URLs when saving references.

### Brand Guidelines Summary (for CMS UI)

The public website follows `brand_guidelines_ai_compact.json`. Key rules the CMS should also respect:
- **Primary colours:** `#f43f5e` (rose), `#be123c` (deep rose), `#0f0508` (near-black), `#fff7fa` (cream)
- **Green accents:** `#4ade80` (leaf spring), `#166534` (leaf dark) — for success states
- **Fonts:** Display = Space Grotesk, Body = Inter, Logo = Outfit 900
- **"pomegranate" is always lowercase** in user-facing text
- **No pill buttons** — use `rounded-lg` or `rounded-xl` only (not `rounded-full` on interactive elements)
- The CMS is internal-only so doesn't need to match the front-end design 1:1, but should feel cohesive — use the same colour palette for accents, success/error states, and brand touches

### What the Front-End Needs from CMS

- **C6: Service page reviews** ✅ DONE — Front-end `useReviewsByServiceSlug()` hook live. Reviews need correct `service_slug` values in DB.
- **F2: Industry keyword cyclers** ✅ DONE — All industry pages use `useIndustry()` hook reading `keyword_cycling_blocks` from DB.
- **K1: Redirects CRUD** ✅ DONE — `/admin/redirects` exists with full CRUD. 77 WordPress redirects imported. `RedirectHandler` in front-end SPA router reads from `redirects` table.
- **Booking/Cal.com (front-end)** ✅ DONE — Full booking flow working: availability (`api/availability.ts` via Cal.com v2 slots) → booking (`api/book.ts` via Cal.com v1) → Google Meet event auto-created. Local dev runs via `local-api-server.ts` + Vite proxy.
- **L1: Content population** — Front-end reads from DB for all service/industry/static pages with hardcoded fallbacks. Remaining gap: P2/P3 CMS form editors for Deliverables, Pricing, Process Steps.

---

**Version:** 5.0 (Session Updates Applied)
**Last Updated:** 2026-03-17

**Changes from v4.0:**
- P0: `downloads` database CRUD marked COMPLETE (`lib/db/downloads.ts` + `DownloadForm`)
- P1: All three rows (Hero fields, SEO fields, Entity linking) marked COMPLETE
- P2: Deliverables split into services (COMPLETE) and industries (NOT STARTED)
- Added "✅ Content Model Alignment — COMPLETE" banner — CMS agents now unblocked
- Added completed items table: Admin Route Fix, Environments comma input, IndustryForm.tsx, Redirects admin UI, 404 Logs dashboard, Weekly 404 email
- Updated Progress Tracker (21% overall, P0+P1 at 100%)
- Updated "What the Front-End Needs from CMS" — C6, F2, K1, booking all marked DONE

**Changes from v3.0:**
- Added P0-P3 Content Model Alignment section at top
- P0: `pseo_page_instances` admin UI marked COMPLETE (exists at /admin/generation)
- P0: `downloads` database CRUD enhancement added as blocking task
- Updated Progress Tracker to include Content Model phase
- Added implementation details for downloads database CRUD

**Changes from v2.0:**
- Added Front-End Website Alignment section with shared table reference
- Added Rules for CMS Agents (schema safety, RLS, Markdown content)
- Added Brand Guidelines Summary for CMS UI consistency
- Added "What the Front-End Needs from CMS" dependency list

**Changes from v1.0:**
- Task 1.2 downgraded to verification (already implemented in button.tsx)
- Task 1.3 scope narrowed (Button/Input already have focus rings)
- Task 2.3 deprioritized to LOW (forms not complex enough)
- Added Task 1.6: Retrofit Existing Modals
- Added Task 1.7: Fix Hover-Only Action Buttons
- Added Task 2.6: Standardize Error Display
- Added Task 2.7: Tab Component Accessibility
- Added recommended execution order
- Added missing files to Task 1.1 (shared components with alert() calls)
- Added dependency notes between tasks
- Added CLAUDE.md reference for agents
