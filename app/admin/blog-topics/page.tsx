
import React, { useEffect, useState } from 'react';
import { 
  Lightbulb, Loader2, Plus, RefreshCw, Trash2, 
  ChevronRight, ChevronDown, Layers, Map as MapIcon, 
  AlertTriangle, Mic, Target, Zap, CheckCircle2, Info,
  ArrowUp, Play, MessageSquare
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Textarea } from '../../../components/ui/textarea';
import { fetchBusinesses } from '../../../lib/db/businesses';
import { fetchServices } from '../../../lib/db/services';
import { fetchLocations } from '../../../lib/db/locations';
import { fetchKnowledgeEntities, createKnowledgeEntity } from '../../../lib/db/knowledge';
import { fetchIndustries } from '../../../lib/db/industries';
import { fetchBlogTopics, bulkCreateBlogTopics, clearAllTopics, updateBlogTopic, createBlogTopic, deleteBlogTopic } from '../../../lib/db/blog-topics';
import { generateTopicRoadmap, generateSubTopics, generateParentTopic } from '../../../lib/ai/topic-generator';
import type { BlogTopic, Business, KnowledgeEntity } from '../../../lib/types';
import { toast } from '../../../lib/toast';
import { useConfirm } from '../../../lib/confirm-dialog';
import { CardSkeleton, PageHeaderSkeleton } from '../../../components/shared/skeletons';

// --- MINDMAP NODE COMPONENT ---

interface TopicNodeProps {
  topic: BlogTopic;
  depth?: number;
  isSelected: boolean;
  onSelect: (topic: BlogTopic) => void;
}

const TopicNode: React.FC<TopicNodeProps> = ({ 
  topic, 
  depth = 0, 
  isSelected, 
  onSelect 
}) => {
  const [expanded, setExpanded] = useState(depth < 2); 
  const hasChildren = topic.children && topic.children.length > 0;
  
  const nodeStyles = {
    pillar: "border-l-4 border-purple-500 bg-purple-50",
    cluster: "border-l-4 border-blue-500 bg-white",
    "sub-cluster": "border-l-4 border-cyan-400 bg-slate-50",
    "micro-topic": "border-l-4 border-slate-300 bg-white opacity-90"
  };

  const styleClass = nodeStyles[topic.topic_type as keyof typeof nodeStyles] || nodeStyles['micro-topic'];

  return (
    <div className="relative">
      {depth > 0 && (
        <div className="absolute -left-4 top-6 w-4 h-px bg-slate-300"></div>
      )}
      
      <div 
        onClick={(e) => {
          e.stopPropagation();
          onSelect(topic);
        }}
        className={`
          mb-3 rounded-lg border shadow-sm p-4 transition-all duration-200 cursor-pointer
          ${styleClass}
          ${depth > 0 ? 'ml-6' : ''}
          ${isSelected ? 'ring-2 ring-purple-600 ring-offset-2' : 'hover:shadow-md'}
        `}
      >
        <div className="flex justify-between items-start">
          <div className="flex-1">
             <div className="flex items-center gap-2">
                {hasChildren && (
                  <div 
                    className="text-slate-400 hover:text-slate-600 p-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      setExpanded(!expanded);
                    }}
                  >
                    {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  </div>
                )}
                <h4 className="font-bold text-slate-800 text-sm md:text-base">
                  {topic.name}
                </h4>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-white/50 border text-slate-500">
                  {topic.topic_type}
                </span>
             </div>
             
             {expanded && (
               <div className="mt-3 text-sm text-slate-600 animate-in fade-in">
                  <p className="mb-2 text-xs">{topic.description}</p>
               </div>
             )}
          </div>
        </div>
      </div>

      {expanded && hasChildren && (
        <div className="border-l-2 border-slate-200 ml-4 pl-0 py-1">
           {topic.children?.map(child => (
             <TopicNode 
                key={child.id} 
                topic={child} 
                depth={depth + 1} 
                isSelected={false} // Only select top-level passed down usually, but here we manage selection via parent state
                onSelect={onSelect}
             />
           ))}
        </div>
      )}
    </div>
  );
};

// --- MAIN PAGE ---
export default function BlogTopicsPage() {
  const [topics, setTopics] = useState<BlogTopic[]>([]);
  const [flatTopics, setFlatTopics] = useState<BlogTopic[]>([]);
  const [rootBusiness, setRootBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);
  
  // Refinement State
  const [instructions, setInstructions] = useState("");
  const [isRefining, setIsRefining] = useState(false);

  // Side Panel Action State
  const [actionLoading, setActionLoading] = useState(false);
  const { confirm, ConfirmDialog } = useConfirm();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [tData, bData] = await Promise.all([
        fetchBlogTopics(),
        fetchBusinesses()
      ]);
      
      setFlatTopics(tData);
      const tree = buildTopicTree(tData);
      setTopics(tree);
      
      if (bData.length > 0) setRootBusiness(bData[0]);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const buildTopicTree = (flat: BlogTopic[]): BlogTopic[] => {
    const topicMap = new Map<string, BlogTopic>();
    const roots: BlogTopic[] = [];

    // Clone to avoid mutation issues
    const safeFlat = JSON.parse(JSON.stringify(flat));

    safeFlat.forEach((t: BlogTopic) => {
      topicMap.set(t.id, { ...t, children: [] });
    });

    safeFlat.forEach((t: BlogTopic) => {
      const node = topicMap.get(t.id);
      if (node) {
        if (t.parent_topic_id && topicMap.has(t.parent_topic_id)) {
          topicMap.get(t.parent_topic_id)?.children?.push(node);
        } else {
          roots.push(node);
        }
      }
    });

    return roots;
  };

  const handleGenerate = async (refinementMode = false) => {
    if (!rootBusiness) { toast.error("No root business found."); return; }
    
    // If refining, confirm with user
    if (refinementMode && topics.length > 0) {
       const confirmed = await confirm({
         title: "Regenerate Roadmap",
         message: "This will regenerate the entire roadmap based on your new instructions. Existing topics will be replaced. Continue?",
         confirmText: "Regenerate",
         cancelText: "Cancel",
         variant: "destructive",
       });
       if (!confirmed) return;
    }

    setGenerating(true);
    setIsRefining(refinementMode);

    try {
      const [services, locations, initialEntities, industries] = await Promise.all([
        fetchServices(),
        fetchLocations(),
        fetchKnowledgeEntities(),
        fetchIndustries()
      ]);

      const result = await generateTopicRoadmap({
        business: rootBusiness,
        services,
        locations,
        entities: initialEntities,
        industries
      }, instructions); // Pass user instructions

      const roadmap = result.topical_authority_roadmap;
      
      // Clear existing if strictly regenerating
      await clearAllTopics(rootBusiness.id);

      // Recursive Save
      const saveRecursive = async (nodes: any[], parentId: string | null = null, depth = 0) => {
         for (const node of nodes) {
            try {
               const dbPayload = {
                  business_id: rootBusiness.id,
                  name: node.name,
                  slug: node.slug || node.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                  description: node.description,
                  parent_topic_id: parentId,
                  depth_level: depth,
                  topic_type: node.topic_type,
                  content_intent: node.content_intent,
                  seo_notes: node.seo_notes,
                  speakable_hints: node.speakable_hints || [],
               };

               const savedTopicCorrect = await bulkCreateBlogTopics([dbPayload]);

               if (savedTopicCorrect && savedTopicCorrect[0] && node.children && node.children.length > 0) {
                  await saveRecursive(node.children, savedTopicCorrect[0].id, depth + 1);
               }
            } catch (err: any) {
               console.error("Failed to save topic node:", node.name, err);
            }
         }
      };

      if (roadmap.topics) {
         await saveRecursive(roadmap.topics);
      }

      await loadData();
      if (refinementMode) setInstructions(""); // Clear after success

    } catch (e: any) {
      toast.error("Generation failed", e.message);
    } finally {
      setGenerating(false);
      setIsRefining(false);
    }
  };

  // --- SUB-TOPIC GENERATION ---
  const handleGenerateSubtopics = async () => {
    const parent = flatTopics.find(t => t.id === selectedTopicId);
    if (!parent || !rootBusiness) return;

    setActionLoading(true);
    try {
      const [services, entities] = await Promise.all([fetchServices(), fetchKnowledgeEntities()]);
      
      const newSubTopics = await generateSubTopics(parent, {
         business: rootBusiness,
         services,
         locations: [],
         entities,
         industries: []
      });

      // Save to DB
      const payloads = newSubTopics.map(st => ({
         business_id: rootBusiness.id,
         name: st.name,
         slug: st.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
         description: st.description,
         parent_topic_id: parent.id, // Link to selected
         depth_level: parent.depth_level + 1,
         topic_type: st.topic_type || 'cluster',
         content_intent: st.content_intent
      }));

      await bulkCreateBlogTopics(payloads);
      await loadData();
      toast.success(`Added ${payloads.length} sub-topics to "${parent.name}"`);

    } catch (e: any) {
      toast.error("Failed", e.message);
    } finally {
      setActionLoading(false);
    }
  };

  // --- PARENT GENERATION (WRAPPER) ---
  const handleGenerateParent = async () => {
    const child = flatTopics.find(t => t.id === selectedTopicId);
    if (!child || !rootBusiness) return;

    setActionLoading(true);
    try {
      const newParentData = await generateParentTopic(child, {
         business: rootBusiness,
         services: [],
         locations: [],
         entities: [],
         industries: []
      });

      // 1. Create New Parent
      const savedParent = await createBlogTopic({
         business_id: rootBusiness.id,
         name: newParentData.name,
         slug: newParentData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
         description: newParentData.description,
         parent_topic_id: child.parent_topic_id, // Inherit existing parent (if any)
         depth_level: Math.max(0, child.depth_level - 1),
         topic_type: newParentData.topic_type || 'pillar',
      });

      // 2. Move Child to New Parent
      await updateBlogTopic(child.id, {
         parent_topic_id: savedParent.id,
         depth_level: savedParent.depth_level + 1
      });

      await loadData();
      toast.success(`Created parent "${savedParent.name}" and moved "${child.name}" inside.`);

    } catch (e: any) {
      toast.error("Failed", e.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteTopic = async () => {
    if (!selectedTopicId) return;
    const selectedTopic = flatTopics.find(t => t.id === selectedTopicId);
    const confirmed = await confirm({
      title: "Delete Topic",
      message: `Are you sure you want to delete "${selectedTopic?.name || 'this topic'}" AND all its children? This action cannot be undone.`,
      confirmText: "Delete",
      cancelText: "Cancel",
      variant: "destructive",
    });
    if (confirmed) {
       try {
         await deleteBlogTopic(selectedTopicId);
         toast.success(`"${selectedTopic?.name || 'Topic'}" deleted successfully`);
         setSelectedTopicId(null);
         loadData();
       } catch (e: any) {
         toast.error("Delete failed", e.message);
       }
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <PageHeaderSkeleton />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  const selectedTopic = flatTopics.find(t => t.id === selectedTopicId);

  return (
    <div className="flex h-[calc(100vh-64px)]">
      {/* MAIN CONTENT AREA */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="flex flex-col gap-6 mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              <Lightbulb className="h-8 w-8 text-yellow-500" />
              Blog Topic Hub
            </h1>
            <p className="text-slate-500 mt-2">
              Semantic mindmap of your topical authority.
            </p>
          </div>

          {/* REFINEMENT BOX */}
          <div className="bg-slate-50 border p-4 rounded-lg flex flex-col gap-3 shadow-sm">
             <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
                <MessageSquare className="h-4 w-4" />
                AI Refinement & Feedback
             </div>
             <Textarea 
               value={instructions}
               onChange={(e) => setInstructions(e.target.value)}
               placeholder="e.g. 'Brixton is in South West London, not East', or 'Focus more on high-ticket commercial services'..."
               className="bg-white min-h-[60px] text-sm"
             />
             <div className="flex justify-end gap-2">
               {topics.length > 0 && (
                 <Button 
                   variant="secondary" 
                   onClick={() => handleGenerate(true)} 
                   disabled={generating || !instructions}
                   className="text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200"
                 >
                   {generating && isRefining ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <RefreshCw className="h-4 w-4 mr-2" />}
                   Regenerate with Instructions
                 </Button>
               )}
               {topics.length === 0 && (
                 <Button onClick={() => handleGenerate(false)} disabled={generating}>
                   {generating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                   Generate Initial Roadmap
                 </Button>
               )}
             </div>
          </div>
        </div>

        {generating && !isRefining && (
          <div className="mb-8 bg-blue-50 border border-blue-200 rounded-lg p-4 animate-in fade-in">
             <div className="flex items-start gap-3">
                <Loader2 className="h-5 w-5 text-blue-600 mt-0.5 animate-spin" />
                <div>
                   <h3 className="font-bold text-blue-800">Generating Roadmap...</h3>
                   <p className="text-sm text-blue-700">Analyzing Knowledge Graph & Services (2-3 mins).</p>
                </div>
             </div>
          </div>
        )}

        <div className="space-y-4">
           {topics.length === 0 && !generating ? (
              <div className="text-center py-20 text-slate-400">
                 <p>No topics generated yet.</p>
              </div>
           ) : (
              topics.map(rootTopic => (
                 <TopicNode 
                   key={rootTopic.id} 
                   topic={rootTopic} 
                   depth={0} 
                   isSelected={selectedTopicId === rootTopic.id}
                   onSelect={(t) => setSelectedTopicId(t.id === selectedTopicId ? null : t.id)}
                 />
              ))
           )}
        </div>
      </div>

      {/* SIDE PANEL (DETAILS & ACTIONS) */}
      {selectedTopic && (
        <div className="w-80 border-l bg-white shadow-xl overflow-y-auto animate-in slide-in-from-right-10 flex flex-col">
           <div className="p-4 border-b bg-slate-50 flex justify-between items-start">
              <div>
                 <h3 className="font-bold text-lg text-slate-800 leading-tight">{selectedTopic.name}</h3>
                 <span className="text-[10px] uppercase font-bold text-slate-500">{selectedTopic.topic_type}</span>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setSelectedTopicId(null)}>×</Button>
           </div>
           
           <div className="p-4 space-y-6 flex-1">
              <div className="space-y-2">
                 <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Actions</h4>
                 
                 <Button 
                   className="w-full justify-start" 
                   variant="outline" 
                   onClick={handleGenerateSubtopics}
                   disabled={actionLoading}
                 >
                    {actionLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2"/> : <Play className="h-4 w-4 mr-2 text-green-600" />}
                    Generate Sub-Topics
                 </Button>
                 
                 <Button 
                   className="w-full justify-start" 
                   variant="outline"
                   onClick={handleGenerateParent}
                   disabled={actionLoading}
                 >
                    {actionLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2"/> : <ArrowUp className="h-4 w-4 mr-2 text-blue-600" />}
                    Create Wider Parent
                 </Button>

                 <Button 
                   className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50" 
                   variant="ghost"
                   onClick={handleDeleteTopic}
                 >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Topic
                 </Button>
              </div>

              <div className="space-y-3 pt-4 border-t">
                 <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Details</h4>
                 <p className="text-sm text-slate-600">{selectedTopic.description}</p>
                 
                 {selectedTopic.seo_notes && (
                    <div className="bg-amber-50 p-3 rounded border border-amber-100 text-xs text-amber-800">
                       <strong>Strategy:</strong> {selectedTopic.seo_notes}
                    </div>
                 )}
                 
                 <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-slate-50 p-2 rounded">
                       <span className="block text-slate-400">Intent</span>
                       <span className="font-medium capitalize">{selectedTopic.content_intent || '-'}</span>
                    </div>
                    <div className="bg-slate-50 p-2 rounded">
                       <span className="block text-slate-400">Volume</span>
                       <span className="font-medium">{selectedTopic.estimated_search_volume || 'Unknown'}</span>
                    </div>
                 </div>
              </div>
           </div>
         </div>
      )}
      <ConfirmDialog />
    </div>
  );
}
