
import React, { useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '../ui/button';
import { Loader2 } from 'lucide-react';
import type { Business } from '../../lib/types';
import { businessFormSchema, BusinessFormValues } from '../../lib/schemas/business-schema';
import { mapBusinessToFormValues, mapFormValuesToBusiness, DEFAULT_HOURS } from '../../lib/transformers/business-transforms';

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

export const BusinessForm: React.FC<BusinessFormProps> = ({ initialData, onSubmit, isLoading }) => {
  const methods = useForm<BusinessFormValues>({
    resolver: zodResolver(businessFormSchema) as any,
    defaultValues: {
      name: '',
      in_language: 'en-GB',
      opening_hours: DEFAULT_HOURS,
      global_theme: {},
      social_links: []
    },
  });

  const { handleSubmit, reset } = methods;

  useEffect(() => {
    if (initialData) {
      reset(mapBusinessToFormValues(initialData));
    }
  }, [initialData, reset]);

  const onFormSubmit = (values: BusinessFormValues) => {
    const submissionData = mapFormValuesToBusiness(values);
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
