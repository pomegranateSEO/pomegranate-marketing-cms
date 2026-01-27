import React, { useEffect, useState } from 'react';
import { PenTool, Plus, Edit2, Trash2, Loader2, FileText, Save } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Textarea } from '../../../components/ui/textarea';
import { Label } from '../../../components/ui/label';
import { fetchPosts, createPost, updatePost, deletePost } from '../../../lib/db/posts';
import { fetchBusinesses } from '../../../lib/db/businesses';
import type { BlogPost } from '../../../lib/types';
import { EntityGenerator } from '../../../components/shared/EntityGenerator';

export default function PostsPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentPost, setCurrentPost] = useState<Partial<BlogPost>>({});
  const [rootBusinessId, setRootBusinessId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

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
        ...currentPost,
        business_id: rootBusinessId,
        status: currentPost.status || 'draft',
        slug: currentPost.slug || currentPost.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        content: currentPost.content 
      };

      if (currentPost.id) {
        await updatePost(currentPost.id, payload);
      } else {
        await createPost(payload);
      }
      setIsEditing(false);
      setCurrentPost({});
      loadData();
    } catch (err: any) {
      alert("Failed to save post: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Delete this post?")) {
      await deletePost(id);
      loadData();
    }
  };

  const startEdit = (post?: BlogPost) => {
    setCurrentPost(post || { title: '', content: '', status: 'draft' });
    setIsEditing(true);
  };

  const getPostContent = () => {
    return `Title: ${currentPost.title}\nExcerpt: ${currentPost.excerpt}\nContent: ${currentPost.content}`;
  };

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-slate-400" /></div>;

  if (isEditing) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
           <h2 className="text-2xl font-bold">{currentPost.id ? 'Edit Post' : 'New Blog Post'}</h2>
           {rootBusinessId && (
              <EntityGenerator getContent={getPostContent} businessId={rootBusinessId} sourceName="This Post" />
           )}
        </div>

        <form onSubmit={handleSave} className="space-y-6 bg-white p-6 rounded-lg border shadow-sm">
          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-2 col-span-2 md:col-span-1">
                <Label>Post Title</Label>
                <Input 
                  value={currentPost.title || ''} 
                  onChange={e => setCurrentPost({...currentPost, title: e.target.value})} 
                  required 
                  placeholder="e.g. 10 Tips for..."
                />
             </div>
             <div className="space-y-2 col-span-2 md:col-span-1">
                <Label>Status</Label>
                <select 
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={currentPost.status || 'draft'}
                  onChange={e => setCurrentPost({...currentPost, status: e.target.value as any})}
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
             </div>
          </div>
          
          <div className="space-y-2">
            <Label>Slug (URL)</Label>
            <Input 
              value={currentPost.slug || ''} 
              onChange={e => setCurrentPost({...currentPost, slug: e.target.value})} 
              placeholder="auto-generated-from-title"
            />
          </div>
          
          <div className="space-y-2">
            <Label>Excerpt (SEO Description)</Label>
            <Textarea 
              value={currentPost.excerpt || ''} 
              onChange={e => setCurrentPost({...currentPost, excerpt: e.target.value})} 
              className="h-20"
              placeholder="A brief summary for search engines..."
            />
          </div>
          
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
               Body Content (Text/Markdown)
               <span className="text-xs text-slate-400 font-normal">(No HTML required. Use standard text.)</span>
            </Label>
            <Textarea 
              value={currentPost.content || ''} 
              onChange={e => setCurrentPost({...currentPost, content: e.target.value})} 
              className="font-mono text-sm min-h-[400px] leading-relaxed p-4"
              placeholder="Start writing your article here..."
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
        <Button onClick={() => startEdit()}>
          <Plus className="h-4 w-4 mr-2" /> New Post
        </Button>
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
                 <div className="p-2 bg-slate-100 rounded text-slate-500">
                    <FileText className="h-6 w-6" />
                 </div>
                 <div>
                    <h3 className="font-bold text-lg text-slate-900">{post.title}</h3>
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
