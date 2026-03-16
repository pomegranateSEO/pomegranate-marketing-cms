# CMS Content Model Alignment — Session 8 Handoff

**Created:** March 16, 2026  
**Status:** 🔄 IN PROGRESS  
**Priority:** HIGHEST — Blocking content management capability

---

## The Problem

The front-end pages contain **~80% hardcoded content** that cannot be edited from the CMS admin panel. This includes:

- Hero section titles, subtitles, body text, CTAs
- "Why Choose Us" and "Who It's For" sections
- "What You Get" deliverables grid
- "Our Process" step-by-step content (10 steps)
- "Where We Work" scrolling environments text
- CTA section headings and subheadings
- FAQ questions and answers
- About page: mission, values, awards, founder bio, timeline milestones

**Impact:** Content editors cannot change any of this content without developer intervention.

---

## What Was Done (Session 8)

### 1. Database Schema Extended

**Front-end repo:** `C:\Users\k_che\Documents\TEST NEW POMEGRANATE WEBSITE 13-03-2026`

```sql
-- services table (for SEO Services, Web Design, SEO Training pages)
ALTER TABLE services ADD COLUMN hero_data JSONB DEFAULT '{}';
ALTER TABLE services ADD COLUMN content_sections JSONB DEFAULT '{}';
ALTER TABLE services ADD COLUMN deliverables JSONB DEFAULT '{}';
ALTER TABLE services ADD COLUMN process JSONB DEFAULT '{}';
ALTER TABLE services ADD COLUMN cta JSONB DEFAULT '{}';
ALTER TABLE services ADD COLUMN og_image_url TEXT;

-- industries table (for industry pages)
ALTER TABLE industries ADD COLUMN hero_data JSONB DEFAULT '{}';
ALTER TABLE industries ADD COLUMN content_sections JSONB DEFAULT '{}';
ALTER TABLE industries ADD COLUMN deliverables JSONB DEFAULT '{}';
ALTER TABLE industries ADD COLUMN cta JSONB DEFAULT '{}';
ALTER TABLE industries ADD COLUMN og_image_url TEXT;

-- pages table (for Home, About, Contact, etc.)
ALTER TABLE pages ADD COLUMN hero_data JSONB DEFAULT '{}';
ALTER TABLE pages ADD COLUMN content_sections JSONB DEFAULT '{}';
ALTER TABLE pages ADD COLUMN og_image_url TEXT;
ALTER TABLE pages ADD COLUMN canonical_url TEXT;
```

### 2. CMS Types Updated

**File:** `lib/types.ts`

Updated interfaces for `Service`, `Industry`, and `StaticPage` to include nested content fields:

```typescript
// Service interface additions
hero_data?: {
  title?: string;
  subtitle?: string;
  body?: string;
  cta_primary_text?: string;
  cta_primary_link?: string;
};
content_sections?: {
  why_heading?: string;
  why_body?: string[];
  who_its_for?: string[];
  environments_heading?: string;
  environments_scroll_text?: string;
};
// ... etc
```

### 3. ServiceForm Enhanced

**File:** `components/forms/ServiceForm.tsx`

Added 7 collapsible sections:
1. **Core Details** — name, slug, category, audience, short description
2. **Hero Section** — title, subtitle, body, CTA text/link
3. **Keyword Typewriter** — prefix + keywords (already existed)
4. **Content Sections** — Why Choose Us heading/body, Environments scroll text
5. **Deliverables** — What You Get section heading
6. **Process** — Our Process section heading + markdown steps
7. **CTA** — Work With Us heading/subheading
8. **SEO & Metadata** — title, description, canonical URL, OG image

---

## What's Next (For Continuing Agent)

### Immediate Next Steps

#### 1. Update `lib/db/services.ts`

The database CRUD functions need to include the new JSONB columns:

```typescript
// In lib/db/services.ts
// Ensure these fields are included in INSERT and UPDATE operations:
// hero_data, content_sections, deliverables, process, cta, og_image_url

export const createService = async (service: Partial<Service>) => {
  const { data, error } = await supabase
    .from('services')
    .insert({
      ...service,
      hero_data: service.hero_data || {},
      content_sections: service.content_sections || {},
      // etc.
    })
    .select()
    .single();
  // ...
};
```

#### 2. Update Front-End to Read from CMS

**File:** `src/pages/SeoServices.tsx` (in front-end repo)

Currently reads from hardcoded:
```typescript
// HARDCODED - needs to change:
<h2 className="text-3xl md:text-4xl font-bold mb-10">Why Choose Us?</h2>
<p>Search Engine Optimization is the art and science...</p>
```

Should read from service data:
```typescript
const { service } = useService('seo-service');

// Then use:
<h2>{service?.content_sections?.why_heading || 'Why Choose Us?'}</h2>
<div dangerouslySetInnerHTML={{ __html: service?.content_sections?.why_body?.join('<br/><br/>') || ''}} />
```

#### 3. Create IndustryForm

Create `components/forms/IndustryForm.tsx` with similar structure:
- Hero section (title, landmarks, keyword)
- Content sections (overview)
- Deliverables
- CTA
- SEO & Metadata

#### 4. Create PageForm

Create `components/forms/PageForm.tsx` for static pages:
- Homepage: hero, services_section, story
- About: hero, mission, values, awards, founder, timeline
- Contact: hero, contact_config

#### 5. Seed Default Content

Populate the new columns with current hardcoded values so editors have a starting point:

```sql
-- Example for SEO Services
UPDATE services SET 
  hero_data = '{"title": "SEO Services That Drive Real Results", "subtitle": "..."}',
  content_sections = '{"why_heading": "Why Choose Us?", "why_body": ["paragraph1", "paragraph2"]}'
WHERE base_slug = 'seo-service';
```

---

## File Structure Reference

### CMS Repo Files Modified
- `lib/types.ts` — Added content field interfaces
- `components/forms/ServiceForm.tsx` — Enhanced with collapsible sections

### CMS Repo Files To Create/Modify
- `components/forms/IndustryForm.tsx` — NEW (similar to ServiceForm)
- `components/forms/PageForm.tsx` — NEW (for Home, About, Contact)
- `lib/db/services.ts` — UPDATE to persist new columns
- `lib/db/industries.ts` — UPDATE to persist new columns
- `lib/db/pages.ts` — UPDATE to persist new columns

### Front-End Repo Files To Modify
- `src/pages/SeoServices.tsx` — Read from service.hero_data, etc.
- `src/pages/WebDesign.tsx` — Same
- `src/pages/SeoTraining.tsx` — Same
- `src/pages/Industry.tsx` — Read from industry.hero_data
- `src/pages/Industries/*.tsx` — All 5 specific industry pages
- `src/pages/Home.tsx` — Read from page.hero_data
- `src/pages/About.tsx` — Read from page.mission, values, founder, timeline
- `src/pages/Contact.tsx` — Same pattern

---

## Content Field Mapping Reference

**See:** `CMS_CONTENT_FIELDS_MASTER.md` in the front-end repo root for complete mapping of every front-end content field to CMS database columns.

---

## Testing Checklist

### For Services (SEO, Web Design, Training)
- [ ] Hero section shows CMS content
- [ ] Why Choose Us section editable
- [ ] Who It's For items editable
- [ ] What You Get deliverables editable
- [ ] Our Process steps editable
- [ ] Where We Work scroll text editable
- [ ] CTA section editable
- [ ] FAQs editable from cms

### For Industries (Enterprise, eCommerce, FX, Charities, WebDevs)
- [ ] Hero section with landmarks
- [ ] Sector overview
- [ ] Deliverables
- [ ] FAQs
- [ ] CTA

### For Pages (Home, About, Contact)
- [ ] Hero sections
- [ ] Mission/values (About)
- [ ] Founder block (About)
- [ ] Timeline (About)
- [ ] Awards (About)
- [ ] Contact info (Contact)

---

## Key Repositories

- **Front-end:** `C:\Users\k_che\Documents\TEST NEW POMEGRANATE WEBSITE 13-03-2026`
- **CMS Admin:** `C:\Users\k_che\Documents\pomegranate-marketing-cms\`
- **Supabase:** Project `yyiwfosejjirnfjnohgu`

---

## Agent Signoff

May peace be upon you. This is the handoff for the CMS Content Model Alignment initiative started in Session 8. The foundation is laid — database schema extended, types defined, ServiceForm enhanced. 

**Your mission:** Complete the connection between CMS forms and front-end pages so that content editors can manage 100% of visible content from the admin panel.

Start with:
1. `lib/db/services.ts` — ensure new columns persist
2. `SeoServices.tsx` — read from service.hero_data
3. Create `IndustryForm.tsx`
4. Create `PageForm.tsx`

Baraka Allahu feek.