-- pomegranate phase 2A additive migration
-- Source alignment: docs/phase-0-source-of-truth-roadmap.md + Legacy_docs/extracted/content-model-amendments-v3.txt
-- Includes requested extension: public.pseo_page_instances.landmarks (jsonb)

BEGIN;

-- 1) businesses
ALTER TABLE public.businesses
  ADD COLUMN IF NOT EXISTS website_schema_config jsonb DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS sameas_urls text[] DEFAULT '{}'::text[];

-- 2) pages
ALTER TABLE public.pages
  ADD COLUMN IF NOT EXISTS keyword_cycling_blocks jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS canonical_url text,
  ADD COLUMN IF NOT EXISTS faq_list jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS schema_json_ld jsonb;

-- 3) blog_posts
ALTER TABLE public.blog_posts
  ADD COLUMN IF NOT EXISTS keyword_cycling_blocks jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS canonical_url text,
  ADD COLUMN IF NOT EXISTS faq_list jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS schema_json_ld jsonb,
  ADD COLUMN IF NOT EXISTS author_person_id uuid,
  ADD COLUMN IF NOT EXISTS reviewer_person_id uuid;

-- 4) pseo_page_instances (schema_json_ld already exists)
ALTER TABLE public.pseo_page_instances
  ADD COLUMN IF NOT EXISTS keyword_cycling_blocks jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS canonical_url text,
  ADD COLUMN IF NOT EXISTS faq_list jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS landmarks jsonb DEFAULT '[]'::jsonb;

-- 5) services
ALTER TABLE public.services
  ADD COLUMN IF NOT EXISTS long_description text,
  ADD COLUMN IF NOT EXISTS seo_title text,
  ADD COLUMN IF NOT EXISTS seo_meta_desc text,
  ADD COLUMN IF NOT EXISTS canonical_url text,
  ADD COLUMN IF NOT EXISTS keyword_cycling_blocks jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS faq_list jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS schema_json_ld jsonb;

-- 6) industries
ALTER TABLE public.industries
  ADD COLUMN IF NOT EXISTS canonical_url text,
  ADD COLUMN IF NOT EXISTS keyword_cycling_blocks jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS faq_list jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS schema_json_ld jsonb;

-- 7) free_tools
ALTER TABLE public.free_tools
  ADD COLUMN IF NOT EXISTS seo_title text,
  ADD COLUMN IF NOT EXISTS seo_meta_desc text,
  ADD COLUMN IF NOT EXISTS canonical_url text,
  ADD COLUMN IF NOT EXISTS keyword_cycling_blocks jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS faq_list jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS schema_json_ld jsonb;

-- 8) knowledge_graph_entities + unique indexes
ALTER TABLE public.knowledge_graph_entities
  ADD COLUMN IF NOT EXISTS wikidata_qid text,
  ADD COLUMN IF NOT EXISTS wikipedia_slug text;

CREATE UNIQUE INDEX IF NOT EXISTS idx_kg_wikidata_qid
  ON public.knowledge_graph_entities (wikidata_qid)
  WHERE wikidata_qid IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_kg_wikipedia_slug
  ON public.knowledge_graph_entities (wikipedia_slug)
  WHERE wikipedia_slug IS NOT NULL;

-- 9) about/mentions indexes
CREATE INDEX IF NOT EXISTS idx_pages_about_entities
  ON public.pages USING GIN (about_entities);
CREATE INDEX IF NOT EXISTS idx_pages_mentions_entities
  ON public.pages USING GIN (mentions_entities);
CREATE INDEX IF NOT EXISTS idx_blog_posts_about_entities
  ON public.blog_posts USING GIN (about_entities);
CREATE INDEX IF NOT EXISTS idx_blog_posts_mentions_entities
  ON public.blog_posts USING GIN (mentions_entities);
CREATE INDEX IF NOT EXISTS idx_pseo_about_entities
  ON public.pseo_page_instances USING GIN (about_entities);
CREATE INDEX IF NOT EXISTS idx_pseo_mentions_entities
  ON public.pseo_page_instances USING GIN (mentions_entities);

-- 10) people table
CREATE TABLE IF NOT EXISTS public.people (
  id                       uuid NOT NULL DEFAULT uuid_generate_v4(),
  business_id              uuid NOT NULL,
  full_name                text NOT NULL,
  slug                     text NOT NULL,
  job_title                text,
  bio                      text,
  short_bio                text,
  profile_image_url        text,
  profile_image_alt        text,
  email                    text,
  website_url              text,
  linkedin_url             text,
  sameas_urls              jsonb DEFAULT '[]'::jsonb,
  social_links             jsonb,
  expertise_areas          text[] DEFAULT '{}'::text[],
  credentials              text[] DEFAULT '{}'::text[],
  works_for_business_id    uuid,
  is_author                boolean DEFAULT true,
  is_reviewer              boolean DEFAULT false,
  is_team_member           boolean DEFAULT true,
  published                boolean DEFAULT false,
  seo_title                text,
  seo_meta_desc            text,
  canonical_url            text,
  in_language              text DEFAULT 'en-GB',
  schema_json_ld           jsonb,
  created_at               timestamptz DEFAULT now(),
  last_updated             timestamptz DEFAULT now(),
  CONSTRAINT people_pkey PRIMARY KEY (id),
  CONSTRAINT people_business_id_fkey
    FOREIGN KEY (business_id) REFERENCES public.businesses(id),
  CONSTRAINT people_works_for_fkey
    FOREIGN KEY (works_for_business_id) REFERENCES public.businesses(id),
  CONSTRAINT people_slug_business_unique UNIQUE (business_id, slug)
);

-- 11) blog_posts author/reviewer foreign keys
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.table_constraints
    WHERE table_schema = 'public'
      AND table_name = 'blog_posts'
      AND constraint_name = 'blog_posts_author_person_fkey'
  ) THEN
    ALTER TABLE public.blog_posts
      ADD CONSTRAINT blog_posts_author_person_fkey
      FOREIGN KEY (author_person_id) REFERENCES public.people(id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.table_constraints
    WHERE table_schema = 'public'
      AND table_name = 'blog_posts'
      AND constraint_name = 'blog_posts_reviewer_person_fkey'
  ) THEN
    ALTER TABLE public.blog_posts
      ADD CONSTRAINT blog_posts_reviewer_person_fkey
      FOREIGN KEY (reviewer_person_id) REFERENCES public.people(id);
  END IF;
END $$;

-- 12) associates default alignment: brands/partners/software only
ALTER TABLE public.associates
  ALTER COLUMN type SET DEFAULT 'organisation';

COMMIT;

-- 13) backfill faq_list from legacy columns
UPDATE public.pages
SET faq_list = to_jsonb(faqs)
WHERE faqs IS NOT NULL AND faq_list = '[]'::jsonb;

UPDATE public.blog_posts
SET faq_list = to_jsonb("FAQs")
WHERE "FAQs" IS NOT NULL AND faq_list = '[]'::jsonb;

UPDATE public.pseo_page_instances
SET faq_list = unique_faqs
WHERE unique_faqs IS NOT NULL AND unique_faqs != '[]'::jsonb
  AND faq_list = '[]'::jsonb;

-- 14) backfill pseo landmarks from target_locations.landmarks_list (first 3)
UPDATE public.pseo_page_instances p
SET landmarks = COALESCE(
  (
    SELECT to_jsonb(array_agg(x.landmark))
    FROM (
      SELECT unnest(t.landmarks_list) AS landmark
      LIMIT 3
    ) AS x
  ),
  '[]'::jsonb
)
FROM public.target_locations t
WHERE p.location_id = t.id
  AND (p.landmarks IS NULL OR p.landmarks = '[]'::jsonb);
