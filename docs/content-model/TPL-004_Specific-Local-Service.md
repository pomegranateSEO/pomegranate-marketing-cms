# TPL-004: Specific Local Service Page

**Template:** 4 of 13
**URL Pattern:** `/locations/[location]/[specific-service]/` — e.g. `/locations/london/technical-seo/`, `/locations/manchester/local-seo/`
**Purpose:** Hyper-local commercial page — a specific service in a specific location. Must feel genuine and locally-rooted, not templated with a city name swapped in.
**Schema:** Service, LocalBusiness, areaServed, BreadcrumbList, Organization (ref), FAQPage (optional)
**Keyword Cycling Component:** ✓ Applicable

---

## Global Components Present

- **Header Nav** — See GLOBAL-001
- **Footer Nav** — See GLOBAL-002

---

## Component Inventory (in page order)

1. Hero Section (Template 2) — See GLOBAL-005
2. Keyword Cycling Block — See GLOBAL-003
3. Service Overview — Page-specific (spec below)
4. Trusted By — See GLOBAL-007
5. Service Deliverables — Page-specific (spec below)
6. Environments We Work In — See GLOBAL-008
7. Pricing & Packages — See GLOBAL-016
8. Work With Us CTA — See GLOBAL-010
9. FAQ Section — See GLOBAL-017

---

## SEO & Meta

| Field Name | Field Type | Required? | Notes / Guidance |
| :--- | :--- | :--- | :--- |
| **Meta Title** | Text (80 chars max) | Yes | [Service] in [Location] | [Brand] — e.g. 'Technical SEO in London | Pomegranate Digital' |
| **Meta Description** | Text (135 chars max) | Yes | Hyper-local — service + location in the first 20 words |
| **Canonical URL** | URL | Yes | Self-referencing canonical |
| **Focus Keyword** | Text | Yes | e.g. 'technical SEO London' |
| **Geo Region Tag** | Text | No | ISO region code — e.g. 'GB-LND' |
| **Geo Placename** | Text | No | e.g. 'London' |

---

## Component Tailoring Notes

### 1. Hero Section (Template 2)

Uses GLOBAL-005: Hero Template 2 — Location / Industry Hero. This is the first page template to use Hero Template 2.

| Field | Specific Local Service Tailoring |
| :--- | :--- |
| **H1 Headline** | [Service] in [Location] — e.g. 'Technical SEO in London' |
| **Heading Level** | H2 for the structured heading |
| **Pre-Text** | e.g. 'From' |
| **Landmark 1** | Local geographic reference — e.g. 'Canary Wharf' |
| **Mid-Text 1** | e.g. 'to' |
| **Landmark 2** | Another local reference — e.g. 'Walthamstow' |
| **Mid-Text 2** | e.g. '— and every' |
| **Landmark 3** | Generic local term — e.g. 'high street' |
| **After-Text** | e.g. 'in between, we deliver SEO that puts your business on the map.' |
| **Hero Body Copy** | 2–4 sentences. Locally aware — references the area naturally, not just the city name dropped in. |
| **Primary CTA** | e.g. 'Get Your Free Local SEO Audit' |
| **Breadcrumb Display** | **true** — Path: Home > Locations > [Location] > [Service] |

### 2. Keyword Cycling Block

Uses GLOBAL-003. Tailoring:

| Field | Specific Local Service Tailoring |
| :--- | :--- |
| **prefix_text** | e.g. 'Looking for a' |
| **keywords** | Localised service permutations — e.g. ['London SEO specialist', 'London SEO consultant', 'London search optimisation expert'] |
| **suffix_text** | e.g. 'in [location]? You've found us.' |
| **static_fallback** | Complete localised sentence — e.g. 'Looking for a London SEO specialist? You've found us.' |
| **heading_level** | H2 (or H3 if the structured hero heading is H2) |

### 3. Service Overview (Page-Specific)

Combines service explanation with genuine local context. This is not a copy-paste of the national service overview with a location name inserted — it must demonstrate knowledge of the local market.

| Field Name | Field Type | Required? | Notes / Guidance |
| :--- | :--- | :--- | :--- |
| **Section Heading** | Text | Yes | e.g. 'Technical SEO for London Businesses' |
| **— Heading Level** | Select: H2 / H3 / p | Yes | Typically H2 |
| **Localised Intro Copy** | Rich Text (200–400 words) | Yes | Combines service explanation with genuine local context. Reference the local business landscape, local competition, local opportunities. Must not read as templated. |
| **Local Market Insight** | Text or Rich Text | No | A specific local insight — e.g. 'London's competitive digital landscape means technical SEO issues cost you more per day than in less competitive markets.' Shows genuine local knowledge. |

### 4. Trusted By

Uses GLOBAL-007. No page-specific tailoring — synchronized singleton.

### 5. Service Deliverables (Page-Specific)

Same structure as TPL-003 Service Deliverables but content can be localised where relevant.

| Field Name | Field Type | Required? | Notes / Guidance |
| :--- | :--- | :--- | :--- |
| **Section Heading** | Text | Yes | e.g. 'What's Included in Our London Technical SEO Service' |
| **— Heading Level** | Select: H2 / H3 / p | Yes | Typically H2 |
| **Deliverable Items** | Repeatable Component | Yes | Same structure as TPL-003: Heading + Description + optional Icon. Content can reference local context where natural. |
| **— Deliverable Heading** | Text | Yes | |
| **— Deliverable Description** | Rich Text (2–4 sentences) | Yes | |
| **— Deliverable Icon** | Image or SVG | No | |
| **Process Steps** | Repeatable Component | No | Same structure as TPL-003. Typically identical to the national version — process doesn't usually change by location. |

### 6. Environments We Work In

Uses GLOBAL-008. No page-specific tailoring — synchronized singleton.

### 7. Pricing & Packages

Uses GLOBAL-016. Tailoring:

| Field | Specific Local Service Tailoring |
| :--- | :--- |
| **Section Heading** | Can reference location — e.g. 'Technical SEO Pricing for London' |
| **Pricing Model / Cards** | May mirror national pricing or have location-specific adjustments |
| **Trust Note** | Same as national |

### 8. Work With Us CTA

Uses GLOBAL-010. Tailoring:

| Field | Specific Local Service Tailoring |
| :--- | :--- |
| **Section Heading** | Can reference location — e.g. 'Ready to Rank in London?' |
| **All interaction logic** | No changes — full 5-option flow |

### 9. FAQ Section

Uses GLOBAL-017. Tailoring:

| Field | Specific Local Service Tailoring |
| :--- | :--- |
| **Section Heading** | e.g. 'Technical SEO FAQs for London Businesses' |
| **FAQ Items** | Mix of service-level and location-level questions. e.g. 'How long does technical SEO take for a London business?', 'Do you work with businesses across all London boroughs?' |
| **FAQ Schema Toggle** | **true** |

---

## Content Quality Note

Localised service pages are high-risk for thin/templated content. Google's Helpful Content system specifically targets pages that swap location names into otherwise identical content. Every localised page must have:

- **Unique intro copy** that references the actual local market
- **At least one genuine local insight** that couldn't apply to a different city
- **Localised FAQ questions** that address real location-specific concerns
- **Local testimonials** where available (not required at launch but should be added over time)

---

## Structured Data / Schema Fields

The Specific Local Service page is the richest local schema output. Unlike national pages (which reference Organization by `@id` only), local service pages **re-emit the full WebSite and Organization objects** to reinforce local SEO signals. The Service includes `areaServed` (City with Wikidata), `audience` targeting, and an Offer (always present). FAQ uses Pattern A (separate FAQPage `@graph` item).

### @graph Structure

| @graph Item | @type | @id | Notes |
| :--- | :--- | :--- | :--- |
| **WebPage** | WebPage | `{pageUrl}` | Local service page |
| **Service** | Service | `{pageUrl}#service` | Localised service with `areaServed`, `audience`, and Offer |
| **FAQPage** | FAQPage | `{pageUrl}#faq` | Conditional — separate `@graph` item (Pattern A) |
| **ImageObject** | ImageObject | `{pageUrl}#primaryimage` | Conditional — only if OG image exists |
| **BreadcrumbList** | BreadcrumbList | `{pageUrl}#breadcrumb` | Home → Locations → [City] → [Service] |
| **WebSite** | WebSite | `{siteUrl}/#website` | Full object re-emitted on local pages for local SEO signal strength |
| **Organization** | Organization | `{siteUrl}/#organization` | Full object re-emitted on local pages |

### WebPage Fields

| Field Name | Source | Required? | Notes |
| :--- | :--- | :--- | :--- |
| **@type** | Fixed: "WebPage" | Yes | Single type — FAQPage is a separate `@graph` item |
| **@id** | `{pageUrl}` | Yes | |
| **url** | `{pageUrl}` | Yes | |
| **name** | `pages.meta_title` | Yes | |
| **description** | `pages.meta_description` | Yes | |
| **isPartOf** | Complete WebSite ref: `@type`, `@id`, `url`, `name` | Yes | Always complete. Standard across all templates. |
| **breadcrumb** | @id ref → `{pageUrl}#breadcrumb` | Yes | |
| **inLanguage** | Fixed: "en-GB" | Yes | |
| **isFamilyFriendly** | Fixed: "true" | Yes | Standard across all templates |
| **datePublished** | `pages.created_at` (ISO 8601) | Yes | Standard across all templates |
| **dateModified** | `pages.updated_at` (ISO 8601) | Yes | Standard across all templates |
| **image** | @id ref → `{pageUrl}#primaryimage` | No | Conditional |
| **primaryImageOfPage** | @id ref → `{pageUrl}#primaryimage` | No | Conditional |
| **mainEntity** | @id ref → `{pageUrl}#service` | Yes | Points to the localised Service |
| **about** | From `knowledge_graph_entities` via `pages.about_entities` uuid[] | No | Includes @id ref to the Service + topic entities |
| **mentions** | From `knowledge_graph_entities` via `pages.mentions_entities` uuid[] | No | Location entity, related concepts |
| **potentialAction** | ReadAction targeting `{pageUrl}` | No | |

### Service Fields

| Field Name | Source | Required? | Notes |
| :--- | :--- | :--- | :--- |
| **@type** | Fixed: "Service" | Yes | |
| **@id** | `{pageUrl}#service` | Yes | |
| **name** | Localised service name — e.g. "London Keyword Research Service" | Yes | |
| **description** | `pages.service_description` | Yes | Localised version |
| **serviceType** | `pages.service_type` | No | e.g. "Search Engine Optimisation" |
| **additionalType** | Wikidata URL for the service concept | No | e.g. `https://www.wikidata.org/wiki/Q1313364` |
| **provider** | @id ref → `#organization` | Yes | |
| **areaServed** | City/Place with Wikidata `sameAs` | Yes | e.g. `{ "@type": "City", "name": "London", "sameAs": ["...wikipedia...", "...wikidata..."] }` |
| **audience** | Array of Audience objects | No | Target audience segments with Wikidata `sameAs`. See JSON-LD template for structure. |
| **subjectOf** | @id refs to FAQ Question items | No | Only when FAQPage exists. References each Question `@id`. |
| **offers** | Offer object | Yes | Always present — with price if available, or "Contact for tailored pricing" |

### Audience Fields (on Service)

| Field Name | Source | Required? | Notes |
| :--- | :--- | :--- | :--- |
| **@type** | "Audience" or "BusinessAudience" | Yes | Use "BusinessAudience" for B2B segments |
| **name** | Audience label | Yes | e.g. "Chief Marketing Officers" |
| **audienceType** | Descriptive type | No | e.g. "CMOs and Marketing Directors" |
| **sameAs** | Wikidata URL | No | e.g. `https://www.wikidata.org/wiki/Q1072823` |

### Offer Fields (Always Present)

Same structure as TPL-003. Always present — with pricing if available, or "Contact for tailored pricing" when not.

```json
"offers": {
  "@type": "Offer",
  "priceCurrency": "GBP",
  "price": "0",
  "description": "Contact for tailored pricing",
  "url": "{pageUrl}"
}
```

### FAQPage Fields (Conditional — Pattern A)

Separate `@graph` item. Only emitted when FAQ items exist and FAQ Schema Toggle is true.

| Field Name | Source | Required? | Notes |
| :--- | :--- | :--- | :--- |
| **@type** | Fixed: "FAQPage" | Yes | |
| **@id** | `{pageUrl}#faq` | Yes | |
| **mainEntity** | Array of Question objects | Yes | From `pages.faqs` JSON array |
| **— Question @type** | Fixed: "Question" | Yes | |
| **— Question name** | Question text | Yes | |
| **— acceptedAnswer @type** | Fixed: "Answer" | Yes | |
| **— acceptedAnswer text** | Answer text | Yes | |

### BreadcrumbList Fields

| Field Name | Source | Required? | Notes |
| :--- | :--- | :--- | :--- |
| **@type** | Fixed: "BreadcrumbList" | Yes | |
| **@id** | `{pageUrl}#breadcrumb` | Yes | |
| **itemListElement** | 4 ListItems | Yes | Position 1: Home. Position 2: Locations. Position 3: [City]. Position 4: [Service Name]. All with `item` containing `@id` + `name` (except last position which omits `item`). |

### WebSite + Organization (Full Objects on Local Pages)

Unlike national pages which reference these by `@id` only, local service pages re-emit the full WebSite and Organization objects. This is a deliberate choice for local SEO signal reinforcement — ensuring Google associates the local service with the complete business entity on every local page.

The Organization object uses `@type: "Organization"` on local pages (not `ProfessionalService` — that full object lives on the Homepage). Include: `name`, `alternateName`, `url`, `logo`, `image`.

---

### Full JSON-LD Template

See `/docs/content-model/schema-examples/TPL-004_Specific-Local-Service_schema.jsonld` for the complete working template.
