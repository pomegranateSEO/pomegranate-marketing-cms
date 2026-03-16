import React, { useEffect, useState } from 'react';
import { Download, Plus, Loader2, File, Trash2, ExternalLink, Pencil, Eye, EyeOff, Lock, Unlock } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { supabase, uploadFile } from '../../../lib/supabaseClient';
import { EntityGenerator } from '../../../components/shared/EntityGenerator';
import { fetchBusinesses } from '../../../lib/db/businesses';
import { fetchDownloads, createDownload, updateDownload, deleteDownload } from '../../../lib/db/downloads';
import { DownloadForm } from '../../../components/forms/DownloadForm';
import { toast } from '../../../lib/toast';
import type { Download as DownloadType } from '../../../lib/types';

export default function DownloadsPage() {
  const [downloads, setDownloads] = useState<DownloadType[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [editingDownload, setEditingDownload] = useState<DownloadType | null>(null);
  const [rootBusinessId, setRootBusinessId] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [downloadsData, businessesData] = await Promise.all([
        fetchDownloads(),
        fetchBusinesses()
      ]);
      setDownloads(downloadsData);
      if (businessesData.length > 0) {
        setRootBusinessId(businessesData[0].id);
      }
    } catch (err) {
      console.error("Failed to load downloads:", err);
      toast.error("Failed to load downloads");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateOrUpdate = async (data: any) => {
    try {
      if (editingDownload) {
        await updateDownload(editingDownload.id, data);
        toast.success("Download updated successfully");
        setEditingDownload(null);
      } else {
        await createDownload(data);
        toast.success("Download created successfully");
        setIsCreating(false);
      }
      loadData();
    } catch (err: any) {
      toast.error("Failed to save download", err.message);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    try {
      await deleteDownload(id);
      toast.success("Download deleted");
      loadData();
    } catch (err: any) {
      toast.error("Delete failed", err.message);
    }
  };

  const handleEdit = (download: DownloadType) => {
    setEditingDownload(download);
    setIsCreating(false);
  };

  const handleTogglePublished = async (download: DownloadType) => {
    try {
      await updateDownload(download.id, { published: !download.published });
      toast.success(download.published ? "Download unpublished" : "Download published");
      loadData();
    } catch (err: any) {
      toast.error("Failed to update", err.message);
    }
  };

  const getAllDownloadsContent = () => {
    return downloads.map(d => `Title: ${d.title}\nType: ${d.type}\nDescription: ${d.description}`).join('\n---\n');
  };

  if (loading) {
    return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-slate-400" /></div>;
  }

  if (isCreating || editingDownload) {
    if (!rootBusinessId) {
      return (
        <div className="p-6 text-center">
          <h2 className="text-xl font-bold text-red-600">No Business Found</h2>
          <p className="mb-4">You must create a Root Business Entity before adding downloads.</p>
          <Button onClick={() => { setIsCreating(false); setEditingDownload(null); }}>Go Back</Button>
        </div>
      );
    }

    return (
      <div className="p-6 max-w-3xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" onClick={() => { setIsCreating(false); setEditingDownload(null); }}>
            ← Back
          </Button>
          <h1 className="text-2xl font-bold">
            {editingDownload ? 'Edit Download' : 'Add New Download'}
          </h1>
        </div>
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <DownloadForm
            initialData={editingDownload || undefined}
            businessId={rootBusinessId}
            onSubmit={handleCreateOrUpdate}
            onCancel={() => { setIsCreating(false); setEditingDownload(null); }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Downloads</h1>
          <p className="text-slate-500 mt-2">
            Manage downloadable resources (PDFs, Guides, Whitepapers). Published downloads appear on the front-end.
          </p>
        </div>
        <div className="flex gap-2 items-center">
          {rootBusinessId && downloads.length > 0 && (
            <EntityGenerator
              getContent={getAllDownloadsContent}
              businessId={rootBusinessId}
              sourceName="Downloads"
            />
          )}
          <Button onClick={() => setIsCreating(true)}>
            <Plus className="h-4 w-4 mr-2" /> Add Download
          </Button>
        </div>
      </div>

      {downloads.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed rounded-lg bg-slate-50">
          <Download className="h-12 w-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900">No downloads yet</h3>
          <p className="text-slate-500 mb-6">Create your first downloadable resource.</p>
          <Button onClick={() => setIsCreating(true)}>
            Create Download
          </Button>
        </div>
      ) : (
        <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 border-b font-medium text-slate-500">
              <tr>
                <th className="px-6 py-4">Title</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Access</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Order</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {downloads.map((download) => (
                <tr key={download.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-900">{download.title}</div>
                    {download.description && (
                      <div className="text-xs text-slate-500 truncate max-w-xs">{download.description}</div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                      {download.type}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {download.gated ? (
                      <span className="inline-flex items-center gap-1 text-amber-600">
                        <Lock className="h-3.5 w-3.5" /> Gated
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-green-600">
                        <Unlock className="h-3.5 w-3.5" /> Free
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleTogglePublished(download)}
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors ${
                        download.published
                          ? 'bg-green-50 text-green-700 hover:bg-green-100'
                          : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                      }`}
                    >
                      {download.published ? (
                        <><Eye className="h-3.5 w-3.5" /> Published</>
                      ) : (
                        <><EyeOff className="h-3.5 w-3.5" /> Draft</>
                      )}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-slate-500">{download.sort_order}</td>
                  <td className="px-6 py-4 text-right flex justify-end gap-1">
                    {download.file_url && (
                      <a
                        href={download.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center h-8 w-8 rounded-md hover:bg-slate-100 text-slate-500"
                        title="View File"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(download)}
                      className="h-8 w-8 text-slate-500 hover:text-primary hover:bg-slate-100"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(download.id, download.title)}
                      className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}