import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Loader2, FileText, Info } from 'lucide-react';
import type { Service } from '../../lib/types';
import { EntityGenerator } from '../shared/EntityGenerator';

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
  short_description: z.string().max(300, "Max 300 characters").optional(),
  shared_content_blocks: z.object({
    process_content: z.string().optional(),
    pricing_content: z.string().optional(),
  }).optional(),
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
  const { register, handleSubmit, watch, setValue, formState: { errors }, getValues } = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceFormSchema),
    defaultValues: {
      name: initialData?.name || '',
      base_slug: initialData?.base_slug || '',
      category: initialData?.category || 'Residential Service',
      short_description: initialData?.short_description || '',
      shared_content_blocks: {
        process_content: initialData?.shared_content_blocks?.process_content || '',
        pricing_content: initialData?.shared_content_blocks?.pricing_content || '',
      }
    },
  });

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    const currentSlug = watch('base_slug');
    if (!currentSlug || currentSlug.length === 0) {
      const slug = val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      setValue('base_slug', slug);
    }
  };

  const onFormSubmit = (values: ServiceFormValues) => {
    onSubmit({
      ...values,
      business_id: businessId,
    });
  };

  // Combine content for entity extraction
  const getFullContent = () => {
    const vals = getValues();
    return `
      Service: ${vals.name}
      Category: ${vals.category}
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
            <p className="text-xs text-red-500">{errors.category?.message}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="base_slug">URL Slug Pattern</Label>
            <div className="flex items-center">
              <span className="bg-slate-100 border border-r-0 rounded-l px-3 py-2 text-sm text-slate-500">/service/</span>
              <Input id="base_slug" {...register('base_slug')} className="rounded-l-none" placeholder="emergency-boiler-repair" />
            </div>
            <p className="text-xs text-slate-400">This will form the URL structure: website.com/service/<strong>slug</strong>/location</p>
            <p className="text-xs text-red-500">{errors.base_slug?.message}</p>
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
