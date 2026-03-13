import React, { useEffect, useState } from 'react';
import { Loader2, Briefcase, Trash2, Plus, ArrowLeft, Pencil } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { ServiceForm } from '../../../components/forms/ServiceForm';
import { fetchServices, deleteService, createService, updateService } from '../../../lib/db/services';
import { fetchBusinesses } from '../../../lib/db/businesses';
import type { Service } from '../../../lib/types';
import { EntityGenerator } from '../../../components/shared/EntityGenerator';

export default function ServicesPage() {
  const [services, setServices] = useState<(Service & { businesses: { name: string } | null })[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [rootBusinessId, setRootBusinessId] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [servicesData, businessesData] = await Promise.all([
        fetchServices(),
        fetchBusinesses()
      ]);
      setServices(servicesData);
      if (businessesData.length > 0) {
        setRootBusinessId(businessesData[0].id);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to load services");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`CAUTION: Are you sure you want to delete the service "${name}"?\n\nThis action cannot be undone. All generated pages, reviews, and case studies linked to this service may be broken or deleted.`)) {
      try {
        await deleteService(id);
        loadData();
      } catch (e: any) {
        // Detailed error reporting for debugging
        alert(`Failed to delete service.\n\nDatabase Error: ${e.message || JSON.stringify(e)}`);
        console.error("Delete Service Error:", e);
      }
    }
  };

  const handleCreateOrUpdate = async (data: any) => {
    try {
      if (editingService) {
        await updateService(editingService.id, data);
        setEditingService(null);
      } else {
        await createService(data);
        setIsCreating(false);
      }
      loadData();
    } catch (e: any) {
      alert(`Failed to save service: ${e.message}`);
    }
  };

  const handleEdit = (service: Service) => {
    setEditingService(service);
    setIsCreating(false);
  };

  // Combine content for bulk entity extraction
  const getAllServicesContent = () => {
    return services.map(s => `
      Service: ${s.name}
      Description: ${s.short_description}
      Process: ${s.shared_content_blocks?.process_content}
    `).join('\n---\n');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  // CREATE / EDIT MODE
  if (isCreating || editingService) {
    if (!rootBusinessId) {
       return (
         <div className="p-6 text-center">
            <h2 className="text-xl font-bold text-red-600">No Business Found</h2>
            <p className="mb-4">You must create a Root Business Entity before adding services.</p>
            <Button onClick={() => setIsCreating(false)}>Go Back</Button>
         </div>
       );
    }

    return (
      <div className="p-6 max-w-3xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" onClick={() => { setIsCreating(false); setEditingService(null); }}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Back
          </Button>
          <h1 className="text-2xl font-bold">
            {editingService ? 'Edit Service' : 'Add New Service'}
          </h1>
        </div>
        <div className="bg-white p-6 rounded-lg border shadow-sm">
           <ServiceForm 
              initialData={editingService || undefined}
              businessId={rootBusinessId} 
              onSubmit={handleCreateOrUpdate} 
              onCancel={() => { setIsCreating(false); setEditingService(null); }} 
           />
        </div>
      </div>
    );
  }

  // LIST MODE
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Services</h1>
          <p className="text-slate-500 mt-2">
            The "80%" of your pSEO content. Define service keyword cycling here for both national service pages and generated local service pages.
          </p>
        </div>
        <div className="flex gap-2">
           {rootBusinessId && services.length > 0 && (
             <EntityGenerator 
               getContent={getAllServicesContent} 
               businessId={rootBusinessId} 
               sourceName="All Services" 
             />
           )}
           <Button onClick={() => setIsCreating(true)}>
             <Plus className="h-4 w-4 mr-2" /> Add Service
           </Button>
        </div>
      </div>

      {services.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed rounded-lg bg-slate-50">
          <Briefcase className="h-12 w-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900">No services yet</h3>
          <p className="text-slate-500 mb-6">Create your first service to begin Phase 2.</p>
          <Button onClick={() => setIsCreating(true)}>
             Create Service
          </Button>
        </div>
      ) : (
        <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 border-b font-medium text-slate-500">
              <tr>
                <th className="px-6 py-4">Service Name</th>
                <th className="px-6 py-4">Base Slug</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {services.map((service) => (
                <tr key={service.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-900">{service.name}</td>
                  <td className="px-6 py-4 text-slate-500 font-mono bg-slate-50/50 rounded inline-block my-2 mx-6 px-2 py-0.5 text-xs">
                    /{service.base_slug}
                  </td>
                  <td className="px-6 py-4 text-slate-500">{service.category || '-'}</td>
                  <td className="px-6 py-4 text-right flex justify-end gap-2">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(service)} className="text-slate-500 hover:text-primary hover:bg-slate-100">
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(service.id, service.name)} className="text-slate-400 hover:text-red-600 hover:bg-red-50">
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
