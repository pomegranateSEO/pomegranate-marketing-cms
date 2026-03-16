import React, { useEffect, useState } from 'react';
import { Wifi, WifiOff, AlertTriangle, Save, Loader2, RefreshCw, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { toast } from '../../../lib/toast';
import { BusinessForm } from '../../../components/forms/BusinessForm';
import { fetchBusinesses, createBusiness, deleteBusiness, updateBusiness } from '../../../lib/db/businesses';
import { checkConnection } from '../../../lib/supabaseAdmin';
import type { Business } from '../../../lib/types';
import { EntityGenerator } from '../../../components/shared/EntityGenerator';
import { useConfirm } from '../../../lib/confirm-dialog';
import { FormSkeleton, PageHeaderSkeleton } from '../../../components/shared/skeletons';

export default function BusinessPage() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [detailedError, setDetailedError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');
  const { confirm, ConfirmDialog } = useConfirm();

  const runConnectionCheck = async () => {
    setConnectionStatus('checking');
    const isConnected = await checkConnection();
    setConnectionStatus(isConnected ? 'connected' : 'disconnected');
    return isConnected;
  };

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      setDetailedError(null);

      const isConnected = await runConnectionCheck();
      
      if (!isConnected) {
        throw new Error("Connection to Supabase failed. Please check your credentials.");
      }

      const data = await fetchBusinesses();
      setBusinesses(data);
    } catch (err) {
      console.error(err);
      setBusinesses([]); 
      setError(err instanceof Error ? err.message : "An error occurred while loading business entities.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDelete = async (id: string) => {
    const confirmed = await confirm({
      title: "Delete Business",
      message: "This will permanently remove this entity and ALL its related services, locations, and pages. This action cannot be undone.",
      confirmText: "Delete",
      cancelText: "Cancel",
      variant: "destructive",
    });
    
    if (confirmed) {
      try {
        setDeletingId(id);
        await deleteBusiness(id);
        toast.success("Business deleted successfully");
        setTimeout(async () => {
          await loadData();
          setDeletingId(null);
        }, 500);
      } catch (err) {
        console.error(err);
        setDeletingId(null);
        toast.error("Failed to delete business");
      }
    }
  };

  const handleSubmit = async (data: any) => {
    setSaving(true);
    setError(null);
    setDetailedError(null);
    
    try {
      if (businesses.length > 0) {
        // Update existing (Singleton)
        await updateBusiness(businesses[0].id, data);
      } else {
        // Create new
        await createBusiness(data);
      }
      await loadData();
      toast.success("Root Entity Saved Successfully!");
    } catch (err: any) {
      console.error("Save Error:", err);
      setError("Failed to save the business entity.");
      // Capture detailed Supabase error message (e.g., missing column)
      setDetailedError(err.message || JSON.stringify(err));
    } finally {
      setSaving(false);
    }
  };

  const getBusinessContent = () => {
    if (businesses.length === 0) return "";
    const b = businesses[0];
    const theme = b.global_theme as any;
    return `
      Business Name: ${b.name}
      Description: ${b.description}
      Legal Name: ${b.legal_name}
      Slogan: ${b.slogan}
      Industry: ${theme?.strategic_positioning || ''}
      Core Values: ${theme?.core_values?.join(', ') || ''}
      Founders: ${b.founder_names?.join(', ') || ''}
      Services: ${b.makes_offer ? JSON.stringify(b.makes_offer) : ''}
    `;
  };

  // RENDER LOADING
  if (loading) {
     return (
       <div className="p-6 max-w-3xl mx-auto">
         <PageHeaderSkeleton />
         <FormSkeleton fields={8} />
       </div>
     );
  }

  // RENDER CONFLICT RESOLUTION (Multiple Businesses)
  if (businesses.length > 1) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="bg-amber-50 border-amber-200 border p-6 rounded-lg mb-8">
          <div className="flex items-start gap-4">
             <AlertTriangle className="h-6 w-6 text-amber-600 mt-1" />
             <div>
               <h2 className="text-lg font-bold text-amber-900">Conflict: Multiple Root Entities Detected</h2>
               <p className="text-amber-800 mt-1">
                 Pomegranate v2 is a <strong>Single-Tenant CMS</strong>. The Knowledge Graph can only have one root "Organization" or "LocalBusiness".
               </p>
               <p className="text-amber-800 mt-2 font-medium">
                 Please delete the extra/test entities below to proceed.
               </p>
             </div>
          </div>
        </div>

        <div className="space-y-4">
          {businesses.map(b => (
            <div key={b.id} className="bg-white border p-4 rounded-lg flex justify-between items-center shadow-sm">
              <div>
                <h3 className="font-bold text-lg">{b.name}</h3>
                <p className="text-sm text-slate-500 font-mono">{b.id}</p>
                <div className="text-xs text-slate-400 mt-1">
                  Created: {new Date(b.created_at || '').toLocaleDateString()}
                </div>
              </div>
              <Button 
                variant="destructive" 
                onClick={() => handleDelete(b.id)}
                disabled={deletingId === b.id}
              >
                {deletingId === b.id ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Delete Entity'}
              </Button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // RENDER SINGLE TENANT VIEW (0 or 1 Business)
  const rootBusiness = businesses.length > 0 ? businesses[0] : undefined;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-8 border-b pb-6">
        <div>
           <div className="flex items-center gap-3">
             <h1 className="text-3xl font-bold tracking-tight">Root Business Entity</h1>
             {connectionStatus === 'connected' ? (
               <span className="flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-green-100 text-green-700 border border-green-200">
                 <Wifi className="h-3 w-3" /> Live
               </span>
             ) : (
               <span className="flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-red-100 text-red-700 border border-red-200">
                 <WifiOff className="h-3 w-3" /> Disconnected
               </span>
             )}
           </div>
           <p className="text-slate-500 mt-2">
             {rootBusiness 
               ? "Manage the primary knowledge graph entity properties." 
               : "Initialize the root entity for this Pomegranate instance."}
           </p>
        </div>
        <div className="flex items-center gap-2">
          {rootBusiness && (
            <EntityGenerator 
              getContent={getBusinessContent} 
              businessId={rootBusiness.id} 
              sourceName="Business Profile" 
            />
          )}
          {saving && (
             <div className="flex items-center gap-2 text-primary font-medium mr-4">
               <Loader2 className="h-4 w-4 animate-spin" /> Saving...
             </div>
          )}
          <Button variant="outline" size="sm" onClick={loadData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-md mb-6 border border-red-200">
          <div className="flex items-center gap-2 font-bold mb-1">
            <AlertTriangle className="h-5 w-5" />
            Database Error
          </div>
          <p className="text-sm">{error}</p>
          {detailedError && (
             <pre className="mt-2 text-xs bg-red-100 p-2 rounded overflow-auto border border-red-300">
               {detailedError}
             </pre>
          )}
          {detailedError?.includes("column") && (
             <p className="mt-2 text-xs font-semibold">
               Tip: Your Supabase table might be missing columns. Check that `employee_count`, `founder_names`, and `social_links` exist in the `businesses` table.
             </p>
          )}
        </div>
      )}

      <div className="bg-card border rounded-lg p-6 shadow-sm">
        <BusinessForm 
          initialData={rootBusiness} 
          onSubmit={handleSubmit} 
           isLoading={saving}
         />
       </div>
       <ConfirmDialog />
     </div>
   );
 }