# TPL-011: Downloads Page

**Template:** 11 of 13
**URL Pattern:** `/downloads/`
**Purpose:** Hub for downloadable resources — guides, templates, checklists, reports, worksheets. Gated or ungated. Builds the mailing list and demonstrates expertise. All downloads are listed on this single page — there are no individual download sub-pages.
**Schema:** WebPage, CollectionPage, BreadcrumbList, Organization (ref)
**Keyword Cycling Component:** ✗ Not applicable

**Reference:** Similar in concept to https://seoworks.co.uk/downloads/

---

## Global Components Present

- **Header Nav** — See GLOBAL-001
- **Footer Nav** — See GLOBAL-002

---

## Component Inventory (in page order)

1. Hero Section (Template 1) — See GLOBAL-004
2. Download Gallery — Page-specific (spec below)
3. Trusted By — See GLOBAL-007
4. Free Tools Featured Gallery — See GLOBAL-012
5. Mailing List CTA — See GLOBAL-011
6. Featured Blog Posts — See GLOBAL-013

---

## SEO & Meta

| Field Name | Field Type | Required? | Notes / Guidance |
| :--- | :--- | :--- | :--- |
| **Meta Title** | Text (80 chars max) | Yes | e.g. 'Free Downloads & Resources \| Pomegranate Digital' |
| **Meta Description** | Text (135 chars max) | Yes | What's available and why it's worth downloading |
| **Canonical URL** | URL | Yes | Self-referencing canonical |
| **Index Toggle** | Boolean | Yes | Pages with only gated content behind forms may warrant no-index. Default: true (indexed). |

---

## Component Tailoring Notes

### 1. Hero Section (Template 1)

Uses GLOBAL-004. Tailoring for Downloads Page:

| Field | Downloads Page Tailoring |
| :--- | :--- |
| **H1 Headline** | e.g. 'Free Downloads & Resources', 'Guides, Templates & More' |
| **Hero Subheadline** | Optional — e.g. 'Practical resources to help your business grow.' |
| **Hero Body Copy** | 1–2 sentences. Brief overview of what's available. |
| **Primary CTA** | Optional — e.g. 'Browse Below' anchor link. The page content is the CTA. |
| **Hero Image / Visual** | Optional — can use a lighter hero |
| **Trust Signals** | Typically omitted |
| **Breadcrumb Display** | **true** — Path: Home > Downloads |

### 2. Download Gallery (Page-Specific)

All downloadable resources displayed in a single gallery on this page. No individual download pages.

| Field Name | Field Type | Required? | Notes / Guidance |
| :--- | :--- | :--- | :--- |
| **Gallery Heading** | Text | No | Optional — e.g. 'Our Resources' |
| **— Heading Level** | Select: H2 / H3 / p | No | |

#### Download Items

| Field Name | Field Type | Required? | Notes / Guidance |
| :--- | :--- | :--- | :--- |
| **Download Items** | Repeatable Component | Yes | All resources listed here. No sub-pages. |
| **— Resource Title** | Text | Yes | e.g. 'The Complete Local SEO Checklist' |
| **— Resource Type** | Select: Guide / Template / Checklist / Report / Worksheet | Yes | Displayed as a badge/label on the card |
| **— Resource Description** | Rich Text (50–150 words) | Yes | What the resource covers and who it's for |
| **— Cover / Preview Image** | Image | Yes | Visual thumbnail — cover design, preview screenshot, or branded graphic |
| **— Cover Image Alt Text** | Text | Yes | |
| **— Access Type** | Select: Free / Gated / Member Only | Yes | Controls whether a direct download link or a form is shown |
| **— Download URL (if ungated)** | URL | No | Direct link to the file (PDF, XLSX, etc.). Only shown when Access Type is 'Free'. |
| **— Form Embed (if gated)** | Form Component | No | Email capture form shown when Access Type is 'Gated'. On submission, delivers the resource via email or reveals the download link. |
| **— Gated Form Fields** | Structured: Name + Email | No | Minimal friction — name and email only. Consent checkbox required. |
| **— Privacy Assurance Statement** | Text | No | e.g. 'We never spam. Unsubscribe any time.' Displayed near the gated form. |
| **— File Format** | Text | No | e.g. 'PDF', 'XLSX', 'DOCX'. Displayed as metadata on the card. |
| **— File Size** | Text | No | e.g. '2.4 MB'. Displayed as metadata. |
| **— Sort Order** | Integer | No | Controls display sequence. Lower numbers appear first. |
| **— Category Tag** | Text | No | e.g. 'SEO', 'Web Design', 'Business'. Used for optional filtering. |

#### Filtering & Sorting

| Field Name | Field Type | Required? | Notes / Guidance |
| :--- | :--- | :--- | :--- |
| **Filter By Resource Type** | Boolean | No | Enables filter tabs by Resource Type (Guide, Template, etc.) |
| **Filter By Category** | Boolean | No | Enables filter tabs by Category Tag |
| **Sort Default** | Select: Manual / Newest First | No | Default: Manual (by Sort Order) |

### 3. Trusted By

Uses GLOBAL-007. No page-specific tailoring — synchronized singleton.

### 4. Free Tools Featured Gallery

Uses GLOBAL-012. Tailoring:

| Field | Downloads Page Tailoring |
| :--- | :--- |
| **Section Heading** | e.g. 'Try Our Free Tools Too' |
| **Tool Cards** | Cross-promote 2–3 free tools alongside the downloads |

### 5. Mailing List CTA

Uses GLOBAL-011. Tailoring:

| Field | Downloads Page Tailoring |
| :--- | :--- |
| **Section Heading** | e.g. 'Get Notified When We Publish New Resources' |
| **Section Subheading** | e.g. 'Plus free SEO tips. No spam.' |

### 6. Featured Blog Posts

Uses GLOBAL-013. Tailoring:

| Field | Downloads Page Tailoring |
| :--- | :--- |
| **Section Heading** | e.g. 'From the Blog' |
| **Selection Mode** | Auto (Latest) — most recent posts |
| **Max Posts Displayed** | 3 |

---

## Behaviour & Logic Notes

1. **No Sub-Pages:** All downloads live on this single page. There are no individual download detail pages. Each resource is a card within the gallery.

2. **Gated vs Ungated:** The Access Type field controls the card's CTA behaviour. Free resources show a direct download button. Gated resources show an inline form or modal form that captures email before delivering the resource.

3. **Gated Delivery:** When a gated form is submitted, the resource can be delivered via email (preferred — builds the mailing list) or the download link can be revealed inline. Both are valid approaches.

4. **Mailing List Sync:** Gated form submissions should sync to the same mailing list provider as the Mailing List CTA (GLOBAL-011). Tag subscribers with the resource they downloaded for segmentation.

5. **File Format & Size:** Displaying these metadata fields on the card sets expectations and reduces friction — users know what they're getting before they click.

---

## Structured Data / Schema Fields

The Downloads Page is a collection hub with minimal schema. It's a WebPage + CollectionPage (no single mainEntity). The page references the organization by @id and includes `about` and `mentions` for the types of resources available (white papers, e-books) and related concepts (digital marketing, SEO).

### @graph Structure

| @graph Item | @type | @id | Notes |
| :--- | :--- | :--- | :--- |
| **WebPage** | WebPage + CollectionPage | `https://pomegranate.marketing/downloads/` | Dual type — collection hub with no single entity |
| **BreadcrumbList** | BreadcrumbList | `{pageUrl}/#breadcrumb` | Home > Downloads |
| **ImageObject** | ImageObject | `{pageUrl}/#primaryimage` | Conditional — only if OG image exists |

The Organization (`#organization`) and WebSite (`#website`) are referenced by `@id` — their full objects are emitted on the Homepage (TPL-001).

### WebPage Fields

| Field Name | Source | Required? | Notes |
| :--- | :--- | :--- | :--- |
| **@type** | Fixed: ["WebPage", "CollectionPage"] | Yes | Dual type — page is both a page and a collection |
| **@id** | `https://pomegranate.marketing/downloads/` | Yes | |
| **url** | `https://pomegranate.marketing/downloads/` | Yes | |
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
| **about** | Array of Thing objects | Yes | Resource concept types: White paper, E-book, with Wikipedia + Wikidata sameAs |
| **mentions** | Array of Thing objects | No | Related concepts: Digital marketing, SEO, with Wikipedia + Wikidata sameAs |

### BreadcrumbList Fields

| Field Name | Source | Required? | Notes |
| :--- | :--- | :--- | :--- |
| **@type** | Fixed: "BreadcrumbList" | Yes | |
| **@id** | `{pageUrl}/#breadcrumb` | Yes | |
| **itemListElement** | 2 ListItems | Yes | Position 1: Home (with `item`). Position 2: Downloads (no `item`, just `name`). |

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
  "name": "White paper",
  "sameAs": [
    "https://en.wikipedia.org/wiki/White_paper",
    "https://www.wikidata.org/wiki/Q223706"
  ]
}
```

Sourced from `knowledge_graph_entities` table via the page's `about_entities` and `mentions_entities` uuid[] columns.

---

## Note on Individual Download Schema

Individual download items (.pdf, .xlsx, .docx files) do not have their own pages in this template design. If in future the design evolves to include individual download detail pages, each could emit CreativeWork schema alongside the download metadata. For now, all schema is consolidated on the hub page.

---

### Full JSON-LD Template

See `/docs/content-model/schema-examples/TPL-011_Downloads_schema.jsonld` for the complete working template.
