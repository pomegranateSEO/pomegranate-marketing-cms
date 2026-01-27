import React, { useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '../ui/button';
import { Loader2 } from 'lucide-react';
import type { Business, GlobalTheme, OpeningHours } from '../../lib/types';

// Import Sub-Components
import { IdentitySection } from './business/IdentitySection';
import { BrandSection } from './business/BrandSection';
import { LocationSection } from './business/LocationSection';
import { OpeningHoursSection } from './business/OpeningHoursSection';
import { ContactSection } from './business/ContactSection';

// Robust schema to handle optional numbers from HTML inputs
const optionalNumber = z.number()
  .or(z.nan())
  .transform((val) => (Number.isNaN(val) ? undefined : val))
  .optional();

// Schema for Global Theme
const globalThemeSchema = z.object({
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

const businessFormSchema = z.object({
  name: z.string().min(1, "Business name is required").max(90, "Name must be under 90 characters"),
  legal_name: z.string().optional(),
  slogan: z.string().optional(),
  description: z.string().max(160, "Description must be under 160 characters (SEO Limit)").optional(),
  website_url: z.string().url("Must be a valid URL").optional().or(z.literal("")),
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
});

type BusinessFormValues = z.infer<typeof businessFormSchema>;

interface BusinessFormProps {
  initialData?: Partial<Business>;
  onSubmit: (data: any) => void;
  isLoading?: boolean;
}

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export const BusinessForm: React.FC<BusinessFormProps> = ({ initialData, onSubmit, isLoading }) => {
  // STATE: Social Links (Managed locally, pushed to form on submit)
  const [socialLinks, setSocialLinks] = useState<string[]>(
    Array.isArray(initialData?.social_links) ? initialData.social_links as string[] : []
  );

  // STATE: Opening Hours (Managed locally)
  const [openingHours, setOpeningHours] = useState<OpeningHours[]>(
    Array.isArray(initialData?.opening_hours) 
      ? initialData.opening_hours as OpeningHours[]
      : DAYS_OF_WEEK.map(day => ({ day: day as any, opens: '09:00', closes: '17:00', closed: false }))
  );

  const methods = useForm<BusinessFormValues>({
    resolver: zodResolver(businessFormSchema) as any,
    defaultValues: {
      name: initialData?.name || '',
      legal_name: initialData?.legal_name || '',
      slogan: initialData?.slogan || '',
      description: initialData?.description || '',
      website_url: initialData?.website_url || '',
      email: initialData?.email || '',
      telephone: initialData?.telephone || '',
      street_address: initialData?.street_address || '',
      address_locality: initialData?.address_locality || '',
      address_region: initialData?.address_region || '',
      postal_code: initialData?.postal_code || '',
      address_country: initialData?.address_country || 'UK',
      in_language: initialData?.in_language || 'en-GB',
      latitude: initialData?.latitude || undefined,
      longitude: initialData?.longitude || undefined,
      price_range: initialData?.price_range || '',
      founding_date: initialData?.founding_date || '',
      employee_count: initialData?.employee_count || undefined,
      founder_names: initialData?.founder_names?.join(', ') || '',
      global_theme: initialData?.global_theme as GlobalTheme || {},
    },
  });

  const { handleSubmit } = methods;

  // HANDLER: Submit
  const onFormSubmit = (values: BusinessFormValues) => {
    const founders = values.founder_names 
      ? values.founder_names.split(',').map(s => s.trim()).filter(s => s.length > 0)
      : [];

    const submissionData = {
      ...values,
      social_links: socialLinks,
      opening_hours: openingHours,
      founder_names: founders.length > 0 ? founders : null,
      employee_count: values.employee_count ?? null,
      latitude: values.latitude ?? null,
      longitude: values.longitude ?? null,
    };
    
    onSubmit(submissionData);
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-10">
        
        <IdentitySection />
        
        <BrandSection />
        
        <LocationSection />
        
        <OpeningHoursSection hours={openingHours} onChange={setOpeningHours} />
        
        <ContactSection socialLinks={socialLinks} setSocialLinks={setSocialLinks} />

        <div className="flex justify-end pt-6">
          <Button type="submit" disabled={isLoading} className="w-full md:w-auto h-12 text-lg">
            {isLoading ? <><Loader2 className="mr-2 h-5 w-5 animate-spin"/> Saving Knowledge Graph...</> : 'Save Root Entity'}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
};