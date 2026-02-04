
import * as z from 'zod';

// Helper for optional numbers from HTML inputs
export const optionalNumber = z.number()
  .or(z.nan())
  .transform((val) => (Number.isNaN(val) ? undefined : val))
  .optional();

// Opening Hours Schema
const openingHoursSchema = z.object({
  day: z.string(),
  opens: z.string(),
  closes: z.string(),
  closed: z.boolean().optional().default(false),
});

// Schema for Global Theme
export const globalThemeSchema = z.object({
  brand_essence: z.string().optional(),
  core_values: z.array(z.string()).optional(),
  personality: z.string().optional(),
  visual_identity: z.object({
    primary: z.string().optional(),
    secondary: z.string().optional(),
    accent: z.string().optional(),
    neutral_light: z.string().optional(),
    neutral_dark: z.string().optional(),
    color_meanings: z.string().optional(),
  }).optional(),
  typography: z.object({
    primary_font: z.string().optional(),
    secondary_font: z.string().optional(),
    usage_notes: z.string().optional(),
  }).optional(),
  voice_and_tone: z.object({
    description: z.string().optional(),
    do_say: z.array(z.string()).optional(),
    dont_say: z.array(z.string()).optional(),
  }).optional(),
  grammar_mechanics: z.string().optional(),
  strategic_positioning: z.string().optional(),
  never_list: z.array(z.string()).optional(),
  interaction_style: z.string().optional(),
}).optional();

// Main Business Form Schema
export const businessFormSchema = z.object({
  name: z.string().min(1, "Business name is required").max(90, "Name must be under 90 characters"),
  legal_name: z.string().optional(),
  slogan: z.string().optional(),
  description: z.string().max(160, "Description must be under 160 characters (SEO Limit)").optional(),
  website_url: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  logo_url: z.string().optional().or(z.literal("")),
  email: z.string().email("Must be a valid email").optional().or(z.literal("")),
  telephone: z.string().optional(),
  street_address: z.string().optional(),
  address_locality: z.string().optional(),
  address_region: z.string().optional(),
  postal_code: z.string().optional(),
  address_country: z.string().default("UK"),
  in_language: z.string().default("en-GB"),
  latitude: optionalNumber,
  longitude: optionalNumber,
  price_range: z.string().optional(),
  founding_date: z.string().optional(),
  employee_count: optionalNumber,
  founder_names: z.string().optional(),
  global_theme: globalThemeSchema,
  social_links: z.array(z.string()).optional(),
  opening_hours: z.array(openingHoursSchema).optional(),
  rating_value: optionalNumber,
  review_count: optionalNumber,
  
  // V2 Additions
  robots_txt_rules: z.string().optional(),
  llms_txt_rules: z.string().optional(),
});

export type BusinessFormValues = z.infer<typeof businessFormSchema>;
