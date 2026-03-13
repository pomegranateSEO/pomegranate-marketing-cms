
import type { Business, GlobalTheme } from '../types';
import type { BusinessFormValues } from '../schemas/business-schema';

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export const DEFAULT_HOURS = DAYS_OF_WEEK.map(day => ({ 
  day: day as any, 
  opens: '09:00', 
  closes: '17:00', 
  closed: false 
}));

export const mapBusinessToFormValues = (data: Partial<Business>): BusinessFormValues => {
  return {
    name: data.name || '',
    legal_name: data.legal_name || '',
    slogan: data.slogan || '',
    description: data.description || '',
    website_url: data.website_url || '',
    logo_url: data.logo_url || 'code:pomegranate-logo',
    email: data.email || '',
    telephone: data.telephone || '',
    street_address: data.street_address || '',
    address_locality: data.address_locality || '',
    address_region: data.address_region || '',
    postal_code: data.postal_code || '',
    address_country: data.address_country || 'UK',
    in_language: data.in_language || 'en-GB',
    latitude: data.latitude || undefined,
    longitude: data.longitude || undefined,
    price_range: data.price_range || '',
    founding_date: data.founding_date || '',
    employee_count: data.employee_count || undefined,
    founder_names: data.founder_names?.join(', ') || '',
    global_theme: (data.global_theme as GlobalTheme) || {},
    social_links: (data.social_links as string[]) || [],
    opening_hours: (data.opening_hours as any[]) || DEFAULT_HOURS,
    rating_value: data.rating_value || undefined,
    review_count: data.review_count || undefined,
  };
};

export const mapFormValuesToBusiness = (values: BusinessFormValues): Partial<Business> => {
  const founders = values.founder_names 
    ? values.founder_names.split(',').map(s => s.trim()).filter(s => s.length > 0)
    : [];

  return {
    ...values,
    founder_names: founders.length > 0 ? founders : null,
    employee_count: values.employee_count ?? null,
    latitude: values.latitude ?? null,
    longitude: values.longitude ?? null,
    rating_value: values.rating_value ?? null,
    review_count: values.review_count ?? null,
  };
};
