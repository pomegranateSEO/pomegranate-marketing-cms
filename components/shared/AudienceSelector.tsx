import React, { useState } from 'react';
import { Search, Plus, X, Globe, Loader2, Users } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { searchWikipedia, WikiEntity } from '../../lib/wikipedia/api';

export interface AudienceEntity {
  name: string;
  type: 'Person' | 'Organization' | 'Group' | 'Concept';
  wikipedia_url?: string;
  id?: string;
}

interface Props {
  value: AudienceEntity[];
  onChange: (audiences: AudienceEntity[]) => void;
}

export const AudienceSelector: React.FC<Props> = ({ value = [], onChange }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<WikiEntity[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setIsSearching(true);
    try {
      const hits = await searchWikipedia(query, 5);
      setResults(hits);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSearching(false);
    }
  };

  const addAudience = (wiki: WikiEntity) => {
    // Determine broad type based on description or default to Concept
    let type: AudienceEntity['type'] = 'Concept';
    const desc = (wiki.description || '').toLowerCase();
    if (desc.includes('person') || desc.includes('human')) type = 'Person';
    else if (desc.includes('organization') || desc.includes('company') || desc.includes('association')) type = 'Organization';
    else if (desc.includes('group') || desc.includes('community')) type = 'Group';

    const newAudience: AudienceEntity = {
      name: wiki.title,
      type,
      wikipedia_url: wiki.url,
      id: String(wiki.id)
    };

    // Avoid duplicates
    if (!value.some(v => v.name === newAudience.name)) {
      onChange([...value, newAudience]);
    }
    setResults([]);
    setQuery('');
  };

  const removeAudience = (index: number) => {
    const updated = [...value];
    updated.splice(index, 1);
    onChange(updated);
  };

  return (
    <div className="space-y-4 border rounded-md p-4 bg-slate-50">
      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <Users className="h-4 w-4 text-primary" />
          Target Audience Entities
        </Label>
        <p className="text-xs text-slate-500">
          Who is this for? Search for official entities (e.g. "Small Business", "Chief Executive Officer", "Homeowner").
          This builds a stronger Knowledge Graph than simple text tags.
        </p>
        
        <div className="flex gap-2">
          <Input 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search Wikipedia (e.g. 'Dentists', 'Startups')..."
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleSearch())}
            className="bg-white"
          />
          <Button type="button" onClick={handleSearch} disabled={isSearching} variant="secondary">
            {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          </Button>
        </div>

        {/* Search Results Dropdown */}
        {results.length > 0 && (
          <div className="bg-white border rounded-md shadow-lg mt-2 divide-y max-h-60 overflow-y-auto">
            {results.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => addAudience(r)}
                className="w-full text-left p-3 hover:bg-slate-50 flex items-start gap-3 transition-colors"
              >
                <div className="flex-1">
                  <div className="font-medium text-sm text-slate-900">{r.title}</div>
                  <div className="text-xs text-slate-500 line-clamp-1">{r.description}</div>
                </div>
                <Plus className="h-4 w-4 text-slate-400" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Selected Tags */}
      <div className="flex flex-wrap gap-2">
        {value.length === 0 && <span className="text-xs text-slate-400 italic">No audiences selected.</span>}
        {value.map((aud, idx) => (
          <div key={idx} className="flex items-center gap-2 bg-white border px-3 py-1.5 rounded-full shadow-sm">
            <div className="flex flex-col leading-none">
              <span className="text-sm font-medium text-slate-800">{aud.name}</span>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider">{aud.type}</span>
            </div>
            {aud.wikipedia_url && (
              <a href={aud.wikipedia_url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-600">
                <Globe className="h-3 w-3" />
              </a>
            )}
            <button 
              type="button" 
              onClick={() => removeAudience(idx)}
              className="ml-1 text-slate-400 hover:text-red-500"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
