# TPL-003: National Specific Service Page

**Template:** 3 of 13
**URL Pattern:** `/[service-category]/[specific-service]/` — e.g. `/seo-services/technical-seo/`, `/seo-services/keyword-research/`
**Purpose:** Primary commercial page for an individual service at national level. Covers all training services and L2/L1 service detail pages. The main conversion-driving page for each service offering.
**Schema:** Service, Offer, WebPage, BreadcrumbList, Organization (ref), FAQPage (optional)
**Keyword Cycling Component:** ✓ Applicable

---

## Global Components Present

- **Header Nav** — See GLOBAL-001
- **Footer Nav** — See GLOBAL-002

---

## Component Inventory (in page order)

1. Hero Section (Template 1) — See GLOBAL-004
2. Keyword Cycling Block — See GLOBAL-003
3. Service Overview — Page-specific (spec below)
4. Service Deliverables — Page-specific (spec below)
5. Trusted By — See GLOBAL-007
6. Testimonials — See GLOBAL-009
7. Environments We Work In — See GLOBAL-008
8. Pricing & Packages — See GLOBAL-016
9. FAQ Section — See GLOBAL-017
10. Work With Us CTA — See GLOBAL-010

---

## SEO & Meta

| Field Name | Field Type | Required? | Notes / Guidance |
| :--- | :--- | :--- | :--- |
| **Meta Title** | Text (80 chars max) | Yes | Service name + outcome + brand — e.g. 'Technical SEO Services | Pomegranate Digital' |
| **Meta Description** | Text (135 chars max) | Yes | What the service delivers and who it's for |
| **Canonical URL** | URL | Yes | Self-referencing canonical |
| **Focus Keyword** | Text | Yes | Primary target keyword — e.g. 'technical SEO services' |
| **Secondary Keywords** | Text (comma-separated) | No | Editorial use — informs content writing, not rendered on page |

---

## Component Tailoring Notes

### 1. Hero Section (Template 1)

Uses GLOBAL-004. Tailoring for National Specific Service:

| Field | National Specific Service Tailoring |
| :--- | :--- |
| **H1 Headline** | Service name + core outcome — e.g. 'Technical SEO That Fixes What's Holding You Back' |
| **Hero Subheadline** | Optional |
| **Hero Body Copy** | 2–5 sentences. Problem-aware copy — who this service is for and what pain it solves. |
| **Primary CTA** | e.g. 'Get a Free SEO Audit', 'Book Your Free Consultation' |
| **Hero Image / Visual** | Service-specific or category-level image |
| **Breadcrumb Display** | **true** — Path: Home > [Category] > [Service Name] |

### 2. Keyword Cycling Block

Uses GLOBAL-003. Tailoring:

| Field | National Specific Service Tailoring |
| :--- | :--- |
| **prefix_text** | e.g. 'Our' |
| **keywords** | Service name permutations — e.g. ['technical SEO service', 'technical SEO audit', 'site health optimisation'] |
| **suffix_text** | e.g. 'drives qualified traffic to your site' |
| **static_fallback** | Complete sentence with primary keyword |
| **heading_level** | H2 |

### 3. Service Overview (Page-Specific)

An editorial section that explains what the service is, who it's for, and why it matters.

| Field Name | Field Type | Required? | Notes / Guidance |
| :--- | :--- | :--- | :--- |
| **Section Heading** | Text | Yes | e.g. 'What Is Technical SEO?', 'About This Service' |
| **— Heading Level** | Select: H2 / H3 / p | Yes | Typically H2 |
| **Overview Body Copy** | Rich Text (200–500 words) | Yes | Detailed explanation of the service. What it involves, why it's important, what results to expect. This is the core editorial content — supports E-E-A-T and gives the page indexable depth. |
| **Target Audience Description** | Rich Text (100–200 words) | No | Who this service is for — e.g. 'Ideal for businesses with established websites that are underperforming in search despite having good content.' |
| **Audience Persona Tags** | Repeatable Text | No | e.g. 'E-commerce', 'SaaS', 'Local Business', 'Enterprise'. Used for filtering and internal tagging. |

### 4. Service Deliverables (Page-Specific)

What the client actually gets — the tangible outputs and process.

| Field Name | Field Type | Required? | Notes / Guidance |
| :--- | :--- | :--- | :--- |
| **Section Heading** | Text | Yes | e.g. 'What's Included', 'What You Get', 'Our Process' |
| **— Heading Level** | Select: H2 / H3 / p | Yes | Typically H2 |
| **Deliverable Items** | Repeatable Component | Yes | Min 3 items |
| **— Deliverable Heading** | Text | Yes | e.g. 'Full Site Technical Audit', 'Monthly Performance Report' |
| **— Deliverable Description** | Rich Text (2–4 sentences) | Yes | What this deliverable is and why it matters |
| **— Deliverable Icon** | Image or SVG | No | Visual icon for the deliverable |
| **Process Steps** | Repeatable Component | No | Optional numbered process — e.g. 'Step 1: Discovery → Step 2: Audit → Step 3: Implementation → Step 4: Reporting' |
| **— Step Number** | Integer | Yes | |
| **— Step Heading** | Text | Yes | |
| **— Step Body** | Rich Text (1–3 sentences) | Yes | |

### 5. Trusted By

Uses GLOBAL-007. No page-specific tailoring — synchronized singleton.

### 6. Testimonials

Uses GLOBAL-009. Tailoring:

| Field | National Specific Service Tailoring |
| :--- | :--- |
| **Section Heading** | e.g. 'What Our Clients Say About Our Technical SEO' |
| **Testimonial Items** | Filter or curate reviews specific to this service. At least 1 service-specific testimonial. |
| **Display Aggregate?** | Recommended: true |

### 7. Environments We Work In

Uses GLOBAL-008. No page-specific tailoring — synchronized singleton.

### 8. Pricing & Packages

Uses GLOBAL-016. Tailoring:

| Field | National Specific Service Tailoring |
| :--- | :--- |
| **Section Heading** | e.g. 'Technical SEO Pricing', 'Our Packages' |
| **Pricing Model** | Set per service — some services suit Tiered Packages, others suit Starting From or Custom Quote |
| **Package Cards / Price Display** | Populated with service-specific pricing data |
| **Trust Note** | e.g. 'No long-term contracts. Cancel anytime.' |
| **Offer Schema Toggle** | Enable to generate Offer schema with price data |

### 9. FAQ Section

Uses GLOBAL-017. Tailoring:

| Field | National Specific Service Tailoring |
| :--- | :--- |
| **Section Heading** | e.g. 'Technical SEO FAQs', 'Common Questions' |
| **FAQ Items** | Service-specific questions. Min 4 recommended. e.g. 'How long does a technical SEO audit take?', 'Do I need technical SEO if my site is new?' |
| **FAQ Schema Toggle** | **true** — service pages benefit strongly from FAQ rich results |

### 10. Work With Us CTA

Uses GLOBAL-010. Tailoring:

| Field | National Specific Service Tailoring |
| :--- | :--- |
| **Section Heading** | Can reference the service — e.g. 'Ready to Fix Your Technical SEO?' |
| **All interaction logic** | No changes — full 5-option flow |

---

## Training Service Variant

When this template is used for a **training/course page** (e.g. 'SEO Training', '1:1 SEO Coaching'), the following fields require different content but no structural changes:

| Field | Training Variant Notes |
| :--- | :--- |
| **Service Overview** | Focuses on learning outcomes, course format (in-person, remote, 1:1, group), and who should attend |
| **Service Deliverables** | Reframed as 'What You'll Learn' or 'Course Modules' — same repeatable structure, different content framing |
| **Pricing & Packages** | May use Tiered Packages for different course levels (e.g. Beginner, Advanced, Bespoke) or Fixed for a single offering |
| **Testimonials** | Curate training-specific reviews from past participants |
| **FAQ Items** | Training-specific — e.g. 'Do I need prior SEO experience?', 'Is the training recorded?' |

**Schema note:** Training services may require a different `serviceType` value and potentially `Course` or `EducationEvent` schema in addition to `Service`. This will be addressed in the per-template schema pass.

---

## Structured Data / Schema Fields

The National Specific Service page emits a WebPage with a Service as its mainEntity. The Service always includes an Offer (with pricing if available, or "Contact for pricing" if not). FAQPage is emitted as a separate `@graph` item when FAQ items are present. The `isPartOf` reference to the WebSite is always complete (not just an `@id` ref) — this is standard across all templates.

### @graph Structure

| @graph Item | @type | @id | Notes |
| :--- | :--- | :--- | :--- |
| **WebPage** | WebPage | `{pageUrl}/` | Leaf-level service page |
| **Service** | Service | `{pageUrl}/#service` | The specific service, with Offer and bidirectional link to WebPage |
| **FAQPage** | FAQPage | `{pageUrl}/#faq` | Conditional — only when FAQ items are present and toggled on |
| **BreadcrumbList** | BreadcrumbList | `{pageUrl}/#breadcrumb` | Home → [Category] → [Service Name] |
| **ImageObject** | ImageObject | `{pageUrl}/#primaryimage` | Conditional — only if OG image exists |

The Organization (`#organization`) and WebSite (`#website`) are referenced — their full objects are emitted on the Homepage (TPL-001).

### WebPage Fields

| Field Name | Source | Required? | Notes |
| :--- | :--- | :--- | :--- |
| **@type** | Fixed: "WebPage" | Yes | Single type — not a collection |
| **@id** | `{pageUrl}/` | Yes | |
| **url** | `{pageUrl}/` | Yes | |
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
| **mainEntity** | @id ref → `{pageUrl}/#service` | Yes | Points to the Service |
| **about** | From `knowledge_graph_entities` via `pages.about_entities` uuid[] | No | |
| **mentions** | From `knowledge_graph_entities` via `pages.mentions_entities` uuid[] | No | |

### Service Fields

| Field Name | Source | Required? | Notes |
| :--- | :--- | :--- | :--- |
| **@type** | Fixed: "Service" | Yes | |
| **@id** | `{pageUrl}/#service` | Yes | |
| **name** | `pages.service_name` | Yes | e.g. "On-Page SEO Service" |
| **description** | `pages.service_description` (150–300 words) | Yes | |
| **serviceType** | `pages.service_type` | No | e.g. "Professional SEO Service" |
| **additionalType** | Wikidata URL for the service concept | No | e.g. `https://www.wikidata.org/wiki/Q114055561` |
| **provider** | @id ref → `#organization` | Yes | |
| **areaServed** | Country or Place | No | e.g. `{ "@type": "Country", "name": "United Kingdom" }` |
| **mainEntityOfPage** | @id ref → `{pageUrl}/` | Yes | Bidirectional link back to WebPage |
| **subjectOf** | @id ref → `{pageUrl}/#faq` | No | Only when FAQPage exists |
| **offers** | Offer object | Yes | Always present — with price if available, or "Contact for pricing" |

### Offer Fields (Always Present)

| Field Name | Source | Required? | Notes |
| :--- | :--- | :--- | :--- |
| **@type** | Fixed: "Offer" | Yes | |
| **priceCurrency** | Fixed: "GBP" | Yes | |
| **price** | `pages.price_value` or "0" | Yes | Use actual price if available. If no specific price, set to "0". |
| **priceSpecification** | PriceSpecification object | No | Use when price exists — includes `minPrice` for "Starting From" models |
| **availability** | Fixed: "https://schema.org/OnlineOnly" or "InStock" | No | |
| **description** | Pricing context text | No | e.g. "Contact for pricing" when no specific price. "From £499/month" when Starting From. |
| **url** | `{pageUrl}/` | No | |

**When no specific price exists:**
```json
"offers": {
  "@type": "Offer",
  "priceCurrency": "GBP",
  "price": "0",
  "description": "Contact for pricing",
  "url": "{pageUrl}/"
}
```

**When a specific price exists:**
```json
"offers": {
  "@type": "Offer",
  "priceCurrency": "GBP",
  "price": "499",
  "priceSpecification": {
    "@type": "UnitPriceSpecification",
    "price": "499",
    "priceCurrency": "GBP",
    "unitText": "monthly"
  },
  "availability": "https://schema.org/OnlineOnly",
  "url": "{pageUrl}/"
}
```

### FAQPage Fields (Conditional)

Only emitted when FAQ items are present and FAQ Schema Toggle is true.

| Field Name | Source | Required? | Notes |
| :--- | :--- | :--- | :--- |
| **@type** | Fixed: "FAQPage" | Yes | |
| **@id** | `{pageUrl}/#faq` | Yes | |
| **mainEntity** | Array of Question objects | Yes | From `pages.faqs` JSON array |
| **— Question @type** | Fixed: "Question" | Yes | |
| **— Question name** | Question text | Yes | |
| **— acceptedAnswer @type** | Fixed: "Answer" | Yes | |
| **— acceptedAnswer text** | Answer text (HTML stripped or lightly formatted) | Yes | |

### BreadcrumbList Fields

| Field Name | Source | Required? | Notes |
| :--- | :--- | :--- | :--- |
| **@type** | Fixed: "BreadcrumbList" | Yes | |
| **@id** | `{pageUrl}/#breadcrumb` | Yes | |
| **itemListElement** | 3 ListItems | Yes | Position 1: Home. Position 2: [Category]. Position 3: [Service Name]. All with `item` object containing `@id` and `name`. |

### Training Service Variant

When this template is used for a training/course page, the Service `@type` may be extended and `serviceType` changes:

| Field | Training Variant |
| :--- | :--- |
| **serviceType** | "EducationalService" or "Training" |
| **additionalType** | `https://www.wikidata.org/wiki/Q918385` (Training) |

Full Course / EducationEvent schema to be addressed in a separate training-specific schema spec if needed.

---

### isPartOf Standard (All Templates)

The `isPartOf` reference on WebPage must always include the complete WebSite object reference, not just an `@id`:

```json
"isPartOf": {
  "@type": "WebSite",
  "@id": "https://pomegranate.marketing/#website",
  "url": "https://pomegranate.marketing/",
  "name": "pomegranate"
}
```

This is standard across ALL page templates. Previous templates (TPL-001, TPL-002) should be updated to match.

---

### Full JSON-LD Template

See `/docs/content-model/schema-examples/TPL-003_National-Specific-Service_schema.jsonld` for the complete working template.
