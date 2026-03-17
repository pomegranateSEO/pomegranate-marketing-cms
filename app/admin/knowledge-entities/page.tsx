
import React, { useEffect, useState } from 'react';
import { Loader2, BookOpen, Search, Plus, Trash2, Eye, AlertCircle, Database, Globe, FolderOpen } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { fetchKnowledgeEntities, createKnowledgeEntity, deleteKnowledgeEntity, updateKnowledgeEntity } from '../../../lib/db/knowledge';
import type { KnowledgeEntity } from '../../../lib/types';
import { fetchBusinesses } from '../../../lib/db/businesses';
import { searchWikipedia, getWikidataIdFromWikipediaUrl, type WikiEntity } from '../../../lib/wikipedia/api';
import { toast } from '../../../lib/toast';
import { useConfirm } from '../../../lib/confirm-dialog';
import { CardSkeleton, PageHeaderSkeleton } from '../../../components/shared/skeletons';

export default function KnowledgeEntitiesPage() {
  const [entities, setEntities] = useState<KnowledgeEntity[]>([]);
  const [loading, setLoading] = useState(true);
  const [rootBusinessId, setRootBusinessId] = useState<string | null>(null);
  const { confirm, ConfirmDialog } = useConfirm();
  
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
      toast.error("Search failed. Please try again.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleSaveEntity = async (wikiResult: WikiEntity) => {
    if (!rootBusinessId) {
      toast.error("No Root Business found. Please create a business first.");
      return;
    }

    setIsSaving(true);
    try {
      // Check for duplicates locally by Wikipedia URL
      if (entities.some(e => e.wikipedia_url === wikiResult.url)) {
        toast.info("This entity is already in your Knowledge Graph.");
        setIsSaving(false);
        return;
      }

      // Simplified Payload as requested
      const payload: any = {
        business_id: rootBusinessId,
        name: wikiResult.title,
        description: wikiResult.description || wikiResult.excerpt || "No description available",
        entity_type: 'Thing', // Default fallback
        wikipedia_url: wikiResult.url || `https://en.wikipedia.org/wiki/${wikiResult.key}`,
        wikidata_url: null 
      };

      // Enhanced Categorization Logic based on keywords
      const desc = (payload.description || "").toLowerCase();
      const title = (payload.name || "").toLowerCase();

      if (desc.includes('seo') || title.includes('seo') || desc.includes('search engine')) {
         payload.entity_type = 'SEO Concept';
      } else if (desc.includes('design') || desc.includes('ui') || desc.includes('ux') || title.includes('design')) {
         payload.entity_type = 'Web Design';
      } else if (desc.includes('development') || desc.includes('code') || desc.includes('software') || title.includes('css') || title.includes('html')) {
         payload.entity_type = 'Web Development';
      } else if (desc.includes('business') || desc.includes('marketing') || desc.includes('strategy') || desc.includes('company')) {
         payload.entity_type = 'Business Term';
      } else if (desc.includes('customer') || desc.includes('audience') || desc.includes('demographic') || desc.includes('person')) {
         payload.entity_type = 'Customer Type';
      } else if (desc.includes('city') || desc.includes('town') || desc.includes('region') || desc.includes('village') || desc.includes('capital')) {
         payload.entity_type = 'Location';
      } else if (desc.includes('organization') || desc.includes('association')) {
         payload.entity_type = 'Organization';
      } else if (desc.includes('software') || desc.includes('app')) {
         payload.entity_type = 'Software Tool';
      }

      await createKnowledgeEntity(payload);

      // Clear search and reload
      setSearchQuery('');
      setSearchResults([]);
      await loadData();
      
    } catch (err: any) {
      console.error("Save Error:", err);
      toast.error("Failed to save entity", err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    const confirmed = await confirm({
      title: "Delete Knowledge Entity",
      message: `Are you sure you want to delete "${name}" from your knowledge graph? This action cannot be undone.`,
      confirmText: "Delete",
      cancelText: "Cancel",
      variant: "destructive",
    });
    if (confirmed) {
      try {
        console.log("Deleting ID:", id);
        await deleteKnowledgeEntity(id);
        await loadData();
        toast.success(`"${name}" deleted from knowledge graph`);
      } catch (err: any) {
        console.error(err);
        toast.error("Failed to delete entity", err.message);
      }
    }
  };

  const handleMassWikidataSync = async () => {
    setIsSyncingWikidata(true);
    let updatedCount = 0;
    let errors = 0;

    try {
        const targets = entities.filter(e => e.wikipedia_url && !e.wikidata_url);

        if (targets.length === 0) {
            toast.info("No entities found needing Wikidata URLs.");
            setIsSyncingWikidata(false);
            return;
        }

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
        toast.success(`Sync complete! Updated ${updatedCount} entities.`, errors > 0 ? `${errors} errors — check console.` : undefined);

    } catch (err) {
        console.error(err);
        toast.error("Mass sync failed unexpectedly.");
    } finally {
        setIsSyncingWikidata(false);
    }
  };

  // Group Entities by Type
  const groupedEntities = entities.reduce((groups, entity) => {
    const type = entity.entity_type || 'Uncategorized';
    if (!groups[type]) {
      groups[type] = [];
    }
    groups[type].push(entity);
    return groups;
  }, {} as Record<string, KnowledgeEntity[]>);

  // Sort groups alphabetically
  const sortedGroups = Object.keys(groupedEntities).sort();

  if (loading) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <PageHeaderSkeleton />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8 border-b pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Knowledge Entities</h1>
          <p className="text-muted-foreground mt-2">
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
          <div className="bg-muted p-6 rounded-lg border shadow-sm sticky top-6">
            <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Search className="h-5 w-5 text-primary" />
              Research Entities
            </h2>
            <form onSubmit={handleSearch} className="flex gap-2 mb-4">
              <Input 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Wikipedia..."
                className="bg-card"
                disabled={!rootBusinessId}
              />
               <Button type="submit" disabled={isSearching || !rootBusinessId} size="icon" aria-label="Search entities">
                 {isSearching ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Search className="h-4 w-4" aria-hidden="true" />}
               </Button>
            </form>

            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
              {searchResults.length === 0 && !isSearching && searchQuery && (
                <p className="text-sm text-muted-foreground text-center py-4">No results found.</p>
              )}
              {searchResults.map((result) => (
                <div key={result.id} className="bg-card p-3 rounded border hover:shadow-md transition-shadow">
                  <div className="flex gap-3">
                    {result.thumbnail && (
                      <img 
                        src={result.thumbnail.url} 
                        alt={result.title} 
                        className="w-12 h-12 object-cover rounded bg-muted flex-shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-sm text-foreground truncate">{result.title}</h4>
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{result.description}</p>
                      
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
<Button size="icon" variant="outline" className="h-9 w-9" aria-label="View source">
                                    <Eye className="h-4 w-4" aria-hidden="true" />
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

        {/* RIGHT COLUMN: Saved Entities (Grouped) */}
        <div className="lg:col-span-2 space-y-8">
           <div className="flex justify-between items-center">
<h2 className="font-bold text-lg flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-muted-foreground" />
                Saved Entities ({entities.length})
              </h2>
           </div>

          {entities.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed rounded-lg bg-muted">
              <BookOpen className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
              <p className="text-muted-foreground">No knowledge entities found.</p>
              <p className="text-xs text-muted-foreground/70 mt-2">Use the search tool on the left to add your first entity.</p>
            </div>
          ) : (
            <div className="space-y-8">
              {sortedGroups.map((group) => (
                <div key={group}>
<h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2 border-b pb-2">
                    <FolderOpen className="h-4 w-4" />
                    {group} ({groupedEntities[group].length})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {groupedEntities[group].map((entity) => (
                       <div key={entity.id} className="bg-card p-4 rounded-lg border shadow-sm group hover:border-primary/50 transition-colors relative flex flex-col">
                        
                        {/* Header: Actions */}
                        <div className="absolute top-3 right-3">
                           <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  handleDelete(entity.id, entity.name);
                              }}
                              className="h-9 w-9 text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950"
                              aria-label={`Delete ${entity.name}`}
                           >
                              <Trash2 className="h-4 w-4" />
                           </Button>
                        </div>
                        
                        {/* Content */}
                        <div className="flex gap-4 items-start flex-1 mb-3">
                           <div className="w-10 h-10 rounded bg-muted flex items-center justify-center border flex-shrink-0 text-muted-foreground font-bold text-xs uppercase">
                              {group.substring(0,2)}
                           </div>
                           <div className="min-w-0 pr-6">
                              <h3 className="font-bold text-md text-foreground line-clamp-1" title={entity.name}>{entity.name}</h3>
                              <p className="text-xs text-muted-foreground line-clamp-2 mt-1 leading-relaxed">
                                  {entity.description || "No description available."}
                              </p>
                           </div>
                        </div>

                        {/* Footer: Links */}
                        <div className="mt-auto pt-3 border-t flex flex-wrap gap-3">
                              {entity.wikipedia_url ? (
                                   <a 
                                      href={entity.wikipedia_url} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:underline"
                                   >
                                      <Globe className="h-3 w-3" /> Wikipedia
                                   </a>
                              ) : (
                                  <span className="flex items-center gap-1 text-xs text-muted-foreground/50 cursor-not-allowed">
                                      <Globe className="h-3 w-3" /> No Wiki
                                  </span>
                              )}

                              {entity.wikidata_url ? (
                                   <a 
                                      href={entity.wikidata_url} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="flex items-center gap-1 text-xs text-purple-600 dark:text-purple-400 hover:underline"
                                   >
                                      <Database className="h-3 w-3" /> Wikidata
                                   </a>
                              ) : (
                                  <span className="flex items-center gap-1 text-xs text-muted-foreground/50 cursor-not-allowed" title="Use 'Sync Wikidata IDs' button">
                                      <Database className="h-3 w-3" /> No ID
                                  </span>
                              )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <ConfirmDialog />
    </div>
  );
}
