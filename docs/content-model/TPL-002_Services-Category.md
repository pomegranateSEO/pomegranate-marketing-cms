# TPL-002: Services Category Page

**Template:** 2 of 13
**URL Pattern:** `/[service-category]/` — e.g. `/seo-services/`, `/web-design/`, `/ai-development/`
**Purpose:** Navigational and informational hub for a group of related services. Routes users to specific service sub-pages (TPL-003).
**Schema:** Service, CollectionPage, BreadcrumbList, Organization (ref), FAQPage (optional)
**Keyword Cycling Component:** ✓ Applicable

---

## Global Components Present

- **Header Nav** — See GLOBAL-001
- **Footer Nav** — See GLOBAL-002

---

## Component Inventory (in page order)

1. Hero Section (Template 1) — See GLOBAL-004
2. Keyword Cycling Block — See GLOBAL-003
3. Category Introduction — Page-specific (spec below)
4. Trusted By — See GLOBAL-007
5. Specific Services Grid — See GLOBAL-014
6. Environments We Work In — See GLOBAL-008
7. Work With Us CTA — See GLOBAL-010

---

## SEO & Meta

| Field Name | Field Type | Required? | Notes / Guidance |
| :--- | :--- | :--- | :--- |
| **Meta Title** | Text (80 chars max) | Yes | Category name + core benefit + brand — e.g. 'SEO Services | Pomegranate Digital' |
| **Meta Description** | Text (135 chars max) | Yes | Summarise the category offering and who it's for |
| **Canonical URL** | URL | Yes | Self-referencing canonical |
| **OG Image** | Image (1200×630px) | No | Category-specific social image. Falls back to site default if not set. |

---

## Component Tailoring Notes

### 1. Hero Section (Template 1)

Uses GLOBAL-004: Hero Template 1. Tailoring for Services Category:

| Field | Services Category Tailoring |
| :--- | :--- |
| **H1 Headline** | Category name with value context — e.g. 'SEO Services That Drive Real Results' |
| **Hero Subheadline** | Optional — sets context for who the category is for |
| **Hero Body Copy** | 2–4 sentences. Sets context: what services are in this category and who they help. |
| **Primary CTA** | e.g. 'Get a Free Consultation' or 'Explore Our SEO Services' |
| **Secondary CTA** | Optional — e.g. 'See Pricing' anchor link |
| **Hero Image / Visual** | Category-relevant image. Can be shared across services in the same category. |
| **Breadcrumb Display** | **true** — Path: Home > [Category Name] |

### 2. Keyword Cycling Block

Uses GLOBAL-003. Tailoring for Services Category:

| Field | Services Category Tailoring |
| :--- | :--- |
| **prefix_text** | e.g. 'Specialists in' |
| **keywords** | Service name permutations for this category — e.g. ['SEO services', 'search engine optimisation', 'organic search marketing'] |
| **suffix_text** | e.g. 'for businesses that want to grow' |
| **static_fallback** | Complete sentence — e.g. 'Specialists in SEO services for businesses that want to grow.' |
| **heading_level** | H2 |

### 3. Category Introduction (Page-Specific)

A content section unique to this template — provides editorial depth about the service category.

| Field Name | Field Type | Required? | Notes / Guidance |
| :--- | :--- | :--- | :--- |
| **Section Heading** | Text | No | Optional — the intro may flow naturally from the hero without a separate heading |
| **Intro Body Copy** | Rich Text (200–400 words) | Yes | Detailed introduction to the service category. What it covers, why it matters, who it's for. This is the editorial meat of the page — supports E-E-A-T and gives the page indexable depth. |
| **Supporting Image** | Image | No | Optional image alongside the intro text |

### 4. Trusted By

Uses GLOBAL-007. No page-specific tailoring — synchronized singleton.

### 5. Specific Services Grid

Uses GLOBAL-014: Service / Specific Services Grid Component. Tailoring for Services Category:

| Field | Services Category Tailoring |
| :--- | :--- |
| **Section Heading** | e.g. 'Our SEO Services', 'What We Offer' |
| **Service Cards** | One card per specific service within this category. Each links to a National Specific Service page (TPL-003). |
| **Card CTA URLs** | All point to TPL-003 pages (e.g. /seo-services/technical-seo/, /seo-services/local-seo/) |
| **Card Descriptions** | Brief, benefit-led — explain what each specific service delivers |

### 6. Environments We Work In

Uses GLOBAL-008. No page-specific tailoring — synchronized singleton.

### 7. Work With Us CTA

Uses GLOBAL-010. Tailoring for Services Category:

| Field | Services Category Tailoring |
| :--- | :--- |
| **Section Heading** | Can reference the category — e.g. 'Ready to Invest in SEO?' |
| **All interaction logic** | No changes — full 5-option flow as specced in GLOBAL-010 |

---

## Structured Data / Schema Fields

The Services Category page emits a CollectionPage with a Service as its mainEntity. The Service owns a nested OfferCatalog listing child services (TPL-003 pages). The Organization is referenced by `@id` only — not re-emitted. `datePublished` and `dateModified` are standard across all templates.

### @graph Structure

| @graph Item | @type | @id | Notes |
| :--- | :--- | :--- | :--- |
| **WebPage** | WebPage + CollectionPage | `{siteUrl}/{category-slug}/` | Dual @type — navigational hub for a service group |
| **Service** | Service | `{siteUrl}/{category-slug}/#main-service` | The parent service, with nested OfferCatalog of child services |
| **BreadcrumbList** | BreadcrumbList | `{siteUrl}/{category-slug}/#breadcrumb` | Home → [Category Name] |

The Organization (`#organization`) and WebSite (`#website`) are referenced by `@id` — their full objects are emitted on the Homepage (TPL-001).

### WebPage Fields

| Field Name | Source | Required? | Notes |
| :--- | :--- | :--- | :--- |
| **@type** | Fixed: ["WebPage", "CollectionPage"] | Yes | Dual type |
| **@id** | `{siteUrl}/{category-slug}/` | Yes | |
| **url** | `{siteUrl}/{category-slug}/` | Yes | |
| **name** | `pages.meta_title` | Yes | |
| **description** | `pages.meta_description` | Yes | |
| **isPartOf** | Complete WebSite ref: `@type`, `@id`, `url`, `name` | Yes | Always complete — not just `@id`. Standard across all templates. |
| **breadcrumb** | @id ref → `{pageUrl}/#breadcrumb` | Yes | |
| **inLanguage** | Fixed: "en-GB" | Yes | |
| **isFamilyFriendly** | Fixed: "true" | Yes | Standard across all templates |
| **datePublished** | `pages.created_at` (ISO 8601) | Yes | Standard across all templates |
| **dateModified** | `pages.updated_at` (ISO 8601) | Yes | Standard across all templates |
| **image** | @id ref → `{pageUrl}/#primaryimage` | No | Conditional — only if OG image exists |
| **primaryImageOfPage** | @id ref → `{pageUrl}/#primaryimage` | No | Conditional — only if OG image exists |
| **mainEntity** | @id ref → `{pageUrl}/#main-service` | Yes | Points to the parent Service |
| **about** | From `knowledge_graph_entities` via `pages.about_entities` uuid[] | No | Primary topic entities — e.g. SEO |
| **mentions** | From `knowledge_graph_entities` via `pages.mentions_entities` uuid[] | No | Secondary referenced entities |

### Service Fields

| Field Name | Source | Required? | Notes |
| :--- | :--- | :--- | :--- |
| **@type** | Fixed: "Service" | Yes | |
| **@id** | `{pageUrl}/#main-service` | Yes | |
| **name** | Category service name — e.g. "Search Engine Optimisation Services" | Yes | |
| **serviceType** | Short label — e.g. "SEO" | No | |
| **provider** | @id ref → `#organization` | Yes | |
| **areaServed** | Country or Place | No | e.g. `{ "@type": "Country", "name": "United Kingdom" }` |
| **hasOfferCatalog** | OfferCatalog built from child service pages | Yes | Each child Service includes `url`, `additionalType` (Wikidata), `name`, `description`. Child `@id` is the child page URL. |

### BreadcrumbList Fields

| Field Name | Source | Required? | Notes |
| :--- | :--- | :--- | :--- |
| **@type** | Fixed: "BreadcrumbList" | Yes | |
| **@id** | `{pageUrl}/#breadcrumb` | Yes | |
| **itemListElement** | 2 ListItems | Yes | Position 1: Home (with `item` URL). Position 2: [Category Name] (with `item` URL). |

### ImageObject (Conditional)

Only included in `@graph` if the page has an OG image.

| Field Name | Source | Required? | Notes |
| :--- | :--- | :--- | :--- |
| **@type** | Fixed: "ImageObject" | Yes | |
| **@id** | `{pageUrl}/#primaryimage` | Yes | |
| **url** | `pages.og_image_url` | Yes | |
| **contentUrl** | `pages.og_image_url` | Yes | |
| **width** | Image width | No | |
| **height** | Image height | No | |

---

### Full JSON-LD Template

See `/docs/content-model/schema-examples/TPL-002_Services-Category_schema.jsonld` for the complete working template.

---

⚠️ FAQ schema: If FAQ items are present on this page and FAQ Schema Toggle is true, a FAQPage object is added to the `@graph` alongside these items. See GLOBAL-017 and GLOBAL-018 Layer 5 for the FAQPage structure.
