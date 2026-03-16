
import React, { useEffect, useState } from 'react';
import { Factory, Plus, Loader2, Edit2, Trash2, ArrowLeft } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { fetchIndustries, createIndustry, updateIndustry, deleteIndustry } from '../../../lib/db/industries';
import { fetchBusinesses } from '../../../lib/db/businesses';
import { fetchKnowledgeEntities } from '../../../lib/db/knowledge';
import type { Industry, Business, KnowledgeEntity } from '../../../lib/types';
import { EntityGenerator } from '../../../components/shared/EntityGenerator';
import { IndustryForm } from '../../../components/forms/IndustryForm';
import { toast } from '../../../lib/toast';
import { useConfirm } from '../../../lib/confirm-dialog';
import { TableSkeleton, PageHeaderSkeleton } from '../../../components/shared/skeletons';

export default function IndustriesPage() {
  const [industries, setIndustries] = useState<Industry[]>([]);
  const [knowledgeEntities, setKnowledgeEntities] = useState<KnowledgeEntity[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingIndustry, setEditingIndustry] = useState<Industry | null | undefined>(undefined);
  const [rootBusiness, setRootBusiness] = useState<Business | null>(null);
  const [saving, setSaving] = useState(false);
  const { confirm, ConfirmDialog } = useConfirm();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [indData, busData, entitiesData] = await Promise.all([
        fetchIndustries(),
        fetchBusinesses(),
        fetchKnowledgeEntities()
      ]);
      setIndustries(indData);
      setKnowledgeEntities(entitiesData);
      if (busData.length > 0) setRootBusiness(busData[0]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (data: Partial<Industry>) => {
    if (!rootBusiness) { toast.error("No Root Business found."); return; }
    setSaving(true);
    try {
      const payload = { ...data, business_id: rootBusiness.id };
      if (editingIndustry?.id) {
        await updateIndustry(editingIndustry.id, payload);
        toast.success("Industry updated successfully");
      } else {
        await createIndustry(payload);
        toast.success("Industry created successfully");
      }
      setEditingIndustry(undefined);
      loadData();
    } catch (err: any) {
      toast.error("Failed to save industry", err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    const confirmed = await confirm({
      title: "Delete Industry",
      message: `Are you sure you want to delete the industry "${name}"? This action cannot be undone.`,
      confirmText: "Delete",
      cancelText: "Cancel",
      variant: "destructive",
    });
    if (confirmed) {
      try {
        await deleteIndustry(id);
        toast.success(`"${name}" deleted successfully`);
        loadData();
      } catch (err: any) {
        toast.error("Failed to delete industry", err.message);
      }
    }
  };

  const getIndustriesContent = () => industries.map(i => `Industry: ${i.name}\n${i.description}`).join('\n---\n');

  if (loading) {
    return (
      <div className="p-6">
        <PageHeaderSkeleton />
        <TableSkeleton rows={5} columns={4} />
      </div>
    );
  }

  // — EDITOR VIEW —
  if (editingIndustry !== undefined) {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" onClick={() => setEditingIndustry(undefined)}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Back
          </Button>
          <h2 className="text-2xl font-bold">{editingIndustry?.id ? 'Edit Industry' : 'Add New Industry'}</h2>
        </div>

        <IndustryForm
          initialData={editingIndustry || undefined}
          businessId={rootBusiness?.id || ''}
          knowledgeEntities={knowledgeEntities}
          onSubmit={handleSave}
          isLoading={saving}
          onCancel={() => setEditingIndustry(undefined)}
        />
      </div>
    );
  }

  // — LIST VIEW —
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
          <Button onClick={() => setEditingIndustry(null)}>
            <Plus className="h-4 w-4 mr-2" /> Add Industry
          </Button>
        </div>
      </div>

      {industries.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed rounded-lg bg-slate-50">
          <Factory className="h-12 w-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900">No industries yet</h3>
          <Button onClick={() => setEditingIndustry(null)}>Add Industry</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {industries.map((ind) => (
            <div key={ind.id} className="bg-white p-5 rounded-lg border shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-lg text-slate-900 mb-2">{ind.name}</h3>
                <p className="text-sm text-slate-500 mb-4 line-clamp-3">{ind.description}</p>
                <code className="text-xs bg-slate-100 px-2 py-1 rounded">/{ind.slug}</code>
                <div className="mt-2 flex gap-2 flex-wrap">
                  {ind.hero_data && (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Hero ✓</span>
                  )}
                  {ind.keyword_cycling_blocks && (
                    <span className="text-xs bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full">Keywords ✓</span>
                  )}
                  {Array.isArray(ind.faq_list) && (ind.faq_list as any[]).length > 0 && (
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">FAQs ✓</span>
                  )}
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4 border-t mt-4">
                <Button variant="ghost" size="sm" onClick={() => setEditingIndustry(ind)}>
                  <Edit2 className="h-4 w-4 mr-2" /> Edit
                </Button>
                 <Button variant="ghost" size="icon" onClick={() => handleDelete(ind.id, ind.name)} className="text-red-500 hover:bg-red-50" aria-label={`Delete ${ind.name}`}>
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
