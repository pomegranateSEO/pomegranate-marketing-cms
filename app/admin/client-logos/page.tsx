import React, { useEffect, useState } from 'react';
import { Loader2, Image, Globe, Plus, Pencil, Trash2, ArrowUp, ArrowDown, Eye, EyeOff } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { toast } from '../../../lib/toast';
import { useConfirm } from '../../../lib/confirm-dialog';
import { supabase } from '../../../lib/supabaseClient';
import { PageHeaderSkeleton } from '../../../components/shared/skeletons';
import type { ClientLogo } from '../../../lib/types';

export default function ClientLogosPage() {
  const [logos, setLogos] = useState<ClientLogo[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<Partial<ClientLogo> | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { confirm, ConfirmDialog } = useConfirm();

  const loadLogos = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('client_logos')
        .select('*')
        .order('display_order', { ascending: true });
      if (error) throw error;
      setLogos(data || []);
    } catch (err: any) {
      toast.error('Failed to load client logos', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogos();
  }, []);

  const handleSave = async () => {
    if (!editing?.name?.trim()) {
      toast.error('Client name is required');
      return;
    }
    setSaving(true);
    try {
      if (editing.id) {
        const { error } = await supabase
          .from('client_logos')
          .update({
            name: editing.name,
            logo_url: editing.logo_url || '',
            website_url: editing.website_url || '',
            published: editing.published ?? true,
          })
          .eq('id', editing.id);
        if (error) throw error;
        toast.success('Logo updated successfully');
      } else {
        const maxOrder = logos.length > 0 ? Math.max(...logos.map(l => l.display_order || 0)) : 0;
        const { error } = await supabase
          .from('client_logos')
          .insert([{
            name: editing.name,
            logo_url: editing.logo_url || '',
            website_url: editing.website_url || '',
            published: editing.published ?? true,
            display_order: maxOrder + 1,
          }]);
        if (error) throw error;
        toast.success('Logo added successfully');
      }
      setEditing(null);
      loadLogos();
    } catch (err: any) {
      toast.error('Failed to save', err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    const confirmed = await confirm({
      title: 'Delete Client Logo',
      message: `Delete "${name}"? This cannot be undone.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'destructive',
    });
    if (confirmed) {
      try {
        await supabase.from('client_logos').delete().eq('id', id);
        toast.success('Logo deleted');
        loadLogos();
      } catch (err: any) {
        toast.error('Failed to delete', err.message);
      }
    }
  };

  const handleTogglePublish = async (logo: ClientLogo) => {
    try {
      await supabase
        .from('client_logos')
        .update({ published: !logo.published })
        .eq('id', logo.id);
      loadLogos();
    } catch (err: any) {
      toast.error('Failed to update', err.message);
    }
  };

  const handleMove = async (logo: ClientLogo, direction: 'up' | 'down') => {
    const idx = logos.findIndex(l => l.id === logo.id);
    if (direction === 'up' && idx === 0) return;
    if (direction === 'down' && idx === logos.length - 1) return;

    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    const updated = [...logos];
    [updated[idx], updated[swapIdx]] = [updated[swapIdx], updated[idx]];
    setLogos(updated);

    await supabase
      .from('client_logos')
      .update({ display_order: idx + 1 })
      .eq('id', logo.id);
    await supabase
      .from('client_logos')
      .update({ display_order: swapIdx + 1 })
      .eq('id', updated[swapIdx].id);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const path = `client-logos/${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from('media')
        .upload(path, file, { upsert: true });
      if (uploadError) throw uploadError;
      
      const { data: { publicUrl } } = supabase.storage
        .from('media')
        .getPublicUrl(path);
      
      setEditing(prev => prev ? { ...prev, logo_url: publicUrl } : null);
      toast.success('Image uploaded');
    } catch (err: any) {
      toast.error('Upload failed', err.message);
    } finally {
      setIsUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <PageHeaderSkeleton />
      </div>
    );
  }

  if (editing !== null) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" onClick={() => setEditing(null)}>
            <ArrowUp className="h-4 w-4 mr-2" /> Back
          </Button>
          <h1 className="text-2xl font-bold">
            {editing.id ? 'Edit Client Logo' : 'Add Client Logo'}
          </h1>
        </div>

        <div className="bg-card p-6 rounded-lg border space-y-6">
          <div className="space-y-2">
            <Label>Client Name *</Label>
            <Input
              value={editing.name || ''}
              onChange={e => setEditing(prev => prev ? { ...prev, name: e.target.value } : null)}
              placeholder="e.g. Shopify"
            />
          </div>

          <div className="space-y-2">
            <Label>Logo URL</Label>
            <div className="flex gap-2">
              <Input
                value={editing.logo_url || ''}
                onChange={e => setEditing(prev => prev ? { ...prev, logo_url: e.target.value } : null)}
                placeholder="https://... or upload below"
              />
            </div>
            <div className="flex items-center gap-4">
              <label className="cursor-pointer">
                <input type="file" accept="image/*" onChange={handleUpload} className="hidden" />
                <span className="inline-flex items-center gap-2 px-4 py-2 bg-muted hover:bg-muted/80 rounded-md text-sm">
                  {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Image className="h-4 w-4" />}
                  {isUploading ? 'Uploading...' : 'Upload Image'}
                </span>
              </label>
              {editing.logo_url && (
                <img src={editing.logo_url} alt="Preview" className="h-12 object-contain" />
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Website URL</Label>
            <Input
              value={editing.website_url || ''}
              onChange={e => setEditing(prev => prev ? { ...prev, website_url: e.target.value } : null)}
              placeholder="https://client-website.com"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="published"
              checked={editing.published ?? true}
              onChange={e => setEditing(prev => prev ? { ...prev, published: e.target.checked } : null)}
              className="rounded"
            />
            <Label htmlFor="published">Published</Label>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="ghost" onClick={() => setEditing(null)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Save
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Client Logos</h1>
          <p className="text-muted-foreground mt-2">Manage logos shown in the Trusted By section.</p>
        </div>
        <Button onClick={() => setEditing({ name: '', published: true })}>
          <Plus className="h-4 w-4 mr-2" /> Add Logo
        </Button>
      </div>

      {logos.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed rounded-lg bg-muted">
          <Image className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground">No client logos yet</h3>
          <p className="text-sm text-muted-foreground mb-4">Add logos to display in the Trusted By section.</p>
          <Button onClick={() => setEditing({ name: '', published: true })}>Add First Logo</Button>
        </div>
      ) : (
        <div className="bg-card border rounded-lg divide-y">
          {logos.map((logo, index) => (
            <div key={logo.id} className="flex items-center gap-4 p-4">
              <span className="text-muted-foreground text-sm w-6">{index + 1}</span>
              <div className="w-16 h-10 bg-muted rounded flex items-center justify-center overflow-hidden shrink-0">
                {logo.logo_url ? (
                  <img src={logo.logo_url} alt={logo.name} className="max-w-full max-h-full object-contain" />
                ) : (
                  <span className="text-xs text-muted-foreground">No logo</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{logo.name}</p>
                {logo.website_url && (
                  <a href={logo.website_url} target="_blank" rel="noopener noreferrer" className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 truncate">
                    <Globe className="h-3 w-3 shrink-0" /> {logo.website_url}
                  </a>
                )}
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleMove(logo, 'up')}
                  disabled={index === 0}
                  title="Move up"
                >
                  <ArrowUp className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleMove(logo, 'down')}
                  disabled={index === logos.length - 1}
                  title="Move down"
                >
                  <ArrowDown className="h-4 w-4" />
                </Button>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleTogglePublish(logo)}
                title={logo.published ? 'Unpublish' : 'Publish'}
              >
                {logo.published ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              </Button>
              <Button variant="ghost" size="icon" onClick={() => setEditing(logo)}>
                <Pencil className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => handleDelete(logo.id, logo.name)} className="text-red-500 hover:bg-red-50">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
      <ConfirmDialog />
    </div>
  );
}
