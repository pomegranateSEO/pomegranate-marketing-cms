# TPL-007: About Page

**Template:** 7 of 13
**URL Pattern:** `/about/`
**Purpose:** Builds human connection and trust. Key page for E-E-A-T signals and converting consideration-stage visitors. This is where the brand becomes a person (or people).
**Schema:** AboutPage, Organization, Person (founder/team members)
**Keyword Cycling Component:** ✗ Not applicable

---

## Global Components Present

- **Header Nav** — See GLOBAL-001
- **Footer Nav** — See GLOBAL-002

---

## Component Inventory (in page order)

1. Hero Section (Template 1) — See GLOBAL-004
2. Mission Section — Page-specific (spec below)
3. Beliefs & Values Section — Page-specific (spec below)
4. Trusted By — See GLOBAL-007
5. Awards Won — See GLOBAL-015
6. Named Founder Block — Page-specific (spec below)
7. Story & Timeline — Page-specific (spec below)
8. Work With Us CTA — See GLOBAL-010

---

## SEO & Meta

| Field Name | Field Type | Required? | Notes / Guidance |
| :--- | :--- | :--- | :--- |
| **Meta Title** | Text (80 chars max) | Yes | e.g. 'About Us | Pomegranate Digital' |
| **Meta Description** | Text (135 chars max) | Yes | Brief human summary — who you are, what drives you, why it matters |
| **Canonical URL** | URL | Yes | Self-referencing canonical |

---

## Component Tailoring Notes

### 1. Hero Section (Template 1)

Uses GLOBAL-004. Tailoring for About Page:

| Field | About Page Tailoring |
| :--- | :--- |
| **H1 Headline** | Emotive or direct — e.g. 'About Us', 'The People Behind the Results', 'Our Story' |
| **Hero Subheadline** | Optional — e.g. 'A small team with a big mission.' |
| **Hero Body Copy** | Optional. Keep brief — the page content does the storytelling. |
| **Hero Image / Visual** | Team photo or founder portrait recommended. Human faces build trust. |
| **Primary CTA** | Soft — e.g. 'Work With Us' anchoring to the Work With Us CTA section |
| **Secondary CTA** | Optional — e.g. 'Read Our Story' anchoring to the Story section |
| **Trust Signals** | Can include credentials — e.g. 'Google Partner', 'UK Search Award Winner' |
| **Breadcrumb Display** | **true** — Path: Home > About |

### 2. Mission Section (Page-Specific)

| Field Name | Field Type | Required? | Notes / Guidance |
| :--- | :--- | :--- | :--- |
| **Section Heading** | Text | Yes | e.g. 'Our Mission', 'What Drives Us', 'Why We Do This' |
| **— Heading Level** | Select: H2 / H3 / p | Yes | Typically H2 |
| **Mission Statement** | Text (1–3 sentences) | Yes | The core purpose — pull-quote style. Clear, concise, memorable. e.g. 'To give small businesses the same digital advantage that big brands take for granted.' |
| **Mission Body Copy** | Rich Text (100–250 words) | No | Expanded context around the mission. What it means in practice, how it shapes the work. |

### 3. Beliefs & Values Section (Page-Specific)

| Field Name | Field Type | Required? | Notes / Guidance |
| :--- | :--- | :--- | :--- |
| **Section Heading** | Text | Yes | e.g. 'What We Believe', 'Our Values' |
| **— Heading Level** | Select: H2 / H3 / p | Yes | Typically H2 |
| **Section Intro** | Rich Text (1–2 sentences) | No | Optional framing — e.g. 'These aren't wall decorations. They shape every decision we make.' |
| **Value Items** | Repeatable Component | Yes | 3–5 values. Must be concrete and specific, not generic corporate platitudes. |
| **— Value Heading** | Text | Yes | e.g. 'Radical Transparency', 'No Jargon', 'Results Over Busywork' |
| **— Value Description** | Rich Text (2–4 sentences) | Yes | What this value means in practice — give an example or a "this means we..." statement |
| **— Value Icon** | Image or SVG | No | Optional visual for each value |

### 4. Trusted By

Uses GLOBAL-007. No page-specific tailoring — synchronized singleton.

### 5. Awards Won

Uses GLOBAL-015: Awards Won Component. Tailoring for About Page:

| Field | About Page Tailoring |
| :--- | :--- |
| **Presence** | This is the primary home for the Awards Won component. Full display with descriptions if available. |
| **Display Style** | Badge Grid or Timeline — the About page has space for the fullest presentation |
| **Show Descriptions?** | Recommended: **true** on the About page to give context to each award |

### 6. Named Founder Block (Page-Specific)

A dedicated section for the founder or principal — distinct from a generic team grid. Gives the business a human face and supports Person schema for E-E-A-T.

| Field Name | Field Type | Required? | Notes / Guidance |
| :--- | :--- | :--- | :--- |
| **Section Heading** | Text | No | e.g. 'Meet the Founder', or omitted if the name alone is sufficient |
| **— Heading Level** | Select: H2 / H3 / p | No | Typically H2 |
| **Founder Name** | Text | Yes | Full name |
| **Founder Title / Role** | Text | Yes | e.g. 'Founder & Lead SEO Consultant' |
| **Founder Photo** | Image | Yes | Professional headshot or candid portrait. High quality. |
| **Founder Photo Alt Text** | Text | Yes | |
| **Founder Bio** | Rich Text (150–400 words) | Yes | Personal and professional background. What led to founding the business, key expertise, personality. Should feel human, not corporate. |
| **Founder Credentials** | Repeatable: Text | No | e.g. 'Google Analytics Certified', '10+ years in SEO', 'Former agency lead at [Company]' |
| **Founder LinkedIn URL** | URL | No | Links to LinkedIn profile — supports Person schema sameAs |
| **Founder Twitter/X URL** | URL | No | |
| **Founder Email** | Email | No | Direct contact — optional, depends on business preference |

### 7. Story & Timeline (Page-Specific)

The business origin story and key milestones, presented as a timeline or narrative.

| Field Name | Field Type | Required? | Notes / Guidance |
| :--- | :--- | :--- | :--- |
| **Section Heading** | Text | Yes | e.g. 'Our Story', 'How We Got Here', 'The Journey So Far' |
| **— Heading Level** | Select: H2 / H3 / p | Yes | Typically H2 |
| **Story Narrative** | Rich Text (200–500 words) | No | Prose-style origin story. Can be used instead of or alongside the timeline. |
| **Founding Year** | Text | No | e.g. '2019'. Displayed prominently. Feeds into Organization schema foundingDate. |
| **Timeline Items** | Repeatable Component | No | Key milestones in chronological order |
| **— Year / Date** | Text | Yes | e.g. '2019', 'March 2021' |
| **— Milestone Heading** | Text | Yes | e.g. 'Founded in London', 'Won Our First Award', '100th Client Served' |
| **— Milestone Description** | Text (1–3 sentences) | No | Brief context for the milestone |
| **— Milestone Icon / Image** | Image or SVG | No | Optional visual per milestone |

### 8. Work With Us CTA

Uses GLOBAL-010. Tailoring:

| Field | About Page Tailoring |
| :--- | :--- |
| **Section Heading** | e.g. 'Want to Work Together?', 'Let's Build Something Great' |
| **All interaction logic** | No changes — full 5-option flow |

---

## Structured Data / Schema Fields

The About page emits the full Organization schema object (identical to the Homepage ProfessionalService), plus Person schema for the founder. This reinforces the organization's credibility and creates E-E-A-T signals through the named founder.

### @graph Structure

| @graph Item | @type | @id | Notes |
| :--- | :--- | :--- | :--- |
| **WebPage** | AboutPage | `https://pomegranate.marketing/about/` | About page as mainEntity container |
| **Organization** | ProfessionalService | `{siteUrl}/#organization` | Full object (not @id ref) — same as Homepage. About is one of two pages with full org re-emit |
| **Person** | Person | `{pageUrl}/#founder` | Founder/principal with full profile |
| **BreadcrumbList** | BreadcrumbList | `{pageUrl}/#breadcrumb` | Home > About |
| **ImageObject** | ImageObject | `{pageUrl}/#primaryimage` | Conditional — only if OG image exists |

### AboutPage Fields

| Field Name | Source | Required? | Notes |
| :--- | :--- | :--- | :--- |
| **@type** | Fixed: "AboutPage" | Yes | Specific page type for organization pages |
| **@id** | `https://pomegranate.marketing/about/` | Yes | |
| **url** | `https://pomegranate.marketing/about/` | Yes | |
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
| **mainEntity** | @id ref → `#organization` | Yes | Points to the Organization |
| **about** | @id array | Yes | Always includes the organization itself: `[{"@id": "{siteUrl}/#organization"}]` |
| **mentions** | Mixed array | No | Founder (@id ref) + partner organizations (inline or @id ref with sameAs). See example. |

### ProfessionalService (Organization) Fields

Identical to the Homepage — full object re-emitted on this page.

| Field Name | Source | Required? | Notes |
| :--- | :--- | :--- | :--- |
| **@type** | Fixed: "ProfessionalService" | Yes | |
| **@id** | `{siteUrl}/#organization` | Yes | |
| **name** | `businesses.name` | Yes | |
| **alternateName** | `businesses.alternate_name` | No | |
| **url** | `businesses.website_url` | Yes | |
| **priceRange** | `businesses.price_range` | No | |
| **telephone** | `businesses.telephone` | Yes | |
| **email** | `businesses.email` | No | |
| **address** | PostalAddress from `businesses` | Yes | street, locality, region, postalCode, country |
| **geo** | GeoCoordinates | No | latitude, longitude |
| **logo** | ImageObject | Yes | Full object with @id, url, contentUrl, width, height, caption |
| **sameAs** | `businesses.social_links` array | No | All social profile URLs |
| **foundingDate** | `businesses.founding_date` | No | ISO date |
| **areaServed** | Place objects with Wikidata `sameAs` | No | e.g. East London + United Kingdom |
| **aggregateRating** | AggregateRating object | No | From `businesses.aggregate_rating` |
| **openingHoursSpecification** | Array of OpeningHoursSpecification | No | Business hours |
| **hasOfferCatalog** | OfferCatalog | Yes | Links to the flat service pages (post-consolidation) |

**OfferCatalog Structure:**
```json
"hasOfferCatalog": {
  "@type": "OfferCatalog",
  "@id": "{siteUrl}/#services-catalog",
  "name": "SEO & Web Design Services",
  "itemListElement": [
    {
      "@type": "Offer",
      "itemOffered": {
        "@type": "Service",
        "name": "Search Engine Optimisation",
        "url": "https://pomegranate.marketing/seo-services/",
        "additionalType": "https://www.wikidata.org/wiki/Q180711"
      }
    },
    {
      "@type": "Offer",
      "itemOffered": {
        "@type": "Service",
        "name": "Web Design",
        "url": "https://pomegranate.marketing/web-design/",
        "additionalType": "https://www.wikidata.org/wiki/Q190637"
      }
    }
  ]
}
```

### Person (Founder) Fields

| Field Name | Source | Required? | Notes |
| :--- | :--- | :--- | :--- |
| **@type** | Fixed: "Person" | Yes | |
| **@id** | `{pageUrl}/#founder` | Yes | |
| **name** | `founder.name` | Yes | |
| **jobTitle** | `founder.job_title` | Yes | e.g. "Founder & Lead SEO Consultant" |
| **image** | `founder.image_url` | Yes | Professional headshot or portrait |
| **sameAs** | Array of profile URLs | No | LinkedIn URL + Twitter/X URL at minimum |
| **worksFor** | @id ref → `#organization` | Yes | Bidirectional link back to Organization |

### BreadcrumbList Fields

| Field Name | Source | Required? | Notes |
| :--- | :--- | :--- | :--- |
| **@type** | Fixed: "BreadcrumbList" | Yes | |
| **@id** | `{pageUrl}/#breadcrumb` | Yes | |
| **itemListElement** | 2 ListItems | Yes | Position 1: Home (with `item`). Position 2: About (no `item`, just `name`). |

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

### mentions Array Pattern

The mentions array can include both referenced entities and partner organizations:

```json
"mentions": [
  {
    "@id": "https://pomegranate.marketing/about/#founder"
  },
  {
    "@type": "Organization",
    "name": "Google Partners",
    "sameAs": [
      "https://www.wikidata.org/wiki/Q15558448"
    ]
  }
]
```

---

### Full JSON-LD Template

See `/docs/content-model/schema-examples/TPL-007_About-Page_schema.jsonld` for the complete working template.
