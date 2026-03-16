# Pomegranate Marketing CMS - Agent Guide

## What This Project Is

A **knowledge graph-based CMS** for programmatic SEO (pSEO). It manages businesses, services, locations, and auto-generates SEO-optimized pages. Built as a single-page admin panel that connects to a Supabase backend.

**Stack:** React 18 + TypeScript, Vite, Tailwind CSS, Supabase (auth + database + storage), Zod, React Hook Form, Lucide React icons. Deployed on Vercel.

**Architecture:** HashRouter SPA. Auth-gated admin panel. All data via Supabase client (`lib/supabaseClient.ts`). No API routes - everything is client-side.

## Project Structure

```
App.tsx                          # Root - auth check, routing, sidebar layout
app/
  auth/page.tsx                  # Login/signup page
  admin/
    page.tsx                     # Dashboard
    businesses/page.tsx          # Root entity (business identity/brand)
    services/page.tsx            # Service management
    locations/page.tsx           # Location management with geo expansion
    pages/page.tsx               # Static page management + keyword cycling
    posts/page.tsx               # Blog post editor with rich content
    knowledge-entities/page.tsx  # Wikipedia/Wikidata entity research
    blog-topics/page.tsx         # AI-generated topic roadmap (tree structure)
    reviews/page.tsx             # Customer review management
    industries/page.tsx          # Industry vertical management
    case-studies/page.tsx        # Case study management
    downloads/page.tsx           # Downloadable resource management
    tools/page.tsx               # Free tool/calculator management
    associates/page.tsx          # Partner organization management
    people/page.tsx              # Author/people management
    media/page.tsx               # Media library
    generation/page.tsx          # Batch page generation
components/
  ui/                            # Primitives: button, input, textarea, label
  shared/                        # Composite: MediaManager, FAQEditor, VisualContentEditor, EntityGenerator
  forms/                         # BusinessForm, ServiceForm, LocationForm
  layout/                        # Sidebar
lib/
  supabaseClient.ts              # Supabase client init
  supabase/                      # Database operations (CRUD functions per entity)
  utils.ts                       # cn() utility (Tailwind class merge)
```

## Current UI/UX Work (IMPORTANT)

**There is an active UI/UX improvement initiative.** Before making frontend changes, read:

- **`IMPLEMENTATION-PLAN.md`** - The master task list with 20 prioritized tasks across 4 phases. If you are picking up frontend work, find your task here and mark it IN PROGRESS.
- **`CODE-EXAMPLES.md`** - Working code patterns for each task (toast system, confirm dialogs, skeletons, validation, accessibility).
- **`DESIGN-MOCKUPS.md`** - ASCII visual mockups showing before/after targets.

### Key Problems Being Fixed
1. **30+ `alert()` calls** across all admin pages - replacing with Sonner toast notifications
2. **15+ `window.confirm()` calls** - replacing with styled confirmation modals
3. **Zero form validation feedback** - adding Zod inline validation
4. **Every page uses a centered spinner** for loading - replacing with skeleton screens
5. **~50+ icon-only buttons** missing `aria-label` attributes
6. **3+ modals** built as bare divs without focus traps or ARIA
7. **Hover-only action buttons** invisible to keyboard/touch users
8. **Inconsistent error handling** - some show raw SQL errors to users

## Conventions

- **Styling:** Tailwind CSS utility classes. Use `cn()` from `lib/utils.ts` for conditional classes.
- **Icons:** Lucide React (`lucide-react`). Always add `aria-hidden="true"` to decorative icons.
- **State:** React hooks (useState, useEffect). No Redux/Zustand.
- **Data:** All CRUD through functions in `lib/supabase/`. Never call Supabase directly from page components.
- **Forms:** Mix of controlled components and React Hook Form. Moving toward React Hook Form + Zod.
- **Routing:** HashRouter with `react-router-dom`. Admin pages at `/admin/*`.
- **Auth:** Supabase Auth. Session checked in App.tsx. Protected routes redirect to `/auth`.

## Build & Run

```bash
npm install        # Install dependencies
npm run dev        # Dev server (Vite)
npm run build      # Production build (type-checks + bundles)
```

## Shared Backend — CRITICAL

This CMS shares a Supabase backend with the **pomegranate public website** (`C:\Users\k_che\Documents\TEST NEW POMEGRANATE WEBSITE 13-03-2026`). See `IMPLEMENTATION-PLAN.md` → "Front-End Website Alignment" section for full details.

**Key rules:**
- **Never rename/drop DB columns** without checking front-end hooks in the website repo's `src/hooks/`
- **Never modify RLS policies** — the front-end relies on anon-read with `published=true` filters
- **Blog content must be clean Markdown** — the front-end renders with `react-markdown`, not HTML
- **"pomegranate" is always lowercase** in user-facing text

## Do NOT

- Add new dependencies without checking if they're already installed (Zod, Lucide, etc.)
- Use `alert()` or `window.confirm()` - use toast/confirm dialog (see IMPLEMENTATION-PLAN.md Task 1.1/1.5)
- Show raw database/SQL errors to users - sanitize to user-friendly messages
- Create hover-only interactive elements (`opacity-0 group-hover:opacity-100` on buttons)
- Skip `aria-label` on icon-only buttons
- Add `display:none` to tab panels - use proper ARIA patterns instead
- Rename or drop Supabase table columns without coordinating with the front-end website repo
