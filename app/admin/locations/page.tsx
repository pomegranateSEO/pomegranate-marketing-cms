import React, { useEffect, useState } from 'react';
import { Loader2, MapPin, Trash2, Plus, ArrowLeft, Pencil } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { fetchLocations, deleteLocation, createLocation, updateLocation } from '../../../lib/db/locations';
import { fetchBusinesses } from '../../../lib/db/businesses';
import { LocationForm } from '../../../components/forms/LocationForm';
import { EntityGenerator } from '../../../components/shared/EntityGenerator';
import type { TargetLocation } from '../../../lib/types';

export default function LocationsPage() {
  const [locations, setLocations] = useState<(TargetLocation & { businesses: { name: string } | null })[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [editingLocation, setEditingLocation] = useState<TargetLocation | null>(null);
  const [rootBusinessId, setRootBusinessId] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [locationsData, businessesData] = await Promise.all([
        fetchLocations(),
        fetchBusinesses()
      ]);
      setLocations(locationsData);
      if (businessesData.length > 0) {
        setRootBusinessId(businessesData[0].id);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to load locations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure? This will remove this target location from generation queues.")) {
      try {
        await deleteLocation(id);
        loadData();
      } catch (e) {
        alert("Failed to delete location");
      }
    }
  };

  const handleCreateOrUpdate = async (data: any) => {
    try {
      if (editingLocation) {
        await updateLocation(editingLocation.id, data);
        setEditingLocation(null);
      } else {
        await createLocation(data);
        setIsCreating(false);
      }
      loadData();
    } catch (e: any) {
      alert(`Failed to save location: ${e.message}`);
    }
  };

  const handleEdit = (loc: TargetLocation) => {
    setEditingLocation(loc);
    setIsCreating(false);
  };

  // Combine all locations into text for bulk entity extraction
  const getAllLocationsContent = () => {
    return locations.map(l => `
      Location: ${l.name} (${l.address_region})
      Landmarks: ${l.landmarks_list?.join(', ')}
      Demographics: ${l.demographics_tag}
    `).join('\n---\n');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  // CREATE / EDIT VIEW
  if (isCreating || editingLocation) {
    if (!rootBusinessId) {
       return (
         <div className="p-6 text-center">
            <h2 className="text-xl font-bold text-red-600">No Business Found</h2>
            <p className="mb-4">You must create a Root Business Entity before adding locations.</p>
            <Button onClick={() => setIsCreating(false)}>Go Back</Button>
         </div>
       );
    }

    return (
      <div className="p-6 max-w-3xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" onClick={() => { setIsCreating(false); setEditingLocation(null); }}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Back
          </Button>
          <h1 className="text-2xl font-bold">
            {editingLocation ? 'Edit Target Location' : 'Add Target Location'}
          </h1>
        </div>
        <div className="bg-white p-6 rounded-lg border shadow-sm">
           <LocationForm 
              initialData={editingLocation || undefined}
              businessId={rootBusinessId} 
              onSubmit={handleCreateOrUpdate} 
              onCancel={() => { setIsCreating(false); setEditingLocation(null); }} 
           />
        </div>
      </div>
    );
  }

  // LIST VIEW
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Target Locations</h1>
          <p className="text-slate-500 mt-2">
            The "20%" of your pSEO content. Unique landmarks, demographics, and geo-coordinates.
          </p>
        </div>
        <div className="flex gap-2">
            {rootBusinessId && locations.length > 0 && (
                <EntityGenerator 
                    getContent={getAllLocationsContent} 
                    businessId={rootBusinessId} 
                    sourceName="All Locations" 
                />
            )}
            <Button onClick={() => setIsCreating(true)}>
            <Plus className="h-4 w-4 mr-2" /> Add Location
            </Button>
        </div>
      </div>

      {locations.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed rounded-lg bg-slate-50">
          <MapPin className="h-12 w-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900">No locations yet</h3>
          <p className="text-slate-500 mb-6">Create your first target location to begin.</p>
          <Button onClick={() => setIsCreating(true)}>
            Add Location
          </Button>
        </div>
      ) : (
        <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 border-b font-medium text-slate-500">
              <tr>
                <th className="px-6 py-4">Location Name</th>
                <th className="px-6 py-4">Slug</th>
                <th className="px-6 py-4">Region</th>
                <th className="px-6 py-4">Coordinates</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {locations.map((loc) => (
                <tr key={loc.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-900">
                    {loc.name}
                    {loc.demographics_tag && (
                      <span className="ml-2 px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-normal">
                        {loc.demographics_tag}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-slate-500">{loc.slug}</td>
                  <td className="px-6 py-4 text-slate-500">{loc.address_region || '-'}</td>
                  <td className="px-6 py-4 text-slate-500 font-mono text-xs">
                    {loc.geo_data?.lat.toFixed(4)}, {loc.geo_data?.lng.toFixed(4)}
                  </td>
                  <td className="px-6 py-4 text-right flex justify-end gap-2">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(loc)} className="text-slate-500 hover:text-primary hover:bg-slate-100">
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(loc.id)} className="text-slate-400 hover:text-red-700 hover:bg-red-50">
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
