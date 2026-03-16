import React, { useEffect, useState } from 'react';
import { User, Plus, Edit2, Trash2, Loader2, Save, ArrowLeft, X, Image as ImageIcon } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Textarea } from '../../../components/ui/textarea';
import { Label } from '../../../components/ui/label';
import { fetchPeople, createPerson, updatePerson, deletePerson } from '../../../lib/db/people';
import { fetchBusinesses } from '../../../lib/db/businesses';
import type { Person, Business } from '../../../lib/types';
import { MediaManager } from '../../../components/shared/MediaManager';
import { toast } from '../../../lib/toast';
import { useConfirm } from '../../../lib/confirm-dialog';
import { TableSkeleton, PageHeaderSkeleton } from '../../../components/shared/skeletons';

export default function PeoplePage() {
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [rootBusiness, setRootBusiness] = useState<Business | null>(null);
  const [saving, setSaving] = useState(false);
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const { confirm, ConfirmDialog } = useConfirm();

  const [formState, setFormState] = useState({
    id: '',
    full_name: '',
    slug: '',
    job_title: '',
    bio: '',
    short_bio: '',
    profile_image_url: '',
    email: '',
    website_url: '',
    linkedin_url: '',
    is_author: true,
    is_team_member: true,
    published: true,
    expertise_areas: [] as string[],
    credentials: [] as string[],
  });

  const [expertiseInput, setExpertiseInput] = useState('');
  const [credentialInput, setCredentialInput] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const [peopleData, businessesData] = await Promise.all([
        fetchPeople(),
        fetchBusinesses()
      ]);
      setPeople(peopleData);
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
        business_id: rootBusiness.id,
        full_name: formState.full_name,
        slug: formState.slug || formState.full_name?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
        job_title: formState.job_title,
        bio: formState.bio,
        short_bio: formState.short_bio,
        profile_image_url: formState.profile_image_url,
        email: formState.email,
        website_url: formState.website_url,
        linkedin_url: formState.linkedin_url,
        is_author: formState.is_author,
        is_team_member: formState.is_team_member,
        published: formState.published,
        expertise_areas: formState.expertise_areas,
        credentials: formState.credentials,
      };

      if (formState.id) {
        await updatePerson(formState.id, payload);
      } else {
        await createPerson(payload);
      }
      setIsEditing(false);
      resetForm();
      loadData();
    } catch (err: any) {
      toast.error("Failed to save person", err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    const confirmed = await confirm({
      title: "Delete Person",
      message: `Are you sure you want to delete "${name}"? This may affect blog posts linked to this author.`,
      confirmText: "Delete",
      cancelText: "Cancel",
      variant: "destructive",
    });
    if (confirmed) {
      try {
        await deletePerson(id);
        toast.success(`"${name}" deleted successfully`);
        loadData();
      } catch (e: any) {
        toast.error("Failed to delete person", e.message);
      }
    }
  };

  const startEdit = (person?: Person) => {
    if (person) {
      setFormState({
        id: person.id,
        full_name: person.full_name || '',
        slug: person.slug || '',
        job_title: person.job_title || '',
        bio: person.bio || '',
        short_bio: person.short_bio || '',
        profile_image_url: person.profile_image_url || '',
        email: person.email || '',
        website_url: person.website_url || '',
        linkedin_url: person.linkedin_url || '',
        is_author: person.is_author ?? true,
        is_team_member: person.is_team_member ?? true,
        published: person.published ?? true,
        expertise_areas: person.expertise_areas || [],
        credentials: person.credentials || [],
      });
    } else {
      resetForm();
    }
    setIsEditing(true);
  };

  const resetForm = () => {
    setFormState({
      id: '',
      full_name: '',
      slug: '',
      job_title: '',
      bio: '',
      short_bio: '',
      profile_image_url: '',
      email: '',
      website_url: '',
      linkedin_url: '',
      is_author: true,
      is_team_member: true,
      published: true,
      expertise_areas: [],
      credentials: [],
    });
    setExpertiseInput('');
    setCredentialInput('');
  };

  const handleImageSelect = (url: string) => {
    setFormState(prev => ({ ...prev, profile_image_url: url }));
    setShowMediaPicker(false);
  };

  const addExpertise = () => {
    if (expertiseInput.trim()) {
      setFormState(prev => ({
        ...prev,
        expertise_areas: [...prev.expertise_areas, expertiseInput.trim()]
      }));
      setExpertiseInput('');
    }
  };

  const removeExpertise = (index: number) => {
    setFormState(prev => ({
      ...prev,
      expertise_areas: prev.expertise_areas.filter((_, i) => i !== index)
    }));
  };

  const addCredential = () => {
    if (credentialInput.trim()) {
      setFormState(prev => ({
        ...prev,
        credentials: [...prev.credentials, credentialInput.trim()]
      }));
      setCredentialInput('');
    }
  };

  const removeCredential = (index: number) => {
    setFormState(prev => ({
      ...prev,
      credentials: prev.credentials.filter((_, i) => i !== index)
    }));
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
    return (
      <div className="p-6 max-w-4xl mx-auto">
        {/* Media Picker Modal */}
        {showMediaPicker && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-6">
            <div className="w-full max-w-4xl h-[700px] bg-white rounded-lg shadow-2xl overflow-hidden flex flex-col">
              <div className="flex justify-between items-center p-4 border-b">
                <h3 className="font-bold text-lg">Select Profile Image</h3>
                 <Button variant="ghost" size="icon" onClick={() => setShowMediaPicker(false)} aria-label="Close media picker">
                   <X className="h-5 w-5" aria-hidden="true" />
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

        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" onClick={() => setIsEditing(false)}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Back
          </Button>
          <h2 className="text-2xl font-bold">{formState.id ? 'Edit Person' : 'New Person'}</h2>
        </div>

        <form onSubmit={handleSave} className="space-y-6 bg-white p-6 rounded-lg border shadow-sm">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Full Name *</Label>
              <Input
                value={formState.full_name}
                onChange={e => {
                  const name = e.target.value;
                  setFormState(prev => ({
                    ...prev,
                    full_name: name,
                    slug: prev.slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
                  }));
                }}
                required
                placeholder="e.g. Karim Chehab"
              />
            </div>
            <div className="space-y-2">
              <Label>Job Title</Label>
              <Input
                value={formState.job_title}
                onChange={e => setFormState(prev => ({ ...prev, job_title: e.target.value }))}
                placeholder="e.g. Founder & SEO Consultant"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Slug (URL)</Label>
            <Input
              value={formState.slug}
              onChange={e => setFormState(prev => ({ ...prev, slug: e.target.value }))}
              placeholder="auto-generated-from-name"
            />
          </div>

          {/* Profile Image */}
          <div className="space-y-2">
            <Label>Profile Image</Label>
            <div className="flex gap-4 items-start">
              <div className="flex-1 flex gap-2">
                <Input
                  value={formState.profile_image_url}
                  onChange={e => setFormState(prev => ({ ...prev, profile_image_url: e.target.value }))}
                  placeholder="https://... (or select from library)"
                />
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowMediaPicker(true)}
                  className="whitespace-nowrap"
                >
                  <ImageIcon className="h-4 w-4 mr-2" />
                  Select
                </Button>
              </div>
            </div>
            {formState.profile_image_url && (
              <div className="mt-2 relative w-fit group">
                <img
                  src={formState.profile_image_url}
                  alt="Preview"
                  className="h-24 w-24 object-cover rounded-full border bg-slate-50"
                />
                <button
                  type="button"
                  onClick={() => setFormState(prev => ({ ...prev, profile_image_url: '' }))}
                  className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                  aria-label="Remove profile image"
                >
                  <X className="h-3 w-3" aria-hidden="true" />
                </button>
              </div>
            )}
          </div>

          {/* Bio */}
          <div className="space-y-2">
            <Label>Short Bio</Label>
            <Textarea
              value={formState.short_bio}
              onChange={e => setFormState(prev => ({ ...prev, short_bio: e.target.value }))}
              className="h-20"
              placeholder="Brief introduction (used in author cards)..."
            />
          </div>

          <div className="space-y-2">
            <Label>Full Bio</Label>
            <Textarea
              value={formState.bio}
              onChange={e => setFormState(prev => ({ ...prev, bio: e.target.value }))}
              className="h-32"
              placeholder="Detailed biography..."
            />
          </div>

          {/* Contact Links */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={formState.email}
                onChange={e => setFormState(prev => ({ ...prev, email: e.target.value }))}
                placeholder="email@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label>Website</Label>
              <Input
                value={formState.website_url}
                onChange={e => setFormState(prev => ({ ...prev, website_url: e.target.value }))}
                placeholder="https://..."
              />
            </div>
            <div className="space-y-2">
              <Label>LinkedIn</Label>
              <Input
                value={formState.linkedin_url}
                onChange={e => setFormState(prev => ({ ...prev, linkedin_url: e.target.value }))}
                placeholder="https://linkedin.com/in/..."
              />
            </div>
          </div>

          {/* Expertise Areas */}
          <div className="space-y-2">
            <Label>Expertise Areas</Label>
            <div className="flex gap-2 mb-2">
              <Input
                value={expertiseInput}
                onChange={e => setExpertiseInput(e.target.value)}
                placeholder="e.g. Technical SEO"
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addExpertise(); }}}
              />
              <Button type="button" variant="outline" onClick={addExpertise}>Add</Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formState.expertise_areas.map((area, i) => (
                <span key={i} className="bg-slate-100 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                  {area}
                  <button type="button" onClick={() => removeExpertise(i)} className="text-slate-400 hover:text-red-500">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Credentials */}
          <div className="space-y-2">
            <Label>Credentials</Label>
            <div className="flex gap-2 mb-2">
              <Input
                value={credentialInput}
                onChange={e => setCredentialInput(e.target.value)}
                placeholder="e.g. Google Certified Professional"
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addCredential(); }}}
              />
              <Button type="button" variant="outline" onClick={addCredential}>Add</Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formState.credentials.map((cred, i) => (
                <span key={i} className="bg-slate-100 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                  {cred}
                  <button type="button" onClick={() => removeCredential(i)} className="text-slate-400 hover:text-red-500">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Flags */}
          <div className="grid grid-cols-3 gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formState.is_author}
                onChange={e => setFormState(prev => ({ ...prev, is_author: e.target.checked }))}
                className="rounded"
              />
              <span className="text-sm">Is Author</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formState.is_team_member}
                onChange={e => setFormState(prev => ({ ...prev, is_team_member: e.target.checked }))}
                className="rounded"
              />
              <span className="text-sm">Team Member</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formState.published}
                onChange={e => setFormState(prev => ({ ...prev, published: e.target.checked }))}
                className="rounded"
              />
              <span className="text-sm">Published</span>
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="ghost" onClick={() => setIsEditing(false)}>Cancel</Button>
            <Button type="submit" disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
              Save Person
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
          <h1 className="text-3xl font-bold tracking-tight">People & Authors</h1>
          <p className="text-slate-500 mt-2">Manage team members and blog authors.</p>
        </div>
        <Button onClick={() => startEdit()}>
          <Plus className="h-4 w-4 mr-2" /> Add Person
        </Button>
      </div>

      {people.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed rounded-lg bg-slate-50">
          <User className="h-12 w-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900">No people yet</h3>
          <p className="text-slate-500 mb-6">Add team members and authors for blog posts.</p>
          <Button onClick={() => startEdit()}>Add Person</Button>
        </div>
      ) : (
        <div className="space-y-4">
          {people.map(person => (
            <div key={person.id} className="bg-white p-4 rounded-lg border shadow-sm flex justify-between items-center hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-slate-100 rounded text-slate-500 relative overflow-hidden h-12 w-12 flex-shrink-0 flex items-center justify-center">
                  {person.profile_image_url ? (
                    <img src={person.profile_image_url} alt="" className="absolute inset-0 w-full h-full object-cover rounded" />
                  ) : (
                    <User className="h-6 w-6" />
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-900">{person.full_name}</h3>
                  <div className="flex gap-2 text-xs text-slate-500">
                    <span>{person.job_title || 'No title'}</span>
                    <span>•</span>
                    <span className={`capitalize ${person.published ? 'text-green-600' : 'text-amber-600'}`}>
                      {person.published ? 'Published' : 'Draft'}
                    </span>
                    {person.is_author && (
                      <>
                        <span>•</span>
                        <span className="text-blue-600">Author</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                 <Button variant="ghost" size="icon" onClick={() => startEdit(person)} aria-label={`Edit ${person.full_name}`}>
                   <Edit2 className="h-4 w-4 text-slate-500" aria-hidden="true" />
                 </Button>
                 <Button variant="ghost" size="icon" onClick={() => handleDelete(person.id, person.full_name)} aria-label={`Delete ${person.full_name}`}>
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