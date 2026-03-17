import React, { useEffect, useState } from 'react';
import {
  DollarSign, Plus, Loader2, Pencil, Trash2, X, Check, ChevronDown, ChevronUp,
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { toast } from '../../../lib/toast';
import { useConfirm } from '../../../lib/confirm-dialog';
import {
  fetchPricingServices,
  fetchPricingPlans,
  createPricingPlan,
  updatePricingPlan,
  deletePricingPlan,
  type PricingPlan,
  type ServiceOption,
} from '../../../lib/db/pricing';

const EMPTY_PLAN: Omit<PricingPlan, 'id'> = {
  service_id: '',
  category: '',
  subcategory: null,
  tier_number: 1,
  tier_name: '',
  price_min_gbp: 0,
  price_max_gbp: 0,
  features: [],
  hosting_min_gbp: null,
  hosting_max_gbp: null,
  sort_order: 0,
};

interface PlanFormProps {
  initial: Partial<PricingPlan>;
  services: ServiceOption[];
  onSave: (plan: Omit<PricingPlan, 'id'>) => Promise<void>;
  onCancel: () => void;
  isSaving: boolean;
}

const PlanForm: React.FC<PlanFormProps> = ({ initial, services, onSave, onCancel, isSaving }) => {
  const [form, setForm] = useState<Omit<PricingPlan, 'id'>>({
    ...EMPTY_PLAN,
    ...initial,
    features: initial.features || [],
  });
  const [featureInput, setFeatureInput] = useState('');

  const set = (field: keyof typeof form, value: any) =>
    setForm((f) => ({ ...f, [field]: value }));

  const addFeature = () => {
    const trimmed = featureInput.trim();
    if (!trimmed) return;
    set('features', [...form.features, trimmed]);
    setFeatureInput('');
  };

  const removeFeature = (i: number) =>
    set('features', form.features.filter((_, idx) => idx !== i));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.service_id) { toast.error('Please select a service'); return; }
    if (!form.tier_name) { toast.error('Tier name is required'); return; }
    await onSave(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Row 1: Service + Category */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label>Service *</Label>
          <select
            value={form.service_id}
            onChange={(e) => set('service_id', e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="">— select service —</option>
            {services.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <Label>Category *</Label>
          <Input value={form.category} onChange={(e) => set('category', e.target.value)} placeholder="e.g., SEO, Web Design" />
        </div>
      </div>

      {/* Row 2: Subcategory + Tier */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-1">
          <Label>Subcategory</Label>
          <Input value={form.subcategory || ''} onChange={(e) => set('subcategory', e.target.value || null)} placeholder="optional" />
        </div>
        <div className="space-y-1">
          <Label>Tier Number</Label>
          <Input type="number" min={1} value={form.tier_number} onChange={(e) => set('tier_number', Number(e.target.value))} />
        </div>
        <div className="space-y-1">
          <Label>Tier Name *</Label>
          <Input value={form.tier_name} onChange={(e) => set('tier_name', e.target.value)} placeholder="e.g., Seedling" />
        </div>
      </div>

      {/* Row 3: Prices */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="space-y-1">
          <Label>Min Price (£)</Label>
          <Input type="number" min={0} value={form.price_min_gbp} onChange={(e) => set('price_min_gbp', Number(e.target.value))} />
        </div>
        <div className="space-y-1">
          <Label>Max Price (£)</Label>
          <Input type="number" min={0} value={form.price_max_gbp} onChange={(e) => set('price_max_gbp', Number(e.target.value))} />
        </div>
        <div className="space-y-1">
          <Label>Hosting Min (£)</Label>
          <Input type="number" min={0} value={form.hosting_min_gbp ?? ''} onChange={(e) => set('hosting_min_gbp', e.target.value ? Number(e.target.value) : null)} placeholder="optional" />
        </div>
        <div className="space-y-1">
          <Label>Hosting Max (£)</Label>
          <Input type="number" min={0} value={form.hosting_max_gbp ?? ''} onChange={(e) => set('hosting_max_gbp', e.target.value ? Number(e.target.value) : null)} placeholder="optional" />
        </div>
      </div>

      {/* Sort order */}
      <div className="w-32 space-y-1">
        <Label>Sort Order</Label>
        <Input type="number" min={0} value={form.sort_order} onChange={(e) => set('sort_order', Number(e.target.value))} />
      </div>

      {/* Features */}
      <div className="space-y-2">
        <Label>Features</Label>
        <div className="flex gap-2">
          <Input
            value={featureInput}
            onChange={(e) => setFeatureInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addFeature(); } }}
            placeholder="Type a feature and press Enter"
          />
          <Button type="button" variant="outline" onClick={addFeature}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        {form.features.length > 0 && (
          <ul className="space-y-1 mt-2">
            {form.features.map((f, i) => (
<li key={i} className="flex items-center gap-2 text-sm bg-muted px-3 py-1.5 rounded border border-border">
                 <Check className="h-3.5 w-3.5 text-green-500 flex-shrink-0" />
                 <span className="flex-1">{f}</span>
                 <button type="button" onClick={() => removeFeature(i)} className="text-muted-foreground hover:text-red-500">
                   <X className="h-3.5 w-3.5" />
                 </button>
               </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={isSaving}>
          {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
          Save Plan
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
      </div>
    </form>
  );
};

export default function PricingPage() {
  const [services, setServices] = useState<ServiceOption[]>([]);
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedServiceId, setSelectedServiceId] = useState<string>('');
  const [isCreating, setIsCreating] = useState(false);
  const [editingPlan, setEditingPlan] = useState<PricingPlan | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const { confirm, ConfirmDialog } = useConfirm();

  const loadData = async () => {
    try {
      setLoading(true);
      const [svcData, planData] = await Promise.all([
        fetchPricingServices(),
        fetchPricingPlans(selectedServiceId || undefined),
      ]);
      setServices(svcData);
      setPlans(planData);
      // Auto-expand all categories
      const cats = new Set(planData.map((p) => `${p.service_id}::${p.category}`));
      setExpandedCategories(cats);
    } catch (err: any) {
      toast.error('Failed to load pricing data', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [selectedServiceId]);

  const handleSave = async (plan: Omit<PricingPlan, 'id'>) => {
    setIsSaving(true);
    try {
      if (editingPlan?.id) {
        await updatePricingPlan(editingPlan.id, plan);
        toast.success('Pricing plan updated');
        setEditingPlan(null);
      } else {
        await createPricingPlan(plan);
        toast.success('Pricing plan created');
        setIsCreating(false);
      }
      await loadData();
    } catch (err: any) {
      toast.error('Failed to save pricing plan', err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (plan: PricingPlan) => {
    const confirmed = await confirm({
      title: 'Delete Pricing Plan',
      message: `Delete "${plan.tier_name}" (${plan.category})? This cannot be undone.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'destructive',
    });
    if (!confirmed || !plan.id) return;
    try {
      await deletePricingPlan(plan.id);
      toast.success('Plan deleted');
      await loadData();
    } catch (err: any) {
      toast.error('Delete failed', err.message);
    }
  };

  // Group plans by service → category
  const grouped = plans.reduce<Record<string, Record<string, PricingPlan[]>>>((acc, plan) => {
    const svc = services.find((s) => s.id === plan.service_id)?.name ?? plan.service_id;
    if (!acc[svc]) acc[svc] = {};
    if (!acc[svc][plan.category]) acc[svc][plan.category] = [];
    acc[svc][plan.category].push(plan);
    return acc;
  }, {});

  const toggleCategory = (key: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <ConfirmDialog />

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <DollarSign className="h-6 w-6 text-primary" />
          <div>
            <h1 className="text-2xl font-bold text-foreground">Pricing Plans</h1>
            <p className="text-sm text-muted-foreground">{plans.length} plan{plans.length !== 1 ? 's' : ''} total</p>
          </div>
        </div>
        <Button onClick={() => { setIsCreating(true); setEditingPlan(null); }}>
          <Plus className="h-4 w-4 mr-2" />
          Add Plan
        </Button>
      </div>

      {/* Service filter */}
      <div className="mb-6 flex items-center gap-3">
<Label className="text-sm text-foreground whitespace-nowrap">Filter by service:</Label>
         <div className="flex gap-2 flex-wrap">
           <button
             onClick={() => setSelectedServiceId('')}
className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${selectedServiceId === '' ? 'bg-primary text-white' : 'bg-muted text-foreground hover:bg-muted/80'}`}
           >
             All
           </button>
           {services.map((s) => (
             <button
               key={s.id}
               onClick={() => setSelectedServiceId(s.id)}
className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${selectedServiceId === s.id ? 'bg-primary text-white' : 'bg-muted text-foreground hover:bg-muted/80'}`}
             >
               {s.name}
             </button>
           ))}
         </div>
      </div>

      {/* Create form */}
      {isCreating && (
<div className="bg-card border border-border rounded-lg p-6 mb-6 shadow-sm">
           <h2 className="text-lg font-semibold text-foreground mb-5">New Pricing Plan</h2>
          <PlanForm
            initial={{ service_id: selectedServiceId }}
            services={services}
            onSave={handleSave}
            onCancel={() => setIsCreating(false)}
            isSaving={isSaving}
          />
        </div>
      )}

      {/* Plans table */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : plans.length === 0 ? (
<div className="text-center py-20 text-muted-foreground">
           <DollarSign className="h-12 w-12 mx-auto mb-3 opacity-30" />
           <p>No pricing plans found.</p>
         </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([serviceName, categories]) => (
<div key={serviceName} className="bg-card border border-border rounded-lg overflow-hidden shadow-sm">
               <div className="px-6 py-3 bg-muted border-b border-border">
                 <h2 className="font-semibold text-foreground">{serviceName}</h2>
               </div>

              {Object.entries(categories).map(([category, categoryPlans]) => {
                const key = `${serviceName}::${category}`;
                const isOpen = expandedCategories.has(key);
                return (
<div key={category} className="border-b border-border last:border-0">
                     <button
                       onClick={() => toggleCategory(key)}
                      className="w-full flex items-center justify-between px-6 py-3 hover:bg-muted/50 transition-colors"
                     >
                      <span className="text-sm font-medium text-foreground">{category} ({categoryPlans.length})</span>
                      {isOpen ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                     </button>

                     {isOpen && (
                       <div className="overflow-x-auto">
                         <table className="w-full text-sm">
                           <thead>
                            <tr className="bg-muted border-t border-border">
                              <th className="text-left px-4 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">Tier</th>
                              <th className="text-left px-4 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">Name</th>
                              <th className="text-left px-4 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">Price (£)</th>
                              <th className="text-left px-4 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">Features</th>
                              <th className="text-left px-4 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">Sort</th>
                               <th className="px-4 py-2" />
                             </tr>
                           </thead>
                           <tbody>
                             {categoryPlans.map((plan) => (
                               <React.Fragment key={plan.id}>
                                <tr className="border-t border-border hover:bg-muted/50">
                                   <td className="px-4 py-3 font-medium text-foreground">#{plan.tier_number}</td>
                                   <td className="px-4 py-3">
                                    <div className="font-medium text-foreground">{plan.tier_name}</div>
                                    {plan.subcategory && <div className="text-xs text-muted-foreground">{plan.subcategory}</div>}
                                   </td>
                                  <td className="px-4 py-3 text-foreground">
                                     £{plan.price_min_gbp.toLocaleString()}–£{plan.price_max_gbp.toLocaleString()}
                                     {plan.hosting_min_gbp != null && (
                                      <div className="text-xs text-muted-foreground">+hosting £{plan.hosting_min_gbp}–£{plan.hosting_max_gbp}/mo</div>
                                     )}
                                   </td>
                                   <td className="px-4 py-3">
                                    <span className="text-muted-foreground">{plan.features.length} feature{plan.features.length !== 1 ? 's' : ''}</span>
                                   </td>
                                  <td className="px-4 py-3 text-muted-foreground">{plan.sort_order}</td>
                                   <td className="px-4 py-3">
                                     <div className="flex items-center gap-1">
                                       <button
                                         onClick={() => { setEditingPlan(plan); setIsCreating(false); }}
                                        className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                                         aria-label="Edit"
                                       >
                                         <Pencil className="h-3.5 w-3.5" />
                                       </button>
                                       <button
                                         onClick={() => handleDelete(plan)}
                                        className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-950 text-muted-foreground hover:text-red-600 transition-colors"
                                         aria-label="Delete"
                                       >
                                         <Trash2 className="h-3.5 w-3.5" />
                                       </button>
                                     </div>
                                   </td>
                                 </tr>
                                 {/* Inline edit form */}
                                 {editingPlan?.id === plan.id && (
                                   <tr>
                                    <td colSpan={6} className="px-6 py-5 bg-muted border-t border-border">
                                       <PlanForm
                                         initial={editingPlan}
                                         services={services}
                                         onSave={handleSave}
                                         onCancel={() => setEditingPlan(null)}
                                         isSaving={isSaving}
                                       />
                                     </td>
                                   </tr>
                                 )}
                               </React.Fragment>
                             ))}
                           </tbody>
                         </table>
                       </div>
                     )}
                   </div>
                );
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
