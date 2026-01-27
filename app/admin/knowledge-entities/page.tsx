import React, { useEffect, useState } from 'react';
import { Loader2, BookOpen, ExternalLink, Search, Plus, Trash2, Save, AlertCircle, Eye, AlertTriangle, Database, RefreshCw, Globe, LinkIcon } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { fetchKnowledgeEntities, createKnowledgeEntity, deleteKnowledgeEntity, updateKnowledgeEntity } from '../../../lib/db/knowledge';
import type { KnowledgeEntity } from '../../../lib/types';
import { fetchBusinesses } from '../../../lib/db/businesses';
import { searchWikipedia, getWikidataIdFromWikipediaUrl, type WikiEntity } from '../../../lib/wikipedia/api';

export default function KnowledgeEntitiesPage() {
  const [entities, setEntities] = useState<KnowledgeEntity[]>([]);
  const [loading, setLoading] = useState(true);
  const [rootBusinessId, setRootBusinessId] = useState<string | null>(null);
  
  // Research State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<WikiEntity[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Mass Sync State
  const [isSyncingWikidata, setIsSyncingWikidata] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [entitiesData, businessesData] = await Promise.all([
        fetchKnowledgeEntities(),
        fetchBusinesses()
      ]);
      setEntities(entitiesData);
      
      if (businessesData.length > 0) {
        setRootBusinessId(businessesData[0].id);
      }
    } catch (err) {
      console.error("Failed to load data", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const results = await searchWikipedia(searchQuery);
      setSearchResults(results);
    } catch (err) {
      console.error(err);
      alert("Search failed. Check console.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleSaveEntity = async (wikiResult: WikiEntity) => {
    if (!rootBusinessId) {
      alert("Error: No Root Business found. Please create a business in the 'Businesses' tab first.");
      return;
    }

    setIsSaving(true);
    try {
      // Check for duplicates locally by Wikipedia URL
      if (entities.some(e => e.wikipedia_url === wikiResult.url)) {
        alert("This entity is already in your Knowledge Graph (matched by Wikipedia URL).");
        setIsSaving(false);
        return;
      }

      // Simplified Payload as requested
      const payload: any = {
        business_id: rootBusinessId,
        name: wikiResult.title,
        description: wikiResult.description || wikiResult.excerpt || "No description available",
        entity_type: 'Thing', // Default fallback, user can edit later if we add edit functionality
        wikipedia_url: wikiResult.url || `https://en.wikipedia.org/wiki/${wikiResult.key}`,
        wikidata_url: null // Wikipedia search often doesn't give Wikidata ID directly without extra calls
      };

      // Basic mapping for Entity Type based on description keywords
      const desc = (payload.description || "").toLowerCase();
      if (desc.includes('company') || desc.includes('business') || desc.includes('organization')) {
        payload.entity_type = 'Organization';
      } else if (desc.includes('person') || desc.includes('biography')) {
        payload.entity_type = 'Person';
      } else if (desc.includes('place') || desc.includes('city') || desc.includes('region')) {
        payload.entity_type = 'Place';
      } else if (desc.includes('software') || desc.includes('app')) {
        payload.entity_type = 'SoftwareApplication';
      } else if (desc.includes('service')) {
        payload.entity_type = 'Service';
      }

      const saved = await createKnowledgeEntity(payload);
      
      if (!saved) {
         throw new Error("Database insert returned null. Check RLS policies.");
      }

      // Clear search and reload
      setSearchQuery('');
      setSearchResults([]);
      await loadData();
      
    } catch (err: any) {
      console.error("Save Error:", err);
      alert(`Failed to save entity: ${err.message || JSON.stringify(err)}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    // Explicit confirm dialog
    if (window.confirm(`Are you sure you want to delete "${name}" from your knowledge graph?`)) {
      try {
        await deleteKnowledgeEntity(id);
        await loadData(); // Reload immediately
      } catch (err: any) {
        console.error(err);
        alert("Failed to delete entity: " + err.message);
      }
    }
  };

  const handleMassWikidataSync = async () => {
    setIsSyncingWikidata(true);
    let updatedCount = 0;
    let errors = 0;

    try {
        // Filter entities that have Wikipedia but NO Wikidata
        const targets = entities.filter(e => e.wikipedia_url && !e.wikidata_url);

        if (targets.length === 0) {
            alert("No entities found needing Wikidata URLs.");
            setIsSyncingWikidata(false);
            return;
        }

        // Process sequentially to be nice to APIs
        for (const entity of targets) {
            if (!entity.wikipedia_url) continue;

            try {
                const wikidataUrl = await getWikidataIdFromWikipediaUrl(entity.wikipedia_url);
                
                if (wikidataUrl) {
                    await updateKnowledgeEntity(entity.id, { wikidata_url: wikidataUrl });
                    updatedCount++;
                }
            } catch (e) {
                console.error(`Failed to update ${entity.name}`, e);
                errors++;
            }
        }

        await loadData();
        alert(`Sync Complete!\nUpdated: ${updatedCount} entities.\nErrors: ${errors}`);

    } catch (err) {
        console.error(err);
        alert("Mass sync failed unexpectedly.");
    } finally {
        setIsSyncingWikidata(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8 border-b pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Knowledge Entities</h1>
          <p className="text-slate-500 mt-2">
            Research and map external entities (Wikipedia/Wikidata) to establish semantic authority.
          </p>
        </div>
        <div className="flex gap-2">
            <Button 
                variant="outline" 
                onClick={handleMassWikidataSync} 
                disabled={isSyncingWikidata || entities.length === 0}
                title="Find missing Wikidata IDs for existing entities"
            >
                {isSyncingWikidata ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Database className="h-4 w-4 mr-2 text-blue-600" />}
                Sync Wikidata IDs
            </Button>
        </div>
      </div>

      {!rootBusinessId && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-md mb-6 flex items-center gap-3">
            <AlertCircle className="h-5 w-5" />
            <div>
                <p className="font-bold">Missing Root Business</p>
                <p className="text-sm">You must create a Business Entity before adding knowledge nodes.</p>
            </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT COLUMN: Research Tool */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-slate-50 p-6 rounded-lg border shadow-sm sticky top-6">
            <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Search className="h-5 w-5 text-primary" />
              Research Entities
            </h2>
            <form onSubmit={handleSearch} className="flex gap-2 mb-4">
              <Input 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Wikipedia..."
                className="bg-white"
                disabled={!rootBusinessId}
              />
              <Button type="submit" disabled={isSearching || !rootBusinessId} size="icon">
                {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              </Button>
            </form>

            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
              {searchResults.length === 0 && !isSearching && searchQuery && (
                <p className="text-sm text-slate-400 text-center py-4">No results found.</p>
              )}
              {searchResults.map((result) => (
                <div key={result.id} className="bg-white p-3 rounded border hover:shadow-md transition-shadow">
                  <div className="flex gap-3">
                    {result.thumbnail && (
                      <img 
                        src={result.thumbnail.url} 
                        alt={result.title} 
                        className="w-12 h-12 object-cover rounded bg-slate-100 flex-shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-sm text-slate-900 truncate">{result.title}</h4>
                      <p className="text-xs text-slate-500 line-clamp-2 mt-1">{result.description}</p>
                      
                      <div className="flex gap-2 mt-2">
                          <Button 
                            size="sm" 
                            variant="secondary" 
                            className="flex-1 h-7 text-xs"
                            onClick={() => handleSaveEntity(result)}
                            disabled={isSaving || !rootBusinessId}
                          >
                            {isSaving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Plus className="h-3 w-3 mr-1" />}
                            Add
                          </Button>
                          {result.url && (
                             <a href={result.url} target="_blank" rel="noopener noreferrer">
                               <Button size="icon" variant="outline" className="h-7 w-7" title="View Source">
                                  <Eye className="h-3 w-3" />
                               </Button>
                             </a>
                          )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Saved Entities */}
        <div className="lg:col-span-2">
           <div className="flex justify-between items-center mb-4">
             <h2 className="font-bold text-lg flex items-center gap-2">
               <BookOpen className="h-5 w-5 text-slate-600" />
               Saved Entities ({entities.length})
             </h2>
           </div>

          {entities.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed rounded-lg bg-slate-50">
              <BookOpen className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">No knowledge entities found.</p>
              <p className="text-xs text-slate-400 mt-2">Use the search tool on the left to add your first entity.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {entities.map((entity) => (
                <div key={entity.id} className="bg-white p-4 rounded-lg border shadow-sm group hover:border-primary/50 transition-colors relative flex flex-col">
                  
                  {/* Header: Type + Actions */}
                  <div className="flex justify-between items-start mb-3">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-bold bg-slate-100 text-slate-600`}>
                      {(entity.entity_type || 'Unknown')}
                    </span>
                    <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleDelete(entity.id, entity.name);
                        }}
                        className="h-6 w-6 text-slate-300 hover:text-red-500 hover:bg-red-50"
                        title="Delete Entity"
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {/* Content */}
                  <div className="flex gap-4 items-start flex-1">
                     <div className="w-12 h-12 rounded bg-slate-100 flex items-center justify-center border flex-shrink-0 text-slate-400 font-bold text-xs uppercase">
                        {(entity.entity_type || 'Un').substring(0,2)}
                     </div>
                     <div className="min-w-0">
                        <h3 className="font-bold text-md text-slate-900 line-clamp-1" title={entity.name}>{entity.name}</h3>
                        <p className="text-xs text-slate-500 line-clamp-3 mt-1 leading-relaxed">
                            {entity.description || "No description available."}
                        </p>
                     </div>
                  </div>

                  {/* Footer: Links */}
                  <div className="mt-4 pt-3 border-t flex flex-wrap gap-3">
                        {entity.wikipedia_url ? (
                             <a 
                                href={entity.wikipedia_url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 text-xs text-blue-600 hover:underline"
                             >
                                <Globe className="h-3 w-3" /> Wikipedia
                             </a>
                        ) : (
                            <span className="flex items-center gap-1 text-xs text-slate-300 cursor-not-allowed">
                                <Globe className="h-3 w-3" /> No Wiki URL
                            </span>
                        )}

                        {entity.wikidata_url ? (
                             <a 
                                href={entity.wikidata_url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 text-xs text-purple-600 hover:underline"
                             >
                                <Database className="h-3 w-3" /> Wikidata
                             </a>
                        ) : (
                             <span className="flex items-center gap-1 text-xs text-slate-300 cursor-not-allowed" title="Use 'Sync Wikidata IDs' button to fetch">
                                <Database className="h-3 w-3" /> No Wikidata ID
                             </span>
                        )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
