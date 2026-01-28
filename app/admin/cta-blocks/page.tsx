
import React, { useEffect, useState } from 'react';
import { Megaphone, Plus, Loader2, Edit2, Trash2, Save, ArrowLeft } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { fetchCTABlocks, createCTABlock, updateCTABlock, deleteCTABlock } from '../../../lib/db/cta-blocks';
import { fetchBusinesses } from '../../../lib/db/businesses';
import type { CTABlock, Business, GlobalTheme } from '../../../lib/types';
import { EntityGenerator } from '../../../components/shared/EntityGenerator';
import { AITextGenerator } from '../../../components/shared/AITextGenerator';

export default function CTABlocksPage() {
  const [ctas, setCtas] = useState<CTABlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [rootBusiness, setRootBusiness] = useState<Business | null>(null);
  const [saving, setSaving] = useState(false);

  const [formState, setFormState] = useState<Partial<CTABlock>>({
    name: '',
    headline: '',
    subheadline: '',
    button_text: '',
    button_url: '',
    theme_style: 'primary',
    bg_image_url: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [ctaData, busData] = await Promise.all([
        fetchCTABlocks(),
        fetchBusinesses()
      ]);
      setCtas(ctaData);
      if (busData.length > 0) setRootBusiness(busData[0]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rootBusiness) return alert("No Root Business found.");

    setSaving(true);
    try {
      const payload = { ...formState, business_id: rootBusiness.id };
      if (formState.id) {
        await updateCTABlock(formState.id, payload);
      } else {
        await createCTABlock(payload);
      }
      setIsEditing(false);
      resetForm();
      loadData();
    } catch (err: any) {
      alert("Failed to save CTA: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Delete CTA Block "${name}"? This will break any pages using this specific ID.`)) {
      try {
        await deleteCTABlock(id);
        loadData();
      } catch (err: any) {
        alert("Failed to delete CTA Block: " + err.message);
      }
    }
  };

  const startEdit = (cta?: CTABlock) => {
    setFormState(cta || { name: '', headline: '', subheadline: '', button_text: '', button_url: '', theme_style: 'primary', bg_image_url: '' });
    setIsEditing(true);
  };

  const resetForm = () => {
    setFormState({ name: '', headline: '', subheadline: '', button_text: '', button_url: '', theme_style: 'primary', bg_image_url: '' });
  };

  const getContent = () => ctas.map(c => `CTA: ${c.headline}\n${c.subheadline}`).join('\n---\n');

  if (loading) return <div className="p-12 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto text-slate-400"/></div>;

  if (isEditing) {
    const brandTheme = rootBusiness?.global_theme as GlobalTheme;

    return (
      <div className="p-6 max-w-3xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
           <Button variant="ghost" onClick={() => setIsEditing(false)}>
              <ArrowLeft className="h-4 w-4 mr-2" /> Back
           </Button>
           <h2 className="text-2xl font-bold">{formState.id ? 'Edit CTA Block' : 'Add New CTA Block'}</h2>
           {rootBusiness && (
              <EntityGenerator getContent={() => `CTA: ${formState.headline}\n${formState.subheadline}`} businessId={rootBusiness.id} sourceName="CTA Block" />
           )}
        </div>

        <form onSubmit={handleSave} className="space-y-6 bg-white p-6 rounded-lg border shadow-sm">
           <div className="space-y-2">
               <Label>Internal Name</Label>
               <Input 
                 value={formState.name} 
                 onChange={e => setFormState({...formState, name: e.target.value})}
                 placeholder="e.g. Main Newsletter Signup"
                 required
               />
               <p className="text-xs text-slate-400">Not visible to users, used for identifying the block.</p>
           </div>
           
           <div className="space-y-2">
               <div className="flex justify-between">
                  <Label>Headline</Label>
                  <AITextGenerator 
                    onGenerate={t => setFormState({...formState, headline: t})}
                    fieldName="CTA Headline"
                    keyword={formState.name}
                    currentValue={formState.headline}
                    brandTheme={brandTheme}
                  />
               </div>
               <Input 
                 value={formState.headline || ''} 
                 onChange={e => setFormState({...formState, headline: e.target.value})}
                 placeholder="Ready to get started?"
               />
           </div>

           <div className="space-y-2">
               <div className="flex justify-between">
                  <Label>Subheadline</Label>
                  <AITextGenerator 
                    onGenerate={t => setFormState({...formState, subheadline: t})}
                    fieldName="CTA Subheadline"
                    keyword={formState.name}
                    currentValue={formState.subheadline}
                    brandTheme={brandTheme}
                  />
               </div>
               <Input 
                 value={formState.subheadline || ''} 
                 onChange={e => setFormState({...formState, subheadline: e.target.value})}
                 placeholder="Join thousands of happy customers today."
               />
           </div>

           <div className="grid grid-cols-2 gap-4">
             <div className="space-y-2">
               <Label>Button Text</Label>
               <Input 
                 value={formState.button_text || ''} 
                 onChange={e => setFormState({...formState, button_text: e.target.value})}
                 placeholder="Sign Up Now"
               />
             </div>
             <div className="space-y-2">
               <Label>Button URL</Label>
               <Input 
                 value={formState.button_url || ''} 
                 onChange={e => setFormState({...formState, button_url: e.target.value})}
                 placeholder="/contact"
               />
             </div>
           </div>

           <div className="grid grid-cols-2 gap-4">
             <div className="space-y-2">
               <Label>Theme Style</Label>
               <select 
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={formState.theme_style}
                  onChange={e => setFormState({...formState, theme_style: e.target.value as any})}
               >
                 <option value="primary">Primary (Brand Color)</option>
                 <option value="dark">Dark</option>
                 <option value="light">Light</option>
                 <option value="outline">Outline</option>
               </select>
             </div>
             <div className="space-y-2">
               <Label>Background Image URL (Optional)</Label>
               <Input 
                 value={formState.bg_image_url || ''} 
                 onChange={e => setFormState({...formState, bg_image_url: e.target.value})}
                 placeholder="https://..."
               />
             </div>
           </div>

           <div className="flex justify-end pt-4 border-t">
             <Button type="submit" disabled={saving}>
               {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
               Save CTA Block
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
          <h1 className="text-3xl font-bold tracking-tight">CTA Blocks</h1>
          <p className="text-slate-500 mt-2">Create reusable Call-to-Action blocks to insert into pages and posts.</p>
        </div>
        <div className="flex gap-2">
           {rootBusiness && ctas.length > 0 && (
              <EntityGenerator 
                 getContent={getContent} 
                 businessId={rootBusiness.id} 
                 sourceName="CTA Blocks" 
              />
           )}
           <Button onClick={() => startEdit()}>
             <Plus className="h-4 w-4 mr-2" /> Add CTA Block
           </Button>
        </div>
      </div>

      {ctas.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed rounded-lg bg-slate-50">
          <Megaphone className="h-12 w-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900">No CTA blocks yet</h3>
          <Button onClick={() => startEdit()}>Add CTA Block</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ctas.map((cta) => (
             <div key={cta.id} className="bg-white p-5 rounded-lg border shadow-sm flex flex-col justify-between">
                <div>
                   <h3 className="font-bold text-lg text-slate-900 mb-1">{cta.name}</h3>
                   <div className="text-xs font-mono text-slate-400 mb-4 truncate">{cta.id}</div>
                   
                   <div className="p-4 bg-slate-50 rounded border text-center mb-2">
                      <div className="font-bold text-slate-800">{cta.headline}</div>
                      <div className="text-sm text-slate-500 mt-1">{cta.subheadline}</div>
                      <div className="mt-3 inline-block px-3 py-1 bg-primary text-white text-xs rounded">
                         {cta.button_text}
                      </div>
                   </div>
                </div>
                <div className="flex justify-end gap-2 pt-4 border-t mt-2">
                   <Button variant="ghost" size="sm" onClick={() => startEdit(cta)}>
                      <Edit2 className="h-4 w-4 mr-2" /> Edit
                   </Button>
                   <Button variant="ghost" size="icon" onClick={() => handleDelete(cta.id, cta.name)} className="text-red-500 hover:bg-red-50">
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