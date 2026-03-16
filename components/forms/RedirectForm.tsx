import React from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import type { Redirect } from '../../lib/db/redirects';

interface RedirectFormProps {
  initialData?: Redirect;
  onSubmit: (data: Partial<Redirect>) => void;
  onCancel: () => void;
}

export const RedirectForm: React.FC<RedirectFormProps> = ({
  initialData,
  onSubmit,
  onCancel
}) => {
  const [fromPath, setFromPath] = React.useState(initialData?.from_path || '');
  const [toPath, setToPath] = React.useState(initialData?.to_path || '');
  const [statusCode, setStatusCode] = React.useState(initialData?.status_code || 301);
  const [isActive, setIsActive] = React.useState(initialData?.is_active ?? true);
  const [notes, setNotes] = React.useState(initialData?.notes || '');
  const [source, setSource] = React.useState(initialData?.source || 'manual');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      from_path: fromPath.trim(),
      to_path: toPath.trim(),
      status_code: statusCode,
      is_active: isActive,
      notes: notes.trim() || null,
      source: source,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="from_path">From Path *</Label>
          <Input
            id="from_path"
            value={fromPath}
            onChange={(e) => setFromPath(e.target.value)}
            placeholder="/old-page"
            required
          />
          <p className="text-xs text-slate-500">The URL path to redirect from (e.g., /old-blog-post)</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="to_path">To Path *</Label>
          <Input
            id="to_path"
            value={toPath}
            onChange={(e) => setToPath(e.target.value)}
            placeholder="/new-page"
            required
          />
          <p className="text-xs text-slate-500">The URL path to redirect to (e.g., /blog/new-post)</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="status_code">Status Code</Label>
          <select
            id="status_code"
            value={statusCode}
            onChange={(e) => setStatusCode(Number(e.target.value))}
            className="w-full px-3 py-2 border rounded-md text-sm"
          >
            <option value={301}>301 - Permanent</option>
            <option value={302}>302 - Temporary</option>
            <option value={307}>307 - Temporary (preserve method)</option>
            <option value={308}>308 - Permanent (preserve method)</option>
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="source">Source</Label>
          <select
            id="source"
            value={source}
            onChange={(e) => setSource(e.target.value)}
            className="w-full px-3 py-2 border rounded-md text-sm"
          >
            <option value="manual">Manual</option>
            <option value="import">CSV Import</option>
            <option value="auto">Auto-Generated</option>
          </select>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="is_active"
          checked={isActive}
          onChange={(e) => setIsActive(e.target.checked)}
          className="h-4 w-4 rounded border-slate-300"
        />
        <Label htmlFor="is_active" className="text-sm font-normal">
          Active(redirect is live)
        </Label>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Optional notes about this redirect..."
          rows={3}
        />
      </div>

      {initialData && (
        <div className="text-xs text-slate-500 space-y-1">
          <p>Hit Count: {initialData.hit_count || 0}</p>
          {initialData.last_hit_at && (
            <p>Last Hit: {new Date(initialData.last_hit_at).toLocaleString()}</p>
          )}
          <p>Created: {new Date(initialData.created_at).toLocaleString()}</p>
        </div>
      )}

      <div className="flex gap-3 pt-4">
        <Button type="submit">
          {initialData ? 'Update Redirect' : 'Create Redirect'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
};