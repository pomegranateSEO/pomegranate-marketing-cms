# TPL-001: Homepage

**Template:** 1 of 13
**URL Pattern:** `/`
**Purpose:** Primary brand and trust-building page. Introduces the business, its core services, and drives users towards conversion.
**Schema:** WebSite, LocalBusiness, Organization, BreadcrumbList (none — root page), FAQPage (optional)

---

## Global Components Present

- **Header Nav** — See GLOBAL-001
- **Footer Nav** — See GLOBAL-002

---

## Component Inventory (in page order)

1. Hero Section (Template 1) — See GLOBAL-004
2. Keyword Cycling Block — See GLOBAL-003
3. Trusted By — See GLOBAL-007
4. National Service Category Gallery — See GLOBAL-014
5. Who We Are — Page-specific (spec below)
6. Environments We Work In — See GLOBAL-008
7. Testimonials — See GLOBAL-009
8. Free Tools Featured Gallery — See GLOBAL-012
9. Work With Us CTA — See GLOBAL-010

---

## SEO & Meta

| Field Name | Field Type | Required? | Notes / Guidance |
| :--- | :--- | :--- | :--- |
| **Meta Title** | Text (80 chars max) | Yes | Primary keyword + brand name. e.g. 'SEO Agency London | Pomegranate Digital' |
| **Meta Description** | Text (135 chars max) | Yes | Value proposition with a call to action |
| **Canonical URL** | URL | Yes | Self-referencing canonical — the root domain URL |
| **OG Title** | Text | Yes | Can match meta title or be more conversational |
| **OG Description** | Text | Yes | Social-optimised version of the meta description |
| **OG Image** | Image (1200×630px) | Yes | Brand-consistent social sharing image |

---

## Component Tailoring Notes

### 1. Hero Section (Template 1)

Uses GLOBAL-004: Hero Template 1. Tailoring for Homepage:

| Field | Homepage Tailoring |
| :--- | :--- |
| **H1 Headline** | Lead with the primary brand value proposition — e.g. 'SEO & Web Design That Actually Works' |
| **Hero Subheadline** | Expand on the H1 — who you help and what outcome you deliver |
| **Hero Body Copy** | Optional. Keep to 1–2 sentences if used. |
| **Primary CTA** | High-intent — e.g. 'Get a Free Consultation' linking to Work With Us section or Contact page |
| **Secondary CTA** | Softer — e.g. 'See Our Services' linking to Services section on-page |
| **Hero Image / Visual** | Hero-specific brand image or short-loop video. Sets the visual tone for the entire site. |
| **Trust Signals** | Up to 3 — e.g. Google Partner badge, '5.0 Google Rating', 'UK Search Award Winner' |
| **Breadcrumb Display** | **false** — Homepage is the breadcrumb root, no breadcrumb needed |

### 2. Keyword Cycling Block

Uses GLOBAL-003: Keyword Cycling Block. Tailoring for Homepage:

| Field | Homepage Tailoring |
| :--- | :--- |
| **prefix_text** | e.g. 'We are a' |
| **keywords** | Top-level brand keyword permutations — e.g. ['SEO agency', 'digital marketing agency', 'search engine optimisation company', 'web design studio'] |
| **suffix_text** | e.g. 'helping UK businesses grow online.' |
| **static_fallback** | Must be a complete sentence — e.g. 'We are a leading SEO agency helping UK businesses grow online.' |
| **heading_level** | H2 (H1 is in the Hero) |

### 3. Trusted By

Uses GLOBAL-007: Trusted By Component. No page-specific tailoring — synchronized singleton displays the same data everywhere.

### 4. National Service Category Gallery

Uses GLOBAL-014: Service / Specific Services Grid Component. Tailoring for Homepage:

| Field | Homepage Tailoring |
| :--- | :--- |
| **Section Heading** | e.g. 'How Can We Be of Service?' |
| **Section Subheading** | e.g. 'Let us plot out the roadmap and walk you through it' |
| **Section Intro** | Optional 2–3 sentence overview of the service offering |
| **Service Cards** | One card per top-level service category. Each links to a Service Category page (TPL-002). Min 3 cards. |
| **Card CTA URLs** | All point to TPL-002 category pages (e.g. /seo-services/, /web-design/, /ai-development/) |

### 5. Who We Are (Page-Specific)

This component is specific to the Homepage (and optionally the About page). Not a global component.

| Field Name | Field Type | Required? | Notes / Guidance |
| :--- | :--- | :--- | :--- |
| **Section Heading** | Text | Yes | e.g. 'Who We Are', 'Our Story'. Rendered as H2. |
| **Subheading** | Text | No | e.g. 'A dedicated team of local experts.' Supporting line for the H2. |
| **Body Text** | Rich Text | Yes | One short paragraph (2–3 lines). Focused on the brand's essence, mission, or history. This is a teaser — the full story lives on the About page (TPL-007). |

### 6. Environments We Work In

Uses GLOBAL-008: Tech Stack Component. No page-specific tailoring — synchronized singleton.

### 7. Testimonials

Uses GLOBAL-009: Testimonials Component. Tailoring for Homepage:

| Field | Homepage Tailoring |
| :--- | :--- |
| **Section Heading** | e.g. 'What Our Clients Say' |
| **Testimonial Items** | Curate the best/most impressive reviews — not filtered by service or location. These are the "greatest hits." |
| **Display Aggregate?** | Recommended: true. Show the overall aggregate rating prominently on the Homepage. |
| **Display Style** | Carousel recommended for Homepage to keep vertical space manageable |

### 8. Free Tools Featured Gallery

Uses GLOBAL-012: Free Tools Featured Gallery Component. Tailoring for Homepage:

| Field | Homepage Tailoring |
| :--- | :--- |
| **Section Heading** | e.g. 'Free Tools to Grow Your Business' |
| **Tool Cards** | Curate 2–3 flagship tools. Prioritise the most impressive / highest-traffic tools. |
| **Section CTA** | 'Browse All Free Tools' → links to Free Tools hub |

### 9. Work With Us CTA

Uses GLOBAL-010: Work With Us CTA Component. Tailoring for Homepage:

| Field | Homepage Tailoring |
| :--- | :--- |
| **Section Heading** | e.g. 'Ready to Grow Your Business?' |
| **Section Subheading** | e.g. 'Choose what you're interested in and we'll take it from there.' |
| **All interaction logic** | No changes — full 5-option flow as specced in GLOBAL-010 |

---

## Structured Data / Schema Fields

The Homepage emits the fullest schema of any page. It is the root of the WebSite schema, emits the full ProfessionalService (Organization) object, and uses an OfferCatalog as its mainEntity to tie the page to the service hierarchy. Child services in the OfferCatalog include `additionalType` Wikidata URLs for knowledge graph alignment. `datePublished` and `dateModified` are included as standard across all page templates.

### @graph Structure

The Homepage `@graph` array contains:

| @graph Item | @type | @id | Notes |
| :--- | :--- | :--- | :--- |
| **WebPage** | WebPage + CollectionPage | `{siteUrl}/` | Dual @type — page is both a WebPage and a collection entry point |
| **Organization** | ProfessionalService | `{siteUrl}/#organization` | Full object (not just @id ref) — Homepage is one of two pages with full org output |
| **WebSite** | WebSite | `{siteUrl}/#website` | Site-level schema with publisher ref |
| **BreadcrumbList** | BreadcrumbList | `{siteUrl}/#breadcrumb` | Single item: Home (position 1) |
| **ImageObject** | ImageObject | `{siteUrl}/#primaryimage` | Primary brand image, referenced by WebPage |

### WebPage Fields

| Field Name | Source | Required? | Notes |
| :--- | :--- | :--- | :--- |
| **@type** | Fixed: ["WebPage", "CollectionPage"] | Yes | Dual type |
| **@id** | `{siteUrl}/` | Yes | |
| **url** | `{siteUrl}/` | Yes | |
| **name** | `pages.meta_title` | Yes | |
| **description** | `pages.meta_description` | Yes | |
| **isPartOf** | Complete WebSite ref: `@type`, `@id`, `url`, `name` | Yes | Always complete — not just `@id`. Standard across all templates. |
| **primaryImageOfPage** | @id ref → `#primaryimage` | Yes | |
| **image** | @id ref → `#primaryimage` | Yes | |
| **thumbnailUrl** | `businesses.logo_url` | No | |
| **datePublished** | `pages.created_at` (ISO 8601) | Yes | |
| **dateModified** | `pages.updated_at` (ISO 8601) | Yes | |
| **breadcrumb** | @id ref → `#breadcrumb` | Yes | |
| **inLanguage** | Fixed: "en-GB" | Yes | |
| **isFamilyFriendly** | Fixed: "true" | No | |
| **mainEntity** | @id ref → `#services-catalog` | Yes | Points to the OfferCatalog on the Organization |
| **about** | From `knowledge_graph_entities` via `pages.about_entities` uuid[] | No | Primary topic entities — e.g. SEO, Web Design |
| **mentions** | From `knowledge_graph_entities` via `pages.mentions_entities` uuid[] | No | Secondary referenced entities |

### ProfessionalService (Organization) Fields

| Field Name | Source | Required? | Notes |
| :--- | :--- | :--- | :--- |
| **@type** | Fixed: "ProfessionalService" | Yes | |
| **@id** | `{siteUrl}/#organization` | Yes | |
| **name** | `businesses.name` | Yes | Legal entity name — e.g. "POMEGRANATE MARKETING LTD" |
| **alternateName** | `businesses.alternate_name` | No | Trading name — e.g. "pomegranate marketing" |
| **url** | `businesses.website_url` | Yes | |
| **priceRange** | `businesses.price_range` | No | e.g. "££" |
| **telephone** | `businesses.telephone` | Yes | Include country code |
| **email** | `businesses.email` | No | |
| **address** | PostalAddress from `businesses` address fields | Yes | street, locality, region, postalCode, country |
| **geo** | GeoCoordinates from `businesses.latitude` / `businesses.longitude` | No | |
| **logo** | ImageObject from `businesses.logo_url` | Yes | Include @id, url, contentUrl, width, height, caption |
| **sameAs** | `businesses.social_links` array | No | All social profile URLs |
| **foundingDate** | `businesses.founding_date` | No | ISO date — e.g. "2019" |
| **areaServed** | `businesses.area_served` jsonb | No | Array of Place objects or text values |
| **aggregateRating** | `businesses.aggregate_rating` jsonb | No | AggregateRating object if available |
| **openingHoursSpecification** | `businesses.opening_hours_specification` | No | Array of day + time objects |
| **hasOfferCatalog** | Built from published service pages | Yes | OfferCatalog containing Offer → Service items. Each child Service includes `additionalType` with Wikidata URL for the service concept. See JSON-LD template for structure. |

### WebSite Fields

| Field Name | Source | Required? | Notes |
| :--- | :--- | :--- | :--- |
| **@type** | Fixed: "WebSite" | Yes | |
| **@id** | `{siteUrl}/#website` | Yes | |
| **url** | `{siteUrl}/` | Yes | |
| **name** | `businesses.name` or brand name | Yes | |
| **publisher** | @id ref → `#organization` | Yes | |
| **inLanguage** | Fixed: "en-GB" | Yes | |

### BreadcrumbList Fields

| Field Name | Source | Required? | Notes |
| :--- | :--- | :--- | :--- |
| **@type** | Fixed: "BreadcrumbList" | Yes | |
| **@id** | `{siteUrl}/#breadcrumb` | Yes | |
| **itemListElement** | Single ListItem | Yes | Position 1: "Home" with item URL `{siteUrl}/` |

### about / mentions Entity Format

Each entity in the `about` and `mentions` arrays follows this structure:

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

The `@type` can be `Thing`, `Organization`, `Place`, `SoftwareApplication`, or any appropriate Schema.org type. Sourced from `knowledge_graph_entities` table via the page's `about_entities` and `mentions_entities` uuid[] columns.

---

### Full JSON-LD Template

See `/docs/content-model/schema-examples/TPL-001_Homepage_schema.jsonld` for the complete working template.
