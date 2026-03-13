
import React, { useEffect, useState } from 'react';
import { 
  Layers, Plus, Loader2, Search, 
  Trash2, Edit, CheckCircle, Filter, ArrowLeft, Zap
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { fetchServices } from '../../../lib/db/services';
import { fetchLocations } from '../../../lib/db/locations';
import { fetchBusinesses } from '../../../lib/db/businesses';
import { fetchKnowledgeEntities } from '../../../lib/db/knowledge';
import { fetchPageInstances, bulkCreatePageInstances, deletePageInstance, updatePageInstance } from '../../../lib/db/generation';
import type { Service, TargetLocation, PseoPageInstance, Business, KnowledgeEntity } from '../../../lib/types';
import { PseoPageEditor } from '../../../components/editors/PseoPageEditor';

export default function GenerationPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [locations, setLocations] = useState<TargetLocation[]>([]);
  const [rootBusiness, setRootBusiness] = useState<Business | null>(null);
  const [knowledgeEntities, setKnowledgeEntities] = useState<KnowledgeEntity[]>([]);
  const [selectedServiceId, setSelectedServiceId] = useState<string>('');
  
  // All pages (for dashboard stats)
  const [allPages, setAllPages] = useState<PseoPageInstance[]>([]);
  // Filtered pages (for matrix view)
  const [servicePages, setServicePages] = useState<Map<string, PseoPageInstance>>(new Map());
  
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null); // Stores ID of service being processed
  const [selection, setSelection] = useState<Set<string>>(new Set());
  
  // Filtering
  const [viewMode, setViewMode] = useState<'matrix' | 'list'>('matrix');
  const [filterQuery, setFilterQuery] = useState('');

  // Editing
  const [editingPage, setEditingPage] = useState<PseoPageInstance | null>(null);

  const toLandmarkArray = (value: unknown): string[] => {
    if (!Array.isArray(value)) return [];
    return value
      .map((item) => (typeof item === 'string' ? item.trim() : ''))
      .filter(Boolean)
      .slice(0, 3);
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [s, l, p, b, ke] = await Promise.all([
        fetchServices(), 
        fetchLocations(),
        fetchPageInstances(),
        fetchBusinesses(),
        fetchKnowledgeEntities(),
      ]);
      setServices(s);
      setLocations(l);
      setAllPages(p);
      if (b.length > 0) setRootBusiness(b[0]);
      setKnowledgeEntities(ke);
    } catch (e) {
      console.error("Failed to load initial data", e);
    } finally {
      setLoading(false);
    }
  };

  // When selecting a service, filter the pages for the matrix
  useEffect(() => {
    if (selectedServiceId) {
      const relevantPages = allPages.filter(p => p.service_id === selectedServiceId);
      const map = new Map<string, PseoPageInstance>();
      relevantPages.forEach(p => {
        if (p.location_id) map.set(p.location_id, p);
      });
      setServicePages(map);
      setSelection(new Set());
    }
  }, [selectedServiceId, allPages]);

  const toggleLocationSelection = (locationId: string) => {
    const newSet = new Set(selection);
    if (newSet.has(locationId)) newSet.delete(locationId);
    else newSet.add(locationId);
    setSelection(newSet);
  };

  const selectAllMissing = () => {
    const missing = locations.filter(l => !servicePages.has(l.id)).map(l => l.id);
    setSelection(new Set(missing));
  };

  const generatePages = async (serviceId: string, locationIds: string[]) => {
    const service = services.find(s => s.id === serviceId);
    if (!service || locationIds.length === 0) return;

    const validLocationIds = locationIds.filter((locId) => {
      const loc = locations.find((item) => item.id === locId);
      return toLandmarkArray(loc?.landmarks_list).length >= 3;
    });

    const skippedLocationNames = locationIds
      .map((locId) => locations.find((item) => item.id === locId))
      .filter((loc): loc is TargetLocation => !!loc)
      .filter((loc) => toLandmarkArray(loc.landmarks_list).length < 3)
      .map((loc) => loc.name);

    if (skippedLocationNames.length > 0) {
      alert(`Skipped ${skippedLocationNames.length} location(s) because they do not have 3 landmarks set: ${skippedLocationNames.join(', ')}`);
    }

    if (validLocationIds.length === 0) {
      return;
    }

    setActionLoading(serviceId);
    try {
      const payloads = validLocationIds.map(locId => {
        const loc = locations.find(l => l.id === locId);
        if (!loc) return null;

        const locationLandmarks = toLandmarkArray(loc.landmarks_list);
        const primaryLandmark = locationLandmarks[0] || loc.name;
        const serviceKeywordBlocks = Array.isArray(service.keyword_cycling_blocks)
          ? service.keyword_cycling_blocks
          : [];

        const lowerLoc = loc.name.toLowerCase().trim();
        const isNationwide = ['uk', 'united kingdom', 'nationwide', 'england'].includes(lowerLoc);
        
        const slug = isNationwide 
          ? service.base_slug 
          : `locations/${loc.slug}/${service.base_slug}`;
        
        const title = `${service.name} in ${loc.name}`;
        
        return {
          service_id: service.id,
          location_id: loc.id,
          url_slug: slug,
          seo_title: title,
          seo_meta_desc: `${service.short_description || service.name} available in ${loc.name}. Professional services near ${primaryLandmark}.`,
          status: 'draft',
          unique_hero: {
             headline: title,
             subheadline: `Expert ${service.name} services for ${loc.demographics_tag || 'residents'} in ${loc.name}.`
          },
          unique_local_context: {
             content: `Serving the ${loc.name} area near ${primaryLandmark || 'the city center'}.`
          },
          unique_process_content: service.shared_content_blocks?.process_content ? { content: service.shared_content_blocks.process_content } : null,
          landmarks: locationLandmarks,
          keyword_cycling_blocks: serviceKeywordBlocks
        };
      }).filter(Boolean) as any[];

      await bulkCreatePageInstances(payloads);
      
      const freshPages = await fetchPageInstances();
      setAllPages(freshPages);
      
    } catch (e: any) {
      alert("Generation failed: " + e.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleMatrixGenerate = () => {
    if (selectedServiceId) {
      generatePages(selectedServiceId, Array.from(selection));
    }
  };

  const handleQuickGenerate = (serviceId: string) => {
    const existingLocIds = new Set(allPages.filter(p => p.service_id === serviceId).map(p => p.location_id));
    const missingLocIds = locations.filter(l => !existingLocIds.has(l.id)).map(l => l.id);
    
    if (missingLocIds.length === 0) return;
    generatePages(serviceId, missingLocIds);
  };

  const handleDeletePage = async (pageId: string) => {
    if (!confirm("Are you sure you want to delete this page?")) return;
    try {
      await deletePageInstance(pageId);
      const freshPages = await fetchPageInstances();
      setAllPages(freshPages);
    } catch (e: any) {
      alert("Delete failed: " + e.message);
    }
  };

  const handleTogglePublish = async (page: PseoPageInstance) => {
    const newStatus = page.status === 'published' ? 'draft' : 'published';
    try {
      await updatePageInstance(page.id, { 
        status: newStatus,
        published: newStatus === 'published'
      });
      const updated = allPages.map(p => p.id === page.id ? { ...p, status: newStatus, published: newStatus === 'published' } : p);
      setAllPages(updated as PseoPageInstance[]);
    } catch (e: any) {
      alert("Status update failed: " + e.message);
    }
  };

  if (loading) {
    return <div className="p-12 text-center"><Loader2 className="h-8 w-8 animate-spin mx-auto text-slate-400" /></div>;
  }
  
  const editingService = services.find(s => s.id === editingPage?.service_id);
  const editingLocation = locations.find(l => l.id === editingPage?.location_id);

  // --- DASHBOARD VIEW (Service Overview) ---
  if (!selectedServiceId) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Generation Dashboard</h1>
            <p className="text-slate-500 mt-2">
              Phase 7: Site Generation & Management
            </p>
          </div>
        </div>

        {services.length === 0 ? (
           <div className="text-center py-20 bg-slate-50 border-2 border-dashed rounded-lg">
              <Layers className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900">No Services Found</h3>
              <p className="text-slate-500 mt-2">Create services in the 'Services' tab to begin generating pages.</p>
           </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map(service => {
              const pagesForService = allPages.filter(p => p.service_id === service.id);
              const count = pagesForService.length;
              const total = locations.length;
              const progress = total > 0 ? (count / total) * 100 : 0;
              const isProcessing = actionLoading === service.id;

              return (
                <div key={service.id} className="bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow flex flex-col overflow-hidden">
                  <div className="p-6 flex-1">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-bold text-lg text-slate-900">{service.name}</h3>
                        <div className="text-xs text-slate-500 font-mono mt-1">/{service.base_slug}</div>
                      </div>
                      <div className={`text-2xl font-bold ${count === total ? 'text-green-600' : 'text-slate-700'}`}>
                        {count}<span className="text-slate-300 text-lg">/{total}</span>
                      </div>
                    </div>
                    
                    <div className="w-full bg-slate-100 rounded-full h-2 mb-4 overflow-hidden">
                      <div 
                        className={`h-2 rounded-full transition-all duration-500 ${count === total ? 'bg-green-500' : 'bg-primary'}`} 
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>

                    <div className="flex gap-2 text-xs font-medium">
                       <span className="bg-slate-100 px-2 py-1 rounded text-slate-600">
                         {total - count} Missing
                       </span>
                       <span className="bg-green-50 px-2 py-1 rounded text-green-700">
                         {pagesForService.filter(p => p.status === 'published').length} Published
                       </span>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-4 border-t flex gap-3">
                    <Button 
                      variant="outline" 
                      className="flex-1" 
                      onClick={() => setSelectedServiceId(service.id)}
                    >
                      Manage Matrix
                    </Button>
                    {count < total && (
                      <Button 
                        className="flex-1" 
                        onClick={() => handleQuickGenerate(service.id)}
                        disabled={isProcessing}
                      >
                        {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4 mr-2" />}
                        Generate {total - count}
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // --- DETAIL VIEW (Service Matrix) ---
  const activeService = services.find(s => s.id === selectedServiceId);
  const generatedCount = servicePages.size;
  const missingCount = locations.length - generatedCount;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {editingPage && rootBusiness && activeService && editingLocation && (
        <PseoPageEditor 
          page={editingPage}
          business={rootBusiness}
          service={activeService}
          location={editingLocation}
          knowledgeEntities={knowledgeEntities}
          onClose={() => setEditingPage(null)} 
          onSaved={() => {
             // Refresh specific service data
             fetchPageInstances(selectedServiceId).then(fresh => {
                // Merge into allPages
                const others = allPages.filter(p => p.service_id !== selectedServiceId);
                setAllPages([...others, ...fresh]);
             });
          }} 
        />
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <Button variant="ghost" onClick={() => setSelectedServiceId('')} className="mb-2 pl-0 hover:bg-transparent hover:text-primary">
             <ArrowLeft className="h-4 w-4 mr-2" /> Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
             {activeService?.name} 
             <span className="text-slate-300 font-light">Matrix</span>
          </h1>
        </div>
        
        <div className="flex items-center gap-6 bg-white px-4 py-2 rounded-lg border shadow-sm">
           <div className="text-center">
              <span className="block font-bold text-xl text-slate-700">{locations.length}</span>
              <span className="text-[10px] uppercase text-slate-500 font-bold">Total</span>
           </div>
           <div className="h-8 w-px bg-slate-200"></div>
           <div className="text-center">
              <span className="block font-bold text-xl text-green-600">{generatedCount}</span>
              <span className="text-[10px] uppercase text-slate-500 font-bold">Created</span>
           </div>
           <div className="h-8 w-px bg-slate-200"></div>
           <div className="text-center">
              <span className="block font-bold text-xl text-amber-600">{missingCount}</span>
              <span className="text-[10px] uppercase text-slate-500 font-bold">Missing</span>
           </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex justify-between items-center mb-4 sticky top-0 bg-slate-50/95 backdrop-blur z-10 py-2 border-b">
         <div className="flex gap-2">
            <Button 
              variant={viewMode === 'matrix' ? 'default' : 'outline'} 
              size="sm" 
              onClick={() => setViewMode('matrix')}
            >
               <Layers className="h-4 w-4 mr-2" /> Matrix View
            </Button>
            <Button 
              variant={viewMode === 'list' ? 'default' : 'outline'} 
              size="sm" 
              onClick={() => setViewMode('list')}
            >
               <Filter className="h-4 w-4 mr-2" /> List View
            </Button>
         </div>

         {viewMode === 'matrix' && (
            <div className="flex gap-2">
               <Button variant="outline" size="sm" onClick={selectAllMissing}>
                 Select All Missing ({missingCount})
               </Button>
               <Button size="sm" onClick={handleMatrixGenerate} disabled={selection.size === 0 || !!actionLoading}>
                 {actionLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                 Generate {selection.size} Pages
               </Button>
            </div>
         )}
         
         {viewMode === 'list' && (
            <div className="relative w-64">
               <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
               <Input 
                 placeholder="Search pages..." 
                 className="pl-9 h-9" 
                 value={filterQuery}
                 onChange={(e) => setFilterQuery(e.target.value)}
               />
            </div>
         )}
      </div>

      {/* MATRIX VIEW */}
      {viewMode === 'matrix' && (
        <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 divide-y md:divide-y-0 md:divide-x border-b bg-slate-50 text-xs font-bold text-slate-500 uppercase tracking-wider">
               <div className="p-3">Location</div>
               <div className="p-3">Slug Preview</div>
               <div className="p-3 text-right">Status</div>
           </div>
           <div className="divide-y">
             {locations.map(loc => {
               const page = servicePages.get(loc.id);
               const isSelected = selection.has(loc.id);
               const isGenerated = !!page;
               const lowerLoc = loc.name.toLowerCase().trim();
               const isNationwide = ['uk', 'united kingdom', 'nationwide', 'england'].includes(lowerLoc);
               const previewSlug = isNationwide 
                  ? activeService?.base_slug 
                  : `locations/${loc.slug}/${activeService?.base_slug}`;
               
               return (
                 <div key={loc.id} className={`grid grid-cols-1 md:grid-cols-3 items-center group hover:bg-slate-50 transition-colors ${isSelected ? 'bg-blue-50/50' : ''}`}>
                    <div className="p-3 font-medium flex items-center gap-3">
                       {!isGenerated ? (
                         <input 
                           type="checkbox" 
                           checked={isSelected}
                           onChange={() => toggleLocationSelection(loc.id)}
                           className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary cursor-pointer"
                         />
                       ) : (
                         <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                       )}
                       <span className={isGenerated ? 'text-slate-900' : 'text-slate-600'}>{loc.name}</span>
                    </div>
                    <div className="p-3 text-xs font-mono text-slate-500 truncate" title={page ? page.url_slug : previewSlug}>
                       /{page ? page.url_slug : previewSlug}
                    </div>
                    <div className="p-3 text-right">
                       {page ? (
                          <div className="flex justify-end gap-2">
                             <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${page.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
                                {page.status === 'published' ? 'Published' : 'Draft'}
                             </span>
                             <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setEditingPage(page)}>
                               <Edit className="h-3 w-3" />
                             </Button>
                          </div>
                       ) : (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-500">
                             Missing
                          </span>
                       )}
                    </div>
                 </div>
               );
             })}
           </div>
        </div>
      )}

      {/* LIST VIEW */}
      {viewMode === 'list' && (
         <div className="bg-white border rounded-lg shadow-sm">
            <table className="w-full text-sm text-left">
               <thead className="bg-slate-50 border-b font-medium text-slate-500">
                  <tr>
                     <th className="px-6 py-3">Location / Title</th>
                     <th className="px-6 py-3">Slug</th>
                     <th className="px-6 py-3">Status</th>
                     <th className="px-6 py-3 text-right">Actions</th>
                  </tr>
               </thead>
               <tbody className="divide-y">
                  {Array.from(servicePages.values())
                    .filter((p: PseoPageInstance) => 
                       (p.seo_title?.toLowerCase() || '').includes(filterQuery.toLowerCase()) || 
                       (p.url_slug || '').includes(filterQuery.toLowerCase())
                    )
                    .map((page: PseoPageInstance) => {
                      const loc = locations.find(l => l.id === page.location_id);
                      return (
                         <tr key={page.id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-3">
                               <div className="font-medium text-slate-900">{loc?.name || 'Unknown Location'}</div>
                               <div className="text-xs text-slate-500">{page.seo_title}</div>
                            </td>
                            <td className="px-6 py-3 font-mono text-xs text-slate-500">
                               /{page.url_slug}
                            </td>
                            <td className="px-6 py-3">
                               <button 
                                 onClick={() => handleTogglePublish(page)}
                                 className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors ${
                                   page.status === 'published' 
                                     ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                                     : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                                 }`}
                               >
                                  {page.status === 'published' ? 'Published' : 'Draft'}
                               </button>
                            </td>
                            <td className="px-6 py-3 text-right">
                               <div className="flex justify-end gap-2">
                                  <Button variant="ghost" size="icon" onClick={() => setEditingPage(page)}>
                                     <Edit className="h-4 w-4 text-slate-500" />
                                  </Button>
                                  <Button variant="ghost" size="icon" onClick={() => handleDeletePage(page.id)}>
                                     <Trash2 className="h-4 w-4 text-red-500" />
                                  </Button>
                               </div>
                            </td>
                         </tr>
                      );
                  })}
                  {servicePages.size === 0 && (
                     <tr>
                        <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                           No pages generated yet. Switch to "Matrix View" to create them.
                        </td>
                     </tr>
                  )}
               </tbody>
            </table>
         </div>
      )}
    </div>
  );
}
