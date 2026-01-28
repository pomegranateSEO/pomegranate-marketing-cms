
import React, { useState } from 'react';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import { BookOpen, Check, X, Sparkles, Loader2, Search } from 'lucide-react';
import type { KnowledgeEntity } from '../../lib/types';
import { matchEntities } from '../../lib/ai/gemini';

interface Props {
  label: string;
  allEntities: KnowledgeEntity[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  contentToScan?: string; // Optional content for AI scanning
}

export const KnowledgeEntitySelector: React.FC<Props> = ({ label, allEntities, selectedIds = [], onChange, contentToScan }) => {
  const [filter, setFilter] = useState('');
  const [isScanning, setIsScanning] = useState(false);

  // Filter Logic
  const filteredEntities = allEntities.filter(e => 
    e.name.toLowerCase().includes(filter.toLowerCase()) && !selectedIds.includes(e.id)
  );

  const selectedEntities = allEntities.filter(e => selectedIds.includes(e.id));

  // Handlers
  const addEntity = (id: string) => {
    if (!selectedIds.includes(id)) {
      onChange([...selectedIds, id]);
    }
  };

  const removeEntity = (id: string) => {
    onChange(selectedIds.filter(sid => sid !== id));
  };

  const handleAIScan = async () => {
    if (!contentToScan || contentToScan.length < 50) {
      alert("Please add more content to the page before scanning for entities.");
      return;
    }

    setIsScanning(true);
    try {
      const matchedIds = await matchEntities(contentToScan, allEntities);
      if (matchedIds.length > 0) {
        // Merge with existing
        const uniqueIds = Array.from(new Set([...selectedIds, ...matchedIds]));
        onChange(uniqueIds);
      } else {
        alert("No relevant entities found in the text.");
      }
    } catch (e) {
      console.error(e);
      alert("AI Scan failed.");
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="space-y-3 bg-white p-4 rounded-lg border shadow-sm">
      <div className="flex justify-between items-center">
        <Label className="flex items-center gap-2 text-slate-800">
          <BookOpen className="h-4 w-4 text-purple-600" />
          {label}
        </Label>
        
        {contentToScan && (
          <Button 
            type="button" 
            variant="outline" 
            size="sm" 
            onClick={handleAIScan} 
            disabled={isScanning}
            className="h-7 text-xs text-purple-700 border-purple-200 hover:bg-purple-50"
          >
            {isScanning ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Sparkles className="h-3 w-3 mr-1" />}
            AI Auto-Select
          </Button>
        )}
      </div>

      {/* Selected Box */}
      <div className="min-h-[60px] p-2 bg-slate-50 border rounded-md flex flex-wrap gap-2 items-start">
        {selectedEntities.length === 0 && (
          <span className="text-xs text-slate-400 p-1">No entities selected.</span>
        )}
        {selectedEntities.map(entity => (
          <div key={entity.id} className="group flex items-center gap-2 bg-white border border-slate-200 px-2 py-1 rounded shadow-sm">
             <div className="flex flex-col">
                <span className="text-xs font-medium text-slate-700">{entity.name}</span>
                <span className="text-[9px] text-slate-400 uppercase">{entity.entity_type}</span>
             </div>
             <button 
               type="button" 
               onClick={() => removeEntity(entity.id)}
               className="text-slate-300 hover:text-red-500"
             >
               <X className="h-3 w-3" />
             </button>
          </div>
        ))}
      </div>

      {/* Search & Add */}
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-3 w-3 text-slate-400" />
        <Input 
          placeholder="Search to add..." 
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="pl-8 h-8 text-xs bg-slate-50 border-slate-200 focus:bg-white"
        />
      </div>

      <div className="max-h-40 overflow-y-auto border rounded-md bg-white divide-y">
        {filteredEntities.length === 0 && (
          <p className="text-xs text-slate-400 text-center p-2">
            {filter ? "No matching entities found." : "All matching entities selected."}
          </p>
        )}
        {filteredEntities.map(entity => (
          <button 
            key={entity.id}
            type="button"
            onClick={() => addEntity(entity.id)}
            className="w-full text-left p-2 hover:bg-slate-50 flex items-center justify-between text-xs transition-colors group"
          >
            <div className="flex flex-col">
               <span className="font-medium text-slate-700">{entity.name}</span>
               <span className="text-slate-400">{entity.entity_type}</span>
            </div>
            <PlusIcon className="h-3 w-3 text-slate-300 group-hover:text-purple-600" />
          </button>
        ))}
      </div>
    </div>
  );
};

const PlusIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M5 12h14"/><path d="M12 5v14"/></svg>
);
