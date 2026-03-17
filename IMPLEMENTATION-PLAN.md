# Pomegranate CMS - UI/UX Implementation Plan

**Project:** Pomegranate v2 CMS Admin Panel UI/UX Improvements
**Created:** March 16, 2026
**Last Updated:** March 17, 2026 (v6.0 - UI/UX Only)
**Status:** Phase 1 & 2 Complete — Ready for Phase 3
**Priority:** CRITICAL > HIGH > MEDIUM > LOW

**🎉 Recent Updates (March 17, 2026):**
- ✅ Phase 2 UI/UX: All 7 tasks completed (Form Validation, Tables, Dialogs, Error Display, Tab Accessibility)
- ✅ Brand Alignment: Updated colors to pomegranate palette, added Space Grotesk/Outfit fonts
- 🔄 Ready for Phase 3: Dark Mode, Tooltips, Keyboard Shortcuts

**Companion Docs:**
- `CODE-EXAMPLES.md` - Working code examples for each task
- `DESIGN-MOCKUPS.md` - ASCII visual references for target UI
- `CONTENT-MODEL-TASKS.md` - Non-UI/UX work (separate file for CMS feature agents)

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

**Status:** [x] COMPLETED — 2026-03-16

---

### Task 1.2: Fix Button Disabled States
**Priority:** CRITICAL
**Effort:** 30 minutes
**Dependencies:** None

**Description:**
The Button component (`components/ui/button.tsx`) already has `disabled:pointer-events-none disabled:opacity-50` in its className. **This task is a verification** - confirm it works across all variants and that no page is overriding it.

**Status:** [x] COMPLETED — 2026-03-16

---

### Task 1.3: Add Focus Rings to Non-Component Elements
**Priority:** CRITICAL
**Effort:** 2 hours (reduced - Button/Input already have focus rings)
**Dependencies:** None

**Description:**
Button and Input components already have `focus-visible:ring-2` styles. The gap is in **sidebar nav links, table rows, clickable cards, and custom interactive elements** that bypass the Button component.

**Status:** [x] COMPLETED — 2026-03-16

---

### Task 1.4: Add ARIA Labels to Icon-Only Buttons
**Priority:** CRITICAL
**Effort:** 2 hours
**Dependencies:** None

**Description:**
Every icon-only button needs `aria-label`. Icons should get `aria-hidden="true"`. There are ~50+ instances. See `CODE-EXAMPLES.md` Example 4.

**Status:** [x] COMPLETED — 2026-03-16

---

### Task 1.5: Create Confirmation Modal Component
**Priority:** CRITICAL
**Effort:** 2-3 hours
**Dependencies:** Task 1.1 (toast system needed for post-action feedback)

**Description:**
Replace all `window.confirm()` calls with a styled modal dialog. There are 15+ `confirm()` instances. See `CODE-EXAMPLES.md` Example 2 for full implementation.

**Status:** [x] COMPLETED — 2026-03-16

---

### Task 1.6: Retrofit Existing Modals (NEW - from audit)
**Priority:** CRITICAL
**Effort:** 2-3 hours
**Dependencies:** Task 1.5 (use the same Dialog component)

**Description:**
The codebase has 3+ inline modals built as bare `<div>` overlays without accessibility. These need to be converted to use the Dialog component from Task 1.5.

**Status:** [x] COMPLETED — 2026-03-16

---

### Task 1.7: Fix Hover-Only Action Buttons (NEW - from audit)
**Priority:** CRITICAL
**Effort:** 1 hour
**Dependencies:** None

**Description:**
Some pages hide action buttons behind `opacity-0 group-hover:opacity-100`. These are invisible to keyboard users and non-functional on touch devices. Make them always visible.

**Status:** [x] COMPLETED — 2026-03-16

---

## PHASE 2: HIGH PRIORITY

### Task 2.1: Create Skeleton Screen Components
**Priority:** HIGH
**Effort:** 4-5 hours
**Dependencies:** None

**Description:**
Every admin page shows a centered `Loader2` spinner during loading. Replace with skeleton screens that match the page layout. See `CODE-EXAMPLES.md` Example 3.

**Status:** [x] COMPLETED — 2026-03-16

---

### Task 2.2: Implement Form Validation with Inline Errors
**Priority:** HIGH
**Effort:** 6-8 hours
**Dependencies:** Task 1.1 (toast for submit-time error summary)

**Description:**
Zero inline validation exists. Forms fail silently. Add Zod schemas (already installed) with real-time validation on blur. See `CODE-EXAMPLES.md` Example 6.

**Status:** [x] COMPLETED — 2026-03-17

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

**Status:** [x] COMPLETED — 2026-03-17

---

### Task 2.5: Create Reusable Modal/Dialog Component
**Priority:** HIGH
**Effort:** 3-4 hours
**Dependencies:** Task 1.5 (may already be created there - extend if needed)

**Description:**
If Task 1.5 creates a basic Dialog, this task extends it with size variants, scroll lock, and animations. If Task 1.5 already covers everything, merge into 1.5.

**Status:** [x] COMPLETED — 2026-03-17

---

### Task 2.6: Standardize Error Display (NEW - from audit)
**Priority:** HIGH
**Effort:** 2-3 hours
**Dependencies:** Task 1.1

**Description:**
Error handling is inconsistent: some pages use `alert()`, some use state, some just `console.error()`. The businesses page shows raw SQL errors to users. Standardize.

**Status:** [x] COMPLETED — 2026-03-17

---

### Task 2.7: Tab Component Accessibility (NEW - from audit)
**Priority:** HIGH
**Effort:** 2 hours
**Dependencies:** None

**Description:**
Posts and Pages use tab interfaces (`activeTab` state) with conditional CSS visibility. These need proper ARIA roles.

**Status:** [x] COMPLETED — 2026-03-17

---

## PHASE 3: MEDIUM PRIORITY

### Task 3.1: Implement Dark Mode
**Priority:** MEDIUM
**Effort:** 6-8 hours
**Dependencies:** All Phase 1 tasks (UI must be stable first)

**Description:**
Add dark mode toggle. See `DESIGN-MOCKUPS.md` Design 9 for color palette.

**Steps:**
- [x] Dark mode toggle in sidebar header
- [x] System preference detection
- [x] Persist choice in localStorage
- [x] Update all components with `dark:` Tailwind variants
- [x] Colors: bg slate-900/800, text slate-100/300, borders slate-700
- [x] Fix white-on-white issues (March 17, 2026)

**Status:** [x] COMPLETED — 2026-03-17

---

### Task 3.2: Create Tooltip Component
**Priority:** MEDIUM
**Effort:** 2-3 hours
**Dependencies:** None

**Description:**
Add tooltips to icon buttons and status indicators for additional context.

**Status:** [x] COMPLETED — 2026-03-17

---

### Task 3.3: Add Keyboard Shortcuts
**Priority:** MEDIUM
**Effort:** 3-4 hours
**Dependencies:** None

**Description:**
Add keyboard shortcuts for power users. See `CODE-EXAMPLES.md` Example 8.

**Shortcuts:** Ctrl/Cmd+S (save), ? (help), Ctrl/Cmd+K (command palette), Escape (close modals)

**Status:** [x] COMPLETED — 2026-03-17

---

### Task 3.4: Create Command Palette
**Priority:** MEDIUM
**Effort:** 5-6 hours
**Dependencies:** Task 3.3

**Description:**
Ctrl/Cmd+K command palette for quick navigation and actions.

**Status:** [x] COMPLETED — 2026-03-17

---

### Task 3.5: Improve Empty States
**Priority:** MEDIUM
**Effort:** 3-4 hours
**Dependencies:** None

**Description:**
Enhance empty states with better messaging and CTAs. See `DESIGN-MOCKUPS.md` Design 6.

**Status:** [x] COMPLETED — 2026-03-17

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
| Phase 1: Critical | 7 | 7 | 100% ✅ |
| Phase 2: High | 7 | 7 | 100% ✅ |
| Phase 3: Medium | 5 | 5 | 100% ✅ |
| Phase 4: Low | 1 | 0 | 0% |
| **TOTAL** | **20** | **19** | **95%** |

---

## Recommended Execution Order

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
**To Install:** Sonner (`npm install sonner`) — already installed in Phase 1
**Optional:** Radix UI (for Tooltip/advanced components)

**Reference Docs:**
- `CODE-EXAMPLES.md` - Implementation patterns for each task
- `DESIGN-MOCKUPS.md` - Visual targets for UI components

---

**Version:** 6.0 (UI/UX Only)
**Last Updated:** 2026-03-17