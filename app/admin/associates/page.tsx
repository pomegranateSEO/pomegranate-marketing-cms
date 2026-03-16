import React, { useEffect, useState } from 'react';
import { Building2, Plus, Loader2, Edit2, Trash2, Save, ArrowLeft, Upload, Check } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Textarea } from '../../../components/ui/textarea';
import { Label } from '../../../components/ui/label';
import { fetchAssociates, createAssociate, updateAssociate, deleteAssociate } from '../../../lib/db/associates';
import { fetchBusinesses } from '../../../lib/db/businesses';
import type { Associate } from '../../../lib/types';
import { EntityGenerator } from '../../../components/shared/EntityGenerator';
import { uploadFile } from '../../../lib/supabaseAdmin';
import { toast } from '../../../lib/toast';
import { useConfirm } from '../../../lib/confirm-dialog';
import { TableSkeleton, PageHeaderSkeleton } from '../../../components/shared/skeletons';

export default function AssociatesPage() {
  const [associates, setAssociates] = useState<Associate[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [rootBusinessId, setRootBusinessId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [formState, setFormState] = useState<Partial<Associate>>({
    name: '',
    type: 'organization',
    role: '',
    bio: '',
    published: true,
    profile_image_url: ''
  });
  const { confirm, ConfirmDialog } = useConfirm();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [assData, busData] = await Promise.all([
        fetchAssociates(),
        fetchBusinesses()
      ]);
      setAssociates(assData.filter(a => a.type === 'organization'));
      if (busData.length > 0) setRootBusinessId(busData[0].id);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rootBusinessId) { toast.error("No Root Business found."); return; }

    setSaving(true);
    try {
      const payload = { ...formState, business_id: rootBusinessId, type: 'organization' };
      if (formState.id) {
        await updateAssociate(formState.id, payload);
      } else {
        await createAssociate(payload);
      }
      setIsEditing(false);
      resetForm();
      loadData();
    } catch (err: any) {
      toast.error("Failed to save partner organization", err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    const confirmed = await confirm({
      title: "Delete Partner Organization",
      message: `Are you sure you want to delete "${name}"? This action cannot be undone.`,
      confirmText: "Delete",
      cancelText: "Cancel",
      variant: "destructive",
    });
    if (confirmed) {
      try {
        await deleteAssociate(id);
        toast.success(`"${name}" deleted successfully`);
        loadData();
      } catch (e: any) {
        toast.error("Failed to delete", e.message);
      }
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("File too large. Please use an image under 2MB.");
      return;
    }

    setUploading(true);
    try {
      const timestamp = Date.now();
      const cleanFileName = file.name.replace(/[^a-zA-Z0-9.]/g, '_');
      const path = `associates/${timestamp}_${cleanFileName}`;
      
      const publicUrl = await uploadFile('images', path, file);
      setFormState(prev => ({ ...prev, profile_image_url: publicUrl }));
    } catch (err: any) {
      toast.error("Upload failed", err.message);
    } finally {
      setUploading(false);
    }
  };

  const startEdit = (ass?: Associate) => {
    setFormState(ass || { name: '', type: 'organization', role: '', bio: '', published: true, profile_image_url: '' });
    setIsEditing(true);
  };

  const resetForm = () => {
    setFormState({ name: '', type: 'organization', role: '', bio: '', published: true, profile_image_url: '' });
  };

  const getContent = () => associates.map(a => `Partner: ${a.name} (${a.role})\n${a.bio}`).join('\n---\n');

  if (loading) {
    return (
      <div className="p-6">
        <PageHeaderSkeleton />
        <TableSkeleton rows={5} columns={4} />
      </div>
    );
  }

  if (isEditing) {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" onClick={() => setIsEditing(false)}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Back
          </Button>
          <h2 className="text-2xl font-bold">{formState.id ? 'Edit Partner Organization' : 'Add Partner Organization'}</h2>
          {rootBusinessId && (
            <EntityGenerator getContent={() => `Partner: ${formState.name}\n${formState.bio}`} businessId={rootBusinessId} sourceName="Partner" />
          )}
        </div>

        <form onSubmit={handleSave} className="space-y-6 bg-white p-6 rounded-lg border shadow-sm">
          <div className="space-y-2">
            <Label>Organization Name</Label>
            <Input 
              value={formState.name} 
              onChange={e => setFormState({...formState, name: e.target.value})}
              placeholder="e.g. ACME Corp, Partner Agency Ltd"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Relationship / Role</Label>
            <Input 
              value={formState.role || ''} 
              onChange={e => setFormState({...formState, role: e.target.value})}
              placeholder="e.g. Strategic Partner, Technology Partner, Reseller"
            />
          </div>

          <div className="space-y-2">
            <Label>Logo / Brand Image</Label>
            <div className="flex gap-4 items-start">
              <div className="flex-1 flex gap-2">
                <Input 
                  value={formState.profile_image_url || ''} 
                  onChange={e => setFormState({...formState, profile_image_url: e.target.value})}
                  placeholder="https://..." 
                />
                <div className="relative">
                  <Button 
                    type="button" 
                    variant="secondary" 
                    className="whitespace-nowrap w-32"
                    disabled={uploading}
                  >
                    {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
                    Upload
                  </Button>
                  <Input 
                    type="file" 
                    accept="image/*" 
                    className="absolute inset-0 opacity-0 cursor-pointer" 
                    onChange={handleImageUpload}
                    disabled={uploading}
                  />
                </div>
              </div>
            </div>
            {formState.profile_image_url && (
              <div className="mt-2 flex items-center gap-2 p-2 border rounded bg-slate-50 w-fit">
                <img src={formState.profile_image_url} alt="Preview" className="h-12 w-12 object-cover rounded" />
                <span className="text-xs text-green-600 font-medium flex items-center"><Check className="h-3 w-3 mr-1"/> Valid Image</span>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea 
              value={formState.bio || ''} 
              onChange={e => setFormState({...formState, bio: e.target.value})} 
              placeholder="Brief description of the partnership and organization..."
              className="h-32"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Contact Email</Label>
              <Input 
                value={formState.contact_email || ''} 
                onChange={e => setFormState({...formState, contact_email: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label>Website</Label>
              <Input 
                value={formState.website_url || ''} 
                onChange={e => setFormState({...formState, website_url: e.target.value})}
              />
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t">
            <Button type="submit" disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
              Save Partner Organization
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
          <h1 className="text-3xl font-bold tracking-tight">Partner Organizations</h1>
          <p className="text-slate-500 mt-2">Manage partner organizations and collaborators.</p>
        </div>
        <div className="flex gap-2">
          {rootBusinessId && associates.length > 0 && (
            <EntityGenerator 
              getContent={getContent} 
              businessId={rootBusinessId} 
              sourceName="Partners" 
            />
          )}
          <Button onClick={() => startEdit()}>
            <Plus className="h-4 w-4 mr-2" /> Add Partner
          </Button>
        </div>
      </div>

      {associates.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed rounded-lg bg-slate-50">
          <Building2 className="h-12 w-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900">No partner organizations yet</h3>
          <Button onClick={() => startEdit()} className="mt-4">Add Partner Organization</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {associates.map((ass) => (
            <div key={ass.id} className="bg-white p-5 rounded-lg border shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-3">
                    {ass.profile_image_url ? (
                      <img src={ass.profile_image_url} alt={ass.name} className="w-10 h-10 rounded-full object-cover border" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 border">
                        <Building2 className="h-5 w-5" />
                      </div>
                    )}
                    <div>
                      <h3 className="font-bold text-lg text-slate-900 leading-tight">{ass.name}</h3>
                      <span className="text-[10px] uppercase text-slate-500 font-bold">Partner Organization</span>
                    </div>
                  </div>
                </div>
                <p className="text-sm font-medium text-purple-600 mb-2">{ass.role}</p>
                <p className="text-sm text-slate-500 mb-4 line-clamp-3">{ass.bio}</p>
              </div>
              <div className="flex justify-end gap-2 pt-4 border-t mt-4">
                <Button variant="ghost" size="sm" onClick={() => startEdit(ass)}>
                  <Edit2 className="h-4 w-4 mr-2" /> Edit
                </Button>
                 <Button 
                   variant="ghost" 
                   size="icon" 
                   onClick={() => handleDelete(ass.id, ass.name)} 
                   className="text-red-500 hover:bg-red-50"
                   aria-label={`Delete ${ass.name}`}
                 >
                   <Trash2 className="h-4 w-4" aria-hidden="true" />
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