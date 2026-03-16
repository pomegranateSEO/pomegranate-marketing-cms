# TPL-006: Blog Post

**Template:** 6 of 13
**URL Pattern:** `/blog/[post-slug]/` — e.g. `/blog/technical-seo-checklist-2025/`
**Purpose:** Long-form content to attract organic search traffic and demonstrate expertise. The primary content marketing vehicle.
**Schema:** BlogPosting, Article, WebPage, BreadcrumbList, Organization (ref), FAQPage (optional)
**Keyword Cycling Component:** ✗ Not applicable

---

## Global Components Present

- **Header Nav** — See GLOBAL-001
- **Footer Nav** — See GLOBAL-002

---

## Component Inventory (in page order)

1. Post Header — Page-specific (spec below)
2. Post Body — Page-specific (spec below)
3. Next Post / Previous Post Navigation — Page-specific (spec below)
4. Mailing List CTA — See GLOBAL-011
5. Featured Blog Posts — See GLOBAL-013
6. Free Tools Featured Gallery — See GLOBAL-012

---

## SEO & Meta

| Field Name | Field Type | Required? | Notes / Guidance |
| :--- | :--- | :--- | :--- |
| **Meta Title** | Text (80 chars max) | Yes | Post title optimised for search — may differ slightly from the H1 |
| **Meta Description** | Text (135 chars max) | Yes | Summarises the post's value — what the reader will learn or gain |
| **Canonical URL** | URL | Yes | Self-referencing canonical. If syndicated, point to the original. |
| **Focus Keyword** | Text | Yes | Primary target keyword for this post |
| **OG Image** | Image (1200×630px) | Yes | Featured image formatted for social sharing |
| **No-Index Toggle** | Boolean | No | For thin, navigational, or outdated posts that should be excluded from search |

---

## Page-Specific Components

### 1. Post Header

| Field Name | Field Type | Required? | Notes / Guidance |
| :--- | :--- | :--- | :--- |
| **Post H1 Title** | Text | Yes | The headline. Should be compelling for both search and human readers. |
| **Featured Image** | Image | Yes | Min 1200px wide. Displayed prominently at the top of the post. |
| **Featured Image Alt Text** | Text | Yes | Descriptive alt text — not keyword-stuffed, genuinely useful |
| **Author Name** | Text | Yes | Byline — linked to author profile or About page if applicable |
| **Author Photo** | Image | No | Small headshot beside the byline. Supports E-E-A-T. |
| **Author Bio (Short)** | Text (1–2 sentences) | No | Brief credentials — e.g. 'SEO consultant with 10 years of experience.' Displayed near the byline or at post end. |
| **Publish Date** | Date | Yes | Displayed prominently. Important for freshness signals. |
| **Last Updated Date** | Date | No | Displayed if different from Publish Date. Critical for evergreen content that gets refreshed. |
| **Category / Tag(s)** | Repeatable Taxonomy Term | Yes | Primary category + optional tags. Used for filtering on the Blog hub and for Related Posts logic. |
| **Estimated Reading Time** | Auto-calculated or Manual | No | e.g. '7 min read'. Auto-calculated from word count if not manually set. |
| **Breadcrumb Display** | Boolean | Yes | **true** — Path: Home > Blog > [Post Title] |

### 2. Post Body

| Field Name | Field Type | Required? | Notes / Guidance |
| :--- | :--- | :--- | :--- |
| **Body Content** | Rich Text (Full WYSIWYG) | Yes | The full article. Supports headings (H2–H4), bold, italic, links, images, embeds, code blocks, blockquotes, tables, lists. |
| **Table of Contents** | Auto or Manual | Yes | Recommended for posts over 1500 words. Auto-generated from H2/H3 headings. Manual override available. |
| **Inline CTA(s)** | Component (1–2 instances) | Yes | Mid-content CTAs — e.g. a Mailing List signup, a service page link, or a free tool promotion. Should feel natural within the reading flow, not disruptive. |
| **— Inline CTA Heading** | Text | No | e.g. 'Want help with this?' |
| **— Inline CTA Body** | Text (1–2 sentences) | No | |
| **— Inline CTA Label** | Text | Yes | e.g. 'Get a Free Audit', 'Try Our Free Tool' |
| **— Inline CTA URL** | URL | Yes | |
| **FAQ Section** | Repeatable: Q + A | No | Optional in-post FAQ block. Triggers FAQPage schema if present and toggled on. |
| **FAQ Schema Toggle** | Boolean | No | |

### 3. Next Post / Previous Post Navigation

| Field Name | Field Type | Required? | Notes / Guidance |
| :--- | :--- | :--- | :--- |
| **Previous Post Title** | Text (auto-populated) | No | Title of the chronologically previous post |
| **Previous Post URL** | URL (auto-populated) | No | |
| **Next Post Title** | Text (auto-populated) | No | Title of the chronologically next post |
| **Next Post URL** | URL (auto-populated) | No | |

Auto-populated from the `blog_posts` table based on publish date. If no previous or next post exists, that side of the navigation is hidden.

### 4. Mailing List CTA

Uses GLOBAL-011. Tailoring:

| Field | Blog Post Tailoring |
| :--- | :--- |
| **Section Heading** | e.g. 'Enjoyed This Post?', 'Get More Like This' |
| **Section Subheading** | e.g. 'One email a week. No spam. Unsubscribe anytime.' |
| **Layout Style** | Card or Banner recommended — should stand out from the article body |

### 5. Featured Blog Posts

Uses GLOBAL-013. Tailoring:

| Field | Blog Post Tailoring |
| :--- | :--- |
| **Section Heading** | e.g. 'Related Reading', 'More From the Blog' |
| **Selection Mode** | Auto (Related) — matched by shared category/tag with the current post. Falls back to Latest if insufficient matches. |
| **Max Posts Displayed** | 3 |
| **Current Post Exclusion** | Automatic — current post is always excluded from this list |

### 6. Free Tools Featured Gallery

Uses GLOBAL-012. Tailoring:

| Field | Blog Post Tailoring |
| :--- | :--- |
| **Section Heading** | e.g. 'Free Tools You Might Find Useful' |
| **Tool Cards** | Curate 2–3 tools relevant to the post's topic. e.g. a post about technical SEO could feature the SEO Audit Checker. |

---

## Structured Data / Schema Fields

The Blog Post emits a WebPage with a BlogPosting as its mainEntity. When FAQ items are present and toggled on, a FAQPage is emitted as a separate @graph item. The Author Person includes `knowsAbout` for expertise signalling. Publisher references the Organization by @id.

### @graph Structure

| @graph Item | @type | @id | Notes |
| :--- | :--- | :--- | :--- |
| **WebPage** | WebPage | `{pageUrl}/` | Blog post page |
| **BlogPosting** | BlogPosting | `{pageUrl}/#article` | The article itself with full metadata |
| **FAQPage** | FAQPage | `{pageUrl}/#faq` | Conditional — only when FAQ items exist and FAQ Schema Toggle is true |
| **BreadcrumbList** | BreadcrumbList | `{pageUrl}/#breadcrumb` | Home > Blog > [Post Title] |
| **ImageObject** | ImageObject | `{pageUrl}/#primaryimage` | Conditional — only if OG image exists |

The Organization (`#organization`) and WebSite (`#website`) are referenced by `@id` — their full objects are emitted on the Homepage (TPL-001).

### WebPage Fields

| Field Name | Source | Required? | Notes |
| :--- | :--- | :--- | :--- |
| **@type** | Fixed: "WebPage" | Yes | Single type — not a collection |
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
| **mainEntity** | @id ref → `#article` | Yes | Points to the BlogPosting |

### BlogPosting Fields

| Field Name | Source | Required? | Notes |
| :--- | :--- | :--- | :--- |
| **@type** | Fixed: "BlogPosting" | Yes | Specific article type for blog posts |
| **@id** | `{pageUrl}/#article` | Yes | |
| **mainEntityOfPage** | @id ref → `{pageUrl}/` | Yes | Bidirectional link back to WebPage |
| **url** | `{pageUrl}/` | Yes | |
| **headline** | `pages.h1_headline` | Yes | The H1 title |
| **articleBody** | `pages.article_body` | Yes | Full article text (for indexing) |
| **datePublished** | `pages.created_at` (ISO 8601) | Yes | |
| **dateModified** | `pages.updated_at` (ISO 8601) | Yes | |
| **articleSection** | `category.name` | No | Primary category — e.g. "SEO", "Web Design" |
| **wordCount** | `pages.word_count` | Yes | Total word count of the article |
| **author** | Person object | Yes | Full author profile with expertise signals |
| **publisher** | @id ref → `#organization` | Yes | Links to the business organization |
| **image** | @id ref → `#primaryimage` | No | Conditional — the featured image |
| **about** | Array of Thing objects | No | Primary topic entities with Wikipedia + Wikidata sameAs |
| **mentions** | Array of Thing objects | No | Secondary entities referenced in the article with Wikipedia + Wikidata sameAs |
| **subjectOf** | @id ref → `#faq` | No | Conditional — only when FAQPage exists. Links to the FAQ schema. |

### Author (Person) Fields

| Field Name | Source | Required? | Notes |
| :--- | :--- | :--- | :--- |
| **@type** | Fixed: "Person" | Yes | |
| **name** | `author.name` | Yes | |
| **jobTitle** | `author.job_title` | Yes | e.g. "SEO Consultant" |
| **description** | `author.description` | Yes | Short professional bio |
| **url** | `https://pomegranate.marketing/about/#{{author.slug}}` | Yes | Link to author profile on About page |
| **sameAs** | Array of social URLs | No | LinkedIn + Twitter/X URLs |
| **knowsAbout** | Array of Thing objects | No | Expertise areas with Wikidata sameAs. e.g. SEO (Q180711), Digital Marketing (Q1321787) |

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
| **itemListElement** | 3 ListItems | Yes | Position 1: Home (with `item`). Position 2: Blog (with `item`). Position 3: [Post Title] (no `item`, just `name`). |

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

Sourced from `knowledge_graph_entities` table via the post's `about_entities` and `mentions_entities` uuid[] columns.

---

### Full JSON-LD Template

See `/docs/content-model/schema-examples/TPL-006_Blog-Post_schema.jsonld` for the complete working template.
