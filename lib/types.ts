
export interface Json {
  [key: string]: string | number | boolean | null | Json | Json[];
}

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
  faq_list?: Json;
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
  created_at: string;
}

export interface Review {
  id: string;
  business_id: string;
  author_name: string;
  rating_value: number; // 1-5
  review_body: string;
  date_published?: string;
  source_url?: string;
  created_at?: string;
}

export interface BlogPost {
  id: string;
  business_id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content?: string; // Changed from content_html to content
  featured_image_url?: string;
  status: 'draft' | 'published' | 'archived';
  created_at?: string;
  updated_at?: string;
}
