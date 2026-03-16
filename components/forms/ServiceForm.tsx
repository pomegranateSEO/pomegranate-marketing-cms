import React, { useState } from 'react';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Loader2, FileText, Info, Globe, MapPin, ChevronDown, ChevronUp, Plus, Trash2, Sparkles, Layout, TypeIcon, ListChecks, MessageSquare } from 'lucide-react';
import type { Service } from '../../lib/types';
import { EntityGenerator } from '../shared/EntityGenerator';
import { AudienceSelector, AudienceEntity } from '../shared/AudienceSelector';
import { KnowledgeEntitySelector } from '../shared/KnowledgeEntitySelector';
import { DeliverablesEditor } from '../shared/DeliverablesEditor';
import type { KnowledgeEntity } from '../../lib/types';

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

const ICON_OPTIONS = ['Zap', 'Search', 'Code2', 'Network', 'Settings', 'TrendingUp', 'Users', 'MessageSquare', 'Globe', 'Target', 'Award', 'CheckCircle'];

const serviceFormSchema = z.object({
  name: z.string().min(1, "Service name is required").max(100),
  base_slug: z.string().min(1, "Slug is required").regex(/^[a-z0-9-]+$/, "Slug must be URL-safe"),
  category: z.string().min(1, "Please select a category"),
  audience_type: z.string().optional(),
  service_type: z.string().optional(),
  provider_mobility: z.string().optional(),
  short_description: z.string().max(500).optional(),
  seo_title: z.string().optional(),
  seo_meta_desc: z.string().optional(),
  canonical_url: z.string().optional(),
  og_image_url: z.string().optional(),
  shared_content_blocks: z.object({
    process_content: z.string().optional(),
    pricing_content: z.string().optional(),
  }).optional(),
  audience: z.array(z.object({
    name: z.string(),
    type: z.string(),
    wikipedia_url: z.string().optional(),
    id: z.string().optional(),
  })).optional(),
  keyword_prefix_text: z.string().optional(),
  keyword_terms: z.string().optional(),
  // Hero section
  hero_title: z.string().optional(),
  hero_subtitle: z.string().optional(),
  hero_body: z.string().optional(),
  hero_cta_primary_text: z.string().optional(),
  hero_cta_primary_link: z.string().optional(),
  // Why Choose Us section
  why_heading: z.string().optional(),
  why_body: z.string().optional(),
  // Deliverables
  deliverables_heading: z.string().optional(),
  // Process
  process_heading: z.string().optional(),
  // CTA
  cta_heading: z.string().optional(),
  cta_subheading: z.string().optional(),
  // Environments
  environments_scroll_text: z.string().optional(),
});

type ServiceFormValues = z.infer<typeof serviceFormSchema>;

interface Props {
  initialData?: Partial<Service>;
  businessId: string;
  knowledgeEntities?: KnowledgeEntity[];
  onSubmit: (data: any) => void;
  isLoading?: boolean;
  onCancel: () => void;
}

export const ServiceForm: React.FC<Props> = ({ initialData, businessId, knowledgeEntities = [], onSubmit, isLoading, onCancel }) => {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    hero: true,
    content: false,
    deliverables: false,
    process: false,
    seo: false,
    entities: false,
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const initialAudiences = Array.isArray(initialData?.audience)
    ? initialData?.audience as any as AudienceEntity[]
    : [];

  const heroData = initialData?.hero_data as any || {};
  const contentSections = initialData?.content_sections as any || {};
  const deliverablesData = initialData?.deliverables as any || {};
  const processData = initialData?.process as any || {};
  const ctaData = initialData?.cta as any || {};

  const [aboutEntities, setAboutEntities] = useState<string[]>(initialData?.about_entities || []);
  const [mentionsEntities, setMentionsEntities] = useState<string[]>(initialData?.mentions_entities || []);
  const [deliverablesItems, setDeliverablesItems] = useState<{ icon: string; title: string; description: string }[]>(
    deliverablesData?.items || []
  );

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
      seo_title: initialData?.seo_title || '',
      seo_meta_desc: initialData?.seo_meta_desc || '',
      canonical_url: initialData?.canonical_url || '',
      og_image_url: initialData?.og_image_url || '',
      shared_content_blocks: {
        process_content: initialData?.shared_content_blocks?.process_content || '',
        pricing_content: initialData?.shared_content_blocks?.pricing_content || '',
      },
      audience: initialAudiences,
      keyword_prefix_text: primaryKeywordBlock?.prefix_text || 'We are a',
      keyword_terms: Array.isArray(primaryKeywordBlock?.keywords) ? primaryKeywordBlock.keywords.join(', ') : '',
      hero_title: heroData.title || '',
      hero_subtitle: heroData.subtitle || '',
      hero_body: heroData.body || '',
      hero_cta_primary_text: heroData.cta_primary_text || '',
      hero_cta_primary_link: heroData.cta_primary_link || '',
      why_heading: contentSections.why_heading || '',
      why_body: Array.isArray(contentSections.why_body) ? contentSections.why_body.join('\n\n') : '',
      deliverables_heading: deliverablesData.heading || '',
      process_heading: processData.heading || '',
      cta_heading: ctaData.heading || '',
      cta_subheading: ctaData.subheading || '',
      environments_scroll_text: (contentSections.environments_scroll_text || '').split(' • ').join(', '),
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

    const prefixText = (values.keyword_prefix_text || '').trim() || 'We are a';
    const firstKeyword = keywordTerms[0] || 'seo agency';
    const staticFallback = `${prefixText} ${firstKeyword}`;

    const keywordCyclingBlock = {
      block_id: primaryKeywordBlock?.block_id || 'service-main-cycler',
      prefix_text: prefixText,
      keywords: keywordTerms,
      suffix_text: '',
      static_fallback: staticFallback,
      heading_level: 'h2',
      animation_style: 'typewriter',
      cycle_interval_ms: 3000,
      transition_duration_ms: 400,
      loop: true,
      autostart: true,
      aria_live: 'polite',
      enabled: keywordTerms.length > 0,
    };

    const audienceString = values.audience?.map(a => a.name).join(', ') || values.audience_type;

    const whyBodyArray = (values.why_body || '')
      .split('\n\n')
      .map(p => p.trim())
      .filter(Boolean);

    const envScrollText = (values.environments_scroll_text || 'Shopify, WordPress, Next.js, React, Webflow, eCommerce, B2B, B2C')
      .split(',')
      .map(s => s.trim())
      .filter(Boolean)
      .join(' • ');

    const heroData = {
      title: values.hero_title || '',
      subtitle: values.hero_subtitle || '',
      body: values.hero_body || '',
      cta_primary_text: values.hero_cta_primary_text || 'LEARN MORE',
      cta_primary_link: values.hero_cta_primary_link || '',
    };

    const contentSections = {
      why_heading: values.why_heading || 'Why Choose Us?',
      why_body: whyBodyArray,
      who_its_for: [],
      environments_heading: 'Where We Work',
      environments_scroll_text: envScrollText,
    };

    const ctaData = {
      heading: values.cta_heading || 'Ready to Invest in SEO?',
      subheading: values.cta_subheading || 'Choose how you\'d like to get started.',
    };

    const deliverablesData = {
      heading: values.deliverables_heading || 'What You Get',
      items: deliverablesItems,
    };

    const { keyword_prefix_text, keyword_terms, hero_title, hero_subtitle, hero_body, hero_cta_primary_text, hero_cta_primary_link, why_heading, why_body, deliverables_heading, process_heading, cta_heading, cta_subheading, environments_scroll_text, ...dbValues } = values;

    onSubmit({
      ...dbValues,
      audience_type: audienceString,
      keyword_cycling_blocks: [keywordCyclingBlock],
      hero_data: heroData,
      content_sections: contentSections,
      deliverables: deliverablesData,
      cta: ctaData,
      business_id: businessId,
      about_entities: aboutEntities,
      mentions_entities: mentionsEntities,
    });
  };

  const getFullContent = () => {
    const vals = getValues();
    return `
      Service: ${vals.name}
      Category: ${vals.category}
      Audience: ${vals.audience?.map(a => a.name).join(', ')}
      Keyword Cycling Terms: ${vals.keyword_terms}
      Summary: ${vals.short_description}
      Hero: ${vals.hero_title} - ${vals.hero_subtitle}
      Why Choose Us: ${vals.why_heading} - ${vals.why_body}
      Process: ${vals.shared_content_blocks?.process_content}
      Pricing: ${vals.shared_content_blocks?.pricing_content}
    `;
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      
      {/* Core Details Section - Always Expanded */}
      <div className="bg-white border border-slate-200 rounded-lg">
        <div className="p-4 border-b border-slate-200 bg-slate-50">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Core Service Details
              </h3>
              <p className="text-sm text-slate-500">Define the service parameters.</p>
            </div>
            <EntityGenerator 
              getContent={getFullContent} 
              businessId={businessId} 
              sourceName="This Service" 
            />
          </div>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              <Label htmlFor="base_slug">URL Slug</Label>
              <div className="flex items-center">
                <span className="bg-slate-100 border border-r-0 rounded-l px-3 py-2 text-sm text-slate-500">/</span>
                <Input id="base_slug" {...register('base_slug')} className="rounded-l-none" placeholder="emergency-boiler-repair" />
              </div>
              <p className="text-xs text-red-500">{errors.base_slug?.message}</p>
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded border border-slate-200">
            <h4 className="text-xs font-bold uppercase text-slate-500 mb-2">URL Structure Preview</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Globe className="h-4 w-4 text-blue-500" />
                <span className="font-semibold text-slate-700">National:</span>
                <code className="bg-white px-2 py-0.5 rounded border text-slate-600">website.com/{slug || 'service-slug'}</code>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-green-600" />
                <span className="font-semibold text-slate-700">Local:</span>
                <code className="bg-white px-2 py-0.5 rounded border text-slate-600">website.com/locations/london/{slug || 'service-slug'}</code>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <select 
                id="category" 
                {...register('category')}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                {SERVICE_CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="service_type">Schema Service Type</Label>
              <Input {...register('service_type')} placeholder="Service (Default)" />
            </div>
          </div>

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

          <div className="space-y-2">
            <Label htmlFor="short_description">Short Summary</Label>
            <Textarea 
              id="short_description" 
              {...register('short_description')} 
              placeholder="Briefly describe this service (used for meta descriptions and cards)..."
              className="h-[100px]"
            />
            <p className="text-xs text-slate-400">{watch('short_description')?.length || 0}/500 characters</p>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <button
          type="button"
          onClick={() => toggleSection('hero')}
          className="w-full p-4 flex items-center justify-between bg-gradient-to-r from-rose-50 to-orange-50 hover:from-rose-100 hover:to-orange-100 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Sparkles className="h-5 w-5 text-rose-500" />
            <div className="text-left">
              <h3 className="text-lg font-semibold text-slate-800">Hero Section</h3>
              <p className="text-xs text-slate-500">Title, subtitle, body text, and CTA</p>
            </div>
          </div>
          {expandedSections.hero ? <ChevronUp className="h-5 w-5 text-slate-400" /> : <ChevronDown className="h-5 w-5 text-slate-400" />}
        </button>
        
        {expandedSections.hero && (
          <div className="p-6 space-y-4 border-t border-slate-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="hero_title">Hero Title (H1)</Label>
                <Input 
                  id="hero_title" 
                  {...register('hero_title')} 
                  placeholder="SEO Services That Drive Real Results"
                />
                <p className="text-xs text-slate-400">Main headline displayed at top of service page</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="hero_subtitle">Hero Subtitle</Label>
                <Input 
                  id="hero_subtitle" 
                  {...register('hero_subtitle')} 
                  placeholder="Comprehensive SEO services..."
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="hero_body">Hero Body Text</Label>
              <Textarea 
                id="hero_body" 
                {...register('hero_body')} 
                className="min-h-[100px]"
                placeholder="Detailed introduction paragraph..."
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="hero_cta_primary_text">Primary CTA Text</Label>
                <Input 
                  id="hero_cta_primary_text" 
                  {...register('hero_cta_primary_text')} 
                  placeholder="LEARN MORE"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hero_cta_primary_link">Primary CTA Link</Label>
                <Input 
                  id="hero_cta_primary_link" 
                  {...register('hero_cta_primary_link')} 
                  placeholder="/seo-service"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Keyword Cycling Section */}
      <div className="bg-gradient-to-r from-rose-50 to-orange-50 p-6 rounded-lg border border-rose-200">
        <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2 mb-4">
          <span className="w-8 h-8 bg-rose-500 text-white rounded flex items-center justify-center text-sm font-bold">K</span>
          Keyword Typewriter
        </h3>
        <p className="text-sm text-slate-500 mb-4">
          Creates an animated hero text: <code className="bg-white px-2 py-1 rounded text-rose-600">[Start] + [keyword1] + [keyword2] +...</code>
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="keyword_prefix_text">Start of sentence</Label>
            <Input 
              id="keyword_prefix_text" 
              {...register('keyword_prefix_text')} 
              placeholder="We are a"
              className="bg-white"
            />
            <p className="text-xs text-slate-400">e.g., "We are a", "pomegranate is your", "Grow with"</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="keyword_terms">Keywords <span className="text-slate-400 font-normal">(comma-separated)</span></Label>
            <Input
              id="keyword_terms"
              {...register('keyword_terms')}
              placeholder="seo agency, digital performance team, search engine optimisation company"
              className="bg-white"
            />
          </div>
        </div>
        <div className="mt-4 p-4 bg-white rounded border border-slate-200">
          <p className="text-xs text-slate-500 mb-1">Preview:</p>
          <p className="text-lg font-semibold text-slate-800">
            {watch('keyword_prefix_text') || 'We are a'} <span className="text-rose-500">{watch('keyword_terms')?.split(',').map(k => k.trim()).filter(Boolean).join('</span>, <span className="text-rose-500">') || 'seo agency'}</span>
          </p>
        </div>
      </div>

      {/* Content Sections */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <button
          type="button"
          onClick={() => toggleSection('content')}
          className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <TypeIcon className="h-5 w-5 text-slate-600" />
            <div className="text-left">
              <h3 className="text-lg font-semibold text-slate-800">Content Sections</h3>
              <p className="text-xs text-slate-500">Why Choose Us, Who It's For, Environments</p>
            </div>
          </div>
          {expandedSections.content ? <ChevronUp className="h-5 w-5 text-slate-400" /> : <ChevronDown className="h-5 w-5 text-slate-400" />}
        </button>
        
        {expandedSections.content && (
          <div className="p-6 space-y-6 border-t border-slate-200">
            <div className="space-y-2">
              <Label htmlFor="why_heading">"Why Choose Us" Heading</Label>
              <Input 
                id="why_heading" 
                {...register('why_heading')} 
                placeholder="Why Choose Us?"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="why_body">"Why Choose Us" Body <span className="text-slate-400 font-normal">(separate paragraphs with blank lines)</span></Label>
              <Textarea 
                id="why_body" 
                {...register('why_body')} 
                className="min-h-[200px]"
                placeholder="First paragraph here...

Second paragraph here...

Third paragraph here..."
              />
              <p className="text-xs text-slate-400">Each blank line-separated block becomes a paragraph</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="environments_scroll_text">"Where We Work" Scrolling Text</Label>
              <Input 
                id="environments_scroll_text" 
                {...register('environments_scroll_text')} 
                placeholder="Shopify, WordPress, Next.js, React, Webflow, eCommerce, B2B, B2C"
              />
              <p className="text-xs text-slate-400">Comma-separated platforms/technologies (displayed with • separators)</p>
            </div>
          </div>
        )}
      </div>

      {/* Deliverables Section */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <button
          type="button"
          onClick={() => toggleSection('deliverables')}
          className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <ListChecks className="h-5 w-5 text-slate-600" />
            <div className="text-left">
              <h3 className="text-lg font-semibold text-slate-800">Deliverables</h3>
              <p className="text-xs text-slate-500">"What You Get" section items with icons</p>
            </div>
          </div>
          {expandedSections.deliverables ? <ChevronUp className="h-5 w-5 text-slate-400" /> : <ChevronDown className="h-5 w-5 text-slate-400" />}
        </button>
        
        {expandedSections.deliverables && (
          <div className="p-6 space-y-4 border-t border-slate-200">
            <DeliverablesEditor
              value={deliverablesItems}
              onChange={setDeliverablesItems}
              heading={watch('deliverables_heading')}
              onHeadingChange={(h) => setValue('deliverables_heading', h)}
            />
          </div>
        )}
      </div>

      {/* Process Section */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <button
          type="button"
          onClick={() => toggleSection('process')}
          className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <MessageSquare className="h-5 w-5 text-slate-600" />
            <div className="text-left">
              <h3 className="text-lg font-semibold text-slate-800">Our Process</h3>
              <p className="text-xs text-slate-500">Step-by-step process accordion</p>
            </div>
          </div>
          {expandedSections.process ? <ChevronUp className="h-5 w-5 text-slate-400" /> : <ChevronDown className="h-5 w-5 text-slate-400" />}
        </button>
        
        {expandedSections.process && (
          <div className="p-6 space-y-4 border-t border-slate-200">
            <div className="space-y-2">
              <Label htmlFor="process_heading">Process Section Heading</Label>
              <Input 
                id="process_heading" 
                {...register('process_heading')} 
                placeholder="Our Process"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="shared_content_blocks.process_content">Process Steps (Markdown)</Label>
              <Textarea 
                id="process_content" 
                {...register('shared_content_blocks.process_content')} 
                className="font-mono text-xs min-h-[200px]"
                placeholder={"1. Discovery & Audit\nComprehensive audit of your site...\n\n2. Implementation\nWe implement the changes..."} 
              />
              <p className="text-xs text-slate-400">Each step should be numbered. Format: "Number. Title\nDescription"</p>
            </div>
          </div>
        )}
      </div>

      {/* CTA Section */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <button
          type="button"
          onClick={() => toggleSection('cta')}
          className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Layout className="h-5 w-5 text-slate-600" />
            <div className="text-left">
              <h3 className="text-lg font-semibold text-slate-800">Call to Action</h3>
              <p className="text-xs text-slate-500">"Work With Us" section heading and subheading</p>
            </div>
          </div>
          {expandedSections.cta ? <ChevronUp className="h-5 w-5 text-slate-400" /> : <ChevronDown className="h-5 w-5 text-slate-400" />}
        </button>
        
        {expandedSections.cta && (
          <div className="p-6 space-y-4 border-t border-slate-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="cta_heading">CTA Heading</Label>
                <Input 
                  id="cta_heading" 
                  {...register('cta_heading')} 
                  placeholder="Ready to Invest in SEO?"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cta_subheading">CTA Subheading</Label>
                <Input 
                  id="cta_subheading" 
                  {...register('cta_subheading')} 
                  placeholder="Choose how you'd like to get started."
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* SEO & Entities */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <button
          type="button"
          onClick={() => toggleSection('seo')}
          className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Globe className="h-5 w-5 text-slate-600" />
            <div className="text-left">
              <h3 className="text-lg font-semibold text-slate-800">SEO & Metadata</h3>
              <p className="text-xs text-slate-500">Title tags, descriptions, canonical URLs</p>
            </div>
          </div>
          {expandedSections.seo ? <ChevronUp className="h-5 w-5 text-slate-400" /> : <ChevronDown className="h-5 w-5 text-slate-400" />}
        </button>
        
        {expandedSections.seo && (
          <div className="p-6 space-y-4 border-t border-slate-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="seo_title">SEO Title</Label>
                <Input 
                  id="seo_title" 
                  {...register('seo_title')} 
                  placeholder="SEO Services | pomegranate"
                />
                <p className="text-xs text-slate-400">{watch('seo_title')?.length || 0}/60 characters recommended</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="seo_meta_desc">Meta Description</Label>
                <Textarea 
                  id="seo_meta_desc" 
                  {...register('seo_meta_desc')} 
                  placeholder="Comprehensive SEO services..."
                  className="h-[80px]"
                />
                <p className="text-xs text-slate-400">{watch('seo_meta_desc')?.length || 0}/160 characters recommended</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="canonical_url">Canonical URL</Label>
                <Input 
                  id="canonical_url" 
                  {...register('canonical_url')} 
                  placeholder="https://pomegranate.marketing/seo-service"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="og_image_url">Open Graph Image URL</Label>
                <Input 
                  id="og_image_url" 
                  {...register('og_image_url')} 
                  placeholder="https://..."
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Knowledge Entities */}
      {knowledgeEntities.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
          <button
            type="button"
            onClick={() => toggleSection('entities')}
            className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Info className="h-5 w-5 text-slate-600" />
              <div className="text-left">
                <h3 className="text-lg font-semibold text-slate-800">Knowledge Entities</h3>
                <p className="text-xs text-slate-500">Link to Wikidata for enhanced SEO schema</p>
              </div>
            </div>
            {expandedSections.entities ? <ChevronUp className="h-5 w-5 text-slate-400" /> : <ChevronDown className="h-5 w-5 text-slate-400" />}
          </button>
          
          {expandedSections.entities && (
            <div className="p-6 space-y-4 border-t border-slate-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <KnowledgeEntitySelector
                  label="About Entities"
                  allEntities={knowledgeEntities}
                  selectedIds={aboutEntities}
                  onChange={setAboutEntities}
                  contentToScan={getFullContent()}
                />
                <KnowledgeEntitySelector
                  label="Mentioned Entities"
                  allEntities={knowledgeEntities}
                  selectedIds={mentionsEntities}
                  onChange={setMentionsEntities}
                  contentToScan={getFullContent()}
                />
              </div>
            </div>
          )}
        </div>
      )}

      <div className="flex justify-end gap-3 pt-6 border-t bg-slate-50 -mx-6 -mb-6 px-6 py-4 rounded-b-lg">
        <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={isLoading} className="w-40">
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          {initialData ? 'Update Service' : 'Create Service'}
        </Button>
      </div>
    </form>
  );
};