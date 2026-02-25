# pomegranate — phase 0 source-of-truth roadmap

**Status:** draft — awaiting sign-off  
**Date created:** 25 february 2026  
**Last updated:** 25 february 2026  
**Author:** system pilot (gemini)  
**Repository:** `pomegranateSEO/Knowledge-Graph-CMS-built-for-service-based-business-pSEO`  
**Brand compliance:** this document follows `Branding/brand_guidelines_full.md` — British English, lowercase `pomegranate`, plain language, no hype.

---

## table of contents

1. [executive summary](#1-executive-summary)
2. [assumptions](#2-assumptions)
3. [discovery questions — answered](#3-discovery-questions--answered)
4. [live database audit](#4-live-database-audit)
5. [CMS codebase audit](#5-cms-codebase-audit)
6. [schema template analysis](#6-schema-template-analysis)
7. [detailed phase-by-phase roadmap](#7-detailed-phase-by-phase-roadmap)
8. [strict gate / sign-off points](#8-strict-gate--sign-off-points)
9. [brand compliance checkpoints](#9-brand-compliance-checkpoints)
10. [risk notes](#10-risk-notes)
11. [timeline bifurcation](#11-timeline-bifurcation)
12. [tooling recommendations](#12-tooling-recommendations)
13. [open decisions](#13-open-decisions)
14. [next steps](#14-next-steps)

---

## 1. executive summary

This roadmap consolidates three legacy documents (`content-model-v3`, `content-model-amendments-v3`, `project-roadmap-v3`), one architecture reference (`Headless CMS.txt`), one schema template (`schema_templates/service_page.json`), one live Supabase database, and one CMS codebase into a single, phase-gated execution plan for reaching go-live on `pomegranate.marketing`.

### what exists today

| Layer | State |
|---|---|
| **Supabase** (`pomegranateWebsite`, `yyiwfosejjirnfjnohgu`) | Active, healthy. PostgreSQL 17, `eu-north-1`. 18 tables in `public` schema. 10 migrations applied. `services` has 1 row; `pseo_page_instances` has 1 row. All other content tables have 0 rows. |
| **CMS admin panel** | TypeScript / React / Vite application with 17 admin panels. Source-controlled in this repository. Uses Supabase client. |
| **Vercel** | Account active. Three deployments exist: `pomegranate-new-site.vercel.app`, `blogextras.vercel.app`, `branding-guidelines-pdf-generator-c.vercel.app`. |
| **WordPress** (`pomegranate.marketing`) | Live and receiving traffic. Database exportable. Firecrawl available as fallback for content extraction. |
| **Brand guidelines** | Locked and comprehensive (`Branding/brand_guidelines_full.md`). |
| **Content model** | `content-model-v3` + `content-model-amendments-v3` define the target state. **No amendment SQL has been run on the live database yet.** |
| **Schema template** | `schema_templates/service_page.json` provides the canonical nested schema structure. |

---

## 2. assumptions

1. The CMS codebase in this repository is the single source of truth for the admin panel. We have full source control over it, if the Almighty is willing.
2. No production traffic depends on the current Supabase database (all tables but 2 have 0 rows).
3. The domain `pomegranate.marketing` currently runs a WordPress site — the 301/410 redirect map from `Headless CMS.txt` remains valid.
4. The `knowledgeGraph` Supabase project is entirely separate and out of scope.
5. No amendment migration SQL from `content-model-amendments-v3` has been run on the live database. All amendment columns and tables are yet to be created.
6. Google Stitch MCP is the intended tool for building frontend templates (phase 4).
7. There is no hard deadline — we move at the pace the Almighty permits.

---

## 3. discovery questions — answered

| # | Question | Answer |
|---|---|---|
| Q1 | **Where is the CMS admin panel source code?** | In this repository. `app/admin/` contains 17 panel directories. `components/` has forms and shared UI. `lib/` has database helpers, types, and utilities. |
| Q2 | **Is the CMS a web application we have source control over?** | Yes — TypeScript/React/Vite application. Full source control. |
| Q3 | **Has any migration SQL from `content-model-amendments-v3` been run on the live database?** | **No.** None of the amendment SQL has been executed. All amendment columns (`faq_list` standardisation, `schema_json_ld`, `canonical_url`, `keyword_cycling_blocks`, `people` table, `author_person_id`, `reviewer_person_id`, etc.) are yet to be created — except where the original schema already included some of these columns. |
| Q4 | **`services.audience` column shape?** | Resolved by `schema_templates/service_page.json`. See [section 6](#6-schema-template-analysis) for the locked shape. |
| Q5 | **Is the `knowledgeGraph` Supabase project related?** | No — entirely separate. Ignored. |
| Q6 | **WordPress site state?** | Live and receiving traffic on `pomegranate.marketing`. Database is exportable. Firecrawl is available as a fallback for content extraction. |
| Q7 | **Vercel account?** | Set up. Three existing deployments: `pomegranate-new-site.vercel.app`, `blogextras.vercel.app`, `branding-guidelines-pdf-generator-c.vercel.app`. |
| Q8 | **Timeline pressure?** | None. We move at the pace the Almighty permits. No hard deadline. |

---

## 4. live database audit

**Supabase project:** `pomegranateWebsite` (`yyiwfosejjirnfjnohgu`)  
**Audit date:** 25 february 2026  
**Method:** Supabase MCP `list_tables` against `public` schema.

### 4.1 tables that exist (18 total)

| Table | Rows | RLS |
|---|---|---|
| `businesses` | 0 | ✓ |
| `target_locations` | 0 | ✓ |
| `services` | 1 | ✓ |
| `offers` | 0 | ✓ |
| `pseo_page_instances` | 1 | ✓ |
| `pages` | 0 | ✓ |
| `blog_posts` | 0 | ✓ |
| `reviews` | 0 | ✓ |
| `knowledge_graph_entities` | 0 | ✓ |
| `free_tools` | 0 | ✓ |
| `industries` | 0 | ✓ |
| `case_studies` | 0 | ✓ |
| `associates` | 0 | ✓ |
| `cta_blocks` | 0 | ✓ |
| `blog_topics` | 0 | ✓ |
| `blog_post_topics` | 0 | ✓ |
| `design_templates` | 0 | ✓ |
| `component_library` | 0 | ✓ |
| `business_users` | 0 | ✓ |

### 4.2 gap analysis — content-model-amendments-v3 vs live database

**Key: ✓ = exists, ✗ = missing, ⚠ = exists but needs review**

#### Tables missing entirely

| Required table | Status |
|---|---|
| `public.people` | ✗ — must be created |

#### Column gaps — `pages`

| Required column | Status | Notes |
|---|---|---|
| `faq_list` (jsonb) | ✗ | Standardised FAQ column (locked truth #3). Legacy `faqs` (array of jsonb) exists. |
| `schema_json_ld` (jsonb) | ✗ | Schema cache column (locked truth #2). Legacy `generated_schema_markup` (array of json) exists. |
| `canonical_url` | ✗ | |
| `keyword_cycling_blocks` | ✗ | |

#### Column gaps — `blog_posts`

| Required column | Status | Notes |
|---|---|---|
| `author_person_id` (uuid FK → people) | ✗ | Locked truth #5. Legacy `author_name`, `author_url`, `author_image_url` exist as temporary fields. |
| `reviewer_person_id` (uuid FK → people) | ✗ | Locked truth #5. |
| `faq_list` (jsonb) | ✗ | Legacy `"FAQs"` (array of jsonb) exists. Note the uppercase column name — schema oddity. |
| `schema_json_ld` (jsonb) | ✗ | Legacy `generated_schema_markup` exists. |
| `canonical_url` | ✗ | |
| `keyword_cycling_blocks` | ✗ | |

#### Column gaps — `pseo_page_instances`

| Required column | Status | Notes |
|---|---|---|
| `faq_list` (jsonb) | ✗ | Legacy `unique_faqs` (jsonb) exists. |
| `canonical_url` | ✗ | |
| `keyword_cycling_blocks` | ✗ | |
| `schema_json_ld` | ✓ | Already exists on this table. |

#### Column gaps — `services`

| Required column | Status | Notes |
|---|---|---|
| `long_description` | ✗ | |
| `seo_title` | ✗ | |
| `seo_meta_desc` | ✗ | |
| `canonical_url` | ✗ | |
| `keyword_cycling_blocks` | ✗ | |
| `schema_json_ld` | ✗ | Legacy `base_schema` (jsonb) exists. |
| `audience` | ✓ | Exists as jsonb. Shape to follow `service_page.json` template (see section 6). |
| `faq_list` | ✓ | Already exists — defaults to `'[]'::jsonb`. |

#### Column gaps — `industries`

| Required column | Status | Notes |
|---|---|---|
| `canonical_url` | ✗ | |
| `keyword_cycling_blocks` | ✗ | |
| `faq_list` | ✗ | |
| `schema_json_ld` | ✗ | |

#### Column gaps — `free_tools`

| Required column | Status | Notes |
|---|---|---|
| `seo_title` | ✗ | |
| `seo_meta_desc` | ✗ | |
| `canonical_url` | ✗ | |
| `keyword_cycling_blocks` | ✗ | |
| `faq_list` | ✗ | |
| `schema_json_ld` | ✗ | |

#### Column gaps — `businesses`

| Required column | Status | Notes |
|---|---|---|
| `website_schema_config` | ✗ | |
| `sameas_urls` | ✗ | Array of text for sameAs links |

#### Column gaps — `knowledge_graph_entities`

| Required column | Status | Notes |
|---|---|---|
| `wikidata_qid` | ✓ | Exists. Needs unique index verification. |
| `wikipedia_slug` | ✓ | Exists. Needs unique index verification. |

#### Associates table concern

The `associates.type` column defaults to `'person'`. This contradicts locked truth #4 (associates = external brands/partners/software only). Default should be changed to `'organisation'`, and any UI labelling must reflect that humans go in `people`, not `associates`.

---

## 5. CMS codebase audit

**Audit date:** 25 february 2026  
**Method:** filesystem inspection of repository.

### 5.1 admin panels (17 panels)

| Panel (`app/admin/...`) | Table(s) managed | Form exists? |
|---|---|---|
| `associates/` | `associates` | via shared forms |
| `blog-topics/` | `blog_topics` | via shared forms |
| `businesses/` | `businesses` | `BusinessForm.tsx` |
| `case-studies/` | `case_studies` | via shared forms |
| `cta-blocks/` | `cta_blocks` | via shared forms |
| `downloads/` | (unclear — likely `free_tools`) | via shared forms |
| `generation/` | AI generation panel | — |
| `industries/` | `industries` | via shared forms |
| `knowledge-entities/` | `knowledge_graph_entities` | via shared forms |
| `locations/` | `target_locations` | `LocationForm.tsx` |
| `media/` | storage/media management | — |
| `pages/` | `pages` | via shared forms |
| `posts/` | `blog_posts` | via shared forms |
| `reviews/` | `reviews` | via shared forms |
| `roadmap/` | project roadmap UI | — |
| `services/` | `services` | `ServiceForm.tsx` |
| `tools/` | `free_tools` | via shared forms |

### 5.2 dedicated forms

| Form file | Fields exposed | Key gaps |
|---|---|---|
| `BusinessForm.tsx` | Basic business fields | Missing: `website_schema_config`, `sameas_urls` |
| `LocationForm.tsx` | Full location fields including geo, landmarks | Relatively complete |
| `ServiceForm.tsx` | Core service fields including audience, FAQ | Missing: `seo_title`, `seo_meta_desc`, `canonical_url`, `keyword_cycling_blocks`, `schema_json_ld`, `long_description` |

### 5.3 TypeScript types (`lib/types.ts`)

The types file defines 16+ interfaces. Key observations:

- `Service` type has `faqs?: Json` — needs renaming to `faq_list` after migration
- `BlogPost` type lacks `author_person_id`, `reviewer_person_id`, `faq_list`, `schema_json_ld`
- `StaticPage` type lacks `faq_list`, `schema_json_ld`, `canonical_url`
- `KnowledgeEntity` type lacks `wikidata_qid`, `wikipedia_slug` (even though DB has them)
- No `Person` / `People` type exists yet
- `PseoPageInstance` already has `schema_json_ld`

### 5.4 database helpers (`lib/db/`)

15 database helper files cover all content tables. Each will need updating after migration to include new columns in queries and upserts.

### 5.5 additional modules

| Module | Purpose |
|---|---|
| `lib/ai/` | AI generation utilities (3 files) |
| `lib/schemas/` | Schema generation logic (1 file — needs expansion) |
| `lib/seo/` | SEO utilities (3 files) |
| `lib/transformers/` | Data transformers (1 file) |
| `lib/wikipedia/` | Wikipedia/Wikidata API integration (1 file) |
| `components/editors/` | Rich text / block editors (1 file) |
| `components/shared/` | Shared components (7 files) |
| `components/ui/` | UI components (4 files) |

---

## 6. schema template analysis

**Source:** `schema_templates/service_page.json`

This template file reveals the canonical nested schema structure that all page types must produce. Key insights for database column shapes:

### 6.1 `services.audience` — locked JSONB shape

The template shows `audience` as an **array** containing both `Audience` and `BusinessAudience` types:

```json
"audience": [
  {
    "@type": "Audience",
    "name": "Business Owners",
    "audienceType": "Founders, directors, and decision-makers"
  },
  {
    "@type": "BusinessAudience",
    "name": "Small and medium-sized enterprises",
    "audienceType": "SMEs and growing businesses",
    "sameAs": [
      "https://en.wikipedia.org/wiki/Small_and_medium-sized_enterprises",
      "https://www.wikidata.org/wiki/Q256722"
    ]
  }
]
```

**Locked shape for `services.audience` column:**
```
jsonb — array of objects, each with:
  - "@type": "Audience" | "BusinessAudience"
  - "name": string
  - "audienceType": string
  - "sameAs"?: string[] (optional, Wikipedia/Wikidata links for BusinessAudience)
```

### 6.2 `faq_list` — locked JSONB shape

The template shows FAQ structure as standard `schema.org/Question` + `Answer`:

```json
[
  {
    "@type": "Question",
    "name": "What does this service include?",
    "acceptedAnswer": {
      "@type": "Answer",
      "text": "..."
    }
  }
]
```

**Locked shape for `faq_list` column:**
```
jsonb — array of objects, each with:
  - "@type": "Question" (or omitted — implied)
  - "name": string (the question text)
  - "acceptedAnswer": { "@type": "Answer", "text": string }
```

### 6.3 `areaServed` — nested with sameAs

The template shows `areaServed` referencing both `AdministrativeArea` and `Country` types, each with `sameAs` arrays pointing to Wikipedia and Wikidata. This pattern must be followed by the schema generator when reading from `services.area_served` and `target_locations`.

### 6.4 nesting hierarchy

The template demonstrates the full nesting: `FAQPage` → `isPartOf` → `WebPage` → `isPartOf` → `WebSite` → `publisher` → `Organization`. The schema generator must assemble this hierarchy from data stored across multiple tables (`services`, `businesses`, `target_locations`, `knowledge_graph_entities`).

---

## 7. detailed phase-by-phase roadmap

### phase 0 — initialise project memory and consolidate source of truth

| # | Task | Description | Gate |
|---|---|---|---|
| 0.1 | **Write project memory files** | `task_plan.md`, `findings.md`, `progress.md`, `gemini.md` (project constitution) — committed to repository. | Your approval of this roadmap |
| 0.2 | **Merge content model** | Combine `content-model-v3`, `amendments-v3`, and verified database state into `docs/content-model-v4-final.md`. Mark all superseded assumptions explicitly. | Sign-off from you |
| 0.3 | **Lock JSONB shapes** | Document locked shapes for `audience`, `faq_list`, `area_served`, `opening_hours`, and all other JSONB columns — derived from `service_page.json` and `schema.org` specifications. | Automated (derived from template) |

**Gate 0:** Roadmap signed off. Content model v4 merged. JSONB shapes ratified.

---

### phase 1 — content model sign-off

Most of these items were agreed in earlier sessions. This phase formally records each decision with a sign-off.

| # | Task | Description | Gate |
|---|---|---|---|
| 1.1 | **Confirm 13 page templates** | Review all 13 page templates against the merged v4 content model. | You confirm |
| 1.2 | **Confirm keyword cycling component fields** | Verify structure and render logic. | You confirm |
| 1.3 | **Confirm schema generation policy** | CMS generates schema. `schema_json_ld` stores it. Frontend reads blindly. | Locked truth #2 — already agreed |
| 1.4 | **Confirm about/mentions scope** | `pages`, `blog_posts`, `pseo_page_instances` only. | Already agreed |
| 1.5 | **Confirm KG entity deduplication** | `wikidata_qid` + `wikipedia_slug`. | Already agreed |
| 1.6 | **Confirm `schema_json_ld`** | Single column standard for all content tables. | Locked truth #2 |
| 1.7 | **Confirm schema built in database** | Not at render time. | Already agreed |
| 1.8 | **Confirm `faq_list`** | Single FAQ column, JSONB array of `Question`/`Answer` objects. | Locked truth #3 |
| 1.9 | **Confirm associates = external brands only** | Not human contributors. | Locked truth #4 |
| 1.10 | **Confirm `people` table for humans** | Team members, authors, reviewers. | Locked truth #4 |
| 1.11 | **Confirm blog_posts FK columns** | `author_person_id` and `reviewer_person_id` FK to `people`. | Locked truth #5 |
| 1.12 | **Confirm `services.audience` shape** | Array of `Audience`/`BusinessAudience` objects per `service_page.json`. | Locked truth #6 |
| 1.13 | **Formal sign-off** | No further structural changes without a formal amendment note. | **Hard gate — your signature** |

**Gate 1:** Content model v4 signed off. No changes after this point without formal amendment.

---

### phase 2A — supabase migration (additive, backward-compatible)

All SQL must be idempotent (`IF NOT EXISTS`). All changes are additive — no drops until phase 2A.17.

| # | Task | Description | Dependency |
|---|---|---|---|
| 2A.1 | **Point-in-time backup** | Via Supabase dashboard or `pg_dump`. | — |
| 2A.2 | **Create `public.people` table** | Per amendments-v3 SQL. Columns: `id`, `business_id`, `given_name`, `family_name`, `full_name`, `job_title`, `role`, `bio`, `profile_image_url`, `email`, `website_url`, `social_links`, `schema_person_json`, `published`, `created_at`, `last_updated`. | Phase 1 signed off |
| 2A.3 | **Add columns to `pages`** | `faq_list` (jsonb, default `'[]'`), `schema_json_ld` (jsonb), `canonical_url` (text), `keyword_cycling_blocks` (jsonb, default `'[]'`). | Phase 1 |
| 2A.4 | **Add columns to `blog_posts`** | `author_person_id` (uuid FK → people), `reviewer_person_id` (uuid FK → people), `faq_list` (jsonb, default `'[]'`), `schema_json_ld` (jsonb), `canonical_url` (text), `keyword_cycling_blocks` (jsonb, default `'[]'`). | 2A.2 (people table must exist) |
| 2A.5 | **Add columns to `pseo_page_instances`** | `faq_list` (jsonb, default `'[]'`), `canonical_url` (text), `keyword_cycling_blocks` (jsonb, default `'[]'`). (`schema_json_ld` already exists.) | Phase 1 |
| 2A.6 | **Add columns to `services`** | `long_description` (text), `seo_title` (text), `seo_meta_desc` (text), `canonical_url` (text), `keyword_cycling_blocks` (jsonb, default `'[]'`), `schema_json_ld` (jsonb). (`audience` and `faq_list` already exist.) | Phase 1 |
| 2A.7 | **Add columns to `industries`** | `canonical_url` (text), `keyword_cycling_blocks` (jsonb, default `'[]'`), `faq_list` (jsonb, default `'[]'`), `schema_json_ld` (jsonb). | Phase 1 |
| 2A.8 | **Add columns to `free_tools`** | `seo_title` (text), `seo_meta_desc` (text), `canonical_url` (text), `keyword_cycling_blocks` (jsonb, default `'[]'`), `faq_list` (jsonb, default `'[]'`), `schema_json_ld` (jsonb). | Phase 1 |
| 2A.9 | **Add columns to `businesses`** | `website_schema_config` (jsonb), `sameas_urls` (text array, default `'{}'`). | Phase 1 |
| 2A.10 | **Fix `associates.type` default** | Change from `'person'` to `'organisation'`. | Phase 1 |
| 2A.11 | **Add GIN indexes** | On `about_entities` and `mentions_entities` columns across `pages`, `blog_posts`, `pseo_page_instances`. | 2A.3–2A.5 |
| 2A.12 | **Add unique indexes to KG entities** | On `wikidata_qid` and `wikipedia_slug` (if not already present). | Phase 1 |
| 2A.13 | **Smoke test** | Insert and read back a test row in `pages` with all new columns populated. Verify `people` table with a test insert. | All above |
| 2A.14 | **Backfill `faq_list`** | Copy data from legacy columns (`pages.faqs`, `blog_posts."FAQs"`, `pseo.unique_faqs`) to new `faq_list` columns. Transform array-of-jsonb to jsonb-array format if needed. | 2A.13 |
| 2A.15 | **Validate backfill** | Query each table: `SELECT count(*) WHERE faq_list != '[]'`. Compare against legacy column counts. | 2A.14 |
| 2A.16 | **Enable RLS on `people`** | Match policy pattern from other tables. | 2A.2 |
| 2A.17 | **Drop legacy columns** (deferred) | `pages.faqs`, `blog_posts."FAQs"`, `pseo.unique_faqs`, `services.base_schema`, `*.generated_schema_markup`. **Only after CMS is updated and confirmed compatible (depends on 2B.15).** | 2A.15 + 2B.15 |
| 2A.18 | **Full verification pass** | Every table, every new column, every FK, every index — verified. | All above |

**Gate 2A:** All migration SQL executed. Smoke tests pass. Backfill validated.

---

### phase 2B — CMS admin panel patching

These tasks update the CMS codebase in this repository to support all new and amended columns.

| # | Task | Description | Dependency |
|---|---|---|---|
| 2B.1 | **Update `lib/types.ts`** | Add `Person` type. Update `Service`, `BlogPost`, `StaticPage`, `PseoPageInstance`, `Industry`, `FreeTool`, `Business`, `KnowledgeEntity` types with new fields. Add `FaqItem` and `AudienceItem` shared types. | Migration verified |
| 2B.2 | **Update `lib/db/` helpers** | Update all 15 database helper files to include new columns in queries, inserts, and upserts. Add `lib/db/people.ts`. | 2B.1 |
| 2B.3 | **Build keyword cycling block editor** | Component for editing `keyword_cycling_blocks` (jsonb array). Add to all content editing forms. | 2B.1 |
| 2B.4 | **Build FAQ list editor** | Component for editing `faq_list` (jsonb array of Question/Answer). Add to all content editing forms. Must write to the new `faq_list` column, not legacy columns. | 2B.1 |
| 2B.5 | **Build audience editor** | Component for editing `services.audience` (array of Audience/BusinessAudience objects per locked shape). KG entity picker integration for `sameAs` links. | 2B.1 |
| 2B.6 | **Build schema type selector** | Dropdown for `pages.webpage_type` (WebPage, AboutPage, ContactPage, CollectionPage, FAQPage, etc.). | 2B.1 |
| 2B.7 | **Build people management panel** | Full CRUD for `public.people`. Profile image upload, social links editor, role selection. | 2B.2 |
| 2B.8 | **Build author/reviewer picker** on blog post editor | Dropdown/search selecting from `public.people`. Writes to `author_person_id` and `reviewer_person_id`. | 2B.7 |
| 2B.9 | **Expose SEO fields** | Add `seo_title`, `seo_meta_desc`, `canonical_url` to all content editing forms that lack them (services, industries, free_tools). | 2B.1 |
| 2B.10 | **Build `sameas_urls` editor** on business record | Array editor for sameAs links (social profiles, Wikipedia, Wikidata). | 2B.1 |
| 2B.11 | **Patch associates editor** | Relabel for brands/partners/software only. Change default type suggestion. Add help text clarifying: "this is for external brands and partners — for team members, use the people panel." | 2B.1 |
| 2B.12 | **Update entity picker** for `about_entities` / `mentions_entities` | Ensure it works with the GIN indexes. Test search performance. | 2B.1, 2A.11 |
| 2B.13 | **Add `schema_json_ld` read-only viewer** | Display panel showing the generated schema for any content record. Allow manual override with warning. | 2B.1 |
| 2B.14 | **Update `ServiceForm.tsx`** | Add all missing fields: `long_description`, `seo_title`, `seo_meta_desc`, `canonical_url`, `keyword_cycling_blocks`, `schema_json_ld` viewer. Wire existing `audience` field to new locked shape. | 2B.3, 2B.4, 2B.5, 2B.9 |
| 2B.15 | **QA all CMS panels** | Full walkthrough of every admin panel. Every field exposed. Every save tested. Every new column verified. | All panels updated |

**Gate 2B:** All CMS panels QA'd. Every content model field is accessible from the admin panel.

**Combined Gate 2:** Migration verified (2A.18) AND CMS panels QA'd (2B.15).

---

### phase 3 — schema generation in database

Schema is generated in the backend and stored in `schema_json_ld`. Frontend reads blindly.

| # | Task | Description | Dependency |
|---|---|---|---|
| 3.1 | **Define assembly rules** | Document field → schema property mappings for each page type, based on `service_page.json` nesting hierarchy. | Phase 2 complete |
| 3.2 | **Build WebSite schema generator** | `@type: WebSite`, publisher, potentialAction. | 3.1 |
| 3.3 | **Build Organisation/LocalBusiness generator** | From `businesses` table. Include `sameAs` from `sameas_urls`. | 3.1 |
| 3.4 | **Build WebPage subtype generator** | Per `pages.webpage_type` — WebPage, AboutPage, ContactPage, CollectionPage, FAQPage, etc. | 3.1 |
| 3.5 | **Build Service schema generator** | Including `audience` → `Audience`/`BusinessAudience`, `areaServed` → `AdministrativeArea`/`Country` with `sameAs`. | 3.1 |
| 3.6 | **Build BlogPosting generator** | Person author via `people` table FK, fallback to legacy `author_name` fields. Publisher via `businesses`. | 3.1, 2A.4 |
| 3.7 | **Build FAQPage generator** | Reads `faq_list` → generates FAQPage schema with `isPartOf` to parent WebPage. | 3.1 |
| 3.8 | **Build `about` property generator** | Resolves KG entity UUIDs to schema objects. | 3.1 |
| 3.9 | **Build `mentions` property generator** | Resolves KG entity UUIDs to schema objects. | 3.1 |
| 3.10 | **Build BreadcrumbList generator** | From page hierarchy and URL structure. | 3.1 |
| 3.11 | **Wire all generators** | On save/publish trigger → assemble full nested schema → write to `schema_json_ld`. | All generators built |
| 3.12 | **Test each page type** | One page of each type validated with Google Rich Results Test. | 3.11 |
| 3.13 | **Fix validation errors** | Iterate until all pass. | 3.12 |
| 3.14 | **Backfill `schema_json_ld`** | Re-generate schema for all existing rows (`services` × 1, `pseo` × 1). | 3.11 |

**Gate 3:** Every page type passes Google Rich Results Test validation.

---

### phase 4 — template build (Google Stitch + code)

| # | Task | Description | Dependency |
|---|---|---|---|
| 4A.0 | **Lock component variant selections** | Per template type, per the 3/2/1 rule.  Can begin in parallel with phases 2–3. | — |
| 4B.1–15 | **Build shared components** | Keyword cycler, schema injector, header, footer, breadcrumbs, hero (×3), CTA (×3), feature blocks (×3), testimonials (×3), FAQ (×2), process (×2), author block (×2), local proof (×2), related resources (×2). | 4A.0 + Phase 3 |
| 4C.1–13 | **Build all 13 page templates** | Homepage, Service Category Hub, Specific Service, Location (pSEO), Blog Hub, Blog Post, About, Contact, Industries Hub, Industry, Case Studies Hub, Legal/Utility, Free Tools. | 4B complete |
| 4D.1–6 | **QA** | Field coverage, cycling component, schema rendering, author block, mobile responsiveness, cross-browser, accessibility. | All templates built |

**Brand check point:** Every template must be visually vetted against `brand_guidelines_full.md` — darkness → light flow, colour tokens, typography pair (Manrope + Inter), contrast ≥ 7:1, 44×44 touch targets, mobile-first.

**Gate 4:** All 13 templates QA'd. Schema verified in page source. Brand compliance confirmed.

---

### phase 5 — deploy test site to Vercel

| # | Task | Description | Dependency |
|---|---|---|---|
| 5.1 | **Connect build pipeline** | Stitch → Vercel deployment. | Phase 4 |
| 5.2 | **Configure staging** | Staging environment pointing to Supabase. | 5.1 |
| 5.3 | **Block crawlers** | `robots.txt` disallows all on staging. | — |
| 5.4 | **Smoke test staging** | Create test pages for each template, verify schema renders, verify data flows. | 5.2 |
| 5.5 | **Accessibility audit** | Run automated checks (axe/lighthouse). Manual keyboard-only test. | 5.4 |

**Gate 5:** Staging functional. All 13 template types verified. Accessibility score ≥ 90.

---

### phase 6 — content migration, redirects, and 410s

| # | Task | Description | Dependency |
|---|---|---|---|
| 6.1 | **Export WordPress content** | Database export or Firecrawl crawl + clean. | Phase 5 |
| 6.2 | **Migrate blog posts** | Transform and insert into `blog_posts`. Map authors to `people` table records. | 6.1 |
| 6.3 | **Populate all 63 pages** | Enter content for all pages per content model. | Templates working |
| 6.4 | **Configure 68 × 301 redirects** | Per `Headless CMS.txt` redirect map. | — |
| 6.5 | **Configure 97 × 410 gone responses** | Per `Headless CMS.txt` gone list. | — |
| 6.6 | **Validate redirects** | `curl -I` every redirect and 410. | 6.4, 6.5 |
| 6.7 | **Re-generate all schema** | Trigger schema generation for every content record. | 6.2, 6.3 |

**Gate 6:** All redirects verified. All 63 pages populated. All schema generated.

---

### phase 7 — go-live and domain migration

| # | Task | Description | Dependency |
|---|---|---|---|
| 7.1 | **Point `pomegranate.marketing` to Vercel** | DNS change. | Phase 6 |
| 7.2 | **Remove staging robots.txt blocking** | Allow crawlers. | 7.1 |
| 7.3 | **Submit sitemap** | To Google Search Console. | 7.2 |
| 7.4 | **Monitor** | Watch 301s and 410s for 72 hours post-launch. Monitor Search Console for errors. | 7.3 |
| 7.5 | **Post-launch cleanup** | Drop legacy columns (2A.17), remove temporary fields, archive WordPress database export. | 72-hour stability confirmed |

**Gate 7:** DNS propagated. Sitemap submitted. 72-hour monitoring clean.

---

## 8. strict gate / sign-off points

| Gate | Preceding artefact | Signed off by |
|---|---|---|
| Gate 0 | This roadmap + content model v4 + JSONB shapes | You |
| Gate 1 | Content model v4 formal sign-off | You |
| Gate 2A | Migration verified + smoke tests passing | You |
| Gate 2B | CMS panels QA'd | You |
| Gate 3 | Schema generation passes Rich Results Test | You |
| Gate 4 | All 13 templates QA'd + brand compliance | You |
| Gate 5 | Staging functional + accessibility audit | You |
| Gate 6 | Content migrated + redirects verified | You |
| Gate 7 | DNS switch + 72-hour monitoring | You |

---

## 9. brand compliance checkpoints

These checkpoints are embedded at specific gates. Each references `Branding/brand_guidelines_full.md`.

| Checkpoint | Gate | What to verify |
|---|---|---|
| Language standard | Gate 1 | All column names, help text, and UI labels use British English and plain language. |
| Typography | Gate 4 | Manrope (headings) + Inter (body). No system fonts. |
| Colour tokens | Gate 4 | Primary (#C0392B pomegranate red), secondary (#2C3E50 midnight navy), accent (#27AE60 seed green). No ad-hoc colours. |
| Contrast ratio | Gate 4 | ≥ 7:1 for all text. |
| Touch targets | Gate 4 | ≥ 44×44px for all interactive elements. |
| Darkness → light pattern | Gate 4 | Page flow follows the pomegranate growth metaphor. |
| Mobile-first | Gate 5 | All templates verified on mobile viewports. |
| Content tone | Gate 6 | All migrated content reviewed for tone alignment. |

---

## 10. risk notes

| # | Risk | Severity | Mitigation |
|---|---|---|---|
| R1 | **Migration SQL on live DB** — `services` has 1 row, `pseo` has 1 row. | Low (only 2 rows) | All SQL uses `IF NOT EXISTS`. Backup first (2A.1). |
| R2 | **CMS panel field gaps** — many new columns need UI. | Medium | Systematic approach: types → db helpers → components → forms → QA. One table at a time. |
| R3 | **Associates `type` default is `'person'`** — contradicts locked truth #4. | Medium | Fix in 2A.10 before any data entry occurs. |
| R4 | **Backfill data shape mismatch** — legacy `pages.faqs` is `ARRAY` of `jsonb`, new `faq_list` is `jsonb`. | Low (0 rows in pages) | Validate types before running transform. |
| R5 | **Schema generation complexity** — 8-layer hierarchy with conditional assembly. | High | Build and test one generator at a time. Validate each independently against Rich Results Test. |
| R6 | **WordPress content export** — if the WordPress site changes between now and migration, slugs may drift. | Low | Freeze WordPress content publishing before phase 6. |
| R7 | **Legacy column naming** — `blog_posts."FAQs"` uses uppercase, requiring quoted identifiers in all SQL. | Low | Document in migration SQL comments. Handle in backfill script. |
| R8 | **`KnowledgeEntity` type in code lacks `wikidata_qid`/`wikipedia_slug`** — DB has these columns but TypeScript interface does not. | Medium | Fix in 2B.1 when updating types. |

---

## 11. timeline bifurcation

### must do before go-live

- Phase 0 — roadmap sign-off, content model consolidation
- Phase 1 — content model formal sign-off
- Phase 2A — full database migration (all columns, all tables, `people` table)
- Phase 2B — CMS patching (at minimum: types, db helpers, FAQ editor, author picker, SEO fields)
- Phase 3 — schema generation for all page types (at minimum: WebSite, Organisation, WebPage, Service, BlogPosting, FAQPage, BreadcrumbList)
- Phase 4 — build MVP component set + all 13 page templates
- Phase 5 — staging deployment
- Phase 6 — content migration, all 68 × 301 redirects, all 97 × 410 gone responses
- Phase 7 — DNS switch

### should do before go-live

- Full 3/2/1 variant component plan (all 3 hero variants, 3 CTA variants, etc.)
- `services.audience` fully wired end-to-end (editor → DB → schema generator → frontend render)
- People table fully populated with team bios and Person schema tested
- Reviewer picker wired and tested
- About/mentions property generators tested with real KG entities
- Complete `sameas_urls` for business record

### can do after go-live

- Phase C expansion components (comparison blocks, stats/outcomes, pricing cards)
- Industries pages deep content (hub is placeholder at launch)
- Entity scanner integration (`lib/wikipedia/` — auto-suggest from Wikipedia/Wikidata API)
- Free tools page content population
- Analytics integration and conversion tracking
- Legacy column drops (`generated_schema_markup`, `faqs`, `"FAQs"`, `unique_faqs`, `base_schema`)
- Downloads panel content

---

## 12. tooling recommendations

### Google Stitch MCP — for phase 4 template build

Stitch MCP is available in our development environment and supports:
- Creating projects and screens for UI design
- Generating screens from text prompts — useful for rapidly prototyping all 13 templates
- Editing screens with prompts — for iterating based on brand compliance review
- Generating variants — directly supports the 3/2/1 component variant rule

**Caveat:** Stitch generates design artefacts. The wiring to Supabase (data fetching, schema injection, dynamic routing) must be done in code. Stitch accelerates the UI layer; it does not replace the data layer.

### Vercel MCP — for phase 5+ deployment

Vercel MCP is available and should be connected for deployment, environment variable management, and domain configuration.

### Supabase MCP — for phase 2A migration

Already connected and tested. Use for running migration SQL, verifying table states, and monitoring.

### Firecrawl — for phase 6 content extraction (fallback)

If WordPress database export is not straightforward, Firecrawl can crawl the live site and extract content for transformation and import.

---

## 13. open decisions

| # | Decision needed | Owner | Blocks |
|---|---|---|---|
| OD-1 | **Associates table `type` default** — currently `'person'`. Should this be `'organisation'` to align with locked truth #4? Recommendation: yes. | You | Phase 2A.10 |
| OD-2 | **Component variant selections** — which hero/CTA/feature variant goes on which template? Design decision. | You (before 4A.0) | Phase 4B onwards |
| OD-3 | **WordPress content freeze date** — when should we stop publishing new WordPress content? | You | Phase 6 |
| OD-4 | **Staging domain** — `staging.pomegranate.marketing` or Vercel preview URL? | You | Phase 5 |
| OD-5 | **Schema assembly location** — Supabase Edge Function, database trigger, or CMS application code? `schema_templates/service_page.json` suggests the target output but not the assembly mechanism. | You | Phase 3.1 |
| OD-6 | **`businesses.website_schema_config` shape** — what should this JSONB column contain? Suggestion: global schema configuration like `potentialAction`, `inLanguage`, default `publisher` object. | You | Phase 2A.9 |

---

## 14. next steps

Once you sign off this roadmap:

1. ✅ This file is committed to `docs/phase-0-source-of-truth-roadmap.md`
2. Write `docs/task_plan.md`, `docs/findings.md`, `docs/progress.md`, `docs/gemini.md`
3. Begin phase 0.2 — merge content model into `docs/content-model-v4-final.md`
4. Begin phase 2A.1 — back up the database
5. Execute migration SQL (phase 2A.2–2A.16)

All work proceeds one step at a time, with your review between each step.

---

## revision log

| Date | Version | Change | Author |
|---|---|---|---|
| 25 feb 2026 | 0.1.0 | Initial draft — consolidates all legacy documents, live DB audit, CMS audit, schema template analysis, and answered discovery questions. | system pilot (gemini) |

---

*serving small businesses as their digital seeds go from darkness to light, if God Almighty is willing.*
