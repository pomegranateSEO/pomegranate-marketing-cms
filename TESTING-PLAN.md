# Pomegranate CMS - UI/UX Testing Plan

**Companion to:** `IMPLEMENTATION-PLAN.md`
**Purpose:** Static code audits for each implementation checkpoint. Test agents read source files — they do NOT run a browser.
**Last Updated:** 2026-03-16

---

## How to Use This Plan

**For the human:**
When you see a `🧪 TEST CHECKPOINT` block in `IMPLEMENTATION-PLAN.md`, that is your cue to spin up a test agent. Give it this prompt:

```
You are a code auditor for the Pomegranate Marketing CMS at C:\Users\k_che\Documents\pomegranate-marketing-cms.
Read CLAUDE.md for project context, then execute Test Suite [T1/T2/T3/T4] from TESTING-PLAN.md.
For each check, read the relevant source files and report PASS, FAIL, or WARN with file:line references.
Do NOT modify any files. Output a structured report only.
```

**For test agents:**
- Read source files directly — do not run `npm run dev` or open a browser
- Report each check as `PASS`, `FAIL`, or `WARN`
- For FAILs, include the file path and line number
- At the end, give a summary: total checks, passes, fails, warns

---

## Test Suite T1 — Toast Notification System

**Run after:** Task 1.1 is merged
**Checks:** 12

### T1.1 — sonner installed
- Read `package.json`
- PASS if `"sonner"` appears in `dependencies`

### T1.2 — toast utility exists
- Read `lib/toast.ts`
- PASS if file exists and exports a `toast` object with `success`, `error`, `info`, `warning`, `loading`, `dismiss` methods
- PASS if `success` uses `duration: 4000` and `error` uses `duration: 6000`

### T1.3 — Toaster mounted in App.tsx
- Read `App.tsx`
- PASS if `<Toaster` is rendered with `position="top-right"`, `richColors`, and `closeButton`

### T1.4 — No alert() calls remain in source
- Grep all `*.tsx` and `*.ts` files for `alert(`
- PASS if zero results
- FAIL and list every file:line if any remain

### T1.5 — Toast import present in all modified pages
Check that `import { toast } from` exists in each of these files:
- `app/admin/businesses/page.tsx`
- `app/admin/services/page.tsx`
- `app/admin/locations/page.tsx`
- `app/admin/posts/page.tsx`
- `app/admin/pages/page.tsx`
- `app/admin/reviews/page.tsx`
- `app/admin/tools/page.tsx`
- `app/admin/industries/page.tsx`
- `app/admin/case-studies/page.tsx`
- `app/admin/downloads/page.tsx`
- `app/admin/associates/page.tsx`
- `app/admin/knowledge-entities/page.tsx`
- `app/admin/people/page.tsx`
- `app/admin/blog-topics/page.tsx`
- `app/admin/generation/page.tsx`
- `components/shared/MediaManager.tsx`
- `components/shared/EntityGenerator.tsx`
- `components/shared/FAQEditor.tsx`
- `components/shared/AITextGenerator.tsx`
- `components/shared/KnowledgeEntitySelector.tsx`
- `components/editors/PseoPageEditor.tsx`
- `components/forms/LocationForm.tsx`
- `components/forms/business/ContactSection.tsx`
- `components/forms/business/IdentitySection.tsx`
- `components/forms/business/LocationSection.tsx`
- `components/forms/business/BrandSection.tsx`
- PASS if all files contain the import
- FAIL and list missing files if any do not

### T1.6 — Raw DB errors not exposed in toast messages
- Read each page file listed in T1.5
- WARN if any `toast.error()` call passes raw DB error text directly as the *title* (first argument) e.g. `toast.error(err.message)` — the message should be human-readable and the raw error should be the *description* (second argument) at most
- PASS if raw errors are only passed as the description argument or logged to console only

### T1.7 — Success toasts used for positive outcomes
- Read businesses, downloads, locations, knowledge-entities pages
- PASS if `toast.success(` is called after successful save/upload/sync operations (not `toast.error` or `toast.info`)

### T1.8 — TypeScript build passes
- Check that `npm run build` would succeed by verifying the dist output exists, OR
- Read the most recent git commit message to confirm build was verified before merge
- PASS if build was confirmed clean

### T1.9 — toast.warning used for validation nudges (not toast.error)
- Read `components/forms/LocationForm.tsx`, `components/editors/PseoPageEditor.tsx`, `components/forms/business/LocationSection.tsx`
- PASS if validation messages (e.g. "Please enter a location name first") use `toast.warning` not `toast.error`

### T1.10 — toast.info used for neutral informational messages
- Read `app/admin/knowledge-entities/page.tsx`
- PASS if "already in your Knowledge Graph" and "No entities found needing Wikidata URLs" use `toast.info`

### T1.11 — EntityGenerator shows success toast when entities added
- Read `components/shared/EntityGenerator.tsx`
- PASS if `toast.success(` is called when `added > 0`

### T1.12 — No window.confirm() calls remain (scope check only — full replacement is Task 1.5)
- Grep all `*.tsx` files for `window.confirm(` and bare `confirm(`
- This is an INFORMATIONAL check only — record how many remain for tracking purposes. Do NOT fail on this.

---

## Test Suite T2 — Phase 1 Complete

**Run after:** Tasks 1.2, 1.3, 1.4, 1.5, 1.6, and 1.7 are all merged
**Checks:** 18

### T2.1 — No window.confirm() calls remain
- Grep all `*.tsx` files for `window.confirm(` and bare `confirm(`
- PASS if zero results
- FAIL and list file:line if any remain

### T2.2 — Dialog component exists and is accessible
- Read `components/ui/dialog.tsx`
- PASS if file exists
- PASS if it includes `aria-modal="true"`
- PASS if it includes `aria-labelledby`
- PASS if it handles the Escape key (look for `keydown` or `Escape` in the source)
- PASS if it has a backdrop/overlay click-to-close handler

### T2.3 — useConfirm hook exists
- Read `lib/confirm-dialog.tsx`
- PASS if file exports a `useConfirm` hook
- PASS if the hook returns a `ConfirmDialog` component and a `confirm` function

### T2.4 — Confirm dialog used for destructive actions
Check that `useConfirm` (not `window.confirm`) is used in:
- `app/admin/businesses/page.tsx`
- `app/admin/services/page.tsx`
- `app/admin/locations/page.tsx`
- `app/admin/posts/page.tsx`
- `app/admin/pages/page.tsx`
- `app/admin/reviews/page.tsx`
- `app/admin/industries/page.tsx`
- `app/admin/case-studies/page.tsx`
- `app/admin/downloads/page.tsx`
- `app/admin/associates/page.tsx`
- `app/admin/knowledge-entities/page.tsx`
- `app/admin/blog-topics/page.tsx`
- `components/shared/MediaManager.tsx`
- FAIL and list any file that still uses `window.confirm` or bare `confirm(`

### T2.5 — Destructive confirm dialogs use red/destructive button variant
- Read a sample of confirm dialog usages (e.g. delete handlers in businesses, services, locations)
- PASS if the confirm button in destructive dialogs uses `variant="destructive"` or equivalent red styling

### T2.6 — Existing modals retrofitted (Task 1.6)
- Read `app/admin/locations/page.tsx` expansion modal section
- Read `app/admin/posts/page.tsx` media picker modal section
- PASS if both use the Dialog component from `components/ui/dialog.tsx`
- PASS if both have `aria-modal`, `aria-labelledby`, and Escape-close handling

### T2.7 — All icon-only buttons have aria-label
- Read these files and grep for `size="icon"` buttons:
  - `app/admin/businesses/page.tsx`, `services/page.tsx`, `locations/page.tsx`, `posts/page.tsx`, `pages/page.tsx`
  - `reviews/page.tsx`, `tools/page.tsx`, `industries/page.tsx`, `case-studies/page.tsx`
  - `downloads/page.tsx`, `associates/page.tsx`, `knowledge-entities/page.tsx`, `people/page.tsx`
  - `components/layout/Sidebar.tsx`
  - `components/shared/FAQEditor.tsx`, `MediaManager.tsx`
- PASS if every `size="icon"` Button has an `aria-label` prop
- FAIL and list file:line for any that are missing

### T2.8 — Decorative icons have aria-hidden
- In the same files as T2.7, spot-check that Lucide icon components inside icon-only buttons include `aria-hidden="true"`
- PASS if at least the buttons flagged in the plan have `aria-hidden` on their icon child

### T2.9 — Sidebar sign-out button has aria-label
- Read `components/layout/Sidebar.tsx`
- PASS if the sign-out button has `aria-label="Sign out"` or equivalent

### T2.10 — Hover-only buttons fixed in knowledge-entities
- Read `app/admin/knowledge-entities/page.tsx`
- PASS if entity card delete buttons do NOT have `opacity-0` on them
- FAIL if `opacity-0 group-hover:opacity-100` still applies to the delete button

### T2.11 — No new hover-only interactive elements introduced
- Grep all `*.tsx` files for `opacity-0 group-hover:opacity-100`
- WARN if any results are on interactive elements (buttons, links) — acceptable on decorative overlays only

### T2.12 — Sidebar nav items have focus-visible styles (Task 1.3)
- Read `components/layout/Sidebar.tsx`
- PASS if nav links/items include `focus-visible:ring` or `focus-visible:outline` classes

### T2.13 — Button disabled states verified (Task 1.2)
- Read `components/ui/button.tsx`
- PASS if the className includes `disabled:pointer-events-none` and `disabled:opacity-50`
- Read 2-3 pages with save buttons (e.g. services, posts)
- PASS if save buttons use `disabled={saving}` pattern

### T2.14 — No new alert() calls introduced
- Grep all `*.tsx` files for `alert(`
- PASS if zero results

### T2.15 — Modal scroll lock implemented
- Read `components/ui/dialog.tsx`
- PASS if it adds/removes `overflow-hidden` or `overflow: hidden` to `document.body` when open
- WARN if scroll lock is absent (not a hard failure but noted)

### T2.16 — Dialog has focus trap
- Read `components/ui/dialog.tsx`
- PASS if it uses a focus trap mechanism (e.g. `useEffect` that focuses first focusable element, or a library)
- WARN if focus trap appears to be absent

### T2.17 — TypeScript build passes
- Check most recent git commit or dist output to confirm clean build

### T2.18 — IMPLEMENTATION-PLAN.md Phase 1 tasks all marked COMPLETED
- Read `IMPLEMENTATION-PLAN.md`
- PASS if Tasks 1.1 through 1.7 are all marked `[x] COMPLETED`
- WARN for any still marked `[ ]` or `[~]`

---

## Test Suite T3 — Skeleton Screens

**Run after:** Task 2.1 is merged
**Checks:** 8

### T3.1 — Skeleton component exists
- Read `components/ui/skeleton.tsx`
- PASS if file exists with a `Skeleton` base component using pulse animation

### T3.2 — Shared skeleton variants exist
- Read `components/shared/skeletons.tsx`
- PASS if file exists and exports: `TableSkeleton`, `CardSkeleton`, `FormSkeleton`, `PageHeaderSkeleton`

### T3.3 — No centered Loader2 spinners on initial page load
Grep the following files for `Loader2` inside a full-page loading return:
- `app/admin/businesses/page.tsx`, `services/page.tsx`, `locations/page.tsx`
- `app/admin/posts/page.tsx`, `pages/page.tsx`, `reviews/page.tsx`
- `app/admin/tools/page.tsx`, `industries/page.tsx`, `case-studies/page.tsx`
- `app/admin/downloads/page.tsx`, `associates/page.tsx`, `knowledge-entities/page.tsx`, `people/page.tsx`
- PASS if none of the above return a bare `<Loader2 className="animate-spin"` as their loading state
- FAIL and list any file that still uses a centered spinner for the main page load

### T3.4 — Table pages use TableSkeleton
- Read services, locations, posts, pages, people, downloads pages
- PASS if each imports and renders `TableSkeleton` when `loading === true`

### T3.5 — Card pages use CardSkeleton
- Read tools, industries, case-studies, associates, knowledge-entities pages
- PASS if each uses `CardSkeleton` when loading

### T3.6 — Dashboard uses DashboardStatsSkeleton (if implemented)
- Read `app/admin/page.tsx`
- PASS if it uses a skeleton, WARN if still using a spinner (acceptable if deprioritised)

### T3.7 — Skeleton pulse animation defined
- Read `components/ui/skeleton.tsx`
- PASS if the component uses `animate-pulse` or equivalent CSS animation

### T3.8 — TypeScript build passes
- Confirm via git log or dist output

---

## Test Suite T4 — Form Validation

**Run after:** Task 2.2 is merged
**Checks:** 10

### T4.1 — Zod validation schemas exist
- Check that these files exist:
  - `lib/validation/business.ts`
  - `lib/validation/service.ts`
  - `lib/validation/location.ts`
- PASS if all three exist and export a Zod schema

### T4.2 — ValidatedInput component exists
- Read `components/forms/ValidatedInput.tsx`
- PASS if file exists
- PASS if it renders an error message below the input
- PASS if it sets `aria-invalid` when an error is present
- PASS if it sets `aria-describedby` pointing to the error element's id

### T4.3 — Required field indicators present
- Read `components/forms/BusinessForm.tsx` (or equivalent)
- PASS if required fields show a `*` indicator in their label

### T4.4 — Validation triggers on blur
- Read the form implementations in BusinessForm, ServiceForm, LocationForm
- PASS if `mode: 'onBlur'` or equivalent is set in the useForm/zodResolver config
- WARN if only `onSubmit` validation is configured

### T4.5 — Invalid fields have red border
- Read `components/forms/ValidatedInput.tsx`
- PASS if the input has a red border class (e.g. `border-red-500`) applied when in error state

### T4.6 — Valid fields have green border (or neutral — acceptable either way)
- WARN only — green border is a nice-to-have, not required

### T4.7 — Error summary toast on invalid submit
- Read BusinessForm, ServiceForm, or LocationForm submit handlers
- PASS if `toast.error(` is called when form has validation errors on submit

### T4.8 — BusinessForm uses ValidatedInput
- Read `components/forms/BusinessForm.tsx`
- PASS if required fields use the `ValidatedInput` component or equivalent pattern with error display

### T4.9 — ServiceForm uses ValidatedInput
- Read `components/forms/ServiceForm.tsx`
- PASS if required fields use the validated input pattern

### T4.10 — TypeScript build passes
- Confirm via git log or dist output

---

## Summary Table

| Suite | Trigger Task | Checks | Status |
|-------|-------------|--------|--------|
| T1 — Toast System | Task 1.1 ✅ | 12 | Ready to run |
| T2 — Phase 1 Complete | Tasks 1.2–1.7 | 18 | Waiting |
| T3 — Skeleton Screens | Task 2.1 | 8 | Waiting |
| T4 — Form Validation | Task 2.2 | 10 | Waiting |

---

**Version:** 1.0
**Created:** 2026-03-16
