
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
    mentions_entities: [] as string[]
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
    if (!rootBusiness) return alert("No Root Business found.");

    setSaving(true);
    try {
      const payload: Partial<StaticPage> = {
        business_id: rootBusiness.id,
        title: formState.title,
        slug: formState.slug || formState.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
        status: (formState.status as 'draft' | 'published'),
        page_type: formState.page_type || 'WebPage',
        content_html: formState.content, 
        seo_title: formState.title, 
        faqs: formState.faqs,
        about_entities: formState.about_entities,
        mentions_entities: formState.mentions_entities
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
      alert("Failed to save page: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Delete this page? This cannot be undone.")) {
      try {
        await deletePage(id);
        loadData();
      } catch (err: any) {
        alert("Failed to delete page: " + err.message);
      }
    }
  };

  const handleGenerateCorePages = async () => {
    if (!rootBusiness) return alert("No Root Business found.");
    
    const confirmMsg = "This will generate the following pages if they don't exist:\n\n- About Us\n- Contact Us\n- Privacy Policy\n- Terms of Service\n- Downloads Hub\n- Tools Hub\n- Case Studies Hub\n- Industries Hub\n- Locations Hub\n- Blog Root\n\nContent will be based on your Brand Identity settings. Proceed?";
    
    if (!confirm(confirmMsg)) return;

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
      alert(`Success! Generated ${createdCount} new core pages.`);

    } catch (e: any) {
      alert("Generation failed: " + e.message);
    } finally {
      setGeneratingCore(false);
    }
  };

  const startEdit = (page?: StaticPage) => {
    setActiveTab('content');
    if (page) {
      const pageFaqs = Array.isArray(page.faqs) 
        ? page.faqs as { question: string; answer: string }[] 
        : [];

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
        mentions_entities: page.mentions_entities || []
      });
    } else {
      resetForm();
    }
    setIsEditing(true);
  };

  const resetForm = () => {
    setFormState({ 
      id: '', title: '', slug: '', content: '', status: 'draft', page_type: 'WebPage', faqs: [], target_keyword: '', custom_head: '', about_entities: [], mentions_entities: []
    });
  };

  const getPageContent = () => `Page Title: ${formState.title}\n\nContent:\n${formState.content}`;
  const getAllPagesContent = () => pages.map(p => `Page: ${p.title}\n${p.content_html}`).join('\n---\n');

  if (loading) return <div className="p-12 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto text-slate-400"/></div>;

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

        <div className="flex border-b bg-slate-50 mb-4 rounded-t-lg">
           <button onClick={() => setActiveTab('content')} className={`px-6 py-3 text-sm font-medium border-b-2 ${activeTab === 'content' ? 'border-primary text-primary' : 'border-transparent text-slate-500'}`}>Content</button>
           <button onClick={() => setActiveTab('semantic')} className={`px-6 py-3 text-sm font-medium border-b-2 ${activeTab === 'semantic' ? 'border-primary text-primary' : 'border-transparent text-slate-500'}`}>Semantic Markup</button>
           <button onClick={() => setActiveTab('settings')} className={`px-6 py-3 text-sm font-medium border-b-2 ${activeTab === 'settings' ? 'border-primary text-primary' : 'border-transparent text-slate-500'}`}>Settings & Head</button>
        </div>

        <form onSubmit={handleSave} className="space-y-6 bg-white p-6 rounded-lg border shadow-sm rounded-tr-none">
           
           {/* CONTENT TAB */}
           <div className={activeTab === 'content' ? 'block' : 'hidden'}>
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
           <div className={activeTab === 'semantic' ? 'block' : 'hidden'}>
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
           <div className={activeTab === 'settings' ? 'block' : 'hidden'}>
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
                     <Button variant="ghost" size="icon" onClick={() => startEdit(page)}>
                        <Edit2 className="h-4 w-4 text-slate-500" />
                     </Button>
                     <Button variant="ghost" size="icon" onClick={() => handleDelete(page.id)} className="text-red-500 hover:bg-red-50">
                        <Trash2 className="h-4 w-4" />
                     </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
