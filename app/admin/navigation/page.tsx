import React, { useEffect, useState } from 'react';
import { Loader2, Navigation, Plus, Pencil, Trash2, ArrowLeft, ArrowUp, ArrowDown, Eye, EyeOff, ChevronRight } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { toast } from '../../../lib/toast';
import { useConfirm } from '../../../lib/confirm-dialog';
import { supabase } from '../../../lib/supabaseClient';
import { PageHeaderSkeleton } from '../../../components/shared/skeletons';
import type { NavigationItem } from '../../../lib/types';

interface NavFormData {
  id?: string;
  section: 'header' | 'footer';
  label: string;
  url: string;
  icon?: string;
  order: number;
  parent_id?: string | null;
  published: boolean;
}

export default function NavigationPage() {
  const [items, setItems] = useState<NavigationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<NavFormData | null>(null);
  const [activeSection, setActiveSection] = useState<'header' | 'footer'>('header');
  const { confirm, ConfirmDialog } = useConfirm();

  const loadItems = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('navigation')
        .select('*')
        .order('order', { ascending: true });
      if (error) throw error;
      setItems(data || []);
    } catch (err: any) {
      toast.error('Failed to load navigation', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

  const sectionItems = items.filter(i => i.section === activeSection);

  const handleSave = async () => {
    if (!editing?.label?.trim()) {
      toast.error('Label is required');
      return;
    }
    setSaving(true);
    try {
      if (editing.id) {
        const { error } = await supabase
          .from('navigation')
          .update({
            label: editing.label,
            url: editing.url || '',
            icon: editing.icon || null,
            parent_id: editing.parent_id || null,
            published: editing.published ?? true,
          })
          .eq('id', editing.id);
        if (error) throw error;
        toast.success('Navigation item updated');
      } else {
        const maxOrder = sectionItems.length > 0 ? Math.max(...sectionItems.map(i => i.order || 0)) : 0;
        const { error } = await supabase
          .from('navigation')
          .insert([{
            section: editing.section,
            label: editing.label,
            url: editing.url || '',
            icon: editing.icon || null,
            parent_id: editing.parent_id || null,
            published: editing.published ?? true,
            order: maxOrder + 1,
          }]);
        if (error) throw error;
        toast.success('Navigation item added');
      }
      setEditing(null);
      loadItems();
    } catch (err: any) {
      toast.error('Failed to save', err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, label: string) => {
    const confirmed = await confirm({
      title: 'Delete Navigation Item',
      message: `Delete "${label}"? Child items will also be removed.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'destructive',
    });
    if (confirmed) {
      try {
        await supabase.from('navigation').delete().eq('id', id);
        toast.success('Item deleted');
        loadItems();
      } catch (err: any) {
        toast.error('Failed to delete', err.message);
      }
    }
  };

  const handleTogglePublish = async (item: NavigationItem) => {
    try {
      await supabase
        .from('navigation')
        .update({ published: !item.published })
        .eq('id', item.id);
      loadItems();
    } catch (err: any) {
      toast.error('Failed to update', err.message);
    }
  };

  const handleMove = async (item: NavigationItem, direction: 'up' | 'down') => {
    const parentFiltered = sectionItems.filter(i => i.parent_id === item.parent_id);
    const idx = parentFiltered.findIndex(i => i.id === item.id);
    if (direction === 'up' && idx === 0) return;
    if (direction === 'down' && idx === parentFiltered.length - 1) return;

    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    const swapItem = parentFiltered[swapIdx];
    
    const updated = sectionItems.map(i => {
      if (i.id === item.id) return { ...i, order: swapIdx + 1 };
      if (i.id === swapItem.id) return { ...i, order: idx + 1 };
      return i;
    });
    setItems(prev => prev.map(i => {
      const u = updated.find(u => u.id === i.id);
      return u || i;
    }));

    await supabase
      .from('navigation')
      .update({ order: swapIdx + 1 })
      .eq('id', item.id);
    await supabase
      .from('navigation')
      .update({ order: idx + 1 })
      .eq('id', swapItem.id);
  };

  const parentItems = sectionItems.filter(i => !i.parent_id);

  if (loading) {
    return (
      <div className="p-6">
        <PageHeaderSkeleton />
      </div>
    );
  }

  if (editing !== null) {
    const childOptions = sectionItems.filter(i => !i.parent_id && i.id !== editing.id);

    return (
      <div className="p-6 max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" onClick={() => setEditing(null)}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Back
          </Button>
          <h1 className="text-2xl font-bold">
            {editing.id ? 'Edit Navigation Item' : 'Add Navigation Item'}
          </h1>
        </div>

        <div className="bg-card p-6 rounded-lg border space-y-6">
          <div className="space-y-2">
            <Label>Section *</Label>
            <select
              value={editing.section}
              onChange={e => setEditing(prev => prev ? { ...prev, section: e.target.value as 'header' | 'footer' } : null)}
              className="flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm"
            >
              <option value="header">Header</option>
              <option value="footer">Footer</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label>Label *</Label>
            <Input
              value={editing.label || ''}
              onChange={e => setEditing(prev => prev ? { ...prev, label: e.target.value } : null)}
              placeholder="e.g. About Us"
            />
          </div>

          <div className="space-y-2">
            <Label>URL</Label>
            <Input
              value={editing.url || ''}
              onChange={e => setEditing(prev => prev ? { ...prev, url: e.target.value } : null)}
              placeholder="/about or https://..."
            />
          </div>

          <div className="space-y-2">
            <Label>Parent Item (for dropdowns)</Label>
            <select
              value={editing.parent_id || ''}
              onChange={e => setEditing(prev => prev ? { ...prev, parent_id: e.target.value || null } : null)}
              className="flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm"
            >
              <option value="">None (top-level)</option>
              {childOptions.map(item => (
                <option key={item.id} value={item.id}>{item.label}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label>Icon (Lucide icon name)</Label>
            <Input
              value={editing.icon || ''}
              onChange={e => setEditing(prev => prev ? { ...prev, icon: e.target.value } : null)}
              placeholder="e.g. Zap, Search, Users"
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
          <h1 className="text-3xl font-bold tracking-tight">Navigation</h1>
          <p className="text-muted-foreground mt-2">Manage header and footer navigation items.</p>
        </div>
        <div className="flex gap-2">
          <Button variant={activeSection === 'header' ? 'default' : 'outline'} onClick={() => setActiveSection('header')}>Header</Button>
          <Button variant={activeSection === 'footer' ? 'default' : 'outline'} onClick={() => setActiveSection('footer')}>Footer</Button>
          <Button onClick={() => setEditing({ section: activeSection, label: '', url: '', order: 0, published: true })}>
            <Plus className="h-4 w-4 mr-2" /> Add Item
          </Button>
        </div>
      </div>

      {parentItems.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed rounded-lg bg-muted">
          <Navigation className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground">No {activeSection} navigation items</h3>
          <p className="text-sm text-muted-foreground mb-4">Add items to build your navigation structure.</p>
          <Button onClick={() => setEditing({ section: activeSection, label: '', url: '', order: 0, published: true })}>
            Add First Item
          </Button>
        </div>
      ) : (
        <div className="bg-card border rounded-lg divide-y">
          {parentItems.map((item, index) => {
            const children = sectionItems.filter(c => c.parent_id === item.id);
            const parentFiltered = sectionItems.filter(i => !i.parent_id);
            
            return (
              <div key={item.id}>
                <div className="flex items-center gap-4 p-4">
                  <span className="text-muted-foreground text-sm w-6">{index + 1}</span>
                  <div className="flex-1">
                    <p className="font-medium">{item.label}</p>
                    <a href={item.url || '#'} target="_blank" rel="noopener noreferrer" className="text-xs text-muted-foreground hover:text-foreground">
                      {item.url || '(no URL)'}
                    </a>
                  </div>
                  {children.length > 0 && (
                    <span className="text-xs bg-muted px-2 py-1 rounded">
                      {children.length} child(ren) <ChevronRight className="inline h-3 w-3" />
                    </span>
                  )}
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleMove(item, 'up')}
                      disabled={index === 0}
                      title="Move up"
                    >
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleMove(item, 'down')}
                      disabled={index === parentFiltered.length - 1}
                      title="Move down"
                    >
                      <ArrowDown className="h-4 w-4" />
                    </Button>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleTogglePublish(item)}
                    title={item.published ? 'Unpublish' : 'Publish'}
                  >
                    {item.published ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => setEditing({ ...item })}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id, item.label)} className="text-red-500 hover:bg-red-50">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                {children.length > 0 && (
                  <div className="pl-12 pr-4 pb-4 space-y-2">
                    {children.map((child, childIdx) => (
                      <div key={child.id} className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
                        <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                        <div className="flex-1">
                          <p className="font-medium text-sm">{child.label}</p>
                          <a href={child.url || '#'} className="text-xs text-muted-foreground">{child.url || '(no URL)'}</a>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleTogglePublish(child)}
                        >
                          {child.published ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setEditing({ ...child })}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(child.id, child.label)} className="text-red-500 hover:bg-red-50">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
      <ConfirmDialog />
    </div>
  );
}
