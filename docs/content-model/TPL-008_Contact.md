# TPL-008: Contact Page

**Template:** 8 of 13
**URL Pattern:** `/contact/`
**Purpose:** Primary conversion page. Reduces friction and offers multiple contact methods. The page should feel welcoming, low-pressure, and easy to act on.
**Schema:** ContactPage, ContactPoint, BreadcrumbList, Organization (ref)
**Keyword Cycling Component:** ✗ Not applicable

---

## Global Components Present

- **Header Nav** — See GLOBAL-001
- **Footer Nav** — See GLOBAL-002

---

## Component Inventory (in page order)

1. Hero Section (Template 3) — See GLOBAL-006
2. Contact Form — Page-specific (spec below)
3. Trusted By — See GLOBAL-007
4. Thanks For Visiting Sliding Carousel — Page-specific (spec below)
5. Work With Us CTA — See GLOBAL-010
6. Contact Details — Page-specific (spec below)

---

## SEO & Meta

| Field Name | Field Type | Required? | Notes / Guidance |
| :--- | :--- | :--- | :--- |
| **Meta Title** | Text (80 chars max) | Yes | e.g. 'Contact Us | Pomegranate Digital' |
| **Meta Description** | Text (135 chars max) | Yes | Low-pressure, welcoming — e.g. 'Get in touch for a free consultation. We typically respond within one business day.' |
| **Canonical URL** | URL | Yes | Self-referencing canonical |

---

## Component Tailoring Notes

### 1. Hero Section (Template 3)

Uses GLOBAL-006: Hero Template 3 — Light Hero. This is the first (and primary) page to use the light hero variant.

| Field | Contact Page Tailoring |
| :--- | :--- |
| **H1 Headline** | Warm and direct — e.g. 'Get in Touch', 'Let's Talk', 'We'd Love to Hear From You' |
| **Subheadline** | Sets expectations — e.g. 'We typically respond within one business day.' |
| **Intro Body Copy** | Optional. 1–2 sentences max. Low-pressure, welcoming tone. |
| **Primary CTA** | Typically omitted — the form below IS the CTA. If used, anchor-link to `#contact-form`. |
| **Breadcrumb Display** | **true** — Path: Home > Contact |

### 2. Contact Form (Page-Specific)

The primary conversion mechanism on this page. Includes a service selector to help triage enquiries.

| Field Name | Field Type | Required? | Notes / Guidance |
| :--- | :--- | :--- | :--- |
| **Form ID / Anchor** | Text | Yes | e.g. `contact-form`. Used as anchor target from hero CTA and header nav. |
| **Form Heading** | Text | No | e.g. 'Send Us a Message' — optional if the hero H1 is clear enough |
| **— Heading Level** | Select: H2 / H3 / p | No | Typically H2 |
| **Form Field: Full Name** | Text Input | Yes | |
| **Form Field: Email Address** | Email Input | Yes | |
| **Form Field: Phone Number** | Tel Input | No | Optional — some users prefer to provide a phone number |
| **Form Field: Service Interest** | Select | No | Dropdown or radio group: SEO / Web Design / SEO Training / General Enquiry. Helps triage enquiries to the right person/workflow. |
| **Form Field: Message** | Textarea | Yes | Free-text message |
| **Form Field: Website URL** | URL Input | No | Optional — useful for SEO/web design enquiries |
| **Consent / GDPR Checkbox** | Checkbox + Label | Yes | Links to Privacy Policy (TPL-012). Submission must not process without consent. |
| **Submit Button Label** | Text | Yes | e.g. 'Send Message', 'Get in Touch' |
| **Success Message** | Rich Text | Yes | Shown after submission — e.g. 'Thanks for getting in touch! We'll get back to you within one business day.' |
| **Error Message** | Text | No | Fallback if submission fails — e.g. 'Something went wrong. Please try again or email us directly.' |
| **Redirect on Submit URL** | URL | No | Optional redirect for conversion tracking — e.g. a `/thank-you/` page |

**Note on relationship with Work With Us CTA:** The Contact Form and the Work With Us CTA (GLOBAL-010) can co-exist on this page. The Contact Form is a straightforward message form. The Work With Us CTA is the multi-step service selector with calendar embeds. They serve different user intents — the form for "I just want to send a message" and the Work With Us CTA for "I know what service I want."

### 3. Trusted By

Uses GLOBAL-007. No page-specific tailoring — synchronized singleton.

### 4. Thanks For Visiting Sliding Carousel (Page-Specific)

A decorative/engagement element — a sliding/marquee-style carousel with editable text messages. Creates a warm, human touch on what is otherwise a functional page.

| Field Name | Field Type | Required? | Notes / Guidance |
| :--- | :--- | :--- | :--- |
| **Carousel Items** | Repeatable Component | Yes | Min 3 items for smooth scrolling effect. Recommended 5–8. |
| **— Message Text** | Text | Yes | Short, warm messages — e.g. 'Thanks for stopping by', 'We love meeting new people', 'Your business deserves to be found', 'No question is too small', 'We're real people, not bots' |
| **Scroll Direction** | Select: Left / Right | No | Default: Left (right-to-left scroll) |
| **Scroll Speed** | Select: Slow / Medium / Fast | No | Default: Medium |
| **Text Style** | Select: Normal / Large / Handwritten | No | Default: Large. Controls the visual weight and personality of the carousel text. |
| **Background Colour / Style** | Text or Select | No | e.g. 'brand-accent', 'light-grey'. Should contrast with surrounding sections. |

### 5. Work With Us CTA

Uses GLOBAL-010. Tailoring:

| Field | Contact Page Tailoring |
| :--- | :--- |
| **Section Heading** | e.g. 'Know What You Need?', 'Ready to Get Started?' |
| **Section Subheading** | e.g. 'Choose your interest and we'll match you with the right next step.' |
| **All interaction logic** | No changes — full 5-option flow |

### 6. Contact Details (Page-Specific)

Supplementary contact information displayed alongside or below the form and CTA.

| Field Name | Field Type | Required? | Notes / Guidance |
| :--- | :--- | :--- | :--- |
| **Section Heading** | Text | No | e.g. 'Other Ways to Reach Us' |
| **— Heading Level** | Select: H2 / H3 / p | No | Typically H2 |
| **Phone Number** | Text | No | Click-to-call on mobile. Geo-aware if geography variants are active (pulled from Header Nav geography logic). |
| **Email Address** | Text | No | Click-to-email |
| **Address Display** | Rich Text | No | Formatted business address. Geo-aware if geography variants are active. |
| **Office Hours** | Rich Text | No | e.g. 'Monday – Friday, 9am – 5:30pm GMT' |
| **Response Time Promise** | Text | No | e.g. 'We aim to respond within one business day.' Reinforces the subheadline promise. |
| **Map Embed** | URL or Embed Code | No | Optional Google Maps or similar embed showing the business location. |
| **Social Links** | Repeatable: Platform + URL + Icon | No | If not already in the footer, can be displayed here. Otherwise omit to avoid duplication. |

---

## Behaviour & Logic Notes

1. **Form + Work With Us CTA Coexistence:** Both are present on this page. The Contact Form is simpler and faster (just send a message). The Work With Us CTA is more structured (choose a service, get matched to a calendar or specific form). Position the Contact Form higher on the page for visitors who just want to send a quick message. Place the Work With Us CTA below for visitors who know what they need.

2. **Form Submission Handling:** Submit to the backend (Supabase function, API route, or form handler). Include the Service Interest selection in the submission payload for triage. Send a confirmation email to the user if possible.

3. **Sliding Carousel Performance:** The marquee/carousel should be CSS-driven where possible (not JavaScript-heavy). It is a decorative element and should not impact page performance.

4. **Geography-Aware Contact Details:** If geography variants are active (see GLOBAL-001), the phone number and address in the Contact Details section should reflect the detected or selected geography. This uses the same variant resolution as the Header and Footer navs.

---

## Accessibility Requirements

| Requirement | Notes |
| :--- | :--- |
| **Form labels** | All inputs must have visible `<label>` elements |
| **Error handling** | Validation errors announced via `aria-live="polite"` region. Inline error messages next to each field. |
| **Success announcement** | Success message region should have `aria-live="polite"` |
| **Sliding carousel** | Must respect `prefers-reduced-motion: reduce` — fall back to static text. Must be pausable. Decorative only — not critical content. |
| **Map embed** | iframe must have `title` attribute — e.g. 'Map showing office location'. Provide a text address as an alternative. |
| **Click-to-call** | Phone number should use `<a href="tel:...">` with visible text |

---

## Structured Data / Schema Fields

The Contact Page emits a ContactPage with a ContactPoint as its mainEntity. The ContactPoint includes all communication channels (telephone, email) and service type. The page `about` references the organization, and `mentions` includes customer service as a relevant concept.

### @graph Structure

| @graph Item | @type | @id | Notes |
| :--- | :--- | :--- | :--- |
| **WebPage** | ContactPage | `https://pomegranate.marketing/contact/` | Specific page type for contact pages |
| **ContactPoint** | ContactPoint | `{pageUrl}/#contactpoint` | The main entity — contact information for the business |
| **BreadcrumbList** | BreadcrumbList | `{pageUrl}/#breadcrumb` | Home > Contact |
| **ImageObject** | ImageObject | `{pageUrl}/#primaryimage` | Conditional — only if OG image exists |

The Organization (`#organization`) and WebSite (`#website`) are referenced by `@id` — their full objects are emitted on the Homepage (TPL-001).

### ContactPage Fields

| Field Name | Source | Required? | Notes |
| :--- | :--- | :--- | :--- |
| **@type** | Fixed: "ContactPage" | Yes | Specific page type for contact/inquiry pages |
| **@id** | `https://pomegranate.marketing/contact/` | Yes | |
| **url** | `https://pomegranate.marketing/contact/` | Yes | |
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
| **mainEntity** | @id ref → `#contactpoint` | Yes | Points to the ContactPoint |
| **about** | @id array | Yes | Always includes the organization: `[{"@id": "{siteUrl}/#organization"}]` |
| **mentions** | Array of Thing objects | No | Secondary concepts, e.g. "Customer service" with Wikipedia + Wikidata sameAs |

### ContactPoint Fields

| Field Name | Source | Required? | Notes |
| :--- | :--- | :--- | :--- |
| **@type** | Fixed: "ContactPoint" | Yes | |
| **@id** | `{pageUrl}/#contactpoint` | Yes | |
| **url** | `https://pomegranate.marketing/contact/` | Yes | The contact page URL — where users submit contact requests |
| **telephone** | `businesses.telephone` | Yes | Phone number with country code |
| **email** | `businesses.email` | Yes | Primary contact email |
| **contactType** | Fixed: "customer service" | Yes | Type of contact point |
| **areaServed** | "GB" or country code | Yes | Geographic region served |
| **availableLanguage** | "English" or language(s) | No | Languages spoken at this contact point |

### BreadcrumbList Fields

| Field Name | Source | Required? | Notes |
| :--- | :--- | :--- | :--- |
| **@type** | Fixed: "BreadcrumbList" | Yes | |
| **@id** | `{pageUrl}/#breadcrumb` | Yes | |
| **itemListElement** | 2 ListItems | Yes | Position 1: Home (with `item`). Position 2: Contact (no `item`, just `name`). |

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

Entities are Thing objects with Wikipedia and Wikidata sameAs links:

```json
{
  "@type": "Thing",
  "name": "Customer service",
  "sameAs": [
    "https://en.wikipedia.org/wiki/Customer_service",
    "https://www.wikidata.org/wiki/Q828012"
  ]
}
```

---

### Full JSON-LD Template

See `/docs/content-model/schema-examples/TPL-008_Contact-Page_schema.jsonld` for the complete working template.
