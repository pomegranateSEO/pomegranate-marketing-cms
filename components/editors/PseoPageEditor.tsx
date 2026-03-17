
import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Loader2, Save, X, Globe, FileJson, Sparkles, LayoutList, AlertTriangle, Code } from 'lucide-react';
import type { PseoPageInstance, Business, Service, TargetLocation, KnowledgeEntity, GlobalTheme } from '../../lib/types';
import { updatePageInstance } from '../../lib/db/generation';
import { EntityGenerator } from '../shared/EntityGenerator';
import { FAQEditor } from '../shared/FAQEditor';
import { KnowledgeEntitySelector } from '../shared/KnowledgeEntitySelector';
import { generateServiceLocationSchema } from '../../lib/seo/schema-generator';
import { AITextGenerator } from '../shared/AITextGenerator';
import { toast } from '../../lib/toast';

interface Props {
  page: PseoPageInstance;
  business: Business;
  service: Service;
  location: TargetLocation;
  knowledgeEntities: KnowledgeEntity[];
  onClose: () => void;
  onSaved: () => void;
}

type EditorTab = 'content' | 'semantic' | 'schema';

export const PseoPageEditor: React.FC<Props> = ({ page, business, service, location, knowledgeEntities, onClose, onSaved }) => {
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<EditorTab>('content');

  const parseLandmarks = (value: unknown): string[] => {
    if (!Array.isArray(value)) return [];
    return value
      .map((item) => (typeof item === 'string' ? item.trim() : ''))
      .filter(Boolean)
      .slice(0, 3);
  };

  const pageLandmarks = parseLandmarks(page.landmarks);
  const locationLandmarks = parseLandmarks(location.landmarks_list);
  const primaryKeywordBlock = Array.isArray(page.keyword_cycling_blocks)
    ? (page.keyword_cycling_blocks[0] as any)
    : null;

  const { register, handleSubmit, control, getValues, setValue, watch } = useForm({
    defaultValues: {
      url_slug: page.url_slug || '',
      seo_title: page.seo_title || '',
      seo_meta_desc: page.seo_meta_desc || '',
      canonical_url: page.canonical_url || '',
      status: page.status || 'draft',
      hero_headline: (page.unique_hero as any)?.headline || '',
      hero_subheadline: (page.unique_hero as any)?.subheadline || '',
      local_context_content: (page.unique_local_context as any)?.content || '',
      custom_head: page.custom_head_html?.[0] || '',
      unique_process_content: (page.unique_process_content as any)?.content || '',
      unique_faqs: Array.isArray(page.unique_faqs) ? page.unique_faqs : [],
      about_entities: page.about_entities || [],
      mentions_entities: page.mentions_entities || [],
      keywords: (page.keywords || []).join(', '),
      schema_json_ld: page.schema_json_ld ? JSON.stringify(page.schema_json_ld, null, 2) : '',
      landmark_one: pageLandmarks[0] || locationLandmarks[0] || '',
      landmark_two: pageLandmarks[1] || locationLandmarks[1] || '',
      landmark_three: pageLandmarks[2] || locationLandmarks[2] || '',
      keyword_prefix_text: primaryKeywordBlock?.prefix_text || 'We are a',
      keyword_terms: Array.isArray(primaryKeywordBlock?.keywords) ? primaryKeywordBlock.keywords.join(', ') : '',
      keyword_suffix_text: primaryKeywordBlock?.suffix_text || '',
      keyword_static_fallback: primaryKeywordBlock?.static_fallback || '',
      keyword_heading_level: primaryKeywordBlock?.heading_level || 'h2',
    }
  });

  const keywordsString = watch('keywords');
  const hasKeywords = keywordsString && keywordsString.length > 0;
  const brandTheme = business.global_theme as GlobalTheme;

  const onSubmit = async (data: any) => {
    const landmarks = [data.landmark_one, data.landmark_two, data.landmark_three]
      .map((item: string) => item?.trim() || '');

    if (landmarks.some((item) => item.length === 0)) {
      toast.warning('Please enter all 3 landmarks before saving this local service page.');
      return;
    }

    const keywordTerms = (data.keyword_terms || '')
      .split(',')
      .map((item: string) => item.trim())
      .filter(Boolean);

    if (keywordTerms.length < 2) {
      toast.warning('Please add at least 2 keyword cycling terms for this local service page.');
      return;
    }

    const prefixText = (data.keyword_prefix_text || '').trim() || 'We are a';
    const suffixText = (data.keyword_suffix_text || '').trim();
    const staticFallback = (data.keyword_static_fallback || '').trim() || `${prefixText} ${keywordTerms[0]}${suffixText ? ` ${suffixText}` : ''}`;
    const keywordBlock = {
      block_id: primaryKeywordBlock?.block_id || 'local-service-cycler',
      prefix_text: prefixText,
      keywords: keywordTerms,
      suffix_text: suffixText,
      static_fallback: staticFallback,
      heading_level: data.keyword_heading_level || 'h2',
      animation_style: primaryKeywordBlock?.animation_style || 'typewriter',
      cycle_interval_ms: primaryKeywordBlock?.cycle_interval_ms || 3000,
      transition_duration_ms: primaryKeywordBlock?.transition_duration_ms || 400,
      loop: typeof primaryKeywordBlock?.loop === 'boolean' ? primaryKeywordBlock.loop : true,
      autostart: typeof primaryKeywordBlock?.autostart === 'boolean' ? primaryKeywordBlock.autostart : true,
      aria_live: primaryKeywordBlock?.aria_live || 'polite',
      enabled: typeof primaryKeywordBlock?.enabled === 'boolean' ? primaryKeywordBlock.enabled : true,
    };

    const keywordList = data.keywords
      .split(',')
      .map((k: string) => k.trim())
      .filter(Boolean);
    const mergedKeywords = Array.from(new Set([...keywordList, ...keywordTerms]));

    setSaving(true);
    try {
      const payload: Partial<PseoPageInstance> = {
        url_slug: data.url_slug,
        seo_title: data.seo_title,
        seo_meta_desc: data.seo_meta_desc,
        canonical_url: data.canonical_url || undefined,
        status: data.status,
        published: data.status === 'published',
        unique_hero: {
          headline: data.hero_headline,
          subheadline: data.hero_subheadline,
        },
        unique_local_context: {
          content: data.local_context_content,
        },
        custom_head_html: data.custom_head ? [data.custom_head] : undefined,
        unique_process_content: {
          content: data.unique_process_content
        },
        unique_faqs: data.unique_faqs,
        landmarks,
        keyword_cycling_blocks: [keywordBlock],
        about_entities: data.about_entities,
        mentions_entities: data.mentions_entities,
        keywords: mergedKeywords,
        schema_json_ld: data.schema_json_ld ? JSON.parse(data.schema_json_ld) : null,
      };

      await updatePageInstance(page.id, payload);
      onSaved();
      onClose();
    } catch (e: any) {
      toast.error("Failed to save", e.message);
    } finally {
      setSaving(false);
    }
  };
  
  const getPageContentForAI = () => {
      const data = getValues();
      return `
        Title: ${data.seo_title}
        Description: ${data.seo_meta_desc}
        Hero: ${data.hero_headline} - ${data.hero_subheadline}
        Landmarks: ${[data.landmark_one, data.landmark_two, data.landmark_three].filter(Boolean).join(', ')}
        Keyword Cycling Terms: ${data.keyword_terms}
        Local Context: ${data.local_context_content}
        Process: ${data.unique_process_content}
      `;
  };

  const handleGenerateSchema = () => {
    try {
      const formData = getValues();
      const pageDataForSchema: PseoPageInstance = {
        ...page,
        seo_title: formData.seo_title,
        seo_meta_desc: formData.seo_meta_desc,
        landmarks: [formData.landmark_one, formData.landmark_two, formData.landmark_three].filter(Boolean),
        keyword_cycling_blocks: [{
          block_id: primaryKeywordBlock?.block_id || 'local-service-cycler',
          prefix_text: formData.keyword_prefix_text || 'We are a',
          keywords: (formData.keyword_terms || '').split(',').map((item: string) => item.trim()).filter(Boolean),
          suffix_text: formData.keyword_suffix_text || '',
          static_fallback: formData.keyword_static_fallback || '',
          heading_level: formData.keyword_heading_level || 'h2',
          animation_style: primaryKeywordBlock?.animation_style || 'typewriter',
          cycle_interval_ms: primaryKeywordBlock?.cycle_interval_ms || 3000,
          transition_duration_ms: primaryKeywordBlock?.transition_duration_ms || 400,
          loop: typeof primaryKeywordBlock?.loop === 'boolean' ? primaryKeywordBlock.loop : true,
          autostart: typeof primaryKeywordBlock?.autostart === 'boolean' ? primaryKeywordBlock.autostart : true,
          aria_live: primaryKeywordBlock?.aria_live || 'polite',
          enabled: typeof primaryKeywordBlock?.enabled === 'boolean' ? primaryKeywordBlock.enabled : true,
        }],
        about_entities: formData.about_entities,
        mentions_entities: formData.mentions_entities
      };

      const schemaString = generateServiceLocationSchema(
        business,
        service,
        location,
        pageDataForSchema,
        knowledgeEntities,
        formData.unique_faqs as any
      );

      const jsonMatch = schemaString.match(/<script.*?>(.*?)<\/script>/s);
      if (jsonMatch && jsonMatch[1]) {
        const schemaJson = JSON.parse(jsonMatch[1]);
        setValue('schema_json_ld', JSON.stringify(schemaJson, null, 2));
        toast.success("Schema JSON-LD generated successfully!");
      } else {
        throw new Error("Could not extract JSON from schema string.");
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to generate schema.");
    }
  };


  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card w-full max-w-4xl rounded-lg shadow-2xl flex flex-col max-h-[90vh]">
        
        <div className="flex justify-between items-center p-4 border-b">
          <div>
            <h3 className="text-xl font-bold">Edit Page Instance</h3>
            <div className="text-xs text-muted-foreground font-mono mt-1 flex items-center gap-1">
               <Globe className="h-3 w-3" />
               /{getValues('url_slug')}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <EntityGenerator getContent={getPageContentForAI} businessId={business.id} sourceName="Page Content" />
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b bg-muted">
           <button onClick={() => setActiveTab('content')} className={`px-4 py-2 text-sm font-medium border-b-2 ${activeTab === 'content' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground'}`}>Content</button>
           <button onClick={() => setActiveTab('semantic')} className={`px-4 py-2 text-sm font-medium border-b-2 ${activeTab === 'semantic' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground'}`}>Semantic Markup</button>
           <button onClick={() => setActiveTab('schema')} className={`px-4 py-2 text-sm font-medium border-b-2 ${activeTab === 'schema' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground'}`}>Schema & Publish</button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="overflow-y-auto p-6 space-y-6 flex-1">
          
          {/* CONTENT TAB */}
          <div className={`${activeTab === 'content' ? 'block' : 'hidden'} space-y-6`}>
              
              {/* KEYWORD FIRST */}
              <div className="bg-blue-50/50 p-4 rounded border border-blue-100">
                 <Label className="text-blue-800 font-semibold mb-1 block">Target Keyword (Primary)</Label>
                 <Input {...register('keywords')} placeholder="e.g. SEO Services London" className="bg-card border-blue-200 dark:border-blue-800 focus:ring-blue-500" />
                 {!hasKeywords && (
                    <p className="text-xs text-amber-600 mt-1 flex items-center gap-1 font-medium">
                       <AlertTriangle className="h-3 w-3" />
                       Required for AI Optimization
                    </p>
                 )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label>SEO Title</Label>
                    <AITextGenerator 
                      onGenerate={t => setValue('seo_title', t)} 
                      fieldName="SEO Title" 
                      keyword={keywordsString} 
                      currentValue={watch('seo_title')}
                      brandTheme={brandTheme}
                    />
                  </div>
                  <Input {...register('seo_title')} required />
                </div>
                <div className="space-y-2">
                  <Label>URL Slug</Label>
                  <Input {...register('url_slug')} required />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Meta Description</Label>
                  <AITextGenerator 
                    onGenerate={t => setValue('seo_meta_desc', t)} 
                    fieldName="Meta Description" 
                    keyword={keywordsString}
                    currentValue={watch('seo_meta_desc')}
                    brandTheme={brandTheme}
                  />
                </div>
                <Textarea {...register('seo_meta_desc')} className="h-20" />
              </div>

              <div className="border-t pt-4">
                <h4 className="font-semibold text-sm mb-3 text-purple-700">Unique Content Injection</h4>
                <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label>Hero Headline</Label>
                        <AITextGenerator 
                          onGenerate={t => setValue('hero_headline', t)} 
                          fieldName="Hero Headline" 
                          keyword={keywordsString}
                          currentValue={watch('hero_headline')}
                          brandTheme={brandTheme}
                        />
                      </div>
                      <Input {...register('hero_headline')} placeholder="{Service} in {Location}" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label>Hero Subheadline</Label>
                        <AITextGenerator 
                          onGenerate={t => setValue('hero_subheadline', t)} 
                          fieldName="Hero Subheadline" 
                          keyword={keywordsString}
                          currentValue={watch('hero_subheadline')}
                          brandTheme={brandTheme}
                        />
                      </div>
                      <Input {...register('hero_subheadline')} placeholder="Local services near {Landmark}..." />
                    </div>
                    <div className="space-y-2">
                      <Label>Local Landmarks (3 required)</Label>
                      <p className="text-xs text-muted-foreground">Add exactly 3 landmarks used for this local service page.</p>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <Input {...register('landmark_one')} placeholder="Landmark 1" required />
                        <Input {...register('landmark_two')} placeholder="Landmark 2" required />
                        <Input {...register('landmark_three')} placeholder="Landmark 3" required />
                      </div>
                    </div>
                    <div className="space-y-3 p-4 bg-muted rounded border">
                      <Label>Keyword Cycling (Required on Local Service Pages)</Label>
                      <p className="text-xs text-muted-foreground">
                        Local service pages must include a keyword cycling block. The hero landmarks animation appears first, then this keyword cycling section.
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <Input {...register('keyword_prefix_text')} placeholder="Prefix text (e.g. We are a)" />
                        <Input {...register('keyword_suffix_text')} placeholder="Suffix text (optional)" />
                        <div className="md:col-span-2">
                          <Input {...register('keyword_terms')} placeholder="Comma-separated terms (minimum 2)" />
                        </div>
                        <div className="md:col-span-2">
                          <Input {...register('keyword_static_fallback')} placeholder="Static fallback sentence for no-JS and schema contexts" />
                        </div>
                        <div>
                          <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" {...register('keyword_heading_level')}>
                            <option value="h1">h1</option>
                            <option value="h2">h2</option>
                            <option value="h3">h3</option>
                            <option value="h4">h4</option>
                            <option value="p">p</option>
                          </select>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label>Local Context Paragraph</Label>
                        <AITextGenerator 
                          onGenerate={t => setValue('local_context_content', t)} 
                          fieldName="Local Context" 
                          keyword={keywordsString}
                          currentValue={watch('local_context_content')}
                          brandTheme={brandTheme}
                        />
                      </div>
                      <Textarea {...register('local_context_content')} className="h-32" placeholder="Specific text..." />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label>Unique Process Content</Label>
                        <AITextGenerator 
                          onGenerate={t => setValue('unique_process_content', t)} 
                          fieldName="Process Content" 
                          keyword={keywordsString}
                          currentValue={watch('unique_process_content')}
                          brandTheme={brandTheme}
                        />
                      </div>
                      <Textarea {...register('unique_process_content')} className="h-32" placeholder="Location-specific process details..."/>
                    </div>
                </div>
              </div>
          </div>
          
          {/* SEMANTIC MARKUP TAB */}
          <div className={`${activeTab === 'semantic' ? 'block' : 'hidden'} space-y-8`}>
             <Controller
                control={control}
                name="unique_faqs"
                render={({ field }) => (
                  <FAQEditor value={field.value} onChange={field.onChange} sourceText={getPageContentForAI()} />
                )}
             />
             <div className="grid grid-cols-2 gap-6">
                <Controller
                  control={control}
                  name="about_entities"
                  render={({ field }) => (
                    <KnowledgeEntitySelector 
                       label="About Entities"
                       allEntities={knowledgeEntities}
                       selectedIds={field.value}
                       onChange={field.onChange}
                       contentToScan={getPageContentForAI()}
                    />
                  )}
                />
                <Controller
                  control={control}
                  name="mentions_entities"
                  render={({ field }) => (
                    <KnowledgeEntitySelector 
                       label="Mentioned Entities"
                       allEntities={knowledgeEntities}
                       selectedIds={field.value}
                       onChange={field.onChange}
                       contentToScan={getPageContentForAI()}
                    />
                  )}
                />
             </div>
          </div>

{/* SCHEMA & PUBLISH TAB */}
          <div className={`${activeTab === 'schema' ? 'block' : 'hidden'} space-y-6`}>
               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                     <Label>Status</Label>
                     <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" {...register('status')}>
                       <option value="draft">Draft</option>
                       <option value="published">Published</option>
                     </select>
                  </div>
                  <div className="space-y-2">
                     <Label>Canonical URL</Label>
                     <Input {...register('canonical_url')} placeholder="https://example.com/locations/city/service" />
                  </div>
               </div>

               <div className="space-y-2">
<Label className="flex items-center gap-2">
                     <Code className="h-4 w-4 text-muted-foreground" />
                     Custom &lt;head&gt; Code
                   </Label>
                   <Textarea 
                      {...register('custom_head')} 
                      placeholder="<script>...</script> or <meta name='...'>" 
                      className="font-mono text-xs h-32 bg-muted"
                   />
                  <p className="text-xs text-muted-foreground">Injected into the head of this specific page instance.</p>
               </div>

               <div className="space-y-2">
                <div className="flex justify-between items-center mb-2">
                   <Label>Generated Schema (JSON-LD)</Label>
                   <Button type="button" size="sm" variant="secondary" onClick={handleGenerateSchema}>
                     <Sparkles className="h-3 w-3 mr-2"/>
                     Generate/Update Schema
                   </Button>
                </div>
<Textarea 
                   {...register('schema_json_ld')}
                    className="font-mono text-xs h-96 bg-muted"
                    readOnly
                 />
              </div>
          </div>

        </form>

        <div className="p-4 border-t bg-muted flex justify-end gap-2 rounded-b-lg">
           <Button variant="ghost" onClick={onClose}>Cancel</Button>
           <Button onClick={handleSubmit(onSubmit)} disabled={saving}>
             {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
             Save Changes
           </Button>
        </div>

      </div>
    </div>
  );
};
