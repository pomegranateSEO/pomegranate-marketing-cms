import React, { useEffect, useState } from 'react';
import { AlertTriangle, Loader2, ExternalLink, ArrowRight, CheckCircle, Clock } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { fetchErrorLogs, resolveErrorLog, ErrorLog } from '../../../lib/db/redirects';
import { createRedirect } from '../../../lib/db/redirects';
import { RedirectForm } from '../../../components/forms/RedirectForm';
import { toast } from '../../../lib/toast';
import { TableSkeleton, PageHeaderSkeleton } from '../../../components/shared/skeletons';

export default function ErrorLogsPage() {
  const [errorLogs, setErrorLogs] = useState<ErrorLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterResolved, setFilterResolved] = useState<'all' | 'unresolved' | 'resolved'>('unresolved');
  const [creatingRedirect, setCreatingRedirect] = useState<ErrorLog | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await fetchErrorLogs({ limit: 500 });
      setErrorLogs(data);
    } catch (err) {
      console.error("Failed to load error logs:", err);
      toast.error("Failed to load error logs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleResolve = async (log: ErrorLog) => {
    try {
      await resolveErrorLog(log.id);
      toast.success("Error log marked as resolved");
      loadData();
    } catch (err: any) {
      toast.error("Failed to resolve", err.message);
    }
  };

  const handleCreateRedirect = async (data: any) => {
    if (!creatingRedirect) return;
    try {
      await createRedirect({
        from_path: creatingRedirect.path,
        to_path: data.to_path,
        status_code: data.status_code,
        is_active: true,
        source: 'manual',
        notes: `Created from 404 log (hits: ${creatingRedirect.hit_count})`
      });
      await resolveErrorLog(creatingRedirect.id);
      toast.success("Redirect created and error resolved");
      setCreatingRedirect(null);
      loadData();
    } catch (err: any) {
      toast.error("Failed to create redirect", err.message);
    }
  };

  const filteredLogs = errorLogs.filter(log => {
    const matchesSearch = searchQuery === '' || 
      log.path.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesResolved = filterResolved === 'all' || 
      (filterResolved === 'resolved' && log.resolved) ||
      (filterResolved === 'unresolved' && !log.resolved);
    return matchesSearch && matchesResolved;
  });

  const unresolvedCount = errorLogs.filter(l => !l.resolved).length;
  const topErrors = errorLogs.filter(l => !l.resolved).slice(0, 50);

  if (loading) {
    return (
      <div className="p-6">
        <PageHeaderSkeleton />
        <TableSkeleton rows={5} columns={4} />
      </div>
    );
  }

  if (creatingRedirect) {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" onClick={() => setCreatingRedirect(null)}>
            ← Back
          </Button>
          <h1 className="text-2xl font-bold">Create Redirect for 404</h1>
        </div>
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-sm text-amber-800">
              <strong>404 Path:</strong> <code className="bg-amber-100 px-2 py-0.5 rounded">{creatingRedirect.path}</code>
            </p>
            <p className="text-xs text-amber-600 mt-1">
              Hit {creatingRedirect.hit_count} times since {new Date(creatingRedirect.first_seen_at).toLocaleDateString()}
            </p>
          </div>
          <RedirectForm
            initialData={{
              from_path: creatingRedirect.path,
              to_path: '',
              status_code: 301,
              is_active: true,
              source: 'manual',
              notes: '',
              id: '',
              hit_count: 0,
              last_hit_at: null,
              created_at: ''
            }}
            onSubmit={handleCreateRedirect}
            onCancel={() => setCreatingRedirect(null)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            404 Error Logs
            {unresolvedCount > 0 && (
              <span className="text-sm font-normal bg-amber-100 text-amber-700 px-3 py-1 rounded-full">
                {unresolvedCount} unresolved
              </span>
            )}
          </h1>
          <p className="text-slate-500 mt-2">
            Track 404 errors and create redirects to fix broken links.
          </p>
        </div>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="relative flex-1">
          <AlertTriangle className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search by path..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={filterResolved === 'unresolved' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterResolved('unresolved')}
          >
            Unresolved ({unresolvedCount})
          </Button>
          <Button
            variant={filterResolved === 'resolved' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterResolved('resolved')}
          >
            Resolved ({errorLogs.length - unresolvedCount})
          </Button>
          <Button
            variant={filterResolved === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterResolved('all')}
          >
            All ({errorLogs.length})
          </Button>
        </div>
      </div>

      {filteredLogs.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed rounded-lg bg-slate-50">
          <CheckCircle className="h-12 w-12 text-green-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900">
            {filterResolved === 'unresolved' ? 'No unresolved 404s' : 'No error logs'}
          </h3>
          <p className="text-slate-500">
            {filterResolved === 'unresolved' 
              ? 'All 404 errors have been resolved. Great job!'
              : '404 errors will appear here when visitors hit missing pages.'}
          </p>
        </div>
      ) : (
        <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 border-b font-medium text-slate-500">
              <tr>
                <th className="px-6 py-4">Path</th>
                <th className="px-6 py-4 w-20 text-center">Hits</th>
                <th className="px-6 py-4 w-36">First Seen</th>
                <th className="px-6 py-4 w-36">Last Seen</th>
                <th className="px-6 py-4 w-24 text-center">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredLogs.map((log) => (
                <tr key={log.id} className={`hover:bg-slate-50 ${log.resolved ? 'bg-slate-50/50' : ''}`}>
                  <td className="px-6 py-4">
                    <code className="text-xs bg-slate-100 px-2 py-1 rounded font-mono">
                      {log.path}
                    </code>
                    {log.referrer && (
                      <p className="text-xs text-slate-400 mt-1 truncate max-w-xs">
                        Referrer: {log.referrer}
                      </p>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`text-xs font-medium px-2 py-1 rounded ${
                      log.hit_count > 10 ? 'bg-red-100 text-red-700' :
                      log.hit_count > 5 ? 'bg-amber-100 text-amber-700' :
                      'text-slate-600'
                    }`}>
                      {log.hit_count}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-500 text-xs">
                    {new Date(log.first_seen_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-slate-500 text-xs">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(log.last_seen_at).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {log.resolved ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-green-50 text-green-700">
                        <CheckCircle className="h-3 w-3" /> Resolved
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-amber-50 text-amber-700">
                        <AlertTriangle className="h-3 w-3" /> Unresolved
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right flex justify-end gap-1">
                    {!log.resolved && (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setCreatingRedirect(log)}
                          className="h-8 text-primary hover:bg-primary/10"
                        >
                          <ArrowRight className="h-4 w-4 mr-1" />
                          Create Redirect
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleResolve(log)}
                          className="h-8 text-slate-500 hover:text-slate-700 hover:bg-slate-100"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Ignore
                        </Button>
                      </>
                    )}
                    {log.resolved && log.resolved_by_redirect && (
                      <span className="text-xs text-slate-400">Redirect created</span>
                    )}
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