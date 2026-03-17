
import React, { useEffect, useState } from 'react';
import { PenTool, Plus, Edit2, Trash2, Loader2, FileText, Save, ArrowLeft, Image as ImageIcon, X, AlertTriangle, Code, Lightbulb } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Textarea } from '../../../components/ui/textarea';
import { Label } from '../../../components/ui/label';
import { fetchPosts, createPost, updatePost, deletePost } from '../../../lib/db/posts';
import { fetchBusinesses } from '../../../lib/db/businesses';
import { fetchKnowledgeEntities } from '../../../lib/db/knowledge';
import { fetchBlogTopics } from '../../../lib/db/blog-topics';
import type { BlogPost, Business, GlobalTheme, KnowledgeEntity, BlogTopic } from '../../../lib/types';
import { EntityGenerator } from '../../../components/shared/EntityGenerator';
import { VisualContentEditor } from '../../../components/shared/VisualContentEditor';
import { MediaManager } from '../../../components/shared/MediaManager';
import { FAQEditor } from '../../../components/shared/FAQEditor';
import { AITextGenerator } from '../../../components/shared/AITextGenerator';
import { KnowledgeEntitySelector } from '../../../components/shared/KnowledgeEntitySelector';
import { toast } from '../../../lib/toast';
import { useConfirm } from '../../../lib/confirm-dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose, DialogBody } from '../../../components/ui/dialog';
import { TableSkeleton, PageHeaderSkeleton } from '../../../components/shared/skeletons';

export default function PostsPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [knowledgeEntities, setKnowledgeEntities] = useState<KnowledgeEntity[]>([]);
  const [topics, setTopics] = useState<BlogTopic[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [rootBusiness, setRootBusiness] = useState<Business | null>(null);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'semantic' | 'settings'>('semantic');
  const { confirm, ConfirmDialog } = useConfirm();
  
  // Media Picker State
  const [showMediaPicker, setShowMediaPicker] = useState(false);

  // Local form state
  const [formState, setFormState] = useState({
    id: '',
    title: '', // maps to headline
    slug: '',
    content: '', // maps to content_body
    excerpt: '', // maps to seo_meta_desc
    featured_image_url: '',
    status: 'draft',
    faqs: [] as { question: string; answer: string }[],
    keywords: [] as string[],
    target_keyword_input: '', // For UI/AI only
    custom_head: '', // Not persisted in standard schema
    about_entities: [] as string[],
    mentions_entities: [] as string[]
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [postsData, businessesData, keData, topicsData] = await Promise.all([
        fetchPosts(),
        fetchBusinesses(),
        fetchKnowledgeEntities(),
        fetchBlogTopics()
      ]);
      setPosts(postsData);
      setKnowledgeEntities(keData);
      setTopics(topicsData);
      if (businessesData.length > 0) {
        setRootBusiness(businessesData[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rootBusiness) { toast.error("No Root Business found. Please create one first."); return; }

    setSaving(true);
    try {
      const payload = {
        id: formState.id,
        business_id: rootBusiness.id,
        title: formState.title,
        slug: formState.slug || formState.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
        content: formState.content,
        excerpt: formState.excerpt,
        featured_image_url: formState.featured_image_url,
        status: formState.status,
        faqs: formState.faqs,
        keywords: formState.target_keyword_input ? [formState.target_keyword_input] : [], // Simplistic mapping
        about_entities: formState.about_entities,
        mentions_entities: formState.mentions_entities
      };

      if (formState.id) {
        await updatePost(formState.id, payload);
      } else {
        await createPost(payload);
      }
      setIsEditing(false);
      resetForm();
      loadData();
    } catch (err: any) {
      toast.error("Failed to save post", err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    const confirmed = await confirm({
      title: "Delete Post",
      message: `Are you sure you want to delete "${title}"? This action cannot be undone.`,
      confirmText: "Delete",
      cancelText: "Cancel",
      variant: "destructive",
    });
    
    if (confirmed) {
      try {
        await deletePost(id);
        toast.success(`Post "${title}" deleted successfully`);
        loadData();
      } catch (e: any) {
        toast.error("Failed to delete post", e.message);
      }
    }
  };

  const startEdit = (post?: BlogPost) => {
    setActiveTab('content');
    if (post) {
      const postFaqs = Array.isArray(post.faqs) 
        ? post.faqs as { question: string; answer: string }[] 
        : [];

      setFormState({
        id: post.id,
        title: post.headline, // map DB headline to UI title
        slug: post.slug,
        content: post.content_body || post.article_body_raw || '', // map DB content_body to UI content
        excerpt: post.seo_meta_desc || '', // map DB seo_meta_desc to UI excerpt
        featured_image_url: post.featured_image_url || '',
        status: post.status,
        faqs: postFaqs,
        keywords: post.keywords || [],
        target_keyword_input: post.keywords?.[0] || '',
        custom_head: '',
        about_entities: post.about_entities || [],
        mentions_entities: post.mentions_entities || []
      });
    } else {
      resetForm();
    }
    setIsEditing(true);
  };

  const resetForm = () => {
    setFormState({ id: '', title: '', slug: '', content: '', excerpt: '', featured_image_url: '', status: 'draft', faqs: [], keywords: [], target_keyword_input: '', custom_head: '', about_entities: [], mentions_entities: [] });
  };

  const handleImageSelect = (url: string) => {
    setFormState(prev => ({ ...prev, featured_image_url: url }));
    setShowMediaPicker(false);
  };

  const handleTopicSelect = (topicId: string) => {
    const topic = topics.find(t => t.id === topicId);
    if (!topic) return;
    
    // Only update fields if they are empty or user confirms overwrite?
    // For simplicity, we assume selection means intent to use.
    setFormState(prev => ({
      ...prev,
      title: topic.name,
      slug: topic.slug || prev.slug,
      excerpt: topic.description || prev.excerpt,
      // Use topic name as target keyword if keyword is empty
      target_keyword_input: prev.target_keyword_input || topic.name
    }));
  };

  // Content for SINGLE post entity generation
  const getPostContent = () => {
    return `Title: ${formState.title}\nExcerpt: ${formState.excerpt}\nBody Content:\n${formState.content}`;
  };

  // Content for BULK entity generation
  const getAllPostsContent = () => {
    return posts.map(p => `Post: ${p.headline}\n${p.content_body}`).join('\n---\n');
  };

  if (loading) {
    return (
      <div className="p-6">
        <PageHeaderSkeleton />
        <TableSkeleton rows={5} columns={4} />
      </div>
    );
  }

  if (isEditing) {
    const brandTheme = rootBusiness?.global_theme as GlobalTheme;

    return (
      <div className="p-6 max-w-5xl mx-auto">
        {/* Media Picker Modal */}
        <Dialog open={showMediaPicker} onOpenChange={setShowMediaPicker}>
          <DialogContent className="max-w-4xl h-[700px] p-0">
            <DialogHeader className="p-4 border-b">
              <DialogTitle id="media-picker-title">Select Featured Image</DialogTitle>
              <DialogClose onClose={() => setShowMediaPicker(false)} />
            </DialogHeader>
            <DialogBody className="p-0 flex-1 min-h-0 bg-slate-50">
              <MediaManager 
                mode="picker" 
                onSelect={handleImageSelect} 
                onClose={() => setShowMediaPicker(false)} 
              />
            </DialogBody>
          </DialogContent>
        </Dialog>

        <div className="flex justify-between items-center mb-6">
           <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => setIsEditing(false)}>
                  <ArrowLeft className="h-4 w-4 mr-2" /> Back
              </Button>
              <h2 className="text-2xl font-bold">{formState.id ? 'Edit Post' : 'New Blog Post'}</h2>
           </div>
           {rootBusiness && (
              <EntityGenerator getContent={getPostContent} businessId={rootBusiness.id} sourceName="Body Content" />
           )}
        </div>

<form onSubmit={handleSave} className="space-y-6 bg-white p-6 rounded-lg border shadow-sm">
          
              {/* TOPIC SELECTOR */}
              <div className="space-y-2 mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                <Label className="text-yellow-800 flex items-center gap-2">
                   <Lightbulb className="h-4 w-4" />
                   Start from Roadmap Topic (Optional)
                </Label>
                <div className="flex gap-2">
                   <select 
                      className="flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm"
                      onChange={(e) => handleTopicSelect(e.target.value)}
                      defaultValue=""
                   >
                      <option value="">-- Select a Suggested Topic --</option>
                      {topics.map(t => (
                         <option key={t.id} value={t.id}>{t.name} ({t.topic_type})</option>
                      ))}
                   </select>
                </div>
                <p className="text-xs text-yellow-700">Selecting a topic will auto-populate the Headline, Slug, and Description.</p>
              </div>

              {/* KEYWORD FIRST */}
              <div className="bg-blue-50/50 p-4 rounded border border-blue-100 mb-6">
                  <Label className="text-blue-800 font-semibold mb-1 block">Target Keyword (Primary)</Label>
                  <Input 
                    value={formState.target_keyword_input}
                    onChange={(e) => setFormState({...formState, target_keyword_input: e.target.value})}
                    placeholder="Target Keyword (e.g. 'Digital Marketing Strategies')"
                    className="bg-white"
                  />
                  {!formState.target_keyword_input && (
                     <p className="text-xs text-amber-600 mt-2 flex items-center gap-1 font-medium">
                        <AlertTriangle className="h-3 w-3" />
                        No target keyword set. Content may not rank well.
                     </p>
                  )}
              </div>

              {/* MAIN CONTENT FIELDS - Always visible */}
              <div className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label>Post Headline</Label>
                      <AITextGenerator 
                        onGenerate={t => setFormState({...formState, title: t})}
                        fieldName="Headline"
                        keyword={formState.target_keyword_input}
                        currentValue={formState.title}
                        brandTheme={brandTheme}
                      />
                    </div>
                    <Input 
                      value={formState.title || ''} 
                      onChange={e => setFormState({...formState, title: e.target.value})} 
                      required 
                      placeholder="e.g. 10 Tips for..."
                    />
                  </div>

                  <div className="space-y-2">
                     <Label>Featured Image</Label>
                     <div className="flex gap-4 items-start">
                        <div className="flex-1 flex gap-2">
                           <Input 
                              value={formState.featured_image_url || ''}
                              onChange={e => setFormState({...formState, featured_image_url: e.target.value})}
                              placeholder="https://... (or select from library)"
                           />
                           <Button 
                             type="button" 
                             variant="secondary" 
                             onClick={() => setShowMediaPicker(true)}
                             className="whitespace-nowrap"
                           >
                              <ImageIcon className="h-4 w-4 mr-2" />
                              Select Image
                           </Button>
                        </div>
                     </div>
                     {formState.featured_image_url && (
                        <div className="mt-2 relative w-fit group">
                           <img 
                              src={formState.featured_image_url} 
                              alt="Preview" 
                              className="h-32 w-auto object-cover rounded border bg-slate-50" 
                           />
                            <button 
                              type="button"
                              onClick={() => setFormState(prev => ({ ...prev, featured_image_url: '' }))}
                              className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                              aria-label="Remove featured image"
                            >
                               <X className="h-3 w-3" aria-hidden="true" />
                            </button>
                        </div>
                     )}
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label>Excerpt (SEO Meta Description)</Label>
                      <AITextGenerator 
                        onGenerate={t => setFormState({...formState, excerpt: t})}
                        fieldName="Meta Description"
                        keyword={formState.target_keyword_input}
                        currentValue={formState.excerpt}
                        brandTheme={brandTheme}
                      />
                    </div>
                    <Textarea 
                      value={formState.excerpt || ''} 
                      onChange={e => setFormState({...formState, excerpt: e.target.value})} 
                      className="h-20"
                      placeholder="A brief summary for search engines..."
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                       Body Content (Visual Builder)
                       <span className="text-xs text-slate-400 font-normal">(Compartments supported)</span>
                    </Label>
                    <VisualContentEditor 
                      value={formState.content || ''} 
                      onChange={val => setFormState({...formState, content: val})}
                      minHeight="min-h-[600px]"
                      brandTheme={brandTheme}
                      keyword={formState.target_keyword_input}
                    />
                  </div>
              </div>

              {/* STATUS & SLUG - Always visible */}
              <div className="grid grid-cols-2 gap-6 p-4 bg-slate-50 rounded-lg border">
                  <div className="space-y-2">
                    <Label>Slug (URL)</Label>
                    <Input 
                      value={formState.slug || ''} 
                      onChange={e => setFormState({...formState, slug: e.target.value})} 
                      placeholder="auto-generated-from-title"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <select 
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={formState.status || 'draft'}
                      onChange={e => setFormState({...formState, status: e.target.value as any})}
                    >
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                      <option value="archived">Archived</option>
                    </select>
                 </div>
              </div>

          {/* SECONDARY TABS - Semantic & Advanced Settings */}
          <div className="border-t pt-6 mt-6">
            <div className="flex border-b bg-slate-50 mb-4 rounded-t-lg" role="tablist" aria-label="Post settings tabs">
               <button
                 type="button"
                 id="tab-semantic"
                 role="tab"
                 aria-selected={activeTab === 'semantic'}
                 aria-controls="panel-semantic"
                 onClick={() => setActiveTab('semantic')}
                 className={`px-6 py-3 text-sm font-medium border-b-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${activeTab === 'semantic' ? 'border-primary text-primary' : 'border-transparent text-slate-500'}`}
               >
                 Semantic Markup
               </button>
               <button
                 type="button"
                 id="tab-settings"
                 role="tab"
                 aria-selected={activeTab === 'settings'}
                 aria-controls="panel-settings"
                 onClick={() => setActiveTab('settings')}
                 className={`px-6 py-3 text-sm font-medium border-b-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${activeTab === 'settings' ? 'border-primary text-primary' : 'border-transparent text-slate-500'}`}
               >
                 Advanced Settings
               </button>
            </div>

            {/* SEMANTIC TAB */}
            <div
              id="panel-semantic"
              role="tabpanel"
              aria-labelledby="tab-semantic"
              className={activeTab === 'semantic' ? 'block' : 'hidden'}
            >
                {/* FAQ Editor Section */}
                <FAQEditor
                  value={formState.faqs}
                  onChange={(faqs) => setFormState({...formState, faqs: faqs})}
                  sourceText={formState.content}
                />

                <div className="grid grid-cols-2 gap-6">
                   <KnowledgeEntitySelector
                      label="About Entities"
                      allEntities={knowledgeEntities}
                      selectedIds={formState.about_entities}
                      onChange={(ids) => setFormState({...formState, about_entities: ids})}
                      contentToScan={getPostContent()}
                   />
                   <KnowledgeEntitySelector
                      label="Mentioned Entities"
                      allEntities={knowledgeEntities}
                      selectedIds={formState.mentions_entities}
                      onChange={(ids) => setFormState({...formState, mentions_entities: ids})}
                      contentToScan={getPostContent()}
                   />
                </div>
            </div>

            {/* SETTINGS TAB */}
            <div
              id="panel-settings"
              role="tabpanel"
              aria-labelledby="tab-settings"
              className={activeTab === 'settings' ? 'block' : 'hidden'}
            >
                <div className="space-y-2">
                   <Label className="flex items-center gap-2">
                      <Code className="h-4 w-4 text-slate-500" />
                      Custom &lt;head&gt; Code
                   </Label>
                   <Textarea
                      value={formState.custom_head}
                      onChange={e => setFormState({...formState, custom_head: e.target.value})}
                      placeholder="<script>...</script> or <meta name='...'>"
                      className="font-mono text-xs h-32 bg-slate-50"
                   />
                   <p className="text-xs text-slate-500">Note: This code is currently UI-only and may not persist without database schema updates.</p>
                </div>
            </div>
          </div>
          
          <div className="flex justify-end gap-3 pt-4 border-t">
             <Button type="button" variant="ghost" onClick={() => setIsEditing(false)}>Cancel</Button>
             <Button type="submit" disabled={saving}>
               {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
               Save Post
             </Button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Blog Posts</h1>
          <p className="text-slate-500 mt-2">Create articles to build topical authority.</p>
        </div>
        <div className="flex gap-2">
            {rootBusiness && posts.length > 0 && (
              <EntityGenerator 
                 getContent={getAllPostsContent} 
                 businessId={rootBusiness.id} 
                 sourceName="All Blog Posts" 
              />
            )}
            <Button onClick={() => startEdit()}>
              <Plus className="h-4 w-4 mr-2" /> New Post
            </Button>
        </div>
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed rounded-lg bg-slate-50">
          <PenTool className="h-12 w-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900">No posts yet</h3>
          <p className="text-slate-500 mb-6">Create your first blog post.</p>
          <Button onClick={() => startEdit()}>Create Post</Button>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map(post => (
            <div key={post.id} className="bg-white p-4 rounded-lg border shadow-sm flex justify-between items-center hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-4">
                 <div className="p-2 bg-slate-100 rounded text-slate-500 relative overflow-hidden h-12 w-12 flex-shrink-0 flex items-center justify-center">
                    {post.featured_image_url ? (
                       <img src={post.featured_image_url} alt="" className="absolute inset-0 w-full h-full object-cover" />
                    ) : (
                       <FileText className="h-6 w-6" />
                    )}
                 </div>
                 <div>
                    <h3 className="font-bold text-lg text-slate-900">{post.headline}</h3>
                    <div className="flex gap-2 text-xs text-slate-500">
                       <span className={`capitalize font-medium ${post.status === 'published' ? 'text-green-600' : 'text-amber-600'}`}>
                         {post.status}
                       </span>
                       <span>•</span>
                       <span className="font-mono">/{post.slug}</span>
                    </div>
                 </div>
              </div>
              <div className="flex gap-2">
                  <Button variant="ghost" size="icon" onClick={() => startEdit(post)} aria-label={`Edit ${post.title}`}>
                     <Edit2 className="h-4 w-4 text-slate-500" aria-hidden="true" />
                  </Button>
                   <Button variant="ghost" size="icon" onClick={() => handleDelete(post.id, post.title)} aria-label={`Delete ${post.title}`}>
                     <Trash2 className="h-4 w-4 text-red-500" aria-hidden="true" />
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
