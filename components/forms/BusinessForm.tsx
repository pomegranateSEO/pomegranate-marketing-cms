
import React, { useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '../ui/button';
import { Loader2 } from 'lucide-react';
import type { Business, GlobalTheme } from '../../lib/types';
import { businessFormSchema, BusinessFormValues } from '../../lib/schemas/business-schema';

// Import Sub-Components
import { IdentitySection } from './business/IdentitySection';
import { BrandSection } from './business/BrandSection';
import { LocationSection } from './business/LocationSection';
import { OpeningHoursSection } from './business/OpeningHoursSection';
import { ContactSection } from './business/ContactSection';

interface BusinessFormProps {
  initialData?: Partial<Business>;
  onSubmit: (data: any) => void;
  isLoading?: boolean;
}

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const DEFAULT_HOURS = DAYS_OF_WEEK.map(day => ({ 
  day: day as any, 
  opens: '09:00', 
  closes: '17:00', 
  closed: false 
}));

export const BusinessForm: React.FC<BusinessFormProps> = ({ initialData, onSubmit, isLoading }) => {
  const methods = useForm<BusinessFormValues>({
    resolver: zodResolver(businessFormSchema) as any,
    defaultValues: {
      name: '',
      legal_name: '',
      slogan: '',
      description: '',
      website_url: '',
      logo_url: '',
      email: '',
      telephone: '',
      street_address: '',
      address_locality: '',
      address_region: '',
      postal_code: '',
      address_country: 'UK',
      in_language: 'en-GB',
      price_range: '',
      founding_date: '',
      founder_names: '',
      global_theme: {},
      // Complex objects initialized here
      social_links: [],
      opening_hours: DEFAULT_HOURS
    },
  });

  const { handleSubmit, reset } = methods;

  useEffect(() => {
    if (initialData) {
      reset({
        name: initialData.name || '',
        legal_name: initialData.legal_name || '',
        slogan: initialData.slogan || '',
        description: initialData.description || '',
        website_url: initialData.website_url || '',
        logo_url: initialData.logo_url || '',
        email: initialData.email || '',
        telephone: initialData.telephone || '',
        street_address: initialData.street_address || '',
        address_locality: initialData.address_locality || '',
        address_region: initialData.address_region || '',
        postal_code: initialData.postal_code || '',
        address_country: initialData.address_country || 'UK',
        in_language: initialData.in_language || 'en-GB',
        latitude: initialData.latitude || undefined,
        longitude: initialData.longitude || undefined,
        price_range: initialData.price_range || '',
        founding_date: initialData.founding_date || '',
        employee_count: initialData.employee_count || undefined,
        founder_names: initialData.founder_names?.join(', ') || '',
        global_theme: initialData.global_theme as GlobalTheme || {},
        social_links: (initialData.social_links as string[]) || [],
        opening_hours: (initialData.opening_hours as any[]) || DEFAULT_HOURS,
        rating_value: initialData.rating_value || undefined,
        review_count: initialData.review_count || undefined,
      });
    }
  }, [initialData, reset]);

  const onFormSubmit = (values: BusinessFormValues) => {
    const founders = values.founder_names 
      ? values.founder_names.split(',').map(s => s.trim()).filter(s => s.length > 0)
      : [];

    const submissionData = {
      ...values,
      founder_names: founders.length > 0 ? founders : null,
      employee_count: values.employee_count ?? null,
      latitude: values.latitude ?? null,
      longitude: values.longitude ?? null,
      rating_value: values.rating_value ?? null,
      review_count: values.review_count ?? null,
    };
    
    onSubmit(submissionData);
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-10">
        <IdentitySection />
        <BrandSection />
        <LocationSection />
        <OpeningHoursSection />
        <ContactSection />

        <div className="flex justify-end pt-6">
          <Button type="submit" disabled={isLoading} className="w-full md:w-auto h-12 text-lg">
            {isLoading ? <><Loader2 className="mr-2 h-5 w-5 animate-spin"/> Saving Knowledge Graph...</> : 'Save Root Entity'}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
};