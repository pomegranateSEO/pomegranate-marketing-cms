
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

// --- NEW V2: Page Design Studio Types ---

export interface RenderedBlock {
  id: string;
  name: string;
  category: string;
  html: string;
  isVisible: boolean;
  isGlobal?: boolean;
  globalId?: string;
}

export interface DesignTemplate {
  id: string;
  business_id: string;
  name: string;
  description?: string;
  content_type: 'page' | 'blog_post' | 'service_page' | string;
  layout_config: Json; // Layout definitions
  mandatory_components: Json; // Array of component IDs
  optional_components: Json; // Array of component IDs
  theme_config?: Json;
  is_default: boolean;
  created_at: string;
  last_updated: string;
}

export interface ComponentLibraryItem {
  id: string;
  business_id: string;
  component_name: string;
  component_type: string; // 'Header', 'Footer', 'CTA', 'Hero', etc.
  is_mandatory: boolean;
  config_schema?: Json;
  default_props?: Json;
  html_content?: string;
  preview_image_url?: string;
  created_at: string;
}

// ----------------------------------------

export interface OpeningHours {
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  opens: string; // "09:00"
  closes: string; // "17:00"
  closed: boolean;
}

export interface GlobalTheme {
  brand_essence: string;
  core_values: string[];
  personality: string;
  visual_identity: {
    primary: string;
    secondary: string;
    accent: string;
    neutral_light: string;
    neutral_dark: string;
    color_meanings?: string;
  };
  typography: {
    primary_font: string;
    secondary_font: string;
    usage_notes?: string;
  };
  voice_and_tone: {
    description: string;
    do_say: string[];
    dont_say: string[];
  };
  grammar_mechanics: string;
  strategic_positioning: string;
  never_list: string[];
  interaction_style: string;
}

export interface Business {
  id: string; // uuid
  name: string; // text
  legal_name?: string | null; // text
  slogan?: string | null; // text
  description?: string | null; // text
  website_url?: string | null; // text
  logo_url?: string | null; // text
  image_urls?: Json | null; // jsonb
  email?: string | null; // text
  telephone?: string | null; // text
  street_address?: string | null; // text
  address_locality?: string | null; // text
  address_region?: string | null; // text
  postal_code?: string | null; // text
  address_country?: string | null; // text
  latitude?: number | null; // double precision
  longitude?: number | null; // double precision
  price_range?: string | null; // text
  founding_date?: string | null; // date
  opening_hours?: OpeningHours[] | Json | null; // jsonb
  social_links?: string[] | Json | null; // jsonb
  global_theme?: GlobalTheme | Json | null; // jsonb
  created_at?: string; // timestamp with time zone
  last_updated?: string; // timestamp with time zone
  potential_action?: Json | null; // jsonb
  has_part?: Json | null; // jsonb
  employee_count?: number | null; // integer
  founder_names?: string[] | null; // text[]
  in_language?: string; // text DEFAULT 'en-GB'
  area_served?: Json | null; // jsonb
  service_area?: Json | null; // jsonb
  opening_hours_specification?: Json | null; // jsonb
  aggregate_rating?: Json | null; // jsonb
  review_count?: number | null; // integer
  rating_value?: number | null; // numeric
  has_offer_catalog?: Json | null; // jsonb
  makes_offer?: Json | null; // jsonb
  founder?: Json | null; // jsonb
  employee?: Json | null; // jsonb
  alternate_name?: string | null; // text
  image?: Json | null; // jsonb
  number_of_employees?: number | null; // integer
  
  // V2 Additions
  robots_txt_rules?: string;
  llms_txt_rules?: string;

  // Phase 2A additions
  website_schema_config?: Json | null;
  sameas_urls?: string[] | null;
}

export interface Service {
  id: string;
  business_id: string;
  name: string;
  base_slug: string;
  short_description?: string;
  service_type?: string;
  category?: string;
  provider_mobility?: string;
  image_urls?: Json;
  shared_content_blocks?: {
    process_content?: string;
    pricing_content?: string;
    faq_list?: Array<{ question: string; answer: string }>;
  };
  base_schema?: Json;
  created_at?: string;
  last_updated?: string;
  audience_type?: string;
  offers?: Json;
  service_output?: string;
  brand?: string;
  terms_of_service_url?: string;
  available_channel?: Json;
  area_served?: Json;
  geographic_area?: string;
  audience?: Json;
  has_offer_catalog?: Json;
  broker?: Json;
  logo_url?: string;
  slogan?: string;
  aggregate_rating?: Json;

  // Legacy (keep during transition)
  faqs?: Json;

// Phase 2A additions
  long_description?: string;
  seo_title?: string;
  seo_meta_desc?: string;
  canonical_url?: string;
  keyword_cycling_blocks?: Json;
  faq_list?: Json;
  schema_json_ld?: Json;
  pricing_data?: Json;
}

export interface TargetLocation {
  id: string;
  business_id: string;
  name: string;
  slug: string;
  parent_city?: string;
  geo_data?: {
    lat: number;
    lng: number;
    radius: string;
  };
  demographics_tag?: string;
  created_at?: string;
  last_updated?: string;
  area_type?: string;
  address_region?: string;
  address_country?: string;
  landmarks_list?: string[]; // TEXT ARRAY (string[]) NOT JSONB
}

export interface KnowledgeEntity {
  id: string;
  business_id: string;
  name: string;
  description?: string;
  entity_type: string; // 'Wikipedia', 'Wikidata', 'Custom'
  wikipedia_url?: string;
  wikidata_url?: string;
  wikidata_qid?: string;
  wikipedia_slug?: string;
  created_at: string;
  last_updated?: string;
}

export interface Person {
  id: string;
  business_id: string;
  full_name: string;
  slug: string;
  job_title?: string | null;
  bio?: string | null;
  short_bio?: string | null;
  profile_image_url?: string | null;
  profile_image_alt?: string | null;
  email?: string | null;
  website_url?: string | null;
  linkedin_url?: string | null;
  sameas_urls?: Json | null;
  social_links?: Json | null;
  expertise_areas?: string[] | null;
  credentials?: string[] | null;
  works_for_business_id?: string | null;
  is_author?: boolean;
  is_reviewer?: boolean;
  is_team_member?: boolean;
  published?: boolean;
  seo_title?: string | null;
  seo_meta_desc?: string | null;
  canonical_url?: string | null;
  in_language?: string;
  schema_json_ld?: Json | null;
  created_at?: string;
  last_updated?: string;
}

export interface Review {
  id: string;
  service_id?: string | null;
  location_id?: string | null;
  author_name: string;
  rating_value: number; // 1-5
  review_body: string;
  date_published?: string;
  publisher_name?: string;
  publisher_url?: string;
  created_at?: string;
}

export interface BlogPost {
  id: string;
  business_id: string;
  headline: string; // Mapped from UI 'title'
  slug: string;
  seo_meta_desc?: string; // Mapped from UI 'excerpt'
  content_body?: string; // Mapped from UI 'content'
  article_body_raw?: string; // Mapped from UI 'content'
  featured_image_url?: string;
  status: 'draft' | 'published' | 'archived';
  created_at?: string;
  last_updated?: string;
  keywords?: string[];
  about_entities?: string[]; // uuid array
  mentions_entities?: string[]; // uuid array
  faqs?: Json; // or FAQs ARRAY in SQL? Likely jsonb array in practice for simple storage

  // V2 Additions
  article_section?: string;
  author_name?: string;
  author_url?: string;
  author_image_url?: string;
  date_published?: string;
  date_modified?: string;
  scheduled_at?: string;
  word_count?: number;
  in_language?: string;
  publisher_id?: string;
  speaksable_selectors?: string[];
  custom_head_html?: string[];
  generated_schema_markup?: string[];
  translation_group_id?: string;
  main_entity_id?: string;

  // Phase 2A additions
  canonical_url?: string;
  keyword_cycling_blocks?: Json;
  faq_list?: Json;
  schema_json_ld?: Json;
  author_person_id?: string | null;
  reviewer_person_id?: string | null;
  
  // Design Studio
  design_template_id?: string;
  rendered_blocks?: RenderedBlock[];
}

export interface StaticPage {
  id: string;
  business_id: string;
  page_type: string; // e.g., 'static'
  title: string;
  slug: string;
  content_html?: string; // Mapped from UI 'content'
  status: 'draft' | 'published';
  seo_title?: string;
  seo_meta_desc?: string;
  created_at?: string;
  last_updated?: string;
  faqs?: Json;
  about_entities?: string[]; // uuid array
  mentions_entities?: string[]; // uuid array

  // V2 Additions
  breadcrumb_json?: Json;
  breadcrumbs?: Json;
  webpage_type?: string;
  primary_entity_id?: string;
  speaksable_selectors?: string[];
  main_entity_id?: string;
  in_language?: string;
  parent_page_id?: string;
  keywords?: string[];
  custom_head_html?: string[];
  generated_schema_markup?: string[];
  translation_group_id?: string;
  scheduled_at?: string;

  // Phase 2A additions
  canonical_url?: string;
  keyword_cycling_blocks?: Json;
  faq_list?: Json;
  schema_json_ld?: Json;

  // Design Studio
  design_template_id?: string;
  rendered_blocks?: RenderedBlock[];
}

export interface PseoPageInstance {
  id: string;
  service_id: string | null;
  location_id: string | null;
  url_slug: string;
  unique_hero?: Json;
  unique_local_context?: Json;
  seo_title?: string;
  seo_meta_desc?: string;
  schema_json_ld?: Json;
  published?: boolean;
  status?: string;
  created_at?: string;
  last_updated?: string;
  unique_process_content?: Json;
  unique_faqs?: Json;

  // Phase 2A additions
  canonical_url?: string;
  keyword_cycling_blocks?: Json;
  faq_list?: Json;
  landmarks?: string[] | Json;
  
  // Standardized Entity References
  about_entities?: string[]; // uuid array
  mentions_entities?: string[]; // uuid array
  
  keywords?: string[];
  image_urls?: string[]; // NOTE: Use uploaded_image_urls in DB for V2 if different

  // V2 Additions
  in_language?: string;
  translation_group_id?: string;
  main_entity_id?: string;
  custom_head_html?: string[];
  generated_schema_markup?: string[];
  uploaded_image_urls?: string[] | Json;
  image_count?: number;
  validation_status?: Json;
  scheduled_at?: string;

  // Design Studio
  design_template_id?: string;
  rendered_blocks?: RenderedBlock[];
}

export interface FreeTool {
  id: string;
  business_id: string;
  name: string;
  slug: string;
  short_description?: string;
  long_description?: string;
  embed_url?: string;
  download_url?: string;
  tags?: string[];
  screenshot_urls?: Json;
  metadata?: Json;
  seo_title?: string;
  seo_meta_desc?: string;
  canonical_url?: string;
  keyword_cycling_blocks?: Json;
  faq_list?: Json;
  schema_json_ld?: Json;
  published: boolean;
  featured: boolean;
  created_at?: string;
  last_updated?: string;
}

export interface Industry {
  id: string;
  business_id: string;
  name: string;
  slug: string;
  description?: string;
  overview_html?: string;
  icon_url?: string;
  image_urls?: Json;
  keywords?: string[];
  seo_title?: string;
  seo_meta_desc?: string;
  canonical_url?: string;
  keyword_cycling_blocks?: Json;
  faq_list?: Json;
  schema_json_ld?: Json;
  created_at?: string;
  last_updated?: string;
}

export interface CaseStudy {
  id: string;
  business_id: string;
  title: string;
  slug: string;
  summary?: string;
  body_html?: string;
  outcome?: Json; // e.g. {"revenue_increase":"20%"}
  client_name?: string;
  client_id?: string;
  related_service_id?: string;
  related_industry_id?: string;
  featured_image_url?: string;
  gallery_urls?: Json;
  published: boolean;
  published_at?: string;
  created_at?: string;
  last_updated?: string;
}

export interface Associate {
  id: string;
  business_id: string;
  name: string;
  type: 'organisation' | 'partner' | 'software_platform' | 'organization' | 'person';
  role?: string;
  bio?: string;
  profile_image_url?: string;
  contact_email?: string;
  website_url?: string;
  social_links?: Json;
  related_service_ids?: string[];
  related_case_study_ids?: string[];
  published: boolean;
  created_at?: string;
  last_updated?: string;
}

export interface CTABlock {
  id: string;
  business_id: string;
  name: string;
  headline?: string;
  subheadline?: string;
  button_text?: string;
  button_url?: string;
  bg_image_url?: string;
  theme_style?: 'primary' | 'dark' | 'light' | 'outline' | 'image';
  created_at?: string;
  last_updated?: string;
}

export interface BlogTopic {
  id: string;
  business_id: string;
  name: string;
  slug: string;
  description?: string;
  parent_topic_id?: string | null;
  depth_level: number; // 0=pillar, 1=cluster, 2=sub
  topic_type: 'pillar' | 'cluster' | 'sub-cluster' | 'micro-topic';
  primary_entity_id?: string;
  related_service_ids?: string[];
  related_industry_ids?: string[];
  about_entities?: string[];
  mentions_entities?: string[];
  content_intent?: 'informational' | 'commercial' | 'transactional' | 'navigational';
  pseo_variable_type?: 'location_id' | 'industry_id' | 'service_id' | 'none';
  estimated_search_volume?: number;
  keyword_difficulty?: number;
  topical_authority_score?: number;
  content_gap_priority?: number; // 1-10
  suggested_content_count?: number;
  existing_content_count?: number;
  speakable_hints?: string[];
  seo_notes?: string;
  created_at?: string;
  
  // UI Helper
  children?: BlogTopic[];
}
