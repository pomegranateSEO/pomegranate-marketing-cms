import React, { useEffect, useState } from 'react';
import { ArrowRight, Plus, Loader2, Trash2, Pencil, Eye, EyeOff, ExternalLink, Search } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { fetchRedirects, createRedirect, updateRedirect, deleteRedirect, Redirect } from '../../../lib/db/redirects';
import { RedirectForm } from '../../../components/forms/RedirectForm';
import { toast } from '../../../lib/toast';
import { useConfirm } from '../../../lib/confirm-dialog';
import { TableSkeleton, PageHeaderSkeleton } from '../../../components/shared/skeletons';

export default function RedirectsPage() {
  const [redirects, setRedirects] = useState<Redirect[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [editingRedirect, setEditingRedirect] = useState<Redirect | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterActive, setFilterActive] = useState<'all' | 'active' | 'inactive'>('all');
  const { confirm, ConfirmDialog } = useConfirm();

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await fetchRedirects();
      setRedirects(data);
    } catch (err) {
      console.error("Failed to load redirects:", err);
      toast.error("Failed to load redirects");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateOrUpdate = async (data: Partial<Redirect>) => {
    try {
      if (editingRedirect) {
        await updateRedirect(editingRedirect.id, data);
        toast.success("Redirect updated successfully");
        setEditingRedirect(null);
      } else {
        await createRedirect(data);
        toast.success("Redirect created successfully");
        setIsCreating(false);
      }
      loadData();
    } catch (err: any) {
      toast.error("Failed to save redirect", err.message);
    }
  };

  const handleDelete = async (id: string, fromPath: string) => {
    const confirmed = await confirm({
      title: "Delete Redirect",
      message: `Are you sure you want to delete redirect "${fromPath}"? This cannot be undone.`,
      confirmText: "Delete",
      cancelText: "Cancel",
      variant: "destructive",
    });
    if (confirmed) {
      try {
        await deleteRedirect(id);
        toast.success("Redirect deleted");
        loadData();
      } catch (err: any) {
        toast.error("Delete failed", err.message);
      }
    }
  };

  const handleEdit = (redirect: Redirect) => {
    setEditingRedirect(redirect);
    setIsCreating(false);
  };

  const handleToggleActive = async (redirect: Redirect) => {
    try {
      await updateRedirect(redirect.id, { is_active: !redirect.is_active });
      toast.success(redirect.is_active ? "Redirect deactivated" : "Redirect activated");
      loadData();
    } catch (err: any) {
      toast.error("Failed to update", err.message);
    }
  };

  const filteredRedirects = redirects.filter(r => {
    const matchesSearch = searchQuery === '' || 
      r.from_path.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.to_path.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesActive = filterActive === 'all' || 
      (filterActive === 'active' && r.is_active) ||
      (filterActive === 'inactive' && !r.is_active);
    return matchesSearch && matchesActive;
  });

  const activeCount = redirects.filter(r => r.is_active).length;

  if (loading) {
    return (
      <div className="p-6">
        <PageHeaderSkeleton />
        <TableSkeleton rows={5} columns={4} />
      </div>
    );
  }

  if (isCreating || editingRedirect) {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" onClick={() => { setIsCreating(false); setEditingRedirect(null); }}>
            ← Back
          </Button>
          <h1 className="text-2xl font-bold">
            {editingRedirect ? 'Edit Redirect' : 'Add New Redirect'}
          </h1>
        </div>
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <RedirectForm
            initialData={editingRedirect || undefined}
            onSubmit={handleCreateOrUpdate}
            onCancel={() => { setIsCreating(false); setEditingRedirect(null); }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Redirects</h1>
          <p className="text-slate-500 mt-2">
            Manage 301 redirects from old URLs to new pages. {activeCount} active redirects.
          </p>
        </div>
        <Button onClick={() => setIsCreating(true)}>
          <Plus className="h-4 w-4 mr-2" /> Add Redirect
        </Button>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search by path..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={filterActive === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterActive('all')}
          >
            All ({redirects.length})
          </Button>
          <Button
            variant={filterActive === 'active' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterActive('active')}
          >
            Active ({activeCount})
          </Button>
          <Button
            variant={filterActive === 'inactive' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterActive('inactive')}
          >
            Inactive ({redirects.length - activeCount})
          </Button>
        </div>
      </div>

      {filteredRedirects.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed rounded-lg bg-slate-50">
          <ArrowRight className="h-12 w-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900">
            {searchQuery ? 'No matching redirects' : 'No redirects yet'}
          </h3>
          <p className="text-slate-500 mb-6">
            {searchQuery ? 'Try a different search term.' : 'Create your first redirect to handle URL changes.'}
          </p>
          {!searchQuery && (
            <Button onClick={() => setIsCreating(true)}>
              Create Redirect
            </Button>
          )}
        </div>
      ) : (
        <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 border-b font-medium text-slate-500">
              <tr>
                <th className="px-6 py-4">From Path</th>
                <th className="px-6 py-4">To Path</th>
                <th className="px-6 py-4 w-20 text-center">Code</th>
                <th className="px-6 py-4 w-20 text-center">Hits</th>
                <th className="px-6 py-4 w-24 text-center">Status</th>
                <th className="px-6 py-4 w-24">Source</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredRedirects.map((redirect) => (
                <tr key={redirect.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <code className="text-xs bg-slate-100 px-2 py-1 rounded font-mono">
                      {redirect.from_path}
                    </code>
                  </td>
                  <td className="px-6 py-4">
                    <code className="text-xs bg-slate-100 px-2 py-1 rounded font-mono">
                      {redirect.to_path}
                    </code>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-xs font-medium text-slate-600">
                      {redirect.status_code}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-xs font-medium text-slate-600">
                      {redirect.hit_count || 0}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => handleToggleActive(redirect)}
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors ${
                        redirect.is_active
                          ? 'bg-green-50 text-green-700 hover:bg-green-100'
                          : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                      }`}
                    >
                      {redirect.is_active ? (
                        <><Eye className="h-3.5 w-3.5" /> Active</>
                      ) : (
                        <><EyeOff className="h-3.5 w-3.5" /> Inactive</>
                      )}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                      redirect.source === 'import' ? 'bg-blue-50 text-blue-700' :
                      redirect.source === 'auto' ? 'bg-purple-50 text-purple-700' :
                      'bg-slate-100 text-slate-600'
                    }`}>
                      {redirect.source}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right flex justify-end gap-1">
                    <a
                      href={redirect.to_path}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center h-8 w-8 rounded-md hover:bg-slate-100 text-slate-500"
                      title="Test redirect"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                     <Button
                       variant="ghost"
                       size="icon"
                       onClick={() => handleEdit(redirect)}
                       className="h-8 w-8 text-slate-500 hover:text-primary hover:bg-slate-100"
                       aria-label={`Edit redirect from ${redirect.from_path}`}
                     >
                       <Pencil className="h-4 w-4" aria-hidden="true" />
                     </Button>
                     <Button
                       variant="ghost"
                       size="icon"
                       onClick={() => handleDelete(redirect.id, redirect.from_path)}
                       className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                       aria-label={`Delete redirect from ${redirect.from_path}`}
                     >
                       <Trash2 className="h-4 w-4" aria-hidden="true" />
                     </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <ConfirmDialog />
    </div>
  );
}