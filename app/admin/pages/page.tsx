
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
  const [activeTab, setActiveTab] = useState<'content' | 'homepage' | 'semantic' | 'settings'>('content');
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
    // Homepage CMS fields
    stats_json: '',
    featured_tools_json: '',
    blog_section_title: '',
    // 404 page fields
    not_found_heading: '',
    not_found_subheading: '',
    not_found_cta_text: '',
    not_found_cta_url: '',
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

      // Parse stats JSON
      let parsedStats: any[] | undefined;
      if (formState.stats_json) {
        try {
          parsedStats = JSON.parse(formState.stats_json);
        } catch {
          toast.error('Stats JSON is invalid. Fix the JSON and try again.');
          setSaving(false);
          return;
        }
      }

      // Parse featured_tools JSON
      let parsedFeaturedTools: any[] | undefined;
      if (formState.featured_tools_json) {
        try {
          parsedFeaturedTools = JSON.parse(formState.featured_tools_json);
        } catch {
          toast.error('Featured Tools JSON is invalid. Fix the JSON and try again.');
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
        ...(parsedStats && { stats: parsedStats }),
        ...(parsedFeaturedTools && { featured_tools: parsedFeaturedTools }),
        blog_section_title: formState.blog_section_title || undefined,
        heading: formState.not_found_heading || undefined,
        subheading: formState.not_found_subheading || undefined,
        cta_text: formState.not_found_cta_text || undefined,
        cta_url: formState.not_found_cta_url || undefined,
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
        stats_json: page.stats ? JSON.stringify(page.stats, null, 2) : '',
        featured_tools_json: page.featured_tools ? JSON.stringify(page.featured_tools, null, 2) : '',
        blog_section_title: page.blog_section_title || '',
        not_found_heading: page.heading || '',
        not_found_subheading: page.subheading || '',
        not_found_cta_text: page.cta_text || '',
        not_found_cta_url: page.cta_url || '',
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
      stats_json: '',
      featured_tools_json: '',
      blog_section_title: '',
      not_found_heading: '',
      not_found_subheading: '',
      not_found_cta_text: '',
      not_found_cta_url: '',
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

         <div className="flex border-b bg-muted mb-4 rounded-t-lg" role="tablist" aria-label="Page settings tabs">
             <button
               id="tab-content"
               role="tab"
               aria-selected={activeTab === 'content'}
               aria-controls="panel-content"
               onClick={() => setActiveTab('content')}
               className={`px-6 py-3 text-sm font-medium border-b-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${activeTab === 'content' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground'}`}
             >
               Content
             </button>
             <button
               id="tab-homepage"
               role="tab"
               aria-selected={activeTab === 'homepage'}
               aria-controls="panel-homepage"
               onClick={() => setActiveTab('homepage')}
               className={`px-6 py-3 text-sm font-medium border-b-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${activeTab === 'homepage' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground'}`}
             >
               Homepage CMS
             </button>
             <button
               id="tab-semantic"
               role="tab"
               aria-selected={activeTab === 'semantic'}
               aria-controls="panel-semantic"
               onClick={() => setActiveTab('semantic')}
               className={`px-6 py-3 text-sm font-medium border-b-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${activeTab === 'semantic' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground'}`}
             >
               Semantic Markup
             </button>
             <button
               id="tab-settings"
               role="tab"
               aria-selected={activeTab === 'settings'}
               aria-controls="panel-settings"
               onClick={() => setActiveTab('settings')}
               className={`px-6 py-3 text-sm font-medium border-b-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${activeTab === 'settings' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground'}`}
             >
               Settings & Head
             </button>
          </div>

         <form onSubmit={handleSave} className="space-y-6 bg-card p-6 rounded-lg border shadow-sm rounded-tr-none">

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
                     className="bg-background border-blue-200 focus:ring-blue-500"
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
<h4 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
                      <span className="w-6 h-6 bg-rose-500 text-white rounded flex items-center justify-center text-xs font-bold">K</span>
                      Keyword Typewriter (Homepage Hero)
                    </h4>
                    <p className="text-xs text-muted-foreground mb-3">
                      Creates animated hero text: <code className="bg-background px-1.5 py-0.5 rounded text-rose-600">[Start] + [keyword1] + [keyword2] +...</code>
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="font-medium">Start of sentence</Label>
                        <Input 
                          value={formState.keyword_prefix_text}
                          onChange={(e) => setFormState({...formState, keyword_prefix_text: e.target.value})}
                          placeholder="We are a"
                          className="bg-background"
                        />
                        <p className="text-xs text-muted-foreground">e.g., "We are a", "pomegranate is your", "Grow with"</p>
                      </div>
                      <div className="md:col-span-2 space-y-2">
                        <Label className="font-medium">Keywords <span className="text-muted-foreground font-normal">(comma-separated)</span></Label>
                        <Input
                          value={formState.keyword_terms}
                          onChange={(e) => setFormState({...formState, keyword_terms: e.target.value})}
                          placeholder="seo agency, digital performance team, search engine optimisation company"
                          className="bg-background"
                        />
                        <p className="text-xs text-muted-foreground">Each keyword will cycle through in the hero section. Add 2-5 keywords for best effect.</p>
                      </div>
                    </div>
                    {formState.keyword_terms && (
                      <div className="mt-3 p-3 bg-background rounded border border-border">
                        <p className="text-xs text-muted-foreground mb-1">Preview:</p>
                        <p className="text-lg font-semibold text-foreground">
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
<h4 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
                    <span className="w-6 h-6 bg-rose-500 text-white rounded flex items-center justify-center text-xs font-bold">H</span>
                    Hero Section
                  </h4>
                  <p className="text-xs text-muted-foreground mb-3">
                    All hero section fields. Fill only the ones your page uses — empty fields are ignored on save.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label className="text-xs">Eyebrow / Label <span className="text-muted-foreground">(contact, about)</span></Label>
                      <Input
                        value={formState.hero_eyebrow}
                        onChange={e => setFormState({ ...formState, hero_eyebrow: e.target.value })}
                        placeholder="pomegranate marketing"
                        className="bg-background text-sm"
                      />
                    </div>
                    <div className="space-y-1 md:col-span-2">
                      <Label className="text-xs">Hero Title (H1) <span className="text-muted-foreground">(all pages)</span></Label>
                      <Input
                        value={formState.hero_title}
                        onChange={e => setFormState({ ...formState, hero_title: e.target.value })}
                        placeholder="Main page heading..."
                        className="bg-background text-sm"
                      />
                    </div>
                    <div className="space-y-1 md:col-span-2">
                      <Label className="text-xs">Subtitle <span className="text-muted-foreground">(contact, about — line directly under title)</span></Label>
                      <Input
                        value={formState.hero_subtitle}
                        onChange={e => setFormState({ ...formState, hero_subtitle: e.target.value })}
                        placeholder="Supporting line below the main heading..."
                        className="bg-background text-sm"
                      />
                    </div>
                    <div className="space-y-1 md:col-span-2">
                      <Label className="text-xs">Subtext <span className="text-muted-foreground">(home — e.g. "We take small businesses from darkness to light.")</span></Label>
                      <Input
                        value={formState.hero_subtext}
                        onChange={e => setFormState({ ...formState, hero_subtext: e.target.value })}
                        placeholder="We take small businesses from darkness to light."
                        className="bg-background text-sm"
                      />
                    </div>
                    <div className="space-y-1 md:col-span-2">
                      <Label className="text-xs">Tagline <span className="text-muted-foreground">(home — small line below subtext)</span></Label>
                      <Input
                        value={formState.hero_tagline}
                        onChange={e => setFormState({ ...formState, hero_tagline: e.target.value })}
                        placeholder="AI agents are here now but don't worry; we speak their language."
                        className="bg-background text-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Primary CTA Text <span className="text-muted-foreground">(home)</span></Label>
                      <Input
                        value={formState.hero_primary_cta_text}
                        onChange={e => setFormState({ ...formState, hero_primary_cta_text: e.target.value })}
                        placeholder="Begin Seeding"
                        className="bg-background text-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Secondary CTA Text <span className="text-muted-foreground">(home)</span></Label>
                      <Input
                        value={formState.hero_secondary_cta_text}
                        onChange={e => setFormState({ ...formState, hero_secondary_cta_text: e.target.value })}
                        placeholder="FREE SEO TOOLS"
                        className="bg-background text-sm"
                      />
                    </div>
                    <div className="space-y-1 md:col-span-2">
                      <Label className="text-xs">Secondary CTA Link <span className="text-muted-foreground">(home)</span></Label>
                      <Input
                        value={formState.hero_secondary_cta_link}
                        onChange={e => setFormState({ ...formState, hero_secondary_cta_link: e.target.value })}
                        placeholder="/free-tools"
                        className="bg-background text-sm"
                      />
</div>
                  </div>
                </div>

                {/* CONTENT SECTIONS JSON EDITOR */}
                <div className="bg-muted p-4 rounded-lg border border-border mb-6">
                  <h4 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-2">
                    <span className="w-6 h-6 bg-muted-foreground/50 text-white rounded flex items-center justify-center text-xs font-bold">C</span>
                    Content Sections
                  </h4>
                  <p className="text-xs text-muted-foreground mb-3">
                    All page body content (services, who we are, contact details, mission, values, timeline, etc.) stored as JSON.
                    Edit carefully — must be valid JSON. Changes here update what's displayed on the live website.
                  </p>
                  <textarea
                    value={formState.content_sections_json}
                    onChange={e => setFormState({ ...formState, content_sections_json: e.target.value })}
                    className="w-full h-64 font-mono text-xs bg-background border border-border rounded p-3 resize-y focus:outline-none focus:ring-2 focus:ring-rose-400"
                    placeholder="{}"
                    spellCheck={false}
                  />
                  <p className="text-xs text-amber-600 mt-1">Invalid JSON will block saving. Use a JSON validator if unsure.</p>
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

            {/* HOMEPAGE CMS TAB */}
            <div
              id="panel-homepage"
              role="tabpanel"
              aria-labelledby="tab-homepage"
              className={activeTab === 'homepage' ? 'block' : 'hidden'}
            >
                <div className="space-y-6">
                    {/* Stats Section */}
                    <div className="bg-green-50/50 p-4 rounded-lg border border-green-200">
                      <h4 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
                        <span className="w-6 h-6 bg-green-500 text-white rounded flex items-center justify-center text-xs font-bold">S</span>
                        Stats Bar (Homepage)
                      </h4>
                      <p className="text-xs text-muted-foreground mb-3">
                        JSON array of stats to display on the homepage. Format: {"[{\"label\": \"Years in Business\", \"value\": \"7\", \"suffix\": \"+\"}]"}.
                      </p>
                      <textarea
                        value={formState.stats_json}
                        onChange={e => setFormState({ ...formState, stats_json: e.target.value })}
                        className="w-full h-32 font-mono text-xs bg-background border border-border rounded p-3 resize-y focus:outline-none focus:ring-2 focus:ring-green-400"
                        placeholder='[{"label": "Years in Business", "value": "7", "suffix": "+"}, {"label": "Happy Clients", "value": "150", "suffix": "+"}]'
                        spellCheck={false}
                      />
                    </div>

                    {/* Featured Tools Section */}
                    <div className="bg-purple-50/50 p-4 rounded-lg border border-purple-200">
                      <h4 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
                        <span className="w-6 h-6 bg-purple-500 text-white rounded flex items-center justify-center text-xs font-bold">T</span>
                        Featured Tools (Homepage)
                      </h4>
                      <p className="text-xs text-muted-foreground mb-3">
                        JSON array of featured tools to display on the homepage Growth Toolbox section.
                      </p>
                      <textarea
                        value={formState.featured_tools_json}
                        onChange={e => setFormState({ ...formState, featured_tools_json: e.target.value })}
                        className="w-full h-40 font-mono text-xs bg-background border border-border rounded p-3 resize-y focus:outline-none focus:ring-2 focus:ring-purple-400"
                        placeholder='[{"title": "Site Speed Audit", "description": "Deep-dive into Core Web Vitals...", "href": "/free-tools/free-site-speed-test", "icon": "Activity"}]'
                        spellCheck={false}
                      />
                    </div>

                    {/* Blog Section Title */}
                    <div className="bg-amber-50/50 p-4 rounded-lg border border-amber-200">
                      <h4 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
                        <span className="w-6 h-6 bg-amber-500 text-white rounded flex items-center justify-center text-xs font-bold">B</span>
                        Blog Section Title (Homepage)
                      </h4>
                      <p className="text-xs text-muted-foreground mb-3">
                        The heading text for the "Recent from the Blog" section on the homepage.
                      </p>
                      <Input
                        value={formState.blog_section_title}
                        onChange={e => setFormState({ ...formState, blog_section_title: e.target.value })}
                        placeholder="e.g. Recent from the Blog"
                        className="bg-background"
                      />
                    </div>

                    {/* 404 Page Content */}
                    <div className="bg-red-50/50 p-4 rounded-lg border border-red-200">
                      <h4 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
                        <span className="w-6 h-6 bg-red-500 text-white rounded flex items-center justify-center text-xs font-bold">4</span>
                        404 Page Content
                      </h4>
                      <p className="text-xs text-muted-foreground mb-3">
                        Customize the 404 (Page Not Found) error page content. Edit the '404' slug page to see changes.
                      </p>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <Label className="text-xs">Heading</Label>
                            <Input
                              value={formState.not_found_heading}
                              onChange={e => setFormState({ ...formState, not_found_heading: e.target.value })}
                              placeholder="e.g. Looks like you've wandered off..."
                              className="bg-background"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Subheading</Label>
                            <Input
                              value={formState.not_found_subheading}
                              onChange={e => setFormState({ ...formState, not_found_subheading: e.target.value })}
                              placeholder="e.g. Even the best seeds need redirection..."
                              className="bg-background"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <Label className="text-xs">CTA Button Text</Label>
                            <Input
                              value={formState.not_found_cta_text}
                              onChange={e => setFormState({ ...formState, not_found_cta_text: e.target.value })}
                              placeholder="e.g. Return To The Path"
                              className="bg-background"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">CTA Button URL</Label>
                            <Input
                              value={formState.not_found_cta_url}
                              onChange={e => setFormState({ ...formState, not_found_cta_url: e.target.value })}
                              placeholder="e.g. /"
                              className="bg-background"
                            />
                          </div>
                        </div>
                      </div>
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
<Code className="h-4 w-4 text-muted-foreground" />
                     Custom &lt;head&gt; Code
                  </Label>
                  <Textarea 
                     value={formState.custom_head}
                     onChange={e => setFormState({...formState, custom_head: e.target.value})}
                     placeholder="<script>...</script> or <meta name='...'>" 
                     className="font-mono text-xs h-32 bg-muted"
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
          <p className="text-muted-foreground mt-2">
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
        <div className="text-center py-12 border-2 border-dashed rounded-lg bg-muted">
           <Layers className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
           <h3 className="text-lg font-medium text-foreground">No pages yet</h3>
           <p className="text-muted-foreground mb-6">Create your first static page (e.g., ContactPage).</p>
           <div className="flex justify-center gap-4">
              <Button onClick={() => startEdit()}>Create Page</Button>
              <Button variant="outline" onClick={handleGenerateCorePages}>Auto-Generate Defaults</Button>
           </div>
        </div>
      ) : (
        <div className="bg-card border rounded-lg shadow-sm overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted border-b font-medium text-muted-foreground">
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
                <tr key={page.id} className="hover:bg-muted/50 transition-colors">
                   <td className="px-6 py-4 font-medium text-foreground">{page.title}</td>
                   <td className="px-6 py-4 text-muted-foreground font-mono text-xs">/{page.slug}</td>
                   <td className="px-6 py-4 text-muted-foreground text-xs uppercase">{page.page_type}</td>
                   <td className="px-6 py-4">
                     <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${
                       page.status === 'published' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                     }`}>
                       {page.status}
                     </span>
                   </td>
                   <td className="px-6 py-4 text-right flex justify-end gap-2">
                       <Button variant="ghost" size="icon" onClick={() => startEdit(page)} aria-label={`Edit ${page.title}`}>
                          <Edit2 className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                       </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(page.id, page.title)} className="text-red-500 hover:bg-red-50 dark:hover:bg-red-950" aria-label={`Delete ${page.title}`}>
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
