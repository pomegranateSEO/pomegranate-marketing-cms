import React, { useEffect, useState } from 'react';
import { Layers, Plus, Loader2, Edit2, Trash2, Save, ArrowLeft } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { fetchBusinesses } from '../../../lib/db/businesses';
import { fetchPages, createPage, updatePage, deletePage } from '../../../lib/db/pages';
import type { StaticPage } from '../../../lib/types';
import { EntityGenerator } from '../../../components/shared/EntityGenerator';
import { VisualContentEditor } from '../../../components/shared/VisualContentEditor';
import { FAQEditor } from '../../../components/shared/FAQEditor';

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
  const [rootBusinessId, setRootBusinessId] = useState<string | null>(null);
  const [pages, setPages] = useState<StaticPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Form State
  const [formState, setFormState] = useState({
    id: '',
    title: '',
    slug: '',
    content: '',
    status: 'draft',
    page_type: 'WebPage',
    faqs: [] as { question: string; answer: string }[]
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [pagesData, businessesData] = await Promise.all([
        fetchPages(),
        fetchBusinesses()
      ]);
      setPages(pagesData);
      if (businessesData.length > 0) setRootBusinessId(businessesData[0].id);
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
    if (!rootBusinessId) return alert("No Root Business found.");

    setSaving(true);
    try {
      // Map UI state to DB Schema
      const payload: Partial<StaticPage> = {
        business_id: rootBusinessId,
        title: formState.title,
        slug: formState.slug || formState.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
        status: (formState.status as 'draft' | 'published'),
        page_type: formState.page_type || 'WebPage',
        content_html: formState.content, // Map content to content_html column
        seo_title: formState.title, // Default SEO title to page title
        faqs: formState.faqs // Maps to 'faqs' jsonb column
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

  const startEdit = (page?: StaticPage) => {
    if (page) {
      const pageFaqs = Array.isArray(page.faqs) 
        ? page.faqs as { question: string; answer: string }[] 
        : [];

      setFormState({
        id: page.id,
        title: page.title,
        slug: page.slug,
        content: page.content_html || '', // Load content_html into content field
        status: page.status,
        page_type: page.page_type || 'WebPage',
        faqs: pageFaqs
      });
    } else {
      resetForm();
    }
    setIsEditing(true);
  };

  const resetForm = () => {
    setFormState({ 
      id: '', title: '', slug: '', content: '', status: 'draft', page_type: 'WebPage', faqs: [] 
    });
  };

  // Content for Entity Generator
  const getPageContent = () => `Page Title: ${formState.title}\n\nContent:\n${formState.content}`;
  const getAllPagesContent = () => pages.map(p => `Page: ${p.title}\n${p.content_html}`).join('\n---\n');

  if (loading) return <div className="p-12 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto text-slate-400"/></div>;

  // --- EDITOR VIEW ---
  if (isEditing) {
    return (
      <div className="p-6 max-w-5xl mx-auto">
         <div className="flex justify-between items-center mb-6">
           <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => setIsEditing(false)}>
                <ArrowLeft className="h-4 w-4 mr-2" /> Back
              </Button>
              <h2 className="text-2xl font-bold">{formState.id ? 'Edit Page' : 'New Page'}</h2>
           </div>
           {rootBusinessId && (
              <EntityGenerator getContent={getPageContent} businessId={rootBusinessId} sourceName="Page Content" />
           )}
        </div>

        <form onSubmit={handleSave} className="space-y-6 bg-white p-6 rounded-lg border shadow-sm">
           <div className="grid grid-cols-2 gap-4">
             <div className="space-y-2">
               <Label>Page Title</Label>
               <Input 
                 value={formState.title} 
                 onChange={e => setFormState({...formState, title: e.target.value})} 
                 placeholder="e.g. About Us"
                 required
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
           </div>

           <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>URL Slug</Label>
                <Input 
                  value={formState.slug} 
                  onChange={e => setFormState({...formState, slug: e.target.value})} 
                  placeholder="about-us"
                />
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
             <Label>Page Content (Visual Builder)</Label>
             <VisualContentEditor 
                value={formState.content}
                onChange={(val) => setFormState({...formState, content: val})}
                minHeight="min-h-[500px]"
             />
           </div>

           {/* FAQ Editor Section */}
           <div className="pt-2">
             <FAQEditor 
               value={formState.faqs}
               onChange={(faqs) => setFormState({...formState, faqs: faqs})}
               sourceText={formState.content}
             />
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
           {rootBusinessId && pages.length > 0 && (
              <EntityGenerator 
                 getContent={getAllPagesContent} 
                 businessId={rootBusinessId} 
                 sourceName="All Static Pages" 
              />
           )}
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
          <Button onClick={() => startEdit()}>Create Page</Button>
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
