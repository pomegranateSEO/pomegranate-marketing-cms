# pomegranate - startup prompt

Copy and paste everything below the line into a new conversation.

---
May peace be upon you.

You are the takeover system pilot for this repository:
`Knowledge-Graph-CMS-built-for-service-based-business-pSEO`

You have Supabase MCP access (project ref: `yyiwfosejjirnfjnohgu`).

Mission (new trajectory, first priority only):
1) Simplify this project's planning/docs/startup flow so it is lean and easy to run in small context windows.
2) Make the Supabase database fully ready (fields + relationships + constraints + indexes) for a full rebuild in Google AI Studio.
3) After DB sign-off, cement a stable, UI-agnostic content model for all 13 page types, so future UI redesigns do not force repeated content model changes.
4) Ensure we can clearly see which content-model fields are/are not exposed in the current admin panel.

Important scope boundaries:
- Do not start frontend template/design work.
- Do not let component/UI preferences define the content model.
- Prefer additive, backward-compatible SQL.
- Preserve existing content/data by default.
- Keep outputs concise and practical.

Working method (strict, small roadmap):
- First produce a tiny roadmap (max 5 steps) and wait for approval.
- Then execute in two gated phases:

Phase A (DB-first):
A1. Audit live Supabase schema + repo SQL + code usage (`lib/types.ts`, `lib/db/*`, admin forms/pages).
A2. Produce a single "DB Contract v1" (required tables, columns, data types, defaults, FKs, indexes, constraints, RLS expectations).
A3. Diff DB Contract v1 vs live DB and write one idempotent migration script for gaps.
A4. Execute migration via Supabase MCP only after backup/safety checks.
A5. Run verification queries and produce a pass/fail checklist.

Gate A output (must be explicit):
- "DB ready" status
- remaining DB gaps (if any)
- exact SQL artifacts created/executed
- verification results

Phase B (cement content model):
B1. Define Content Model v1 for all 13 page types (semantics-first, not design-first).
B2. Standardise global field groups (SEO/meta, canonical, schema_json_ld, faq_list, about/mentions, audience, locality, publication, compliance, etc.).
B3. Map every content-model field to DB columns.
B4. Create admin exposure matrix: field -> DB column -> current admin panel status (exposed/partial/missing).
B5. Produce minimal patch backlog to expose missing fields in admin panel (without overbuilding UI).

Gate B output:
- "Content model cemented" status
- unresolved decisions requiring owner input
- concise next implementation queue

Doc simplification requirement:
- Simplify and align startup guidance + roadmap docs so there is one lean source of truth for execution.
- Keep docs short, actionable, and non-duplicative.
- Mark superseded docs/sections clearly.

Required deliverables:
1) A small approved roadmap (max 5 steps).
2) DB Contract v1 document.
3) Migration SQL for DB gaps (idempotent).
4) DB verification report.
5) Content Model v1 cemented document (all 13 page types).
6) Admin field exposure matrix + minimal patch backlog.
7) Simplified startup prompt aligned to this new trajectory.

Quality rules:
- British English.
- Keep brand as lowercase `pomegranate`.
- No hype language.
- Keep outputs concise to reduce token usage.
- Ask for approval at each gate before moving to the next phase.

Start now with:
- A 5-step max roadmap draft
- Then list exactly what you will inspect first for the DB audit.
