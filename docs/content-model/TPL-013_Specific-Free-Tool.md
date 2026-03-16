# TPL-013: Specific Free Tool Page

**Template:** 13 of 13
**URL Pattern:** `/free-tools/[tool-slug]/` — e.g. `/free-tools/seo-audit-checker/`, `/free-tools/meta-tag-generator/`
**Purpose:** Individual page for a browser-based interactive tool that delivers immediate value. High SEO traffic potential — these pages target high-intent informational queries (e.g. 'free SEO audit tool', 'meta tag generator'). The tool runs in-browser with no signup required.
**Schema:** WebPage, SoftwareApplication, FAQPage (conditional), BreadcrumbList, Organization (ref)
**Keyword Cycling Component:** ✓ Applicable

---

## Global Components Present

- **Header Nav** — See GLOBAL-001
- **Footer Nav** — See GLOBAL-002

---

## Component Inventory (in page order)

1. Hero Section (Template 1) — See GLOBAL-004
2. Keyword Cycling Block — See GLOBAL-003
3. Tool Interface — Page-specific (spec below)
4. How To Use — Page-specific (spec below)
5. Trusted By — See GLOBAL-007
6. FAQ Section — See GLOBAL-017
7. Mailing List CTA — See GLOBAL-011
8. Free Tools Featured Gallery — See GLOBAL-012
9. Work With Us CTA — See GLOBAL-010

---

## SEO & Meta

| Field Name | Field Type | Required? | Notes / Guidance |
| :--- | :--- | :--- | :--- |
| **Meta Title** | Text (80 chars max) | Yes | Tool name + 'Free' + context — e.g. 'Free SEO Audit Checker \| Pomegranate Digital' |
| **Meta Description** | Text (135 chars max) | Yes | What the tool does and that it's free with no signup |
| **Canonical URL** | URL | Yes | Self-referencing canonical |
| **Focus Keyword** | Text | Yes | e.g. 'free SEO audit tool' |

---

## Component Tailoring Notes

### 1. Hero Section (Template 1)

Uses GLOBAL-004. Tailoring for Free Tool Page:

| Field | Free Tool Page Tailoring |
| :--- | :--- |
| **H1 Headline** | Tool name — e.g. 'Free SEO Audit Checker' |
| **Hero Subheadline** | What it does in one line — e.g. 'Instant analysis of your website's SEO health. No signup required.' |
| **Hero Body Copy** | Optional. 1–2 sentences. Can explain what the tool checks or who it's for. |
| **Primary CTA** | e.g. 'Try It Free' — anchor link to `#tool` |
| **Secondary CTA** | Optional — e.g. 'See How It Works' anchor to the How To Use section |
| **Hero Image / Visual** | Optional — a screenshot or preview of the tool output. Can be omitted if the tool interface itself is visible quickly. |
| **Trust Signals** | Optional — e.g. 'No Signup Required', 'Instant Results' |
| **Breadcrumb Display** | **true** — Path: Home > Free Tools > [Tool Name] |

### 2. Keyword Cycling Block

Uses GLOBAL-003. Tailoring:

| Field | Free Tool Page Tailoring |
| :--- | :--- |
| **prefix_text** | Optional — may not be needed if the cycling block stands alone |
| **keywords** | Tool name permutations — e.g. ['free SEO audit tool', 'website checker', 'SEO health checker', 'site audit tool'] |
| **suffix_text** | Optional |
| **static_fallback** | Complete sentence — e.g. 'Use our free SEO audit tool to check your website's search health.' |
| **heading_level** | H2 |

### 3. Tool Interface (Page-Specific)

The interactive tool itself — the core reason this page exists.

| Field Name | Field Type | Required? | Notes / Guidance |
| :--- | :--- | :--- | :--- |
| **Tool Anchor ID** | Text | Yes | e.g. `tool`. Used as anchor target from hero CTA. |
| **Tool Section Heading** | Text | No | Optional — e.g. 'Try It Now'. May not be needed if the tool is self-explanatory. |
| **— Heading Level** | Select: H2 / H3 / p | No | |

#### Tool Input

| Field Name | Field Type | Required? | Notes / Guidance |
| :--- | :--- | :--- | :--- |
| **Tool Embed / Component** | Interactive Embed or Custom Component | Yes | The tool itself — could be a React component, an iframe embed, or a custom-built interactive element. Implementation varies per tool. |
| **Input Label** | Text | No | e.g. 'Enter your website URL'. Displayed above or within the tool input area. |
| **Input Placeholder** | Text | No | e.g. 'https://yourwebsite.com' |
| **Submit / Run Button Label** | Text | No | e.g. 'Run Audit', 'Check Now', 'Generate' |

#### Tool Output

| Field Name | Field Type | Required? | Notes / Guidance |
| :--- | :--- | :--- | :--- |
| **Tool Output Display** | Component | Yes | The results area — table, chart, score card, text output, or downloadable report. Format depends on the specific tool. |
| **Results CTA** | Component | No | Shown after results are generated. Prompts the next step. |
| **— Results CTA Heading** | Text | No | e.g. 'Want Help Fixing These Issues?' |
| **— Results CTA Body** | Text (1–2 sentences) | No | e.g. 'Our team can implement every recommendation in this audit. Book a free consultation.' |
| **— Results CTA Label** | Text | No | e.g. 'Get a Free Consultation' |
| **— Results CTA URL** | URL / Anchor | No | Links to Work With Us CTA or Contact page |

### 4. How To Use (Page-Specific)

Step-by-step instructions for using the tool. Serves both UX (helps visitors) and SEO (adds indexable content to what would otherwise be a thin interactive page).

| Field Name | Field Type | Required? | Notes / Guidance |
| :--- | :--- | :--- | :--- |
| **Section Heading** | Text | Yes | e.g. 'How To Use This Tool', 'How It Works' |
| **— Heading Level** | Select: H2 / H3 / p | Yes | Typically H2 |
| **Step Items** | Repeatable Component | Yes | Min 3 steps recommended |
| **— Step Number** | Integer | Yes | Auto-incrementing or manual |
| **— Step Heading** | Text | Yes | e.g. 'Enter Your Website URL', 'Review Your Results', 'Take Action' |
| **— Step Body** | Rich Text (1–3 sentences) | Yes | What to do in this step and what to expect |
| **— Step Image / Screenshot** | Image | No | Optional screenshot or illustration of this step |

### 5. Trusted By

Uses GLOBAL-007. No page-specific tailoring — synchronized singleton.

### 6. FAQ Section

Uses GLOBAL-017. Tailoring:

| Field | Free Tool Page Tailoring |
| :--- | :--- |
| **Section Heading** | e.g. 'FAQs About the SEO Audit Checker' |
| **FAQ Items** | Tool-specific questions. e.g. 'Is this tool really free?', 'How accurate are the results?', 'Do you store my website data?', 'How often should I run an audit?' |
| **FAQ Schema Toggle** | **true** |

### 7. Mailing List CTA

Uses GLOBAL-011. Tailoring:

| Field | Free Tool Page Tailoring |
| :--- | :--- |
| **Section Heading** | e.g. 'Get Tool Updates & Free SEO Tips' |
| **Section Subheading** | e.g. 'We'll let you know when we launch new tools.' |

### 8. Free Tools Featured Gallery

Uses GLOBAL-012. Tailoring:

| Field | Free Tool Page Tailoring |
| :--- | :--- |
| **Section Heading** | e.g. 'More Free Tools' |
| **Tool Cards** | Cross-promote 2–3 other tools. **Current tool must be excluded** from this list. |

### 9. Work With Us CTA

Uses GLOBAL-010. Tailoring:

| Field | Free Tool Page Tailoring |
| :--- | :--- |
| **Section Heading** | e.g. 'Need Expert Help?', 'Want Us to Handle It for You?' |
| **All interaction logic** | No changes — full 5-option flow |

---

## Behaviour & Logic Notes

1. **No Signup Required:** The tool must be usable without creating an account or providing an email address. This is a trust-building and traffic-acquisition strategy — friction kills tool page SEO performance.

2. **Results CTA Timing:** The Results CTA should only appear after the user has received their output. Showing it before results are generated feels pushy and undermines trust.

3. **Tool Performance:** Interactive tools must load quickly and run smoothly. Heavy client-side processing should show a progress indicator. If the tool calls an API, handle loading states and errors gracefully.

4. **Data Privacy:** If the tool processes user input (e.g. a website URL), be explicit about what happens to that data. 'We don't store your data' or 'Results are processed in your browser' — whatever is true. The FAQ section is a good place to address this.

5. **How To Use as SEO Content:** The How To Use section adds 200–400 words of indexable, keyword-rich content to the page. Without it, tool pages risk being classified as thin content (the tool interface itself is not indexable text).

6. **Cross-Promotion Exclusion:** The Free Tools Featured Gallery on this page must exclude the current tool to avoid self-referencing. Same logic as blog post Related Posts exclusion.

---

## Accessibility Requirements

| Requirement | Notes |
| :--- | :--- |
| **Tool input labels** | All input fields must have visible `<label>` elements |
| **Submit button** | Must be a `<button>`, not a styled div |
| **Results announcement** | When results load, use `aria-live="polite"` to announce to screen readers that results are available |
| **Loading state** | Progress indicator must be accessible — `role="progressbar"` or `aria-busy="true"` on the results container |
| **Error handling** | Validation and API errors announced via `aria-live="polite"` |
| **Keyboard navigation** | Entire tool flow must be completable via keyboard |

---

## Structured Data / Schema Fields

Free Tool pages emit a SoftwareApplication entity as the mainEntity, with optional conditional FAQPage. The tool is positioned as a Web-based application (BusinessApplication) that provides immediate utility. The SoftwareApplication includes an Offer with price "0" for free, and when FAQ items exist, includes a `subjectOf` link to the FAQPage.

### @graph Structure

| @graph Item | @type | @id | Notes |
| :--- | :--- | :--- | :--- |
| **WebPage** | WebPage | `{pageUrl}/` | Simple page type with mainEntity → SoftwareApplication |
| **SoftwareApplication** | SoftwareApplication | `{pageUrl}/#software` | Free tool with Offer (price 0), `subjectOf` link to FAQPage when present |
| **FAQPage** | FAQPage | `{pageUrl}/#faq` | Conditional — only when FAQ items exist and FAQ Schema Toggle is true |
| **BreadcrumbList** | BreadcrumbList | `{pageUrl}/#breadcrumb` | Home > Free Tools > [Tool Name] |
| **ImageObject** | ImageObject | `{pageUrl}/#primaryimage` | Conditional — only if OG image exists |

The Organization (`#organization`) and WebSite (`#website`) are referenced by `@id` — their full objects are emitted on the Homepage (TPL-001).

### WebPage Fields

| Field Name | Source | Required? | Notes |
| :--- | :--- | :--- | :--- |
| **@type** | Fixed: "WebPage" | Yes | |
| **@id** | `{pageUrl}/` | Yes | e.g. `https://pomegranate.marketing/free-tools/seo-audit-checker/` |
| **url** | `{pageUrl}/` | Yes | |
| **name** | `pages.meta_title` | Yes | |
| **description** | `pages.meta_description` | Yes | |
| **isPartOf** | Complete WebSite ref: `@type`, `@id`, `url`, `name` | Yes | Always complete — not just `@id`. Standard across all templates. |
| **primaryImageOfPage** | @id ref → `#primaryimage` | No | Conditional — only if OG image exists |
| **image** | @id ref → `#primaryimage` | No | Conditional — only if OG image exists |
| **breadcrumb** | @id ref → `#breadcrumb` | Yes | |
| **mainEntity** | @id ref → `#software` | Yes | Points to the SoftwareApplication |
| **inLanguage** | Fixed: "en-GB" | Yes | |
| **isFamilyFriendly** | Fixed: "true" | Yes | |
| **datePublished** | `pages.created_at` (ISO 8601) | Yes | |
| **dateModified** | `pages.updated_at` (ISO 8601) | Yes | |
| **about** | Array of Thing objects | Yes | Tool concept categories — e.g. SEO, Generative AI, with Wikipedia + Wikidata sameAs |
| **mentions** | Array of Thing objects | No | Related concepts — e.g. Web Performance, Content Creation, with Wikipedia + Wikidata sameAs |

### SoftwareApplication Fields

| Field Name | Source | Required? | Notes |
| :--- | :--- | :--- | :--- |
| **@type** | Fixed: "SoftwareApplication" | Yes | |
| **@id** | `{pageUrl}/#software` | Yes | |
| **name** | `pages.tool_name` | Yes | e.g. "SEO Audit Checker" |
| **description** | `pages.tool_description` | Yes | Brief description of what the tool does |
| **applicationCategory** | Fixed: "BusinessApplication" | Yes | Web-based business utility tool |
| **operatingSystem** | Fixed: "Web browser" | Yes | Tool runs in browser — no OS-specific version |
| **url** | `{pageUrl}/` | Yes | Link to the tool page |
| **provider** | @id ref → `#organization` | Yes | |
| **offers** | Offer object | Yes | Fixed: `{ "@type": "Offer", "priceCurrency": "GBP", "price": "0" }` |
| **subjectOf** | @id ref → `#faq` | No | Conditional — only when FAQPage exists |

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
| **itemListElement** | 3 ListItems | Yes | Position 1: Home (with `item`). Position 2: Free Tools hub (with `item`). Position 3: [Tool Name] (no `item`, just `name`). |

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

See `/docs/content-model/schema-examples/TPL-013_Specific-Free-Tool_schema.jsonld` for the complete working template.
