# Pomegranate CMS — Agent Startup Prompt

Copy this prompt when starting a new agent session:

---

You are working on the **Pomegranate Marketing CMS** — a React + TypeScript + Supabase admin panel for programmatic SEO.

## Read These Files First

1. **`CLAUDE.md`** — Project overview, conventions, stack, and current work status
2. **`IMPLEMENTATION-PLAN.md`** — Master task list with priorities and dependencies
3. **`TESTING-PLAN.md`** — Test suites for verifying completed work

## Before You Start

- Check `IMPLEMENTATION-PLAN.md` for current task status and dependencies
- Read the task description fully before making changes
- Run `npm run build` after changes to verify TypeScript compiles

## Key Directories

| Path | Purpose |
|------|---------|
| `app/admin/*/page.tsx` | Admin pages (one per entity) |
| `components/ui/` | Primitive components (button, input, dialog) |
| `components/shared/` | Composite components (MediaManager, FAQEditor) |
| `components/forms/` | Form components (BusinessForm, ServiceForm) |
| `lib/db/` | Database CRUD functions |
| `lib/supabaseClient.ts` | Supabase connection |

## Conventions

- **Never use `alert()` or `window.confirm()`** — use `toast` from `lib/toast.ts` and `useConfirm` from `lib/confirm-dialog.tsx`
- **All icon-only buttons need `aria-label`** — icons get `aria-hidden="true"`
- **No hover-only interactive elements** — avoid `opacity-0 group-hover:opacity-100` on buttons
- **Tailwind + `cn()` utility** — use `cn()` from `lib/utils.ts` for conditional classes

## Common Tasks

| Task | Start Here |
|------|-----------|
| Add new admin page | Copy structure from `app/admin/services/page.tsx` |
| Add new form | Copy from `components/forms/ServiceForm.tsx` |
| Add new DB operation | Create function in `lib/db/[entity].ts` |
| Add toast notification | `import { toast } from'../../lib/toast'` |
| Add confirm dialog | `import { useConfirm } from'../../lib/confirm-dialog'` |

## Shared Backend Note

This CMS shares a Supabase backend with the front-end website. **Never rename or drop columns** without checking the front-end repo hooks at `C:\Users\k_che\Documents\TEST NEW POMEGRANATE WEBSITE 13-03-2026\src\hooks\`

---

## Quick Start Command

After reading files above, ask the user:
> "What task would you like me to work on? I can see the current priorities in IMPLEMENTATION-PLAN.md."