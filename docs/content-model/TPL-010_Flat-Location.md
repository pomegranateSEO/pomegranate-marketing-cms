# TPL-010: Flat Location Page

**Template:** 10 of 13
**URL Pattern:** `/locations/[location-slug]/` — e.g. `/locations/london/`, `/locations/manchester/`
**Purpose:** Landing page for a specific town, city, or region. Establishes local relevance and routes local search traffic to specific local service pages (TPL-004).
**Schema:** WebPage, CollectionPage, Service, Organization (full re-emit), WebSite (full re-emit), BreadcrumbList, FAQPage (optional)
**Keyword Cycling Component:** ✓ Applicable

---

## Structural Relationship

**This template shares the same structure as TPL-002 (Services Category Page)** with the following differences:

1. **Hero Template 2** instead of Hero Template 1
2. **Location-specific SEO & Meta fields** (geo tags)
3. **All content is localised** — headings, copy, and keyword cycling reference the specific location
4. **Service cards link to TPL-004** (Specific Local Service pages) instead of TPL-003 (National Specific Service pages)
5. **Full WebSite + Organization re-emission** like TPL-004 (local pages get full objects for local SEO signal strength)

**Do not duplicate the full TPL-002 spec.** Refer to TPL-002 for the base structure and component inventory. This document specifies only the delta.

---

## Global Components Present

- **Header Nav** — See GLOBAL-001
- **Footer Nav** — See GLOBAL-002

---

## Component Inventory (in page order)

Same as TPL-002:

1. Hero Section (**Template 2** — not Template 1) — See GLOBAL-005
2. Keyword Cycling Block — See GLOBAL-003
3. Category Introduction — Same structure as TPL-002, localised content
4. Trusted By — See GLOBAL-007
5. Specific Services Grid — See GLOBAL-014
6. Environments We Work In — See GLOBAL-008
7. Work With Us CTA — See GLOBAL-010

---

## Delta: SEO & Meta

Replaces TPL-002's SEO & Meta section with location-specific fields:

| Field Name | Field Type | Required? | Notes / Guidance |
| :--- | :--- | :--- | :--- |
| **Meta Title** | Text (80 chars max) | Yes | Primary service + Location + Brand — e.g. 'SEO & Web Design in London \| Pomegranate Digital' |
| **Meta Description** | Text (135 chars max) | Yes | Mention location naturally — e.g. 'Local SEO and web design services in London. Free consultation available.' |
| **Canonical URL** | URL | Yes | Self-referencing canonical |
| **Focus Keyword** | Text | Yes | e.g. 'SEO services London' |
| **Geo Region Tag** | Text | No | ISO region code — e.g. 'GB-LND' |
| **Geo Placename** | Text | No | e.g. 'London' |

---

## Delta: Hero Section (Template 2 instead of Template 1)

Uses GLOBAL-005: Hero Template 2 — Location / Industry Hero (instead of GLOBAL-004 used by TPL-002).

| Field | Flat Location Tailoring |
| :--- | :--- |
| **H1 Headline** | Services + Location — e.g. 'SEO & Digital Marketing in London' |
| **Heading Level** | H2 for the structured heading |
| **Pre-Text** | e.g. 'From' |
| **Landmark 1** | Local geographic reference — e.g. 'the City' |
| **Mid-Text 1** | e.g. 'to' |
| **Landmark 2** | Another local reference — e.g. 'Brixton' |
| **Mid-Text 2** | e.g. '— and every' |
| **Landmark 3** | Generic local term — e.g. 'borough' |
| **After-Text** | e.g. 'in between, we help London businesses get found online.' |
| **Hero Body Copy** | 2–4 sentences. Locally aware. |
| **Primary CTA** | e.g. 'Get a Free Consultation' |
| **Breadcrumb Display** | **true** — Path: Home > Locations > [Location Name] |

---

## Delta: Keyword Cycling Block

Uses GLOBAL-003. Localised content:

| Field | Flat Location Tailoring |
| :--- | :--- |
| **prefix_text** | e.g. 'Your' |
| **keywords** | Location-specific brand permutations — e.g. ['London SEO agency', 'London digital marketing company', 'London web design studio'] |
| **suffix_text** | e.g. 'ready to help your business grow.' |
| **static_fallback** | Complete localised sentence — e.g. 'Your London SEO agency, ready to help your business grow.' |
| **heading_level** | H2 |

---

## Delta: Category Introduction

Same structure as TPL-002's Category Introduction. Content differences:

| Field | Flat Location Tailoring |
| :--- | :--- |
| **Intro Body Copy** | 200–400 words. Localised — references the specific location's business landscape, competition, and opportunities. Must not read as the national version with a city name swapped in. |
| **Supporting Image** | Optional — could be a location-relevant image |

---

## Delta: Specific Services Grid

Uses GLOBAL-014. Content differences:

| Field | Flat Location Tailoring |
| :--- | :--- |
| **Section Heading** | e.g. 'Our Services in London' |
| **Service Cards** | One card per locally available service. Each links to a **Specific Local Service page (TPL-004)** — not a national service page (TPL-003). |
| **Card CTA URLs** | All point to TPL-004 pages — e.g. `/locations/london/technical-seo/`, `/locations/london/local-seo/` |
| **Card Descriptions** | Localised where possible — e.g. 'Technical SEO for London businesses' |

---

## Delta: Work With Us CTA

Uses GLOBAL-010. Tailoring:

| Field | Flat Location Tailoring |
| :--- | :--- |
| **Section Heading** | Can reference location — e.g. 'Ready to Grow Your London Business?' |

---

## Content Quality Note

Same thin-content warning as TPL-004 applies here. Flat Location pages that are just the national category page with a city name inserted will be flagged by Google's Helpful Content system. Unique local intro copy and genuine local references are essential.

---

## Structured Data / Schema Fields

The Flat Location Page is a richly-schemaed local hub. Like TPL-004 (Specific Local Service), it **re-emits the full WebSite and Organization objects** for local SEO signal strength. The Service includes `audience` targeting, a `hasOfferCatalog` with child local services, and optional `subjectOf` link to FAQPage when FAQ items are present. This is one of only two pages that re-emit the full organizational schema.

### @graph Structure

| @graph Item | @type | @id | Notes |
| :--- | :--- | :--- | :--- |
| **WebPage** | WebPage + CollectionPage | `{pageUrl}/` | Dual type — navigational hub for a location |
| **Service** | Service | `{pageUrl}/#service` | Hub service with audience targeting and OfferCatalog of child local services |
| **FAQPage** | FAQPage | `{pageUrl}/#faq` | Conditional — only when FAQ items exist and FAQ Schema Toggle is true |
| **ProfessionalService** | ProfessionalService | `{siteUrl}/#organization` | Full object re-emitted on local pages for local SEO signal |
| **WebSite** | WebSite | `{siteUrl}/#website` | Full object re-emitted on local pages |
| **BreadcrumbList** | BreadcrumbList | `{pageUrl}/#breadcrumb` | Home > Locations > [Location] |
| **ImageObject** | ImageObject | `{pageUrl}/#primaryimage` | Conditional — only if OG image exists |

### WebPage Fields

| Field Name | Source | Required? | Notes |
| :--- | :--- | :--- | :--- |
| **@type** | Fixed: ["WebPage", "CollectionPage"] | Yes | Dual type — page is both a web page and a location collection entry point |
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
| **mainEntity** | @id ref → `#service` | Yes | Points to the hub Service |
| **about** | Array of Thing/Place objects | Yes | Includes location (Place with Wikipedia + Wikidata sameAs) + primary service concepts |
| **mentions** | Array of Thing objects | No | Secondary service concepts (e.g. SEO, Web Design) with Wikipedia + Wikidata sameAs |

### Service (Hub) Fields

| Field Name | Source | Required? | Notes |
| :--- | :--- | :--- | :--- |
| **@type** | Fixed: "Service" | Yes | |
| **@id** | `{pageUrl}/#service` | Yes | |
| **name** | e.g. "Digital Marketing Services in {{location_name}}" | Yes | |
| **serviceType** | "Digital Marketing" or service category | No | |
| **additionalType** | Wikidata URL — e.g. Q1321787 for Digital Marketing | No | |
| **provider** | @id ref → `#organization` | Yes | |
| **areaServed** | City/Place with Wikidata sameAs | Yes | e.g. `{ "@type": "City", "name": "London", "sameAs": "{location_wikidata_url}" }` |
| **audience** | Array of BusinessAudience objects | Yes | Local business decision-makers (SME owners, Marketing Directors) with Wikidata sameAs |
| **subjectOf** | @id ref → `#faq` | No | Conditional — only when FAQPage exists |
| **hasOfferCatalog** | OfferCatalog | Yes | Child local services (TPL-004 pages) with Offer items |

### Audience Fields (on Service)

| Field Name | Source | Required? | Notes |
| :--- | :--- | :--- | :--- |
| **@type** | Fixed: "BusinessAudience" | Yes | Use for B2B audiences |
| **name** | Audience label | Yes | e.g. "Local Business Owners", "Marketing Directors" |
| **audienceType** | Descriptive type | No | More specific descriptor — e.g. "Small to Medium Enterprises" |
| **sameAs** | Wikidata URL | No | e.g. Q4830453 for SMEs |

### OfferCatalog Structure (Child Services)

The Service includes an OfferCatalog listing all available services in this location (child TPL-004 pages):

```json
"hasOfferCatalog": {
  "@type": "OfferCatalog",
  "@id": "{pageUrl}/#catalog",
  "name": "Digital Marketing Services in {{location_name}}",
  "itemListElement": [
    {
      "@type": "Offer",
      "itemOffered": {
        "@type": "Service",
        "name": "SEO Service in {{location_name}}",
        "url": "{pageUrl}/seo-service/",
        "additionalType": "https://www.wikidata.org/wiki/Q180711"
      }
    }
  ]
}
```

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

### ProfessionalService (Organization) Fields

**Full object re-emitted on local pages — identical to Homepage.**

| Field Name | Source | Required? | Notes |
| :--- | :--- | :--- | :--- |
| **@type** | Fixed: "ProfessionalService" | Yes | Full org object on local pages |
| **@id** | `{siteUrl}/#organization` | Yes | |
| **name** | `businesses.name` | Yes | |
| **alternateName** | `businesses.alternate_name` | No | |
| **url** | `businesses.website_url` | Yes | |
| **priceRange** | `businesses.price_range` | No | |
| **telephone** | `businesses.telephone` | Yes | |
| **email** | `businesses.email` | No | |
| **address** | PostalAddress from `businesses` | Yes | |
| **geo** | GeoCoordinates | No | |
| **logo** | ImageObject | Yes | Full object with @id, url, contentUrl, width, height, caption |
| **sameAs** | `businesses.social_links` array | No | |
| **foundingDate** | `businesses.founding_date` | No | |
| **areaServed** | Array of Place/City objects + Country | Yes | Include location (with Wikidata) + United Kingdom |
| **aggregateRating** | AggregateRating object | No | |
| **openingHoursSpecification** | Array of OpeningHoursSpecification | No | |

### WebSite Fields

| Field Name | Source | Required? | Notes |
| :--- | :--- | :--- | :--- |
| **@type** | Fixed: "WebSite" | Yes | |
| **@id** | `{siteUrl}/#website` | Yes | |
| **url** | `{siteUrl}/` | Yes | |
| **name** | Organization name | Yes | |
| **publisher** | @id ref → `#organization` | Yes | |
| **inLanguage** | Fixed: "en-GB" | Yes | |

### BreadcrumbList Fields

| Field Name | Source | Required? | Notes |
| :--- | :--- | :--- | :--- |
| **@type** | Fixed: "BreadcrumbList" | Yes | |
| **@id** | `{pageUrl}/#breadcrumb` | Yes | |
| **itemListElement** | 3 ListItems | Yes | Position 1: Home (with `item`). Position 2: Locations (with `item`). Position 3: [Location] (no `item`, just `name`). |

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

Entities use the full sameAs array pattern:

```json
{
  "@type": "Place",
  "name": "London",
  "sameAs": [
    "https://en.wikipedia.org/wiki/London",
    "https://www.wikidata.org/wiki/Q84"
  ]
}
```

Sourced from `knowledge_graph_entities` table via the page's `about_entities` and `mentions_entities` uuid[] columns.

---

### Full JSON-LD Template

See `/docs/content-model/schema-examples/TPL-010_Flat-Location_schema.jsonld` for the complete working template.
