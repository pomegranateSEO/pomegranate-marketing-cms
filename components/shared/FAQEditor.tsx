import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Plus, Trash2, Sparkles, Loader2, HelpCircle } from 'lucide-react';
import { generateFAQs } from '../../lib/ai/gemini';

interface FAQItem {
  question: string;
  answer: string;
}

interface Props {
  value: FAQItem[];
  onChange: (faqs: FAQItem[]) => void;
  sourceText?: string; // Content to generate FAQs from
}

export const FAQEditor: React.FC<Props> = ({ value = [], onChange, sourceText }) => {
  const [generating, setGenerating] = useState(false);

  const addFAQ = () => {
    onChange([...value, { question: '', answer: '' }]);
  };

  const removeFAQ = (index: number) => {
    const newFaqs = [...value];
    newFaqs.splice(index, 1);
    onChange(newFaqs);
  };

  const updateFAQ = (index: number, field: keyof FAQItem, val: string) => {
    const newFaqs = [...value];
    newFaqs[index] = { ...newFaqs[index], [field]: val };
    onChange(newFaqs);
  };

  const handleAutoGenerate = async () => {
    if (!sourceText || sourceText.length < 50) {
      alert("Please add some content to the page/post body first so the AI can analyze it.");
      return;
    }

    setGenerating(true);
    try {
      const newFaqs = await generateFAQs(sourceText);
      if (newFaqs && newFaqs.length > 0) {
        // Append new FAQs to existing ones
        onChange([...value, ...newFaqs]);
      } else {
        alert("AI couldn't generate any FAQs from the content.");
      }
    } catch (e) {
      alert("Failed to generate FAQs.");
      console.error(e);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-4 border rounded-md p-4 bg-slate-50">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-slate-800">Frequently Asked Questions</h3>
        </div>
        
        <div className="flex gap-2">
           <Button 
             type="button" 
             variant="outline" 
             size="sm"
             onClick={handleAutoGenerate}
             disabled={generating}
             className="text-purple-600 border-purple-200 hover:bg-purple-50"
           >
             {generating ? <Loader2 className="h-3 w-3 animate-spin mr-2" /> : <Sparkles className="h-3 w-3 mr-2" />}
             AI Scan & Generate
           </Button>
           <Button type="button" size="sm" onClick={addFAQ} variant="secondary">
             <Plus className="h-4 w-4 mr-2" /> Add Manually
           </Button>
        </div>
      </div>

      <p className="text-xs text-slate-500">
        These FAQs will be added to the page Schema (JSON-LD) and displayed in the content.
      </p>

      {value.length === 0 && (
        <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-lg bg-white">
           <p className="text-slate-400 text-sm">No FAQs added yet.</p>
        </div>
      )}

      <div className="space-y-3">
        {value.map((faq, index) => (
          <div key={index} className="bg-white p-3 rounded border shadow-sm relative group animate-in fade-in slide-in-from-bottom-2">
             <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => removeFAQ(index)}
                  className="h-6 w-6 text-slate-400 hover:text-red-500"
                >
                   <Trash2 className="h-3 w-3" />
                </Button>
             </div>
             
             <div className="space-y-3">
                <div>
                   <Label className="text-xs text-slate-400 uppercase tracking-wider">Question</Label>
                   <Input 
                      value={faq.question} 
                      onChange={(e) => updateFAQ(index, 'question', e.target.value)}
                      placeholder="e.g. What is your return policy?"
                      className="font-medium"
                   />
                </div>
                <div>
                   <Label className="text-xs text-slate-400 uppercase tracking-wider">Answer</Label>
                   <Textarea 
                      value={faq.answer} 
                      onChange={(e) => updateFAQ(index, 'answer', e.target.value)}
                      placeholder="Answer here..."
                      className="h-16 text-sm"
                   />
                </div>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
};
