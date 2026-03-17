import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Loader2, Factory, Sparkles, Globe, ChevronDown, ChevronUp, MessageSquare, Layout, ListChecks } from 'lucide-react';
import type { Industry, KnowledgeEntity } from '../../lib/types';
import { FAQEditor } from '../shared/FAQEditor';
import { KnowledgeEntitySelector } from '../shared/KnowledgeEntitySelector';
import { DeliverablesEditor } from '../shared/DeliverablesEditor';

interface FAQItem { question: string; answer: string; }

interface IndustryFormProps {
  initialData?: Partial<Industry>;
  businessId: string;
  knowledgeEntities?: KnowledgeEntity[];
  onSubmit: (data: Partial<Industry>) => void;
  isLoading?: boolean;
  onCancel: () => void;
}

export const IndustryForm: React.FC<IndustryFormProps> = ({
  initialData,
  businessId,
  knowledgeEntities = [],
  onSubmit,
  isLoading,
  onCancel,
}) => {
  const heroData = (initialData?.hero_data as any) || {};
  const ctaData = (initialData?.cta as any) || {};
  const contentSections = (initialData?.content_sections as any) || {};
  const primaryBlock = Array.isArray(initialData?.keyword_cycling_blocks)
    ? (initialData.keyword_cycling_blocks as any[])[0]
    : null;
  const faqList = Array.isArray(initialData?.faq_list) ? initialData.faq_list as FAQItem[] : [];
  const overviewItems = Array.isArray(contentSections?.overview_items)
    ? contentSections.overview_items as { icon: string; title: string; description: string }[]
    : [];

  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    hero: true,
    cta: false,
    deliverables: false,
    faq: false,
    seo: false,
    entities: false,
  });

  const [formState, setFormState] = useState({
    name: initialData?.name || '',
    slug: initialData?.slug || '',
    description: initialData?.description || '',
    hero_title: heroData.title || '',
    hero_body: heroData.body || '',
    hero_cta_text: heroData.cta_text || '',
    hero_keyword: heroData.keyword || '',
    hero_landmarks: Array.isArray(heroData.landmarks) ? heroData.landmarks.join(', ') : '',
    keyword_prefix_text: primaryBlock?.prefix_text || 'We serve the',
    keyword_terms: Array.isArray(primaryBlock?.keywords) ? primaryBlock.keywords.join(', ') : '',
    cta_heading: ctaData.heading || '',
    cta_subheading: ctaData.subheading || '',
    seo_title: initialData?.seo_title || '',
    seo_meta_desc: initialData?.seo_meta_desc || '',
    canonical_url: initialData?.canonical_url || '',
    og_image_url: initialData?.og_image_url || '',
    about_entities: initialData?.about_entities || [] as string[],
    mentions_entities: initialData?.mentions_entities || [] as string[],
  });

  const [faqs, setFaqs] = useState<FAQItem[]>(faqList);
  const [deliverablesItems, setDeliverablesItems] = useState<{ icon: string; title: string; description: string }[]>(overviewItems);
  const [overviewHeading, setOverviewHeading] = useState<string>(contentSections?.overview_heading || '');

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const set = (field: keyof typeof formState, value: any) => {
    setFormState(prev => ({ ...prev, [field]: value }));
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (!formState.slug) {
      const slug = val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      setFormState(prev => ({ ...prev, name: val, slug }));
    } else {
      set('name', val);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const keywordTerms = formState.keyword_terms
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    const prefixText = formState.keyword_prefix_text.trim() || 'We serve the';

    const keywordCyclingBlock = {
      block_id: primaryBlock?.block_id || 'industry-main-cycler',
      prefix_text: prefixText,
      keywords: keywordTerms,
      suffix_text: '',
      static_fallback: `${prefixText} ${keywordTerms[0] || 'industry'}`,
      heading_level: 'h2',
      animation_style: 'typewriter',
      cycle_interval_ms: 3000,
      transition_duration_ms: 400,
      loop: true,
      autostart: true,
      aria_live: 'polite',
      enabled: keywordTerms.length > 0,
    };

    const heroDataOut = {
      title: formState.hero_title,
      body: formState.hero_body,
      cta_text: formState.hero_cta_text,
      keyword: formState.hero_keyword,
      landmarks: formState.hero_landmarks.split(',').map(s => s.trim()).filter(Boolean),
    };

    const ctaDataOut = {
      heading: formState.cta_heading,
      subheading: formState.cta_subheading,
    };

    const contentSectionsOut = {
      overview_heading: overviewHeading || 'What You Get',
      overview_items: deliverablesItems,
    };

    onSubmit({
      name: formState.name,
      slug: formState.slug,
      description: formState.description,
      hero_data: heroDataOut,
      keyword_cycling_blocks: [keywordCyclingBlock],
      content_sections: contentSectionsOut,
      cta: ctaDataOut,
      faq_list: faqs,
      seo_title: formState.seo_title,
      seo_meta_desc: formState.seo_meta_desc,
      canonical_url: formState.canonical_url,
      og_image_url: formState.og_image_url,
      about_entities: formState.about_entities,
      mentions_entities: formState.mentions_entities,
      business_id: businessId,
    });
  };

  const getContent = () => `Industry: ${formState.name}\n${formState.description}\n${formState.hero_title} - ${formState.hero_body}`;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">

      {/* Core Details — always visible */}
      <div className="bg-card border rounded-lg p-6 space-y-6">
        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Factory className="h-5 w-5" />
          Core Details
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Industry Name</Label>
            <Input
              value={formState.name}
              onChange={handleNameChange}
              placeholder="e.g. eCommerce"
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Slug</Label>
            <div className="flex items-center">
              <span className="bg-muted border border-r-0 rounded-l px-3 py-2 text-sm text-muted-foreground">/industries/</span>
              <Input
                value={formState.slug}
                onChange={e => set('slug', e.target.value)}
                className="rounded-l-none"
                placeholder="ecommerce"
                required
              />
            </div>
          </div>
        </div>
        <div className="space-y-2">
          <Label>Short Description</Label>
          <Textarea
            value={formState.description || ''}
            onChange={e => set('description', e.target.value)}
            placeholder="Brief summary displayed in industry cards..."
            className="h-[80px]"
          />
        </div>
      </div>

      {/* Hero Section */}
      <div className="bg-card border rounded-lg overflow-hidden">
        <button type="button" onClick={() => toggleSection('hero')}
          className="w-full p-4 flex items-center justify-between bg-gradient-to-r from-rose-50 to-orange-50 dark:from-rose-950/30 dark:to-orange-950/30 hover:from-rose-100 hover:to-orange-100 dark:hover:from-rose-900/40 dark:hover:to-orange-900/40 transition-colors">
          <div className="flex items-center gap-3">
            <Sparkles className="h-5 w-5 text-rose-500" />
            <div className="text-left">
              <h3 className="text-lg font-semibold text-foreground">Hero Section</h3>
              <p className="text-xs text-muted-foreground">Page title, body copy, CTA, and animated landmark phrases</p>
            </div>
          </div>
          {expandedSections.hero ? <ChevronUp className="h-5 w-5 text-muted-foreground" /> : <ChevronDown className="h-5 w-5 text-muted-foreground" />}
        </button>
        {expandedSections.hero && (
          <div className="p-6 space-y-4 border-t">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Hero Title (H1)</Label>
                <Input
                  value={formState.hero_title}
                  onChange={e => set('hero_title', e.target.value)}
                  placeholder="SEO & Marketing for Enterprise Businesses"
                />
              </div>
              <div className="space-y-2">
<Label>Hero Keyword</Label>
                  <Input
                    value={formState.hero_keyword}
                    onChange={e => set('hero_keyword', e.target.value)}
                    placeholder="Enterprise"
                  />
                  <p className="text-xs text-muted-foreground">Single-word industry keyword (shown in animated background)</p>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Hero Body Text</Label>
              <Textarea
                value={formState.hero_body}
                onChange={e => set('hero_body', e.target.value)}
                className="min-h-[80px]"
                placeholder="Brief introduction to this industry service..."
              />
            </div>
            <div className="space-y-2">
              <Label>CTA Button Text</Label>
              <Input
                value={formState.hero_cta_text}
                onChange={e => set('hero_cta_text', e.target.value)}
                placeholder="Book a Discovery Call"
              />
            </div>
            <div className="space-y-2">
              <Label>Landmark Phrases <span className="text-muted-foreground font-normal">(comma-separated)</span></Label>
              <Textarea
                value={formState.hero_landmarks}
                onChange={e => set('hero_landmarks', e.target.value)}
                className="min-h-[80px]"
                placeholder="Nationwide Enterprise SEO, Multi-Location Authority Building, Technical SEO at Scale"
              />
              <p className="text-xs text-muted-foreground">Phrases displayed in the animated hero background. Separate with commas.</p>
            </div>
          </div>
        )}
      </div>

      {/* Keyword Cycling — always visible */}
      <div className="bg-gradient-to-r from-rose-50 to-orange-50 dark:from-rose-950/30 dark:to-orange-950/30 p-6 rounded-lg border border-rose-200 dark:border-rose-800">
        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2 mb-4">
          <span className="w-8 h-8 bg-rose-500 text-white rounded flex items-center justify-center text-sm font-bold">K</span>
          Keyword Typewriter
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          Creates animated hero text: <code className="bg-card px-2 py-1 rounded text-rose-600 dark:text-rose-400">[Start] + [keyword1] + [keyword2]...</code>
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Start of sentence</Label>
            <Input
              value={formState.keyword_prefix_text}
              onChange={e => set('keyword_prefix_text', e.target.value)}
              placeholder="We serve the"
              className="bg-card"
            />
          </div>
          <div className="space-y-2">
            <Label>Keywords <span className="text-muted-foreground font-normal">(comma-separated)</span></Label>
            <Input
              value={formState.keyword_terms}
              onChange={e => set('keyword_terms', e.target.value)}
              placeholder="enterprise sector, corporate market, large-scale businesses"
              className="bg-card"
            />
          </div>
        </div>
        {formState.keyword_terms && (
          <div className="mt-4 p-4 bg-card rounded border">
            <p className="text-xs text-muted-foreground mb-1">Preview:</p>
            <p className="text-lg font-semibold text-foreground">
              {formState.keyword_prefix_text || 'We serve the'}{' '}
              <span className="text-rose-500">
                {formState.keyword_terms.split(',')[0]?.trim() || ''}
              </span>
            </p>
          </div>
        )}
      </div>

      {/* Deliverables Section */}
      <div className="bg-card border rounded-lg overflow-hidden">
        <button type="button" onClick={() => toggleSection('deliverables')}className="w-full p-4 flex items-center justify-between hover:bg-muted transition-colors">
          <div className="flex items-center gap-3">
            <ListChecks className="h-5 w-5 text-muted-foreground" />
            <div className="text-left">
              <h3 className="text-lg font-semibold text-foreground">Deliverables</h3>
              <p className="text-xs text-muted-foreground">"What You Get" section items with icons</p>
            </div>
          </div>
          {expandedSections.deliverables ? <ChevronUp className="h-5 w-5 text-muted-foreground" /> : <ChevronDown className="h-5 text-muted-foreground" />}
        </button>
        {expandedSections.deliverables && (
          <div className="p-6 border-t">
            <DeliverablesEditor
              value={deliverablesItems}
              onChange={setDeliverablesItems}
              heading={overviewHeading}
              onHeadingChange={setOverviewHeading}
            />
          </div>
        )}
      </div>

      {/* CTA Section */}
      <div className="bg-card border rounded-lg overflow-hidden">
        <button type="button" onClick={() => toggleSection('cta')}
          className="w-full p-4 flex items-center justify-between hover:bg-muted transition-colors">
          <div className="flex items-center gap-3">
            <Layout className="h-5 w-5 text-muted-foreground" />
            <div className="text-left">
              <h3 className="text-lg font-semibold text-foreground">Call to Action</h3>
              <p className="text-xs text-muted-foreground">"Work With Us" section heading and subheading</p>
            </div>
          </div>
          {expandedSections.cta ? <ChevronUp className="h-5 w-5 text-muted-foreground" /> : <ChevronDown className="h-5 w-5 text-muted-foreground" />}
        </button>
        {expandedSections.cta && (
          <div className="p-6 space-y-4 border-t">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>CTA Heading</Label>
                <Input
                  value={formState.cta_heading}
                  onChange={e => set('cta_heading', e.target.value)}
                  placeholder="Ready to scale your enterprise presence?"
                />
              </div>
              <div className="space-y-2">
                <Label>CTA Subheading</Label>
                <Input
                  value={formState.cta_subheading}
                  onChange={e => set('cta_subheading', e.target.value)}
                  placeholder="Book a free discovery call today."
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* FAQ Section */}
      <div className="bg-card border rounded-lg overflow-hidden">
        <button type="button" onClick={() => toggleSection('faq')}
          className="w-full p-4 flex items-center justify-between hover:bg-muted transition-colors">
          <div className="flex items-center gap-3">
            <MessageSquare className="h-5 w-5 text-muted-foreground" />
            <div className="text-left">
              <h3 className="text-lg font-semibold text-foreground">FAQs</h3>
              <p className="text-xs text-muted-foreground">Frequently Asked Questions for this industry</p>
            </div>
          </div>
          {expandedSections.faq ? <ChevronUp className="h-5 w-5 text-muted-foreground" /> : <ChevronDown className="h-5 w-5 text-muted-foreground" />}
        </button>
        {expandedSections.faq && (
          <div className="p-6 border-t">
            <FAQEditor
              value={faqs}
              onChange={setFaqs}
              sourceText={`${formState.name} ${formState.description} ${formState.hero_body}`}
            />
          </div>
        )}
      </div>

      {/* SEO Section */}
      <div className="bg-card border rounded-lg overflow-hidden">
        <button type="button" onClick={() => toggleSection('seo')}
          className="w-full p-4 flex items-center justify-between hover:bg-muted transition-colors">
          <div className="flex items-center gap-3">
            <Globe className="h-5 w-5 text-muted-foreground" />
            <div className="text-left">
              <h3 className="text-lg font-semibold text-foreground">SEO & Metadata</h3>
              <p className="text-xs text-muted-foreground">Title tags, descriptions, canonical URLs</p>
            </div>
          </div>
          {expandedSections.seo ? <ChevronUp className="h-5 w-5 text-muted-foreground" /> : <ChevronDown className="h-5 w-5 text-muted-foreground" />}
        </button>
        {expandedSections.seo && (
          <div className="p-6 space-y-4 border-t">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
<Label>SEO Title</Label>
                  <Input
                    value={formState.seo_title}
                    onChange={e => set('seo_title', e.target.value)}
                    placeholder="Enterprise SEO |pomegranate"
                  />
                 <p className="text-xs text-muted-foreground">{formState.seo_title?.length || 0}/60 characters recommended</p>
               </div>
               <div className="space-y-2">
                 <Label>Meta Description</Label>
                 <Textarea
                   value={formState.seo_meta_desc || ''}
                   onChange={e => set('seo_meta_desc', e.target.value)}
                   placeholder="Comprehensive SEO and digital marketing for enterprise businesses..."
                   className="h-[80px]"
                 />
                 <p className="text-xs text-muted-foreground">{formState.seo_meta_desc?.length || 0}/160 characters recommended</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Canonical URL</Label>
                <Input
                  value={formState.canonical_url || ''}
                  onChange={e => set('canonical_url', e.target.value)}
                  placeholder="https://pomegranate.marketing/industries/enterprise"
                />
              </div>
              <div className="space-y-2">
                <Label>Open Graph Image URL</Label>
                <Input
                  value={formState.og_image_url || ''}
                  onChange={e => set('og_image_url', e.target.value)}
                  placeholder="https://..."
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Entities Section */}
      {knowledgeEntities.length > 0 && (
        <div className="bg-card border rounded-lg overflow-hidden">
          <button type="button" onClick={() => toggleSection('entities')}
            className="w-full p-4 flex items-center justify-between hover:bg-muted transition-colors">
            <div className="flex items-center gap-3">
              <Globe className="h-5 w-5 text-muted-foreground" />
              <div className="text-left">
                <h3 className="text-lg font-semibold text-foreground">Knowledge Entities</h3>
                <p className="text-xs text-muted-foreground">Link to Wikidata for enhanced SEO schema</p>
              </div>
            </div>
            {expandedSections.entities ? <ChevronUp className="h-5 w-5 text-muted-foreground" /> : <ChevronDown className="h-5 w-5 text-muted-foreground" />}
          </button>
          {expandedSections.entities && (
            <div className="p-6 border-t">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <KnowledgeEntitySelector
                  label="About Entities"
                  allEntities={knowledgeEntities}
                  selectedIds={formState.about_entities}
                  onChange={(ids) => set('about_entities', ids)}
                  contentToScan={getContent()}
                />
                <KnowledgeEntitySelector
                  label="Mentioned Entities"
                  allEntities={knowledgeEntities}
                  selectedIds={formState.mentions_entities}
                  onChange={(ids) => set('mentions_entities', ids)}
                  contentToScan={getContent()}
                />
              </div>
            </div>
          )}
        </div>
      )}

      <div className="flex justify-end gap-3 pt-6 border-t bg-muted -mx-6 -mb-6 px-6 py-4 rounded-b-lg" style={{ marginLeft: 0, marginBottom: 0 }}>
        <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={isLoading} className="w-48">
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          {initialData?.id ? 'Update Industry' : 'Create Industry'}
        </Button>
      </div>
    </form>
  );
};
