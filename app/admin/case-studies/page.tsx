import React, { useEffect, useState } from 'react';
import { Award, Plus, Loader2, Edit2, Trash2, Save, ArrowLeft } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { fetchCaseStudies, createCaseStudy, updateCaseStudy, deleteCaseStudy } from '../../../lib/db/case-studies';
import { fetchServices } from '../../../lib/db/services';
import { fetchIndustries } from '../../../lib/db/industries';
import { fetchBusinesses } from '../../../lib/db/businesses';
import type { CaseStudy, Service, Industry } from '../../../lib/types';
import { EntityGenerator } from '../../../components/shared/EntityGenerator';
import { VisualContentEditor } from '../../../components/shared/VisualContentEditor';
import { toast } from '../../../lib/toast';
import { useConfirm } from '../../../lib/confirm-dialog';
import { TableSkeleton, PageHeaderSkeleton } from '../../../components/shared/skeletons';

export default function CaseStudiesPage() {
  const [studies, setStudies] = useState<any[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [industries, setIndustries] = useState<Industry[]>([]);
  const [rootBusinessId, setRootBusinessId] = useState<string | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formState, setFormState] = useState<Partial<CaseStudy>>({
    title: '',
    slug: '',
    summary: '',
    body_html: '',
    published: false,
    client_name: '',
  });
  const { confirm, ConfirmDialog } = useConfirm();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [studiesData, servicesData, industriesData, businessesData] = await Promise.all([
        fetchCaseStudies(),
        fetchServices(),
        fetchIndustries(),
        fetchBusinesses()
      ]);
      setStudies(studiesData);
      setServices(servicesData);
      setIndustries(industriesData);
      if (businessesData.length > 0) setRootBusinessId(businessesData[0].id);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    const currentSlug = formState.slug;
    if (!currentSlug) {
      const slug = val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      setFormState(prev => ({ ...prev, title: val, slug }));
    } else {
      setFormState(prev => ({ ...prev, title: val }));
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rootBusinessId) { toast.error("No Root Business found."); return; }

    setSaving(true);
    try {
      const payload = { ...formState, business_id: rootBusinessId };
      if (formState.id) {
        await updateCaseStudy(formState.id, payload);
      } else {
        await createCaseStudy(payload);
      }
      setIsEditing(false);
      setFormState({ title: '', slug: '', summary: '', body_html: '', published: false });
      loadData();
    } catch (err: any) {
      toast.error("Failed to save case study", err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    const confirmed = await confirm({
      title: "Delete Case Study",
      message: `Are you sure you want to delete the case study "${title}"? This action cannot be undone.`,
      confirmText: "Delete",
      cancelText: "Cancel",
      variant: "destructive",
    });
    if (confirmed) {
      try {
        await deleteCaseStudy(id);
        toast.success(`"${title}" deleted successfully`);
        loadData();
      } catch (err: any) {
        toast.error("Failed to delete case study", err.message);
      }
    }
  };

  const startEdit = (study?: CaseStudy) => {
    setFormState(study || { title: '', slug: '', summary: '', body_html: '', published: false, client_name: '' });
    setIsEditing(true);
  };

  const getContent = () => studies.map(s => `Case Study: ${s.title}\n${s.summary}`).join('\n---\n');

  if (loading) {
    return (
      <div className="p-6">
        <PageHeaderSkeleton />
        <TableSkeleton rows={5} columns={4} />
      </div>
    );
  }

  if (isEditing) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
           <Button variant="ghost" onClick={() => setIsEditing(false)}>
              <ArrowLeft className="h-4 w-4 mr-2" /> Back
           </Button>
           <h2 className="text-2xl font-bold">{formState.id ? 'Edit Case Study' : 'New Case Study'}</h2>
           {rootBusinessId && (
              <EntityGenerator getContent={() => `Case Study: ${formState.title}\n${formState.body_html}`} businessId={rootBusinessId} sourceName="This Case Study" />
           )}
        </div>

        <form onSubmit={handleSave} className="space-y-6 bg-white p-6 rounded-lg border shadow-sm">
           <div className="grid grid-cols-2 gap-4">
             <div className="space-y-2">
               <Label>Case Study Title</Label>
               <Input 
                 value={formState.title} 
                 onChange={handleTitleChange}
                 placeholder="e.g. How we helped X grow by 200%"
                 required
               />
             </div>
             <div className="space-y-2">
               <Label>Slug</Label>
               <Input 
                 value={formState.slug} 
                 onChange={e => setFormState({...formState, slug: e.target.value})}
                 placeholder="how-we-helped-x"
                 required
               />
             </div>
           </div>

           <div className="grid grid-cols-2 gap-4">
               <div className="space-y-2">
                  <Label>Related Service</Label>
                  <select 
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={formState.related_service_id || ''}
                    onChange={e => setFormState({...formState, related_service_id: e.target.value || undefined})}
                  >
                    <option value="">-- None --</option>
                    {services.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
               </div>
               <div className="space-y-2">
                  <Label>Related Industry</Label>
                  <select 
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={formState.related_industry_id || ''}
                    onChange={e => setFormState({...formState, related_industry_id: e.target.value || undefined})}
                  >
                    <option value="">-- None --</option>
                    {industries.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
                  </select>
               </div>
           </div>

           <div className="space-y-2">
             <Label>Client Name (Optional)</Label>
             <Input 
                value={formState.client_name || ''} 
                onChange={e => setFormState({...formState, client_name: e.target.value})}
             />
           </div>

           <div className="space-y-2">
             <Label>Detailed Story (Visual Builder)</Label>
             <VisualContentEditor 
               value={formState.body_html || ''}
               onChange={val => setFormState({...formState, body_html: val})}
               minHeight="min-h-[400px]"
             />
           </div>

           <div className="flex justify-end pt-4 border-t">
             <Button type="submit" disabled={saving}>
               {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
               Save Case Study
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
          <h1 className="text-3xl font-bold tracking-tight">Case Studies</h1>
          <p className="text-slate-500 mt-2">Showcase your success stories linked to services and industries.</p>
        </div>
        <div className="flex gap-2">
           {rootBusinessId && studies.length > 0 && (
              <EntityGenerator getContent={getContent} businessId={rootBusinessId} sourceName="Case Studies" />
           )}
           <Button onClick={() => startEdit()}>
             <Plus className="h-4 w-4 mr-2" /> Add Case Study
           </Button>
        </div>
      </div>

      {studies.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed rounded-lg bg-slate-50">
          <Award className="h-12 w-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900">No case studies yet</h3>
          <Button onClick={() => startEdit()}>Add Case Study</Button>
        </div>
      ) : (
        <div className="space-y-4">
          {studies.map((study) => (
             <div key={study.id} className="bg-white p-5 rounded-lg border shadow-sm flex items-center justify-between">
                <div>
                   <h3 className="font-bold text-lg text-slate-900">{study.title}</h3>
                   <div className="flex gap-2 text-xs text-slate-500 mt-1">
                      {study.services?.name && <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded">{study.services.name}</span>}
                      {study.industries?.name && <span className="bg-purple-50 text-purple-700 px-2 py-0.5 rounded">{study.industries.name}</span>}
                      {study.client_name && <span>Client: {study.client_name}</span>}
                   </div>
                </div>
                <div className="flex gap-2">
                   <Button variant="ghost" size="sm" onClick={() => startEdit(study)}>
                      <Edit2 className="h-4 w-4 mr-2" /> Edit
                   </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(study.id, study.title)} className="text-red-500 hover:bg-red-50" aria-label={`Delete ${study.title}`}>
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