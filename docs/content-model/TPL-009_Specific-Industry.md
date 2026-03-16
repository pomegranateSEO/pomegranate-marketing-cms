# TPL-009: Specific Industry Page

**Template:** 9 of 13
**URL Pattern:** `/industries/[industry-slug]/` — e.g. `/industries/accountants/`, `/industries/law-firms/`
**Purpose:** Vertical-specific page demonstrating industry knowledge. Reframes the business's services through the lens of a specific sector's pain points, language, and needs. Helps convert sector-specific visitors who are searching for "[service] for [industry]."
**Schema:** WebPage, Service, BreadcrumbList, Organization (ref), FAQPage (optional)
**Keyword Cycling Component:** ✓ Applicable

---

## Global Components Present

- **Header Nav** — See GLOBAL-001
- **Footer Nav** — See GLOBAL-002

---

## Component Inventory (in page order)

1. Hero Section (Template 2) — See GLOBAL-005
2. Keyword Cycling Block — See GLOBAL-003
3. Service Overview for Sector — Page-specific (spec below)
4. Service Deliverables — Page-specific (spec below)
5. Testimonials — See GLOBAL-009
6. FAQ Section — See GLOBAL-017
7. Work With Us CTA — See GLOBAL-010

---

## SEO & Meta

| Field Name | Field Type | Required? | Notes / Guidance |
| :--- | :--- | :--- | :--- |
| **Meta Title** | Text (80 chars max) | Yes | [Service] for [Industry] \| [Brand] — e.g. 'SEO for Accountants \| Pomegranate Digital' |
| **Meta Description** | Text (135 chars max) | Yes | Sector-aware — name the industry and the outcome in the first 20 words |
| **Canonical URL** | URL | Yes | Self-referencing canonical |
| **Focus Keyword** | Text | Yes | e.g. 'SEO for accountants' |

---

## Component Tailoring Notes

### 1. Hero Section (Template 2)

Uses GLOBAL-005: Hero Template 2 — Location / Industry Hero. On industry pages, the landmark fields reference sector-specific concepts rather than geographic locations.

| Field | Specific Industry Tailoring |
| :--- | :--- |
| **H1 Headline** | [Service] for [Industry] — e.g. 'SEO & Marketing for Accountants' |
| **Heading Level** | H2 for the structured heading |
| **Pre-Text** | e.g. 'From' |
| **Landmark 1** | Industry concept — e.g. 'practice management' |
| **Mid-Text 1** | e.g. 'to' |
| **Landmark 2** | Industry concept — e.g. 'client acquisition' |
| **Mid-Text 2** | e.g. '— and every' |
| **Landmark 3** | Industry challenge — e.g. 'compliance challenge' |
| **After-Text** | e.g. 'in between, we help accountancy firms grow through search.' |
| **Hero Body Copy** | 2–4 sentences. Speaks directly to the industry's pain points. |
| **Primary CTA** | e.g. 'Get a Free Consultation for Your Firm' |
| **Breadcrumb Display** | **true** — Path: Home > Industries > [Industry Name] |
| **Industry Tag** | Text — used in schema + filtering. e.g. 'accountants' |

### 2. Keyword Cycling Block

Uses GLOBAL-003. Tailoring:

| Field | Specific Industry Tailoring |
| :--- | :--- |
| **prefix_text** | e.g. 'We are your' |
| **keywords** | Industry-specific variants — e.g. ['accountancy SEO specialists', 'accounting firm marketing experts', 'SEO agency for accountants'] |
| **suffix_text** | Optional |
| **static_fallback** | Complete sentence — e.g. 'We are your accountancy SEO specialists.' |
| **heading_level** | H2 (or H3 depending on hero heading usage) |

### 3. Service Overview for Sector (Page-Specific)

This is not a single block — it is a set of H3-level sub-sections, each covering one core service reframed for this specific industry. The sub-sections are:

- **SEO for [Sector]**
- **Web Design for [Sector]**
- **AI Development & Integration for [Sector]**

Each sub-section explains how that service applies to the industry's specific context.

| Field Name | Field Type | Required? | Notes / Guidance |
| :--- | :--- | :--- | :--- |
| **Section Heading** | Text | Yes | e.g. 'How We Help Accountancy Firms' |
| **— Heading Level** | Select: H2 / H3 / p | Yes | Typically H2 |
| **Section Intro** | Rich Text (1–2 sentences) | No | Brief framing — e.g. 'We offer three core services, each tailored to the realities of running an accountancy practice.' |
| **Service Sub-Sections** | Repeatable Component | Yes | Min 1, typically 3 (SEO, Web Design, AI). Each is an H3 with body text. |
| **— Sub-Section Heading** | Text | Yes | e.g. 'SEO for Accountants', 'Web Design for Accountants', 'AI Development for Accountants' |
| **— Sub-Section Heading Level** | Select: H3 / H4 | Yes | Typically H3 |
| **— Sub-Section Body** | Rich Text (150–300 words) | Yes | How this service solves industry-specific problems. Must reference real sector challenges, not just generic service copy with an industry name inserted. |
| **— Sub-Section CTA Label** | Text | No | e.g. 'Learn More About Our SEO Services' |
| **— Sub-Section CTA URL** | URL | No | Links to the relevant national service page (TPL-003) |

### 4. Service Deliverables (Page-Specific)

What the client in this industry actually gets — the same deliverables concept as TPL-003 but reframed in sector language.

| Field Name | Field Type | Required? | Notes / Guidance |
| :--- | :--- | :--- | :--- |
| **Section Heading** | Text | Yes | e.g. 'What We Deliver for Accountancy Firms' |
| **— Heading Level** | Select: H2 / H3 / p | Yes | Typically H2 |
| **Deliverable Groups** | Repeatable Group | Yes | Grouped by service type — e.g. 'SEO Deliverables', 'Web Design Deliverables', 'AI Deliverables' |
| **— Group Heading** | Text | Yes | e.g. 'SEO Deliverables' |
| **— Deliverable Items** | Repeatable Component | Yes | Same structure as TPL-003: Heading + Description + optional Icon. Content reframed for sector context. |
| **— — Deliverable Heading** | Text | Yes | |
| **— — Deliverable Description** | Rich Text (2–4 sentences) | Yes | |
| **— — Deliverable Icon** | Image or SVG | No | |

### 5. Testimonials

Uses GLOBAL-009. Tailoring:

| Field | Specific Industry Tailoring |
| :--- | :--- |
| **Section Heading** | e.g. 'What Accountancy Firms Say About Us' |
| **Testimonial Items** | Filter or curate reviews from clients in this industry. Use the `industry_tag` filter. |
| **Display Aggregate?** | Optional — depends on whether enough industry-specific reviews exist |

### 6. FAQ Section

Uses GLOBAL-017. Tailoring:

| Field | Specific Industry Tailoring |
| :--- | :--- |
| **Section Heading** | e.g. 'SEO FAQs for Accountants' |
| **FAQ Items** | Industry-specific questions. e.g. 'Is SEO worth it for a small accounting firm?', 'How long before I see results in the accounting niche?' |
| **FAQ Schema Toggle** | **true** |

### 7. Work With Us CTA

Uses GLOBAL-010. Tailoring:

| Field | Specific Industry Tailoring |
| :--- | :--- |
| **Section Heading** | Can reference the industry — e.g. 'Ready to Grow Your Accountancy Practice?' |
| **All interaction logic** | No changes — full 5-option flow |

---

## Structured Data / Schema Fields

The Industry Page emits a WebPage with a Service as its mainEntity. The Service includes industry-specific audience targeting with BusinessAudience objects. When FAQ items are present and toggled on, a FAQPage is emitted as a separate @graph item. The page `about` includes both the primary service concept and the industry concept; `mentions` includes secondary industry-relevant concepts.

### @graph Structure

| @graph Item | @type | @id | Notes |
| :--- | :--- | :--- | :--- |
| **WebPage** | WebPage | `{pageUrl}/` | Industry-specific service page |
| **Service** | Service | `{pageUrl}/#service` | The industry-tailored service with audience targeting |
| **FAQPage** | FAQPage | `{pageUrl}/#faq` | Conditional — only when FAQ items exist and FAQ Schema Toggle is true |
| **BreadcrumbList** | BreadcrumbList | `{pageUrl}/#breadcrumb` | Home > Industries > [Industry] |
| **ImageObject** | ImageObject | `{pageUrl}/#primaryimage` | Conditional — only if OG image exists |

The Organization (`#organization`) and WebSite (`#website`) are referenced by `@id` — their full objects are emitted on the Homepage (TPL-001).

### WebPage Fields

| Field Name | Source | Required? | Notes |
| :--- | :--- | :--- | :--- |
| **@type** | Fixed: "WebPage" | Yes | Single type |
| **@id** | `{pageUrl}/` | Yes | |
| **url** | `{pageUrl}/` | Yes | |
| **name** | `pages.meta_title` | Yes | |
| **description** | `pages.meta_description` | Yes | |
| **isPartOf** | Complete WebSite ref: `@type`, `@id`, `url`, `name` | Yes | Always complete — not just `@id`. Standard across all templates. |
| **primaryImageOfPage** | @id ref → `#primaryimage` | No | Conditional — only if OG image exists |
| **image** | @id ref → `#primaryimage` | No | Conditional — only if OG image exists |
| **breadcrumb** | @id ref → `#breadcrumb` | Yes | |
| **inLanguage** | Fixed: "en-GB" | Yes | |
| **isFamilyFriendly** | Fixed: "true" | Yes | |
| **datePublished** | `pages.created_at` (ISO 8601) | Yes | |
| **dateModified** | `pages.updated_at` (ISO 8601) | Yes | |
| **mainEntity** | @id ref → `#service` | Yes | Points to the Service |
| **about** | Array of Thing objects | Yes | Primary topic entities: the service concept + the industry concept, both with Wikipedia + Wikidata sameAs |
| **mentions** | Array of Thing objects | No | Secondary concepts relevant to the industry (e.g. web performance, software development) with Wikipedia + Wikidata sameAs |

### Service Fields

| Field Name | Source | Required? | Notes |
| :--- | :--- | :--- | :--- |
| **@type** | Fixed: "Service" | Yes | |
| **@id** | `{pageUrl}/#service` | Yes | |
| **name** | `pages.service_name` | Yes | e.g. "SEO for Accountants" |
| **description** | `pages.service_description` (150–300 words) | Yes | Industry-tailored service description |
| **serviceType** | `pages.service_type` | No | e.g. "SEO for [Industry]" |
| **additionalType** | Wikidata URL for the service concept | No | e.g. `https://www.wikidata.org/wiki/Q180711` for SEO |
| **provider** | @id ref → `#organization` | Yes | |
| **audience** | Array of BusinessAudience objects | Yes | Target audience segments for this industry with Wikidata sameAs. See below. |
| **subjectOf** | @id ref → `#faq` | No | Conditional — only when FAQPage exists. Links to the FAQ schema. |
| **offers** | Offer object | Yes | Always present — with pricing if available, or "Contact for pricing" if not |

### Audience Fields (on Service)

Industry pages emphasize audience targeting. Multiple BusinessAudience objects identify the primary decision-makers:

```json
"audience": [
  {
    "@type": "BusinessAudience",
    "name": "Web Development Agencies",
    "audienceType": "Web agencies and software houses",
    "sameAs": "https://www.wikidata.org/wiki/Q3567035"
  },
  {
    "@type": "BusinessAudience",
    "name": "Chief Executive Officers (CEOs)",
    "audienceType": "Executive Management",
    "sameAs": "https://www.wikidata.org/wiki/Q484876"
  }
]
```

| Field Name | Source | Required? | Notes |
| :--- | :--- | :--- | :--- |
| **@type** | Fixed: "BusinessAudience" | Yes | Use for B2B audiences |
| **name** | Audience label | Yes | e.g. "Web Development Agencies" |
| **audienceType** | Descriptive type | No | More specific descriptor — e.g. "Web agencies and software houses" |
| **sameAs** | Wikidata URL | No | e.g. `https://www.wikidata.org/wiki/Q3567035` for Web agencies |

### Offer Fields (Always Present)

| Field Name | Source | Required? | Notes |
| :--- | :--- | :--- | :--- |
| **@type** | Fixed: "Offer" | Yes | |
| **priceCurrency** | Fixed: "GBP" | Yes | |
| **price** | Price value or "0" | Yes | Use actual price if available, "0" if not |
| **description** | Pricing context | No | e.g. "Contact for pricing" when no specific price |
| **url** | `{pageUrl}/` | No | |

### FAQPage Fields (Conditional)

Only emitted when FAQ items exist and FAQ Schema Toggle is true.

| Field Name | Source | Required? | Notes |
| :--- | :--- | :--- | :--- |
| **@type** | Fixed: "FAQPage" | Yes | |
| **@id** | `{pageUrl}/#faq` | Yes | |
| **mainEntity** | Array of Question objects | Yes | From `pages.faqs` JSON array |
| **— Question @type** | Fixed: "Question" | Yes | |
| **— Question name** | Question text | Yes | |
| **— acceptedAnswer @type** | Fixed: "Answer" | Yes | |
| **— acceptedAnswer text** | Answer text | Yes | |

### BreadcrumbList Fields

| Field Name | Source | Required? | Notes |
| :--- | :--- | :--- | :--- |
| **@type** | Fixed: "BreadcrumbList" | Yes | |
| **@id** | `{pageUrl}/#breadcrumb` | Yes | |
| **itemListElement** | 3 ListItems | Yes | Position 1: Home (with `item`). Position 2: Industries (with `item`). Position 3: [Industry Name] (no `item`, just `name`). |

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

### about / mentions Entity Pattern

Entities use the full sameAs array pattern with both Wikipedia and Wikidata URLs:

```json
{
  "@type": "Thing",
  "name": "Search engine optimization",
  "sameAs": [
    "https://en.wikipedia.org/wiki/Search_engine_optimization",
    "https://www.wikidata.org/wiki/Q180711"
  ]
}
```

Sourced from `knowledge_graph_entities` table via the page's `about_entities` and `mentions_entities` uuid[] columns.

---

### Full JSON-LD Template

See `/docs/content-model/schema-examples/TPL-009_Specific-Industry_schema.jsonld` for the complete working template.
