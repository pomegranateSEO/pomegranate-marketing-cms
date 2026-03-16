import React, { useState, useEffect, useRef } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Search, ExternalLink } from 'lucide-react';
import type { Redirect } from '../../lib/db/redirects';
import { supabase } from '../../lib/supabaseClient';

interface PageOption {
  path: string;
  label: string;
  category: string;
}

interface RedirectFormProps {
  initialData?: Redirect;
  onSubmit: (data: Partial<Redirect>) => void;
  onCancel: () => void;
}

const STATIC_PAGES: PageOption[] = [
  { path: '/', label: 'Homepage', category: 'Static Pages' },
  { path: '/about', label: 'About Us', category: 'Static Pages' },
  { path: '/contact', label: 'Contact', category: 'Static Pages' },
  { path: '/blog', label: 'Blog Hub', category: 'Static Pages' },
  { path: '/downloads', label: 'Downloads', category: 'Static Pages' },
  { path: '/free-tools', label: 'Free Tools Hub', category: 'Static Pages' },
  { path: '/industries', label: 'Industries Hub', category: 'Static Pages' },
  { path: '/locations', label: 'Locations Hub', category: 'Static Pages' },
  { path: '/legal/privacy-policy', label: 'Privacy Policy', category: 'Static Pages' },
];

const FREE_TOOLS: PageOption[] = [
  { path: '/free-tools/seo-audit-checker', label: 'SEO Audit Checker', category: 'Free Tools' },
];

async function fetchAllPages(): Promise<PageOption[]> {
  const pages: PageOption[] = [...STATIC_PAGES, ...FREE_TOOLS];
  
  try {
    const [servicesRes, industriesRes, locationsRes, blogRes] = await Promise.all([
      supabase.from('services').select('base_slug, name'),
      supabase.from('industries').select('slug, name'),
      supabase.from('target_locations').select('slug, name'),
      supabase.from('blog_posts').select('slug, headline').eq('published', true).limit(50),
    ]);

    if (servicesRes.data) {
      pages.push(...servicesRes.data.map((s: any) => ({path: `/${s.base_slug}`, label: s.name, category: 'Services' })));
    }
    if (industriesRes.data) {
      pages.push(...industriesRes.data.map((i: any) => ({ path: `/industries/${i.slug}`, label: i.name, category: 'Industries' })));
    }
    if (locationsRes.data) {
      pages.push(...locationsRes.data.map((l: any) => ({ path: `/locations/${l.slug}`, label: l.name, category: 'Locations' })));
    }
    if (blogRes.data) {
      pages.push(...blogRes.data.map((b: any) => ({ path: `/blog/${b.slug}`, label: b.headline, category: 'Blog Posts' })));
    }
  } catch (err) {
    console.warn('Failed to fetch dynamic pages:', err);
  }

  return pages;
}

export const RedirectForm: React.FC<RedirectFormProps> = ({
  initialData,
  onSubmit,
  onCancel
}) => {
  const [fromPath, setFromPath] = useState(initialData?.from_path || '');
  const [toPath, setToPath] = useState(initialData?.to_path || '');
  const [statusCode, setStatusCode] = useState(initialData?.status_code || 301);
  const [isActive, setIsActive] = useState(initialData?.is_active ?? true);
  const [notes, setNotes] = useState(initialData?.notes || '');
  const [source, setSource] = useState(initialData?.source || 'manual');
  const [pages, setPages] = useState<PageOption[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [loadingPages, setLoadingPages] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchAllPages().then(data => {
      setPages(data);
      setLoadingPages(false);
    });
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current &&!dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredPages = pages.filter(p => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return p.label.toLowerCase().includes(search) || p.path.toLowerCase().includes(search);
  });

  const groupedPages = filteredPages.reduce<Record<string, PageOption[]>>((acc, page) => {
    if (!acc[page.category]) acc[page.category] = [];
    acc[page.category].push(page);
    return acc;
  }, {});

  const handleSelectPage = (path: string) => {
    setToPath(path);
    setShowDropdown(false);
    setSearchTerm('');
  };

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
          <div className="relative" ref={dropdownRef}>
            <div className="flex gap-2">
              <Input
                id="to_path"
                value={toPath}
                onChange={(e) => setToPath(e.target.value)}
                placeholder="/new-page"
                required
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowDropdown(!showDropdown)}
                className="shrink-0"
              >
                <Search className="h-4 w-4 mr-1" />
                Browse
              </Button>
            </div>
            {showDropdown && (
              <div className="absolute z-50 mt-2 w-full bg-white border rounded-lg shadow-lg max-h-80 overflow-auto">
                <div className="sticky top-0 bg-white p-2 border-b">
                  <Input
                    placeholder="Search pages..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full"
                    autoFocus
                  />
                </div>
                {loadingPages ? (
                  <div className="p-4 text-center text-slate-500">Loading pages...</div>
                ) : (
                  <div className="py-1">
                    {Object.entries(groupedPages).map(([category, items]) => (
                      <div key={category}>
                        <div className="px-3 py-1.5 text-xs font-semibold text-slate-500 bg-slate-50">
                          {category}
                        </div>
                        {(items as PageOption[]).map((page) => (
                          <button
                            key={page.path}
                            type="button"
                            onClick={() => handleSelectPage(page.path)}
                            className="w-full px-3 py-2 text-left hover:bg-slate-50 flex items-center justify-between group"
                          >
                            <span className="text-sm">{page.label}</span>
                            <code className="text-xs text-slate-400 group-hover:text-slate-600">{page.path}</code>
                          </button>
                        ))}
                      </div>
                    ))}
                    {filteredPages.length === 0 && (
                      <div className="p-4 text-center text-slate-500">No pages found</div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>{toPath && (
            <a
              href={toPath}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-1"
            >
              <ExternalLink className="h-3 w-3" />
              Preview destination
            </a>
          )}
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