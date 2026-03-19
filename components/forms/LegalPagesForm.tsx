
import React, { useEffect, useState } from 'react';
import { FileText, Loader2, Save, ArrowLeft, Plus } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { fetchLegalPages, createLegalPage, updateLegalPage } from '../../lib/db/legal_pages';
import type { LegalPage } from '../../lib/types';
import { toast } from '../../lib/toast';
import { TableSkeleton, PageHeaderSkeleton } from '../shared/skeletons';

const LEGAL_SLUGS = ['privacy-policy', 'terms-of-service', 'cookie-policy'];

export default function LegalPagesForm() {
  const [pages, setPages] = useState<LegalPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  
  const [formState, setFormState] = useState({
    title: '',
    content: '',
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await fetchLegalPages();
      setPages(data);
      
      for (const slug of LEGAL_SLUGS) {
        if (!data.find(p => p.slug === slug)) {
          await createLegalPage({
            slug,
            title: slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
            content: '',
          });
        }
      }
      
      const updatedData = await fetchLegalPages();
      setPages(updatedData);
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
    if (!editingSlug) return;

    setSaving(true);
    try {
      const existingPage = pages.find(p => p.slug === editingSlug);
      if (existingPage) {
        await updateLegalPage(existingPage.id, {
          title: formState.title,
          content: formState.content,
        });
      }
      toast.success('Legal page saved successfully');
      setEditingSlug(null);
      loadData();
    } catch (err: any) {
      toast.error("Failed to save page", err.message);
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (slug: string) => {
    const page = pages.find(p => p.slug === slug);
    if (page) {
      setFormState({
        title: page.title,
        content: page.content,
      });
    } else {
      setFormState({
        title: slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
        content: '',
      });
    }
    setEditingSlug(slug);
  };

  if (loading) {
    return (
      <div className="p-6">
        <PageHeaderSkeleton />
        <TableSkeleton rows={3} columns={3} />
      </div>
    );
  }

  if (editingSlug) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" onClick={() => setEditingSlug(null)}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Back
          </Button>
          <h2 className="text-2xl font-bold">
            Edit {editingSlug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
          </h2>
        </div>

        <form onSubmit={handleSave} className="space-y-6 bg-card p-6 rounded-lg border shadow-sm">
          <div className="space-y-2">
            <Label>Page Title</Label>
            <Input 
              value={formState.title} 
              onChange={e => setFormState({...formState, title: e.target.value})} 
              placeholder="Page title"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Page Content (HTML supported)</Label>
            <Textarea 
              value={formState.content} 
              onChange={e => setFormState({...formState, content: e.target.value})} 
              placeholder="Enter page content. HTML is supported."
              className="min-h-[400px] font-mono text-sm"
            />
          </div>

          <div className="flex justify-end pt-4 border-t">
            <Button type="submit" disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
              Save Page
            </Button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Legal Pages</h1>
          <p className="text-muted-foreground mt-2">
            Manage legal pages content (Privacy Policy, Terms of Service, Cookie Policy).
          </p>
        </div>
      </div>

      <div className="bg-card border rounded-lg shadow-sm overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-muted border-b font-medium text-muted-foreground">
            <tr>
              <th className="px-6 py-4">Title</th>
              <th className="px-6 py-4">Slug</th>
              <th className="px-6 py-4">Last Updated</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {LEGAL_SLUGS.map(slug => {
              const page = pages.find(p => p.slug === slug);
              return (
                <tr key={slug} className="hover:bg-muted/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-foreground">
                    {page?.title || slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                  </td>
                  <td className="px-6 py-4 text-muted-foreground font-mono text-xs">/{slug}</td>
                  <td className="px-6 py-4 text-muted-foreground text-sm">
                    {page?.updated_at ? new Date(page.updated_at).toLocaleDateString() : 'Never'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Button variant="ghost" size="sm" onClick={() => startEdit(slug)}>
                      <FileText className="h-4 w-4 mr-2" /> Edit
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
