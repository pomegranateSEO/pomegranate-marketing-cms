# TPL-012: Legal / Utility Page

**Template:** 12 of 13
**URL Pattern:** `/privacy-policy/`, `/terms-of-service/`, `/cookie-policy/`
**Purpose:** Privacy Policy, Terms of Service, Cookie Policy, and similar legal/compliance documents. Must be accurate, readable, up to date, and GDPR-compliant. These are functional pages — no conversion components, no marketing flourishes.
**Schema:** WebPage, BreadcrumbList, Organization (ref)
**Keyword Cycling Component:** ✗ Not applicable

---

## Global Components Present

- **Header Nav** — See GLOBAL-001
- **Footer Nav** — See GLOBAL-002

---

## Component Inventory (in page order)

1. Page Header — Page-specific (spec below)
2. Document Body — Page-specific (spec below)
3. Contact / Queries — Page-specific (spec below)

No marketing components (no hero, no Trusted By, no CTAs, no testimonials). This is a clean document page.

---

## SEO & Meta

| Field Name | Field Type | Required? | Notes / Guidance |
| :--- | :--- | :--- | :--- |
| **Meta Title** | Text (80 chars max) | Yes | Document name + Brand — e.g. 'Privacy Policy \| Pomegranate Digital' |
| **Canonical URL** | URL | Yes | Self-referencing canonical |
| **No-Index Toggle** | Boolean | No | Some businesses prefer to no-index legal pages. Default: false (indexed). |

**Note:** No Meta Description field is required — search engines rarely surface legal pages in results, and auto-generated snippets from the intro paragraph are sufficient.

---

## Page-Specific Components

### 1. Page Header

| Field Name | Field Type | Required? | Notes / Guidance |
| :--- | :--- | :--- | :--- |
| **H1 Headline** | Text | Yes | e.g. 'Privacy Policy', 'Terms of Service', 'Cookie Policy' |
| **Last Updated Date** | Date | Yes | Critical for compliance — must always reflect the actual date of the most recent substantive edit. Displayed prominently below the H1. |
| **Intro Paragraph** | Rich Text | No | Plain-English summary of what this document covers — e.g. 'This policy explains how we collect, use, and protect your personal data. Last updated [date].' Keep accessible and jargon-free. |
| **Breadcrumb Display** | Boolean | No | Optional. Some sites show breadcrumbs on legal pages (Home > Privacy Policy), others don't. Default: false. |

### 2. Document Body

The main content of the legal document, structured as repeatable sections.

| Field Name | Field Type | Required? | Notes / Guidance |
| :--- | :--- | :--- | :--- |
| **Document Sections** | Repeatable Component | Yes | The full document broken into sections |
| **— Section Heading (H2)** | Text | Yes | e.g. 'Information We Collect', 'How We Use Your Data', 'Your Rights' |
| **— Section Body** | Rich Text | Yes | Supports paragraphs, lists, sub-headings (H3/H4), links, and tables. Must be comprehensive and legally accurate. |
| **Table of Contents / Jump Links** | Auto or Manual | No | Recommended for longer documents (3+ sections). Auto-generated from H2 headings. Helps users find specific sections quickly. |

### 3. Contact / Queries

Required for GDPR compliance — provides a clear contact path for data-related queries.

| Field Name | Field Type | Required? | Notes / Guidance |
| :--- | :--- | :--- | :--- |
| **Section Heading** | Text | No | e.g. 'Questions About This Policy' |
| **Contact Email** | Email | Yes | Dedicated privacy/legal email — e.g. privacy@pomegranate.digital. Not the general enquiry address. |
| **Data Controller Name** | Text | Yes | GDPR compliance — the named data controller. e.g. 'Pomegranate Digital Ltd' |
| **Data Controller Address** | Text | Yes | GDPR compliance — registered address of the data controller |
| **ICO Registration Number** | Text | No | UK-specific. e.g. 'ZA123456'. Required if the business is registered with the ICO. |
| **DPO Name** | Text | No | Data Protection Officer name — required for some organisations under GDPR |

---

## Behaviour & Logic Notes

1. **No Marketing Components:** Legal pages should not contain Trusted By, Work With Us CTA, Testimonials, or any conversion-oriented components. They are functional documents.

2. **Last Updated Date Accuracy:** This is a compliance field, not a cosmetic one. It must reflect the actual date of the last substantive edit. Changing a typo doesn't count — changing a data retention period does.

3. **Plain English:** Legal documents should be written in plain, accessible English. Avoid unnecessary legalese. UK GDPR guidance recommends that privacy policies be understandable by the average person.

4. **Version History (Optional):** Some businesses maintain a version history log at the bottom of legal documents. This is not modelled as a field but is worth considering as a rich text block within the Document Body.

5. **Cookie Consent Integration:** The Cookie Policy page should be referenced by the site's cookie consent banner. The banner's "Learn More" or "Cookie Policy" link should point to this page.

---

## Accessibility Requirements

| Requirement | Notes |
| :--- | :--- |
| **Heading hierarchy** | H1 → H2 sections → H3 sub-sections. No skipped levels. |
| **Table of contents** | Jump links should use `<a href="#section-id">` with corresponding `id` attributes on section headings |
| **Reading level** | Aim for a reading level accessible to a broad audience. Avoid dense legal language where possible. |
| **Link context** | All links within the document body should have descriptive text — avoid 'click here' |

---

## Structured Data / Schema Fields

Legal / Utility pages emit minimal but compliant schema. The WebPage includes standard metadata (datePublished, dateModified, isFamilyFriendly, inLanguage) and references to the WebSite and Breadcrumb. The schema intentionally omits `about`, `mentions`, `mainEntity`, and other enrichment fields because legal pages are not about promoting expertise or entities — they are functional compliance documents.

### @graph Structure

| @graph Item | @type | @id | Notes |
| :--- | :--- | :--- | :--- |
| **WebPage** | WebPage | `{pageUrl}/` | Simple page type — functional document |
| **BreadcrumbList** | BreadcrumbList | `{pageUrl}/#breadcrumb` | Home > [Page Name] |
| **ImageObject** | ImageObject | `{pageUrl}/#primaryimage` | Conditional — only if OG image exists |

The Organization (`#organization`) and WebSite (`#website`) are referenced by `@id` — their full objects are emitted on the Homepage (TPL-001).

### WebPage Fields

| Field Name | Source | Required? | Notes |
| :--- | :--- | :--- | :--- |
| **@type** | Fixed: "WebPage" | Yes | Single type — functional document |
| **@id** | `{pageUrl}/` | Yes | e.g. `https://pomegranate.marketing/privacy-policy/` |
| **url** | `{pageUrl}/` | Yes | |
| **name** | `pages.meta_title` | Yes | |
| **description** | `pages.meta_description` | No | Optional — auto-generated snippets are usually sufficient for legal pages |
| **isPartOf** | Complete WebSite ref: `@type`, `@id`, `url`, `name` | Yes | Always complete — not just `@id`. Standard across all templates. |
| **primaryImageOfPage** | @id ref → `#primaryimage` | No | Conditional — only if OG image exists |
| **image** | @id ref → `#primaryimage` | No | Conditional — only if OG image exists |
| **breadcrumb** | @id ref → `#breadcrumb` | Yes | |
| **inLanguage** | Fixed: "en-GB" | Yes | |
| **isFamilyFriendly** | Fixed: "true" | Yes | |
| **datePublished** | `pages.created_at` (ISO 8601) | Yes | |
| **dateModified** | `pages.updated_at` (ISO 8601) | Yes | Critical for legal pages — search engines use this to determine freshness of compliance documents |

### BreadcrumbList Fields

| Field Name | Source | Required? | Notes |
| :--- | :--- | :--- | :--- |
| **@type** | Fixed: "BreadcrumbList" | Yes | |
| **@id** | `{pageUrl}/#breadcrumb` | Yes | |
| **itemListElement** | 2 ListItems | Yes | Position 1: Home (with `item`). Position 2: [Page Name] (no `item`, just `name`). |

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

## Why Legal Pages Have Minimal Schema

Legal / Utility pages are designed to be functional compliance documents, not marketing or expertise-demonstration pages. They intentionally omit:

- **`about` and `mentions`:** No need to highlight entities or topics — the document itself is the focus
- **`mainEntity`:** No single entity is being promoted or described
- **`aggregateRating`, `offers`, or service detail:** Legal pages don't sell services or gather reviews
- **FAQPage:** Not appropriate for compliance documents structured as prose sections
- **Author or creator fields:** Legal pages are corporate documents, not personal content

This minimal approach keeps the schema focused on what matters for legal pages: accurate, up-to-date compliance information accessible to users.

---

### Full JSON-LD Template

See `/docs/content-model/schema-examples/TPL-012_Legal-Utility_schema.jsonld` for the complete working template.
