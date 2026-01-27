import React, { useEffect, useState } from 'react';
import { PenTool, Plus, Edit2, Trash2, Loader2, FileText, Save, ArrowLeft, Image as ImageIcon, X } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Textarea } from '../../../components/ui/textarea';
import { Label } from '../../../components/ui/label';
import { fetchPosts, createPost, updatePost, deletePost } from '../../../lib/db/posts';
import { fetchBusinesses } from '../../../lib/db/businesses';
import type { BlogPost } from '../../../lib/types';
import { EntityGenerator } from '../../../components/shared/EntityGenerator';
import { VisualContentEditor } from '../../../components/shared/VisualContentEditor';
import { MediaManager } from '../../../components/shared/MediaManager';
import { FAQEditor } from '../../../components/shared/FAQEditor';

export default function PostsPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [rootBusinessId, setRootBusinessId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  
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
    faqs: [] as { question: string; answer: string }[]
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [postsData, businessesData] = await Promise.all([
        fetchPosts(),
        fetchBusinesses()
      ]);
      setPosts(postsData);
      if (businessesData.length > 0) {
        setRootBusinessId(businessesData[0].id);
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
    if (!rootBusinessId) return alert("No Root Business found. Please create one first.");

    setSaving(true);
    try {
      const payload = {
        id: formState.id,
        business_id: rootBusinessId,
        title: formState.title,
        slug: formState.slug || formState.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
        content: formState.content,
        excerpt: formState.excerpt,
        featured_image_url: formState.featured_image_url,
        status: formState.status,
        faqs: formState.faqs
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
      alert("Failed to save post: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Delete this post?")) {
      try {
        await deletePost(id);
        loadData();
      } catch (e: any) {
        alert(`Failed to delete post.\n\nDatabase Error: ${e.message || JSON.stringify(e)}`);
      }
    }
  };

  const startEdit = (post?: BlogPost) => {
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
        faqs: postFaqs
      });
    } else {
      resetForm();
    }
    setIsEditing(true);
  };

  const resetForm = () => {
    setFormState({ id: '', title: '', slug: '', content: '', excerpt: '', featured_image_url: '', status: 'draft', faqs: [] });
  };

  const handleImageSelect = (url: string) => {
    setFormState(prev => ({ ...prev, featured_image_url: url }));
    setShowMediaPicker(false);
  };

  // Content for SINGLE post entity generation
  const getPostContent = () => {
    return `Title: ${formState.title}\nExcerpt: ${formState.excerpt}\nBody Content:\n${formState.content}`;
  };

  // Content for BULK entity generation
  const getAllPostsContent = () => {
    return posts.map(p => `Post: ${p.headline}\n${p.content_body}`).join('\n---\n');
  };

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-slate-400" /></div>;

  if (isEditing) {
    return (
      <div className="p-6 max-w-5xl mx-auto">
        {/* Media Picker Modal Overlay */}
        {showMediaPicker && (
           <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-6">
              <div className="w-full max-w-4xl h-[700px] bg-white rounded-lg shadow-2xl overflow-hidden flex flex-col">
                 <div className="flex justify-between items-center p-4 border-b">
                    <h3 className="font-bold text-lg">Select Featured Image</h3>
                    <Button variant="ghost" size="icon" onClick={() => setShowMediaPicker(false)}>
                       <X className="h-5 w-5" />
                    </Button>
                 </div>
                 <div className="flex-1 min-h-0 bg-slate-50 p-4">
                    <MediaManager 
                       mode="picker" 
                       onSelect={handleImageSelect} 
                       onClose={() => setShowMediaPicker(false)} 
                    />
                 </div>
              </div>
           </div>
        )}

        <div className="flex justify-between items-center mb-6">
           <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => setIsEditing(false)}>
                  <ArrowLeft className="h-4 w-4 mr-2" /> Back
              </Button>
              <h2 className="text-2xl font-bold">{formState.id ? 'Edit Post' : 'New Blog Post'}</h2>
           </div>
           {rootBusinessId && (
              <EntityGenerator getContent={getPostContent} businessId={rootBusinessId} sourceName="Body Content" />
           )}
        </div>

        <form onSubmit={handleSave} className="space-y-6 bg-white p-6 rounded-lg border shadow-sm">
          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-2 col-span-2 md:col-span-1">
                <Label>Post Headline</Label>
                <Input 
                  value={formState.title || ''} 
                  onChange={e => setFormState({...formState, title: e.target.value})} 
                  required 
                  placeholder="e.g. 10 Tips for..."
                />
             </div>
             <div className="space-y-2 col-span-2 md:col-span-1">
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
          
          <div className="space-y-2">
            <Label>Slug (URL)</Label>
            <Input 
              value={formState.slug || ''} 
              onChange={e => setFormState({...formState, slug: e.target.value})} 
              placeholder="auto-generated-from-title"
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
                     className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                   >
                      <X className="h-3 w-3" />
                   </button>
                </div>
             )}
          </div>
          
          <div className="space-y-2">
            <Label>Excerpt (SEO Meta Description)</Label>
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
            />
          </div>

          {/* FAQ Editor Section */}
           <div className="pt-2">
             <FAQEditor 
               value={formState.faqs}
               onChange={(faqs) => setFormState({...formState, faqs: faqs})}
               sourceText={formState.content}
             />
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
            {rootBusinessId && posts.length > 0 && (
              <EntityGenerator 
                 getContent={getAllPostsContent} 
                 businessId={rootBusinessId} 
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
                 <Button variant="ghost" size="icon" onClick={() => startEdit(post)}>
                    <Edit2 className="h-4 w-4 text-slate-500" />
                 </Button>
                 <Button variant="ghost" size="icon" onClick={() => handleDelete(post.id)}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                 </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
