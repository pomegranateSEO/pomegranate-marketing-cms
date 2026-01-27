import React, { useEffect, useState } from 'react';
import { Loader2, MapPin, Trash2, Plus, ArrowLeft, Pencil, Network, CheckCircle2, Save } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { fetchLocations, deleteLocation, createLocation, updateLocation } from '../../../lib/db/locations';
import { fetchBusinesses } from '../../../lib/db/businesses';
import { LocationForm } from '../../../components/forms/LocationForm';
import { EntityGenerator } from '../../../components/shared/EntityGenerator';
import { suggestSubLocations } from '../../../lib/ai/gemini';
import type { TargetLocation } from '../../../lib/types';

export default function LocationsPage() {
  const [locations, setLocations] = useState<(TargetLocation & { businesses: { name: string } | null })[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [editingLocation, setEditingLocation] = useState<TargetLocation | null>(null);
  const [rootBusinessId, setRootBusinessId] = useState<string | null>(null);

  // Expansion State
  const [expandingLocation, setExpandingLocation] = useState<TargetLocation | null>(null);
  const [suggestedSubLocations, setSuggestedSubLocations] = useState<string[]>([]);
  const [selectedSuggestions, setSelectedSuggestions] = useState<Set<string>>(new Set());
  const [isScanning, setIsScanning] = useState(false);
  const [isAddingSubLocations, setIsAddingSubLocations] = useState(false);

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
      } catch (e: any) {
        alert(`Failed to delete location.\n\nError: ${e.message || JSON.stringify(e)}`);
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

  // --- LOCATION EXPANSION LOGIC ---
  const startExpansion = async (loc: TargetLocation) => {
    setExpandingLocation(loc);
    setSuggestedSubLocations([]);
    setSelectedSuggestions(new Set());
    setIsScanning(true);

    try {
      const suggestions = await suggestSubLocations(loc.name, loc.address_region || undefined);
      setSuggestedSubLocations(suggestions);
      // Auto-select all by default
      setSelectedSuggestions(new Set(suggestions));
    } catch (e) {
      alert("Failed to find sub-locations. Try manual entry.");
    } finally {
      setIsScanning(false);
    }
  };

  const toggleSuggestion = (name: string) => {
    const newSet = new Set(selectedSuggestions);
    if (newSet.has(name)) newSet.delete(name);
    else newSet.add(name);
    setSelectedSuggestions(newSet);
  };

  const saveSubLocations = async () => {
    if (!rootBusinessId || !expandingLocation) return;
    setIsAddingSubLocations(true);

    try {
      const promises = Array.from(selectedSuggestions).map((item) => {
         const name = String(item);
         const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
         return createLocation({
            business_id: rootBusinessId,
            name: name,
            slug: slug,
            parent_city: expandingLocation.name,
            address_region: expandingLocation.address_region, // Inherit region
            address_country: expandingLocation.address_country, // Inherit country
            // Default blank geo_data, will need geocoding later
            geo_data: { lat: 0, lng: 0, radius: '2km' } 
         });
      });

      await Promise.all(promises);
      setExpandingLocation(null);
      loadData();
      alert(`Successfully added ${selectedSuggestions.size} sub-locations!`);
    } catch (e: any) {
      alert("Error adding sub-locations: " + e.message);
    } finally {
      setIsAddingSubLocations(false);
    }
  };
  // ------------------------------

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

  // EXPANSION MODAL (Simulated)
  if (expandingLocation) {
     return (
       <div className="p-6 max-w-3xl mx-auto">
          <div className="bg-white border rounded-lg shadow-lg overflow-hidden">
             <div className="bg-purple-50 p-6 border-b border-purple-100">
                <h2 className="text-xl font-bold text-purple-900 flex items-center gap-2">
                   <Network className="h-6 w-6" />
                   Expand: {expandingLocation.name}
                </h2>
                <p className="text-purple-700 mt-1">
                   Select sub-locations to add as new target locations.
                </p>
             </div>
             
             <div className="p-6">
                {isScanning ? (
                   <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                      <Loader2 className="h-10 w-10 animate-spin text-purple-600 mb-4" />
                      <p>Scanning geography...</p>
                   </div>
                ) : (
                   <>
                      {suggestedSubLocations.length === 0 ? (
                         <div className="text-center py-8 text-slate-500">
                            No sub-locations found via AI. 
                            <br/>
                            <Button variant="link" onClick={() => setExpandingLocation(null)}>Cancel</Button>
                         </div>
                      ) : (
                         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-6 max-h-[400px] overflow-y-auto">
                            {suggestedSubLocations.map(name => (
                               <div 
                                 key={name} 
                                 onClick={() => toggleSuggestion(name)}
                                 className={`
                                   p-3 rounded border cursor-pointer flex items-center justify-between transition-colors
                                   ${selectedSuggestions.has(name) ? 'bg-purple-50 border-purple-300 text-purple-900' : 'hover:bg-slate-50'}
                                 `}
                               >
                                  <span className="font-medium text-sm">{name}</span>
                                  {selectedSuggestions.has(name) && <CheckCircle2 className="h-4 w-4 text-purple-600" />}
                               </div>
                            ))}
                         </div>
                      )}
                      
                      <div className="flex justify-between items-center pt-4 border-t">
                         <div className="text-sm text-slate-500">
                            {selectedSuggestions.size} selected
                         </div>
                         <div className="flex gap-3">
                            <Button variant="ghost" onClick={() => setExpandingLocation(null)}>Cancel</Button>
                            <Button onClick={saveSubLocations} disabled={selectedSuggestions.size === 0 || isAddingSubLocations}>
                               {isAddingSubLocations ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                               Create {selectedSuggestions.size} Locations
                            </Button>
                         </div>
                      </div>
                   </>
                )}
             </div>
          </div>
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
                <th className="px-6 py-4">Region</th>
                <th className="px-6 py-4">Structure</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {locations.map((loc) => (
                <tr key={loc.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-900">
                    {loc.name}
                  </td>
                  <td className="px-6 py-4 text-slate-500">{loc.address_region || '-'}</td>
                   <td className="px-6 py-4 text-slate-500 text-xs">
                     {loc.parent_city ? (
                        <span className="text-slate-400">↳ Inside {loc.parent_city}</span>
                     ) : (
                        <span className="text-slate-800 font-medium">Top Level</span>
                     )}
                   </td>
                  <td className="px-6 py-4 text-right flex justify-end gap-2">
                    {!loc.parent_city && (
                       <Button 
                         variant="ghost" 
                         size="icon" 
                         onClick={() => startExpansion(loc)} 
                         title="Find sub-locations (boroughs/districts)"
                         className="text-purple-600 hover:bg-purple-50"
                       >
                         <Network className="h-4 w-4" />
                       </Button>
                    )}
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