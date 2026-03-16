import React, { useState } from 'react';
import { Sparkles, Loader2, Check } from 'lucide-react';
import { Button } from '../ui/button';
import { extractEntities } from '../../lib/ai/gemini';
import { createKnowledgeEntity, fetchKnowledgeEntities } from '../../lib/db/knowledge';
import { toast } from '../../lib/toast';

interface Props {
  getContent: () => string; // Function to get the latest text from the parent
  businessId: string;
  sourceName: string; // e.g., "Services" or "Blog Post"
}

export const EntityGenerator: React.FC<Props> = ({ getContent, businessId, sourceName }) => {
  const [loading, setLoading] = useState(false);
  const [generatedCount, setGeneratedCount] = useState<number | null>(null);

  const handleGenerate = async () => {
    const text = getContent();
    if (!text || text.length < 50) {
      toast.warning("Not enough content to analyze. Please add more text first.");
      return;
    }

    setLoading(true);
    setGeneratedCount(null);

    try {
      // 1. Extract
      const newEntities = await extractEntities(text);
      if (newEntities.length === 0) {
        toast.info("No entities found in the text.");
        setLoading(false);
        return;
      }

      // 2. Fetch existing to avoid simple duplicates (by name)
      const existing = await fetchKnowledgeEntities();
      const existingNames = new Set(existing.map(e => e.name.toLowerCase()));

      let added = 0;
      for (const entity of newEntities) {
        if (!existingNames.has(entity.name.toLowerCase())) {
          await createKnowledgeEntity({
            business_id: businessId,
            name: entity.name,
            description: entity.description,
            entity_type: entity.entity_type,
            wikipedia_url: entity.wikipedia_url
          });
          added++;
        }
      }

      setGeneratedCount(added);
      if (added > 0) {
          toast.success(`Added ${added} new ${added === 1 ? 'entity' : 'entities'} to your Knowledge Graph.`);
      } else {
        toast.info("Entities found, but they already exist in your Knowledge Graph.");
      }

    } catch (err: any) {
      console.error(err);
      toast.error("Failed to generate entities", err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button 
        onClick={handleGenerate} 
        disabled={loading} 
        variant="secondary" 
        size="sm"
        className="bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
        ) : generatedCount !== null ? (
          <Check className="h-4 w-4 mr-2" />
        ) : (
          <Sparkles className="h-4 w-4 mr-2" />
        )}
        {loading ? 'Analyzing...' : generatedCount !== null ? `Added ${generatedCount} Entities` : `Extract Entities from ${sourceName}`}
      </Button>
    </div>
  );
};
