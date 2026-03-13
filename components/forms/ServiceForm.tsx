import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Loader2, FileText, Info, Globe, MapPin } from 'lucide-react';
import type { Service } from '../../lib/types';
import { EntityGenerator } from '../shared/EntityGenerator';
import { AudienceSelector, AudienceEntity } from '../shared/AudienceSelector';

// Pre-defined categories
const SERVICE_CATEGORIES = [
  "Residential Service",
  "Commercial Service",
  "Emergency Service",
  "Installation",
  "Repair & Maintenance",
  "Consultation",
  "Audit & Inspection",
  "Training & Education",
  "Other"
];

const serviceFormSchema = z.object({
  name: z.string().min(1, "Service name is required").max(100),
  base_slug: z.string().min(1, "Slug is required").regex(/^[a-z0-9-]+$/, "Slug must be URL-safe (lowercase, numbers, hyphens only)"),
  category: z.string().min(1, "Please select a category"),
  // We keep audience_type string for backward compat, but use audience JSON for rich data
  audience_type: z.string().optional(), 
  service_type: z.string().optional(),
  provider_mobility: z.string().optional(),
  short_description: z.string().max(300, "Max 300 characters").optional(),
  shared_content_blocks: z.object({
    process_content: z.string().optional(),
    pricing_content: z.string().optional(),
  }).optional(),
  // New JSON field for rich audiences
  audience: z.array(z.object({
    name: z.string(),
    type: z.string(),
    wikipedia_url: z.string().optional(),
    id: z.string().optional(),
  })).optional(),

  // Keyword cycling (national + local service usage)
  keyword_prefix_text: z.string().optional(),
  keyword_terms: z.string().optional(),
  keyword_suffix_text: z.string().optional(),
  keyword_static_fallback: z.string().optional(),
  keyword_heading_level: z.string().optional(),
});

type ServiceFormValues = z.infer<typeof serviceFormSchema>;

interface Props {
  initialData?: Partial<Service>;
  businessId: string;
  onSubmit: (data: any) => void;
  isLoading?: boolean;
  onCancel: () => void;
}

export const ServiceForm: React.FC<Props> = ({ initialData, businessId, onSubmit, isLoading, onCancel }) => {
  // Safe cast for initial audience JSON
  const initialAudiences = Array.isArray(initialData?.audience) 
    ? initialData?.audience as any as AudienceEntity[] 
    : [];

  const primaryKeywordBlock = Array.isArray(initialData?.keyword_cycling_blocks)
    ? (initialData?.keyword_cycling_blocks?.[0] as any)
    : null;

  const { register, handleSubmit, watch, setValue, control, formState: { errors }, getValues } = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceFormSchema),
    defaultValues: {
      name: initialData?.name || '',
      base_slug: initialData?.base_slug || '',
      category: initialData?.category || 'Residential Service',
      audience_type: initialData?.audience_type || '',
      service_type: initialData?.service_type || 'Service',
      provider_mobility: initialData?.provider_mobility || 'dynamicLocation',
      short_description: initialData?.short_description || '',
      shared_content_blocks: {
        process_content: initialData?.shared_content_blocks?.process_content || '',
        pricing_content: initialData?.shared_content_blocks?.pricing_content || '',
      },
      audience: initialAudiences,
      keyword_prefix_text: primaryKeywordBlock?.prefix_text || 'We are a',
      keyword_terms: Array.isArray(primaryKeywordBlock?.keywords) ? primaryKeywordBlock.keywords.join(', ') : '',
      keyword_suffix_text: primaryKeywordBlock?.suffix_text || '',
      keyword_static_fallback: primaryKeywordBlock?.static_fallback || '',
      keyword_heading_level: primaryKeywordBlock?.heading_level || 'h2',
    },
  });

  const slug = watch('base_slug');

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    const currentSlug = watch('base_slug');
    if (!currentSlug || currentSlug.length === 0) {
      const generatedSlug = val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      setValue('base_slug', generatedSlug);
    }
  };

  const onFormSubmit = (values: ServiceFormValues) => {
    const keywordTerms = (values.keyword_terms || '')
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);

    if (keywordTerms.length < 2) {
      alert('Please enter at least 2 keyword cycling terms for national and local service pages.');
      return;
    }

    const prefixText = (values.keyword_prefix_text || '').trim() || 'We are a';
    const suffixText = (values.keyword_suffix_text || '').trim();
    const staticFallback = (values.keyword_static_fallback || '').trim() || `${prefixText} ${keywordTerms[0]}${suffixText ? ` ${suffixText}` : ''}`;

    const keywordCyclingBlock = {
      block_id: primaryKeywordBlock?.block_id || 'service-main-cycler',
      prefix_text: prefixText,
      keywords: keywordTerms,
      suffix_text: suffixText,
      static_fallback: staticFallback,
      heading_level: values.keyword_heading_level || 'h2',
      animation_style: primaryKeywordBlock?.animation_style || 'typewriter',
      cycle_interval_ms: primaryKeywordBlock?.cycle_interval_ms || 3000,
      transition_duration_ms: primaryKeywordBlock?.transition_duration_ms || 400,
      loop: typeof primaryKeywordBlock?.loop === 'boolean' ? primaryKeywordBlock.loop : true,
      autostart: typeof primaryKeywordBlock?.autostart === 'boolean' ? primaryKeywordBlock.autostart : true,
      aria_live: primaryKeywordBlock?.aria_live || 'polite',
      enabled: typeof primaryKeywordBlock?.enabled === 'boolean' ? primaryKeywordBlock.enabled : true,
    };

    // Sync the string representation for simple queries
    const audienceString = values.audience?.map(a => a.name).join(', ') || values.audience_type;

    onSubmit({
      ...values,
      audience_type: audienceString, // Flattened for backward compat
      keyword_cycling_blocks: [keywordCyclingBlock],
      business_id: businessId,
    });
  };

  // Combine content for entity extraction
  const getFullContent = () => {
    const vals = getValues();
    return `
      Service: ${vals.name}
      Category: ${vals.category}
      Audience: ${vals.audience?.map(a => a.name).join(', ')}
      Keyword Cycling Terms: ${vals.keyword_terms}
      Summary: ${vals.short_description}
      Process: ${vals.shared_content_blocks?.process_content}
      Pricing: ${vals.shared_content_blocks?.pricing_content}
    `;
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-8">
      
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <h3 className="text-lg font-semibold text-slate-800">Core Service Details</h3>
          <p className="text-sm text-slate-500">Define the service parameters.</p>
        </div>
        <EntityGenerator 
          getContent={getFullContent} 
          businessId={businessId} 
          sourceName="This Service" 
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-b pb-8">
          <div className="space-y-2">
            <Label htmlFor="name">Service Name</Label>
            <Input 
              id="name" 
              {...register('name')} 
              placeholder="e.g. Emergency Boiler Repair" 
              onChange={(e) => {
                register('name').onChange(e);
                handleNameChange(e);
              }}
            />
            <p className="text-xs text-red-500">{errors.name?.message}</p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="base_slug">URL Slug Pattern</Label>
            <div className="flex items-center">
              <span className="bg-slate-100 border border-r-0 rounded-l px-3 py-2 text-sm text-slate-500">/</span>
              <Input id="base_slug" {...register('base_slug')} className="rounded-l-none" placeholder="emergency-boiler-repair" />
            </div>
            <p className="text-xs text-red-500">{errors.base_slug?.message}</p>
          </div>

          <div className="md:col-span-2 bg-slate-50 p-4 rounded border border-slate-200">
             <h4 className="text-xs font-bold uppercase text-slate-500 mb-2">URL Structure Preview</h4>
             <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                   <Globe className="h-4 w-4 text-blue-500" />
                   <span className="font-semibold text-slate-700">National/Main Service Page:</span>
                   <code className="bg-white px-2 py-0.5 rounded border text-slate-600">website.com/{slug || 'service-slug'}</code>
                </div>
                <div className="flex items-center gap-2 text-sm">
                   <MapPin className="h-4 w-4 text-green-600" />
                   <span className="font-semibold text-slate-700">Local Service Page (pSEO):</span>
                   <code className="bg-white px-2 py-0.5 rounded border text-slate-600">website.com/locations/london/{slug || 'service-slug'}</code>
                </div>
             </div>
             <p className="text-xs text-slate-400 mt-2">
               * Following hierarchy: Core services reside at root level or under specific parents. Local services reside under /locations/[city]/.
             </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <select 
              id="category" 
              {...register('category')}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {SERVICE_CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2 space-y-2">
            <Controller
              control={control}
              name="audience"
              render={({ field }) => (
                <AudienceSelector 
                  value={field.value as AudienceEntity[] || []} 
                  onChange={field.onChange} 
                />
              )}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="service_type">Schema Service Type</Label>
            <Input {...register('service_type')} placeholder="Service (Default)" />
          </div>

          <div className="space-y-2">
             <Label htmlFor="short_description">Short Summary</Label>
             <Textarea 
                id="short_description" 
                {...register('short_description')} 
                placeholder="Briefly describe this service (used for meta descriptions and cards)..."
                className="h-[80px]"
             />
          </div>

          <div className="md:col-span-2 space-y-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
            <h4 className="text-sm font-semibold text-slate-800">Keyword Cycling (National + Local Service Pages)</h4>
            <p className="text-xs text-slate-500">
              This block powers the keyword typewriter/cycling section for national service pages and local service pages.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="keyword_prefix_text">Prefix Text</Label>
                <Input id="keyword_prefix_text" {...register('keyword_prefix_text')} placeholder="We are a" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="keyword_suffix_text">Suffix Text</Label>
                <Input id="keyword_suffix_text" {...register('keyword_suffix_text')} placeholder="helping businesses grow" />
              </div>
              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="keyword_terms">Cycling Terms (comma-separated, minimum 2)</Label>
                <Input
                  id="keyword_terms"
                  {...register('keyword_terms')}
                  placeholder="seo agency, search engine optimisation company, digital performance team"
                />
              </div>
              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="keyword_static_fallback">Static Fallback Sentence</Label>
                <Input
                  id="keyword_static_fallback"
                  {...register('keyword_static_fallback')}
                  placeholder="We are a leading seo agency helping businesses grow"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="keyword_heading_level">Heading Level</Label>
                <select
                  id="keyword_heading_level"
                  {...register('keyword_heading_level')}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="h1">h1</option>
                  <option value="h2">h2</option>
                  <option value="h3">h3</option>
                  <option value="h4">h4</option>
                  <option value="p">p</option>
                </select>
              </div>
            </div>
          </div>
      </div>

      {/* Shared Content Template Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-slate-600" />
            <h3 className="text-lg font-semibold text-slate-800">Shared Content (Text/Markdown)</h3>
        </div>
        
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-md flex gap-3 text-sm text-blue-800 mb-4">
            <Info className="h-5 w-5 flex-shrink-0" />
            <p>
                Content added below is <strong>shared</strong> across all location pages for this service. 
                Use Markdown or Plain Text. No HTML required.
            </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="process_content">Our Process Section</Label>
            <Textarea 
              id="process_content" 
              {...register('shared_content_blocks.process_content')} 
              className="font-mono text-xs min-h-[200px]"
              placeholder={"1. Initial Inspection\n2. Repair Work\n3. Safety Check"} 
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pricing_content">Pricing / Value Section</Label>
            <Textarea 
              id="pricing_content" 
              {...register('shared_content_blocks.pricing_content')} 
              className="font-mono text-xs min-h-[200px]"
              placeholder={"Standard Callout: From £85\nEmergency: From £150"}
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-6 border-t">
        <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={isLoading} className="w-40">
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          {initialData ? 'Update Service' : 'Create Service'}
        </Button>
      </div>
    </form>
  );
};
