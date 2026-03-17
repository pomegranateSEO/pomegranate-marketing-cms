
import React, { useEffect, useState } from 'react';
import { Layers, Plus, Loader2, Edit2, Trash2, Save, ArrowLeft, AlertTriangle, Code, Sparkles, CheckCircle2 } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Textarea } from '../../../components/ui/textarea';
import { fetchBusinesses } from '../../../lib/db/businesses';
import { fetchPages, createPage, updatePage, deletePage } from '../../../lib/db/pages';
import { fetchKnowledgeEntities } from '../../../lib/db/knowledge';
import type { StaticPage, Business, GlobalTheme, KnowledgeEntity } from '../../../lib/types';
import { EntityGenerator } from '../../../components/shared/EntityGenerator';
import { VisualContentEditor } from '../../../components/shared/VisualContentEditor';
import { FAQEditor } from '../../../components/shared/FAQEditor';
import { AITextGenerator } from '../../../components/shared/AITextGenerator';
import { KnowledgeEntitySelector } from '../../../components/shared/KnowledgeEntitySelector';
import { generateCorePages } from '../../../lib/ai/page-generator';
import { toast } from '../../../lib/toast';
import { useConfirm } from '../../../lib/confirm-dialog';
import { TableSkeleton, PageHeaderSkeleton } from '../../../components/shared/skeletons';

const SCHEMA_PAGE_TYPES = [
  "WebPage",
  "AboutPage",
  "ContactPage",
  "CheckoutPage",
  "CollectionPage",
  "FAQPage",
  "ItemPage",
  "MedicalWebPage",
  "ProfilePage",
  "QAPage",
  "RealEstateListing",
  "SearchResultsPage"
];

export default function PagesPage() {
  const [rootBusiness, setRootBusiness] = useState<Business | null>(null);
  const [pages, setPages] = useState<StaticPage[]>([]);
  const [knowledgeEntities, setKnowledgeEntities] = useState<KnowledgeEntity[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [generatingCore, setGeneratingCore] = useState(false);
  const [activeTab, setActiveTab] = useState<'content' | 'semantic' | 'settings'>('content');
  const { confirm, ConfirmDialog } = useConfirm();
  
  // Form State
  const [formState, setFormState] = useState({
    id: '',
    title: '',
    slug: '',
    content: '',
    status: 'draft',
    page_type: 'WebPage',
    faqs: [] as { question: string; answer: string }[],
    target_keyword: '',
    custom_head: '',
    about_entities: [] as string[],
    mentions_entities: [] as string[],
    // Keyword cycling fields
    keyword_prefix_text: 'We are a',
    keyword_terms: '',
    // Hero data fields
    hero_title: '',
    hero_eyebrow: '',
    hero_subtitle: '',      // contact/about: hd.subtitle
    hero_subtext: '',       // home: hd.subtext (line below hero title)
    hero_tagline: '',       // home: hd.tagline (small line under subtext)
    hero_primary_cta_text: '',      // home: hd.primary_cta_text
    hero_secondary_cta_text: '',    // home: hd.secondary_cta_text
    hero_secondary_cta_link: '',    // home: hd.secondary_cta_link
    // Content sections — JSON editor for complex nested data
    content_sections_json: '',
    // SEO fields
    canonical_url: '',
    og_image_url: '',
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [pagesData, businessesData, keData] = await Promise.all([
        fetchPages(),
        fetchBusinesses(),
        fetchKnowledgeEntities()
      ]);
      setPages(pagesData);
      setKnowledgeEntities(keData);
      if (businessesData.length > 0) setRootBusiness(businessesData[0]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rootBusiness) { toast.error("No Root Business found."); return; }

    setSaving(true);
    try {
      // Build keyword cycling block
      const keywordTerms = (formState.keyword_terms || '')
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);

      const prefixText = (formState.keyword_prefix_text || '').trim() || 'We are a';
      const firstKeyword = keywordTerms[0] || 'seo agency';
      const staticFallback = `${prefixText} ${firstKeyword}`;

      const keywordCyclingBlock = {
        block_id: 'page-main-cycler',
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

      // Build hero_data — only include keys that have values, so existing DB
      // fields not present in this form are not inadvertently cleared.
      const heroDataPayload: Record<string, string> = {};
      if (formState.hero_title)              heroDataPayload.title              = formState.hero_title;
      if (formState.hero_eyebrow)            heroDataPayload.eyebrow            = formState.hero_eyebrow;
      if (formState.hero_subtitle)           heroDataPayload.subtitle           = formState.hero_subtitle;
      if (formState.hero_subtext)            heroDataPayload.subtext            = formState.hero_subtext;
      if (formState.hero_tagline)            heroDataPayload.tagline            = formState.hero_tagline;
      if (formState.hero_primary_cta_text)   heroDataPayload.primary_cta_text   = formState.hero_primary_cta_text;
      if (formState.hero_secondary_cta_text) heroDataPayload.secondary_cta_text = formState.hero_secondary_cta_text;
      if (formState.hero_secondary_cta_link) heroDataPayload.secondary_cta_link = formState.hero_secondary_cta_link;

      // Parse content_sections JSON editor
      let parsedContentSections: Record<string, any> | undefined;
      if (formState.content_sections_json) {
        try {
          parsedContentSections = JSON.parse(formState.content_sections_json);
        } catch {
          toast.error('Content Sections JSON is invalid. Fix the JSON and try again.');
          setSaving(false);
          return;
        }
      }

      const payload: Partial<StaticPage> = {
        business_id: rootBusiness.id,
        title: formState.title,
        slug: formState.slug || formState.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
        status: (formState.status as 'draft' | 'published'),
        page_type: formState.page_type || 'WebPage',
        content_html: formState.content,
        seo_title: formState.title,
        faq_list: formState.faqs,
        about_entities: formState.about_entities,
        mentions_entities: formState.mentions_entities,
        keyword_cycling_blocks: keywordTerms.length > 0 ? [keywordCyclingBlock] : [],
        ...(Object.keys(heroDataPayload).length > 0 && { hero_data: heroDataPayload }),
        ...(parsedContentSections && { content_sections: parsedContentSections }),
        canonical_url: formState.canonical_url || undefined,
        og_image_url: formState.og_image_url || undefined,
      };

      if (formState.id) {
        await updatePage(formState.id, payload);
      } else {
        await createPage(payload);
      }
      setIsEditing(false);
      resetForm();
      loadData();
    } catch (err: any) {
      toast.error("Failed to save page", err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    const confirmed = await confirm({
      title: "Delete Page",
      message: `Are you sure you want to delete "${title}"? This action cannot be undone.`,
      confirmText: "Delete",
      cancelText: "Cancel",
      variant: "destructive",
    });
    
    if (confirmed) {
      try {
        await deletePage(id);
        toast.success(`Page "${title}" deleted successfully`);
        loadData();
      } catch (err: any) {
        toast.error("Failed to delete page", err.message);
      }
    }
  };

  const handleGenerateCorePages = async () => {
    if (!rootBusiness) { toast.error("No Root Business found."); return; }

    const confirmed = await confirm({
      title: "Generate Core Pages",
      message: "This will generate the following pages if they don't exist:\n\n- About Us\n- Contact Us\n- Privacy Policy\n- Terms of Service\n- Downloads Hub\n- Tools Hub\n- Case Studies Hub\n- Industries Hub\n- Locations Hub\n- Blog Root\n\nContent will be based on your Brand Identity settings. Proceed?",
      confirmText: "Generate Pages",
      cancelText: "Cancel",
      variant: "default",
    });
    
    if (!confirmed) return;

    setGeneratingCore(true);
    try {
      const generatedPages = await generateCorePages(rootBusiness);
      const existingSlugs = new Set(pages.map(p => p.slug));
      
      let createdCount = 0;

      for (const p of generatedPages) {
        if (!existingSlugs.has(p.slug)) {
          // Determine schema type based on key
          let type = 'WebPage';
          if (p.page_key === 'about') type = 'AboutPage';
          if (p.page_key === 'contact') type = 'ContactPage';
          if (['blog_root', 'downloads', 'tools', 'case_studies', 'industries', 'locations'].includes(p.page_key)) type = 'CollectionPage';

          await createPage({
            business_id: rootBusiness.id,
            title: p.title,
            slug: p.slug,
            content_html: p.content_html,
            seo_title: p.title,
            seo_meta_desc: p.seo_meta_desc,
            status: 'draft',
            page_type: type
          });
          createdCount++;
        }
      }

      await loadData();
      toast.success(`Generated ${createdCount} new core pages!`);

    } catch (e: any) {
      toast.error("Generation failed", e.message);
    } finally {
      setGeneratingCore(false);
    }
  };

  const startEdit = (page?: StaticPage) => {
    setActiveTab('content');
    if (page) {
      const pageFaqs = Array.isArray(page.faq_list) 
        ? page.faq_list as { question: string; answer: string }[] 
        : [];

      // Extract keyword cycling data
      const keywordBlocks = Array.isArray(page.keyword_cycling_blocks) 
        ? page.keyword_cycling_blocks as any[] 
        : [];
      const primaryBlock = keywordBlocks[0];
      const prefixText = primaryBlock?.prefix_text || 'We are a';
      const keywordTerms = Array.isArray(primaryBlock?.keywords) 
        ? primaryBlock.keywords.join(', ') 
        : '';

      const heroData = (page.hero_data as any) || {};

      setFormState({
        id: page.id,
        title: page.title,
        slug: page.slug,
        content: page.content_html || '',
        status: page.status,
        page_type: page.page_type || 'WebPage',
        faqs: pageFaqs,
        target_keyword: '',
        custom_head: '',
        about_entities: page.about_entities || [],
        mentions_entities: page.mentions_entities || [],
        keyword_prefix_text: prefixText,
        keyword_terms: keywordTerms,
        hero_title: heroData.title || '',
        hero_eyebrow: heroData.eyebrow || '',
        hero_subtitle: heroData.subtitle || '',
        hero_subtext: heroData.subtext || '',
        hero_tagline: heroData.tagline || '',
        hero_primary_cta_text: heroData.primary_cta_text || '',
        hero_secondary_cta_text: heroData.secondary_cta_text || '',
        hero_secondary_cta_link: heroData.secondary_cta_link || '',
        content_sections_json: page.content_sections ? JSON.stringify(page.content_sections, null, 2) : '',
        canonical_url: page.canonical_url || '',
        og_image_url: page.og_image_url || '',
      });
    } else {
      resetForm();
    }
    setIsEditing(true);
  };

  const resetForm = () => {
    setFormState({
      id: '', title: '', slug: '', content: '', status: 'draft', page_type: 'WebPage', faqs: [], target_keyword: '', custom_head: '', about_entities: [], mentions_entities: [],
      keyword_prefix_text: 'We are a',
      keyword_terms: '',
      hero_title: '',
      hero_eyebrow: '',
      hero_subtitle: '',
      hero_subtext: '',
      hero_tagline: '',
      hero_primary_cta_text: '',
      hero_secondary_cta_text: '',
      hero_secondary_cta_link: '',
      content_sections_json: '',
      canonical_url: '',
      og_image_url: '',
    });
  };

  const getPageContent = () => `Page Title: ${formState.title}\n\nContent:\n${formState.content}`;
  const getAllPagesContent = () => pages.map(p => `Page: ${p.title}\n${p.content_html}`).join('\n---\n');

  if (loading) {
    return (
      <div className="p-6">
        <PageHeaderSkeleton />
        <TableSkeleton rows={5} columns={4} />
      </div>
    );
  }

  // --- EDITOR VIEW ---
  if (isEditing) {
    const brandTheme = rootBusiness?.global_theme as GlobalTheme;

    return (
      <div className="p-6 max-w-5xl mx-auto">
         <div className="flex justify-between items-center mb-6">
           <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => setIsEditing(false)}>
                <ArrowLeft className="h-4 w-4 mr-2" /> Back
              </Button>
              <h2 className="text-2xl font-bold">{formState.id ? 'Edit Page' : 'New Page'}</h2>
           </div>
           {rootBusiness && (
              <EntityGenerator getContent={getPageContent} businessId={rootBusiness.id} sourceName="Page Content" />
           )}
        </div>

         <div className="flex border-b bg-slate-50 mb-4 rounded-t-lg" role="tablist" aria-label="Page settings tabs">
            <button
              id="tab-content"
              role="tab"
              aria-selected={activeTab === 'content'}
              aria-controls="panel-content"
              onClick={() => setActiveTab('content')}
              className={`px-6 py-3 text-sm font-medium border-b-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${activeTab === 'content' ? 'border-primary text-primary' : 'border-transparent text-slate-500'}`}
            >
              Content
            </button>
            <button
              id="tab-semantic"
              role="tab"
              aria-selected={activeTab === 'semantic'}
              aria-controls="panel-semantic"
              onClick={() => setActiveTab('semantic')}
              className={`px-6 py-3 text-sm font-medium border-b-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${activeTab === 'semantic' ? 'border-primary text-primary' : 'border-transparent text-slate-500'}`}
            >
              Semantic Markup
            </button>
            <button
              id="tab-settings"
              role="tab"
              aria-selected={activeTab === 'settings'}
              aria-controls="panel-settings"
              onClick={() => setActiveTab('settings')}
              className={`px-6 py-3 text-sm font-medium border-b-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${activeTab === 'settings' ? 'border-primary text-primary' : 'border-transparent text-slate-500'}`}
            >
              Settings & Head
            </button>
         </div>

         <form onSubmit={handleSave} className="space-y-6 bg-white p-6 rounded-lg border shadow-sm rounded-tr-none">

            {/* CONTENT TAB */}
            <div
              id="panel-content"
              role="tabpanel"
              aria-labelledby="tab-content"
              className={activeTab === 'content' ? 'block' : 'hidden'}
            >
{/* KEYWORD FIRST */}
                <div className="bg-blue-50/50 p-4 rounded border border-blue-100 mb-6">
                   <Label className="text-blue-800 font-semibold mb-1 block">Target Keyword (Primary)</Label>
                   <Input 
                     value={formState.target_keyword}
                     onChange={(e) => setFormState({...formState, target_keyword: e.target.value})}
                     placeholder="Enter Target Keyword for AI Generation (e.g. 'About Our Company')"
                     className="bg-white border-blue-200 focus:ring-blue-500"
                   />
                   {!formState.target_keyword && (
                      <p className="text-xs text-amber-600 mt-2 flex items-center gap-1 font-medium">
                         <AlertTriangle className="h-3 w-3" />
                         No target keyword set. AI generation will be generic.
                      </p>
                   )}
                </div>

                {/* KEYWORD CYCLING SECTION */}
                <div className="mb-6 p-4 bg-gradient-to-r from-rose-50 to-orange-50 rounded-lg border border-rose-200">
                   <h4 className="text-sm font-semibold text-slate-800 flex items-center gap-2 mb-3">
                     <span className="w-6 h-6 bg-rose-500 text-white rounded flex items-center justify-center text-xs font-bold">K</span>
                     Keyword Typewriter (Homepage Hero)
                   </h4>
                   <p className="text-xs text-slate-500 mb-3">
                     Creates animated hero text: <code className="bg-white px-1.5 py-0.5 rounded text-rose-600">[Start] + [keyword1] + [keyword2] +...</code>
                   </p>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div className="space-y-2">
                       <Label className="font-medium">Start of sentence</Label>
                       <Input 
                         value={formState.keyword_prefix_text}
                         onChange={(e) => setFormState({...formState, keyword_prefix_text: e.target.value})}
                         placeholder="We are a"
                         className="bg-white"
                       />
                       <p className="text-xs text-slate-400">e.g., "We are a", "pomegranate is your", "Grow with"</p>
                     </div>
                     <div className="md:col-span-2 space-y-2">
                       <Label className="font-medium">Keywords <span className="text-slate-400 font-normal">(comma-separated)</span></Label>
                       <Input
                         value={formState.keyword_terms}
                         onChange={(e) => setFormState({...formState, keyword_terms: e.target.value})}
                         placeholder="seo agency, digital performance team, search engine optimisation company"
                         className="bg-white"
                       />
                       <p className="text-xs text-slate-400">Each keyword will cycle through in the hero section. Add 2-5 keywords for best effect.</p>
                     </div>
                   </div>
                   {formState.keyword_terms && (
                     <div className="mt-3 p-3 bg-white rounded border border-slate-200">
                       <p className="text-xs text-slate-500 mb-1">Preview:</p>
                       <p className="text-lg font-semibold text-slate-800">
                         {formState.keyword_prefix_text || 'We are a'}{' '}
                         <span className="text-rose-500">
                           {formState.keyword_terms.split(',').map(k => k.trim()).filter(Boolean).join('</span>, <span className="text-rose-500">')}
                         </span>
                       </p>
                     </div>
                   )}
                </div>

               {/* HERO FIELDS */}
               <div className="bg-gradient-to-r from-rose-50 to-orange-50 p-4 rounded-lg border border-rose-200 mb-6">
                 <h4 className="text-sm font-semibold text-slate-800 flex items-center gap-2 mb-3">
                   <span className="w-6 h-6 bg-rose-500 text-white rounded flex items-center justify-center text-xs font-bold">H</span>
                   Hero Section
                 </h4>
                 <p className="text-xs text-slate-500 mb-3">
                   All hero section fields. Fill only the ones your page uses — empty fields are ignored on save.
                 </p>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div className="space-y-1">
                     <Label className="text-xs">Eyebrow / Label <span className="text-slate-400">(contact, about)</span></Label>
                     <Input
                       value={formState.hero_eyebrow}
                       onChange={e => setFormState({ ...formState, hero_eyebrow: e.target.value })}
                       placeholder="pomegranate marketing"
                       className="bg-white text-sm"
                     />
                   </div>
                   <div className="space-y-1 md:col-span-2">
                     <Label className="text-xs">Hero Title (H1) <span className="text-slate-400">(all pages)</span></Label>
                     <Input
                       value={formState.hero_title}
                       onChange={e => setFormState({ ...formState, hero_title: e.target.value })}
                       placeholder="Main page heading..."
                       className="bg-white text-sm"
                     />
                   </div>
                   <div className="space-y-1 md:col-span-2">
                     <Label className="text-xs">Subtitle <span className="text-slate-400">(contact, about — line directly under title)</span></Label>
                     <Input
                       value={formState.hero_subtitle}
                       onChange={e => setFormState({ ...formState, hero_subtitle: e.target.value })}
                       placeholder="Supporting line below the main heading..."
                       className="bg-white text-sm"
                     />
                   </div>
                   <div className="space-y-1 md:col-span-2">
                     <Label className="text-xs">Subtext <span className="text-slate-400">(home — e.g. "We take small businesses from darkness to light.")</span></Label>
                     <Input
                       value={formState.hero_subtext}
                       onChange={e => setFormState({ ...formState, hero_subtext: e.target.value })}
                       placeholder="We take small businesses from darkness to light."
                       className="bg-white text-sm"
                     />
                   </div>
                   <div className="space-y-1 md:col-span-2">
                     <Label className="text-xs">Tagline <span className="text-slate-400">(home — small line below subtext)</span></Label>
                     <Input
                       value={formState.hero_tagline}
                       onChange={e => setFormState({ ...formState, hero_tagline: e.target.value })}
                       placeholder="AI agents are here now but don't worry; we speak their language."
                       className="bg-white text-sm"
                     />
                   </div>
                   <div className="space-y-1">
                     <Label className="text-xs">Primary CTA Text <span className="text-slate-400">(home)</span></Label>
                     <Input
                       value={formState.hero_primary_cta_text}
                       onChange={e => setFormState({ ...formState, hero_primary_cta_text: e.target.value })}
                       placeholder="Begin Seeding"
                       className="bg-white text-sm"
                     />
                   </div>
                   <div className="space-y-1">
                     <Label className="text-xs">Secondary CTA Text <span className="text-slate-400">(home)</span></Label>
                     <Input
                       value={formState.hero_secondary_cta_text}
                       onChange={e => setFormState({ ...formState, hero_secondary_cta_text: e.target.value })}
                       placeholder="FREE SEO TOOLS"
                       className="bg-white text-sm"
                     />
                   </div>
                   <div className="space-y-1 md:col-span-2">
                     <Label className="text-xs">Secondary CTA Link <span className="text-slate-400">(home)</span></Label>
                     <Input
                       value={formState.hero_secondary_cta_link}
                       onChange={e => setFormState({ ...formState, hero_secondary_cta_link: e.target.value })}
                       placeholder="/free-tools"
                       className="bg-white text-sm"
                     />
                   </div>
                 </div>
               </div>

               {/* CONTENT SECTIONS JSON EDITOR */}
               <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 mb-6">
                 <h4 className="text-sm font-semibold text-slate-800 flex items-center gap-2 mb-2">
                   <span className="w-6 h-6 bg-slate-600 text-white rounded flex items-center justify-center text-xs font-bold">C</span>
                   Content Sections
                 </h4>
                 <p className="text-xs text-slate-500 mb-3">
                   All page body content (services, who we are, contact details, mission, values, timeline, etc.) stored as JSON.
                   Edit carefully — must be valid JSON. Changes here update what's displayed on the live website.
                 </p>
                 <textarea
                   value={formState.content_sections_json}
                   onChange={e => setFormState({ ...formState, content_sections_json: e.target.value })}
                   className="w-full h-64 font-mono text-xs bg-white border border-slate-300 rounded p-3 resize-y focus:outline-none focus:ring-2 focus:ring-rose-400"
                   placeholder="{}"
                   spellCheck={false}
                 />
                 <p className="text-xs text-amber-600 mt-1">⚠ Invalid JSON will block saving. Use a JSON validator if unsure.</p>
               </div>

               <div className="space-y-6">
                   <div className="space-y-2">
                     <div className="flex justify-between">
                       <Label>Page Title</Label>
                       <AITextGenerator 
                          onGenerate={t => setFormState({...formState, title: t})}
                          fieldName="Page Title"
                          keyword={formState.target_keyword}
                          currentValue={formState.title}
                          brandTheme={brandTheme}
                       />
                     </div>
                     <Input 
                       value={formState.title} 
                       onChange={e => setFormState({...formState, title: e.target.value})} 
                       placeholder="e.g. About Us"
                       required
                     />
                   </div>

                   <div className="space-y-2">
                     <Label>Page Content (Visual Builder)</Label>
                     <VisualContentEditor 
                        value={formState.content}
                        onChange={(val) => setFormState({...formState, content: val})}
                        minHeight="min-h-[500px]"
                        brandTheme={brandTheme}
                        keyword={formState.target_keyword}
                     />
                   </div>
               </div>
           </div>

            {/* SEMANTIC TAB */}
            <div
              id="panel-semantic"
              role="tabpanel"
              aria-labelledby="tab-semantic"
              className={activeTab === 'semantic' ? 'block' : 'hidden'}
            >
                <div className="space-y-6">
                    {/* FAQ Editor Section */}
                    <FAQEditor
                      value={formState.faqs}
                      onChange={(faqs) => setFormState({...formState, faqs: faqs})}
                      sourceText={formState.content}
                    />
                   
                   <div className="grid grid-cols-2 gap-6">
                      <KnowledgeEntitySelector 
                         label="About Entities"
                         allEntities={knowledgeEntities}
                         selectedIds={formState.about_entities}
                         onChange={(ids) => setFormState({...formState, about_entities: ids})}
                         contentToScan={getPageContent()}
                      />
                      <KnowledgeEntitySelector 
                         label="Mentioned Entities"
                         allEntities={knowledgeEntities}
                         selectedIds={formState.mentions_entities}
                         onChange={(ids) => setFormState({...formState, mentions_entities: ids})}
                         contentToScan={getPageContent()}
                      />
                   </div>
               </div>
           </div>

            {/* SETTINGS TAB */}
            <div
              id="panel-settings"
              role="tabpanel"
              aria-labelledby="tab-settings"
              className={activeTab === 'settings' ? 'block' : 'hidden'}
            >
                <div className="grid grid-cols-2 gap-6 mb-6">
                  <div className="space-y-2">
                    <Label>URL Slug</Label>
                    <Input 
                      value={formState.slug} 
                      onChange={e => setFormState({...formState, slug: e.target.value})} 
                      placeholder="about-us"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <select 
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        value={formState.status}
                        onChange={e => setFormState({...formState, status: e.target.value})}
                      >
                        <option value="draft">Draft</option>
                        <option value="published">Published</option>
                      </select>
                  </div>
<div className="space-y-2">
                     <Label>Schema.org Page Type</Label>
                      <select 
                       className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                       value={formState.page_type}
                       onChange={e => setFormState({...formState, page_type: e.target.value})}
                     >
                       {SCHEMA_PAGE_TYPES.map(type => (
                         <option key={type} value={type}>{type}</option>
                       ))}
                     </select>
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-6 mb-6">
                   <div className="space-y-2">
                     <Label>Canonical URL</Label>
                     <Input 
                       value={formState.canonical_url} 
                       onChange={e => setFormState({...formState, canonical_url: e.target.value})} 
                       placeholder="https://example.com/page"
                     />
                   </div>
                   <div className="space-y-2">
                     <Label>Open Graph Image URL</Label>
                     <Input 
                       value={formState.og_image_url} 
                       onChange={e => setFormState({...formState, og_image_url: e.target.value})} 
                       placeholder="https://example.com/og-image.jpg"
                     />
                   </div>
                </div>

               <div className="space-y-2">
                 <Label className="flex items-center gap-2">
                    <Code className="h-4 w-4 text-slate-500" />
                    Custom &lt;head&gt; Code
                 </Label>
                 <Textarea 
                    value={formState.custom_head}
                    onChange={e => setFormState({...formState, custom_head: e.target.value})}
                    placeholder="<script>...</script> or <meta name='...'>" 
                    className="font-mono text-xs h-32 bg-slate-50"
                 />
                 <p className="text-xs text-amber-600">Note: This code is currently UI-only and may not persist without database schema updates.</p>
              </div>
           </div>

           <div className="flex justify-end pt-4 border-t">
             <Button type="submit" disabled={saving}>
               {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
               Save Page
             </Button>
           </div>
        </form>
      </div>
    );
  }

  // --- LIST VIEW ---
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Static Pages</h1>
          <p className="text-slate-500 mt-2">
            Manage core website pages (Home, About, Contact, Policies). 
          </p>
        </div>
        <div className="flex gap-2">
           {rootBusiness && pages.length > 0 && (
              <EntityGenerator 
                 getContent={getAllPagesContent} 
                 businessId={rootBusiness.id} 
                 sourceName="All Static Pages" 
              />
           )}
           <Button 
             onClick={handleGenerateCorePages} 
             variant="secondary" 
             disabled={generatingCore}
             className="bg-purple-100 text-purple-700 hover:bg-purple-200 border border-purple-300"
           >
             {generatingCore ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Sparkles className="h-4 w-4 mr-2" />}
             Auto-Generate Core Pages
           </Button>
           <Button onClick={() => startEdit()}>
             <Plus className="h-4 w-4 mr-2" /> Add Page
           </Button>
        </div>
      </div>

      {pages.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed rounded-lg bg-slate-50">
          <Layers className="h-12 w-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900">No pages yet</h3>
          <p className="text-slate-500 mb-6">Create your first static page (e.g., ContactPage).</p>
          <div className="flex justify-center gap-4">
             <Button onClick={() => startEdit()}>Create Page</Button>
             <Button variant="outline" onClick={handleGenerateCorePages}>Auto-Generate Defaults</Button>
          </div>
        </div>
      ) : (
        <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 border-b font-medium text-slate-500">
              <tr>
                <th className="px-6 py-4">Title</th>
                <th className="px-6 py-4">Slug</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {pages.map((page) => (
                <tr key={page.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-900">{page.title}</td>
                  <td className="px-6 py-4 text-slate-500 font-mono text-xs">/{page.slug}</td>
                  <td className="px-6 py-4 text-slate-500 text-xs uppercase">{page.page_type}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${
                      page.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {page.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => startEdit(page)} aria-label={`Edit ${page.title}`}>
                         <Edit2 className="h-4 w-4 text-slate-500" aria-hidden="true" />
                      </Button>
                       <Button variant="ghost" size="icon" onClick={() => handleDelete(page.id, page.title)} className="text-red-500 hover:bg-red-50" aria-label={`Delete ${page.title}`}>
                         <Trash2 className="h-4 w-4" aria-hidden="true" />
                      </Button>
                  </td>
                </tr>
              ))}
             </tbody>
           </table>
         </div>
       )}
       <ConfirmDialog />
     </div>
   );
 }
