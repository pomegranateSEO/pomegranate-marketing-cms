
import React, { useEffect, useState } from 'react';
import { Factory, Plus, Loader2, Edit2, Trash2, Save, ArrowLeft } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Textarea } from '../../../components/ui/textarea';
import { Label } from '../../../components/ui/label';
import { fetchIndustries, createIndustry, updateIndustry, deleteIndustry } from '../../../lib/db/industries';
import { fetchBusinesses } from '../../../lib/db/businesses';
import type { Industry, Business, GlobalTheme } from '../../../lib/types';
import { EntityGenerator } from '../../../components/shared/EntityGenerator';
import { VisualContentEditor } from '../../../components/shared/VisualContentEditor';
import { AITextGenerator } from '../../../components/shared/AITextGenerator';

export default function IndustriesPage() {
  const [industries, setIndustries] = useState<Industry[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [rootBusiness, setRootBusiness] = useState<Business | null>(null);
  const [saving, setSaving] = useState(false);

  const [formState, setFormState] = useState<Partial<Industry>>({
    name: '',
    slug: '',
    description: '',
    overview_html: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [indData, busData] = await Promise.all([
        fetchIndustries(),
        fetchBusinesses()
      ]);
      setIndustries(indData);
      if (busData.length > 0) setRootBusiness(busData[0]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    const currentSlug = formState.slug;
    // Auto-generate slug if empty
    if (!currentSlug) {
      const slug = val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      setFormState(prev => ({ ...prev, name: val, slug }));
    } else {
      setFormState(prev => ({ ...prev, name: val }));
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rootBusiness) return alert("No Root Business found.");

    setSaving(true);
    try {
      const payload = { ...formState, business_id: rootBusiness.id };
      if (formState.id) {
        await updateIndustry(formState.id, payload);
      } else {
        await createIndustry(payload);
      }
      setIsEditing(false);
      setFormState({ name: '', slug: '', description: '', overview_html: '' });
      loadData();
    } catch (err: any) {
      alert("Failed to save industry: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`CAUTION: Are you sure you want to delete the industry "${name}"? \n\nThis action cannot be undone and may affect case studies or pages linked to this industry.`)) {
      try {
        await deleteIndustry(id);
        loadData();
      } catch (err: any) {
        alert(`Failed to delete industry.\n\nDatabase Error: ${err.message || JSON.stringify(err)}`);
        console.error("Delete Industry Error:", err);
      }
    }
  };

  const startEdit = (ind?: Industry) => {
    setFormState(ind || { name: '', slug: '', description: '', overview_html: '' });
    setIsEditing(true);
  };

  const getIndustriesContent = () => industries.map(i => `Industry: ${i.name}\n${i.description}`).join('\n---\n');

  if (loading) return <div className="p-12 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto text-slate-400"/></div>;

  if (isEditing) {
    const brandTheme = rootBusiness?.global_theme as GlobalTheme;

    return (
      <div className="p-6 max-w-3xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
           <Button variant="ghost" onClick={() => setIsEditing(false)}>
              <ArrowLeft className="h-4 w-4 mr-2" /> Back
           </Button>
           <h2 className="text-2xl font-bold">{formState.id ? 'Edit Industry' : 'Add New Industry'}</h2>
           {rootBusiness && (
              <EntityGenerator getContent={() => `Industry: ${formState.name}\n${formState.overview_html}`} businessId={rootBusiness.id} sourceName="Industry" />
           )}
        </div>

        <form onSubmit={handleSave} className="space-y-6 bg-white p-6 rounded-lg border shadow-sm">
           <div className="grid grid-cols-2 gap-4">
             <div className="space-y-2">
               <Label>Industry Name</Label>
               <Input 
                 value={formState.name} 
                 onChange={handleNameChange}
                 placeholder="e.g. Healthcare"
                 required
               />
             </div>
             <div className="space-y-2">
               <Label>Slug</Label>
               <Input 
                 value={formState.slug} 
                 onChange={e => setFormState({...formState, slug: e.target.value})}
                 placeholder="healthcare"
                 required
               />
             </div>
           </div>

           <div className="space-y-2">
             <div className="flex justify-between">
                <Label>Short Description</Label>
                <AITextGenerator 
                  onGenerate={t => setFormState({...formState, description: t})}
                  fieldName="Industry Description"
                  keyword={formState.name}
                  currentValue={formState.description}
                  brandTheme={brandTheme}
                />
             </div>
             <Textarea 
               value={formState.description || ''} 
               onChange={e => setFormState({...formState, description: e.target.value})} 
               placeholder="Brief summary..."
             />
           </div>

           <div className="space-y-2">
             <Label>Overview Content (Visual Builder)</Label>
             <VisualContentEditor 
               value={formState.overview_html || ''}
               onChange={val => setFormState({...formState, overview_html: val})}
               minHeight="min-h-[300px]"
               placeholder="# Industry Overview..."
               brandTheme={brandTheme}
               keyword={formState.name}
             />
           </div>

           <div className="flex justify-end pt-4 border-t">
             <Button type="submit" disabled={saving}>
               {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
               Save Industry
             </Button>
           </div>
        </form>
      </div>
    );
  }

  return (
    <div className="p-6">
       <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Industries</h1>
          <p className="text-slate-500 mt-2">Define target verticals for service pages and case studies.</p>
        </div>
        <div className="flex gap-2">
           {rootBusiness && industries.length > 0 && (
              <EntityGenerator 
                 getContent={getIndustriesContent} 
                 businessId={rootBusiness.id} 
                 sourceName="Industries" 
              />
           )}
           <Button onClick={() => startEdit()}>
             <Plus className="h-4 w-4 mr-2" /> Add Industry
           </Button>
        </div>
      </div>

      {industries.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed rounded-lg bg-slate-50">
          <Factory className="h-12 w-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900">No industries yet</h3>
          <Button onClick={() => startEdit()}>Add Industry</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {industries.map((ind) => (
             <div key={ind.id} className="bg-white p-5 rounded-lg border shadow-sm flex flex-col justify-between">
                <div>
                   <h3 className="font-bold text-lg text-slate-900 mb-2">{ind.name}</h3>
                   <p className="text-sm text-slate-500 mb-4 line-clamp-3">{ind.description}</p>
                   <code className="text-xs bg-slate-100 px-2 py-1 rounded">/{ind.slug}</code>
                </div>
                <div className="flex justify-end gap-2 pt-4 border-t mt-4">
                   <Button variant="ghost" size="sm" onClick={() => startEdit(ind)}>
                      <Edit2 className="h-4 w-4 mr-2" /> Edit
                   </Button>
                   <Button variant="ghost" size="icon" onClick={() => handleDelete(ind.id, ind.name)} className="text-red-500 hover:bg-red-50">
                      <Trash2 className="h-4 w-4" />
                   </Button>
                </div>
             </div>
          ))}
        </div>
      )}
    </div>
  );
}