
import React, { useEffect, useState } from 'react';
import { Wrench, Plus, Loader2, Edit2, Trash2, Save, ArrowLeft, ExternalLink } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Textarea } from '../../../components/ui/textarea';
import { fetchBusinesses } from '../../../lib/db/businesses';
import { fetchTools, createTool, updateTool, deleteTool } from '../../../lib/db/tools';
import type { FreeTool, Business, GlobalTheme } from '../../../lib/types';
import { EntityGenerator } from '../../../components/shared/EntityGenerator';
import { AITextGenerator } from '../../../components/shared/AITextGenerator';
import { toast } from '../../../lib/toast';
import { useConfirm } from '../../../lib/confirm-dialog';
import { TableSkeleton, PageHeaderSkeleton } from '../../../components/shared/skeletons';

export default function ToolsPage() {
  const [rootBusiness, setRootBusiness] = useState<Business | null>(null);
  const [tools, setTools] = useState<FreeTool[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form State
  const [currentTool, setCurrentTool] = useState<Partial<FreeTool>>({
    name: '',
    slug: '',
    short_description: '',
    long_description: '',
    embed_url: '',
    download_url: '',
    tags: [],
    published: false,
    featured: false
  });
  const { confirm, ConfirmDialog } = useConfirm();

  const [tagInput, setTagInput] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const [toolsData, businessesData] = await Promise.all([
        fetchTools(),
        fetchBusinesses()
      ]);
      setTools(toolsData);
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
      const payload = {
        ...currentTool,
        business_id: rootBusiness.id
      };

      if (currentTool.id) {
        await updateTool(currentTool.id, payload);
      } else {
        await createTool(payload);
      }
      setIsEditing(false);
      resetForm();
      loadData();
    } catch (err: any) {
      toast.error("Failed to save tool", err.message);
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setCurrentTool({
       name: '', slug: '', short_description: '', long_description: '', 
       embed_url: '', download_url: '', tags: [], published: false, featured: false 
    });
    setTagInput('');
  };

  const handleDelete = async (id: string, name: string) => {
    const confirmed = await confirm({
      title: "Delete Tool",
      message: `Are you sure you want to delete "${name}"? This action cannot be undone.`,
      confirmText: "Delete",
      cancelText: "Cancel",
      variant: "destructive",
    });
    if (confirmed) {
      try {
        await deleteTool(id);
        toast.success(`"${name}" deleted successfully`);
        loadData();
      } catch (err: any) {
        toast.error("Failed to delete tool", err.message);
      }
    }
  };

  const startEdit = (tool?: FreeTool) => {
    setCurrentTool(tool || { 
        name: '', slug: '', short_description: '', long_description: '', 
        embed_url: '', download_url: '', tags: [], published: false, featured: false 
    });
    setIsEditing(true);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    const currentSlug = currentTool.slug;
    if (!currentSlug) {
      const slug = val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      setCurrentTool(prev => ({ ...prev, name: val, slug }));
    } else {
      setCurrentTool(prev => ({ ...prev, name: val }));
    }
  };

  const addTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
       e.preventDefault();
       const newTags = [...(currentTool.tags || []), tagInput.trim()];
       setCurrentTool({ ...currentTool, tags: newTags });
       setTagInput('');
    }
  };

  const removeTag = (index: number) => {
    const newTags = [...(currentTool.tags || [])];
    newTags.splice(index, 1);
    setCurrentTool({ ...currentTool, tags: newTags });
  };

  const getToolsContent = () => tools.map(t => `Tool: ${t.name}\n${t.short_description}`).join('\n---\n');

  if (loading) {
    return (
      <div className="p-6">
        <PageHeaderSkeleton />
        <TableSkeleton rows={5} columns={4} />
      </div>
    );
  }

  if (isEditing) {
    const brandTheme = rootBusiness?.global_theme as GlobalTheme;

    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
           <Button variant="ghost" onClick={() => setIsEditing(false)}>
              <ArrowLeft className="h-4 w-4 mr-2" /> Back
           </Button>
           <h2 className="text-2xl font-bold">{currentTool.id ? 'Edit Tool' : 'Add Free Tool'}</h2>
        </div>

        <form onSubmit={handleSave} className="space-y-6 bg-white p-6 rounded-lg border shadow-sm">
           <div className="grid grid-cols-2 gap-4">
               <div className="space-y-2">
                 <Label>Tool Name</Label>
                 <Input 
                   value={currentTool.name} 
                   onChange={handleNameChange} 
                   placeholder="e.g. ROI Calculator"
                   required
                 />
               </div>
               <div className="space-y-2">
                 <Label>Slug</Label>
                 <Input 
                   value={currentTool.slug} 
                   onChange={e => setCurrentTool({...currentTool, slug: e.target.value})} 
                   placeholder="roi-calculator"
                   required
                 />
               </div>
           </div>

           <div className="space-y-2">
             <div className="flex justify-between">
                <Label>Short Description</Label>
                <AITextGenerator 
                  onGenerate={t => setCurrentTool({...currentTool, short_description: t})}
                  fieldName="Short Description"
                  keyword={currentTool.name}
                  currentValue={currentTool.short_description}
                  brandTheme={brandTheme}
                />
             </div>
             <Textarea 
               value={currentTool.short_description || ''} 
               onChange={e => setCurrentTool({...currentTool, short_description: e.target.value})} 
               placeholder="A brief teaser description..."
               className="h-20"
             />
           </div>

           <div className="space-y-2">
             <div className="flex justify-between">
                <Label>Full Description / Instructions</Label>
                <AITextGenerator 
                  onGenerate={t => setCurrentTool({...currentTool, long_description: t})}
                  fieldName="Tool Instructions"
                  keyword={currentTool.name}
                  currentValue={currentTool.long_description}
                  brandTheme={brandTheme}
                />
             </div>
             <Textarea 
               value={currentTool.long_description || ''} 
               onChange={e => setCurrentTool({...currentTool, long_description: e.target.value})} 
               placeholder="Detailed instructions on how to use the tool..."
               className="h-32"
             />
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div className="space-y-2">
                 <Label>Embed URL (iframe source)</Label>
                 <Input 
                   value={currentTool.embed_url || ''} 
                   onChange={e => setCurrentTool({...currentTool, embed_url: e.target.value})} 
                   placeholder="https://..."
                 />
               </div>
               <div className="space-y-2">
                 <Label>Download URL (Optional)</Label>
                 <Input 
                   value={currentTool.download_url || ''} 
                   onChange={e => setCurrentTool({...currentTool, download_url: e.target.value})} 
                   placeholder="https://..."
                 />
               </div>
           </div>
           
           <div className="space-y-2">
              <Label>Tags (Press Enter)</Label>
              <Input 
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={addTag}
                placeholder="Calculator, Finance, Free..."
              />
              <div className="flex flex-wrap gap-2 mt-2">
                 {currentTool.tags?.map((tag, idx) => (
                    <span key={idx} className="bg-slate-100 px-2 py-1 rounded text-xs flex items-center gap-1">
                       {tag}
                       <button type="button" onClick={() => removeTag(idx)} className="hover:text-red-500"><Trash2 className="h-3 w-3" /></button>
                    </span>
                 ))}
              </div>
           </div>
           
           <div className="flex gap-6 pt-4">
              <label className="flex items-center gap-2 cursor-pointer">
                 <input 
                   type="checkbox" 
                   checked={currentTool.published} 
                   onChange={e => setCurrentTool({...currentTool, published: e.target.checked})} 
                 />
                 <span className="text-sm font-medium">Published</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                 <input 
                   type="checkbox" 
                   checked={currentTool.featured} 
                   onChange={e => setCurrentTool({...currentTool, featured: e.target.checked})} 
                 />
                 <span className="text-sm font-medium">Featured Tool</span>
              </label>
           </div>

           <div className="flex justify-end pt-4 border-t">
             <Button type="submit" disabled={saving}>
               {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
               Save Tool
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
          <h1 className="text-3xl font-bold tracking-tight">Free Tools</h1>
          <p className="text-slate-500 mt-2">
            Manage interactive tools and calculators (Lead Magnets).
          </p>
        </div>
        <div className="flex gap-2">
           {rootBusiness && tools.length > 0 && (
              <EntityGenerator 
                 getContent={getToolsContent} 
                 businessId={rootBusiness.id} 
                 sourceName="Tools" 
              />
           )}
           <Button onClick={() => startEdit()}>
             <Plus className="h-4 w-4 mr-2" /> Add Tool
           </Button>
        </div>
      </div>

      {tools.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed rounded-lg bg-slate-50">
          <Wrench className="h-12 w-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900">No tools yet</h3>
          <p className="text-slate-500 mb-6">Configure free tools to generate leads.</p>
          <Button onClick={() => startEdit()}>
             Add Tool
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools.map((tool) => (
             <div key={tool.id} className="bg-white p-5 rounded-lg border shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                <div>
                   <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-lg text-slate-900">{tool.name}</h3>
                      <div className="flex gap-1">
                          {tool.published && <span className="w-2 h-2 rounded-full bg-green-500" title="Published"></span>}
                          {tool.featured && <span className="w-2 h-2 rounded-full bg-amber-500" title="Featured"></span>}
                      </div>
                   </div>
                   <p className="text-sm text-slate-500 mb-4 line-clamp-3">{tool.short_description}</p>
                   
                   <div className="flex flex-wrap gap-2 mb-4">
                      {tool.tags?.map(tag => (
                         <span key={tag} className="text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-500">{tag}</span>
                      ))}
                   </div>
                </div>
                
                <div className="flex justify-end gap-2 pt-4 border-t">
                   <Button variant="ghost" size="sm" onClick={() => startEdit(tool)}>
                      <Edit2 className="h-4 w-4 mr-2" /> Edit
                   </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(tool.id, tool.name)} className="text-red-500 hover:bg-red-50" aria-label={`Delete ${tool.name}`}>
                       <Trash2 className="h-4 w-4" aria-hidden="true" />
                    </Button>
                </div>
             </div>
          ))}
        </div>
      )}
      <ConfirmDialog />
    </div>
  );
}