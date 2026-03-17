
import React, { useState } from 'react';
import { Sparkles, Loader2, RefreshCw, PenTool, AlertCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { generateDraftContent, improveContent } from '../../lib/ai/gemini';
import { toast } from '../../lib/toast';
import type { GlobalTheme } from '../../lib/types';

interface Props {
  onGenerate: (text: string) => void;
  fieldName: string;
  currentValue?: string;
  keyword?: string;
  brandTheme?: GlobalTheme | null;
  className?: string;
  contextContent?: string;
}

export const AITextGenerator: React.FC<Props> = ({ 
  onGenerate, 
  fieldName, 
  currentValue = '', 
  keyword = '', 
  brandTheme,
  className,
  contextContent
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDraft = async () => {
    setLoading(true);
    try {
      const text = await generateDraftContent({
        fieldName,
        keyword,
        brandTheme,
        contextContent
      });
      onGenerate(text);
      setIsOpen(false);
    } catch (e: any) {
      toast.error("AI generation failed", e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleImprove = async () => {
    if (!currentValue) return;
    setLoading(true);
    try {
      const text = await improveContent({
        fieldName,
        keyword,
        brandTheme,
        existingText: currentValue,
        contextContent
      });
      onGenerate(text);
      setIsOpen(false);
    } catch (e: any) {
      toast.error("AI generation failed", e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`relative inline-block ${className}`}>
      <Button 
        type="button" 
        size="sm" 
        variant="ghost" 
        className="h-6 w-6 p-0 text-purple-500 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/30"
        onClick={() => setIsOpen(!isOpen)}
        title="AI Writing Assistant"
      >
        <Sparkles className="h-4 w-4" />
      </Button>

      {isOpen && (
        <div className="absolute z-50 right-0 mt-2 w-64 bg-card rounded-lg shadow-xl border p-3 animate-in fade-in zoom-in-95 duration-200">
          <div className="flex justify-between items-center mb-2 pb-2 border-b">
             <h4 className="text-xs font-bold text-foreground flex items-center gap-1">
               <Sparkles className="h-3 w-3 text-purple-500" />
               AI Assistant
             </h4>
             <button onClick={() => setIsOpen(false)} className="text-muted-foreground hover:text-foreground">×</button>
          </div>
          
          <div className="space-y-2">
             {!keyword && (
               <div className="bg-amber-100/50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-400 text-[10px] p-2 rounded flex items-start gap-1">
                  <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                  No keyword set. AI will write generally.
               </div>
             )}

             <Button 
               type="button" 
               variant="secondary" 
               size="sm" 
               className="w-full justify-start text-xs h-8" 
               onClick={handleDraft}
               disabled={loading}
             >
               {loading ? <Loader2 className="h-3 w-3 animate-spin mr-2" /> : <PenTool className="h-3 w-3 mr-2" />}
               Draft from Scratch
             </Button>

             <Button 
               type="button" 
               variant="outline" 
               size="sm" 
               className="w-full justify-start text-xs h-8" 
               onClick={handleImprove}
               disabled={loading || !currentValue}
             >
               {loading ? <Loader2 className="h-3 w-3 animate-spin mr-2" /> : <RefreshCw className="h-3 w-3 mr-2" />}
               Improve / Rewrite
             </Button>
          </div>
        </div>
      )}
    </div>
  );
};
