import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';

export interface ProcessStepItem {
  id: string;
  title: string;
  content: string;
  note?: string;
  noteDescription?: string;
}

interface ProcessStepsEditorProps {
  value: ProcessStepItem[];
  onChange: (items: ProcessStepItem[]) => void;
  heading?: string;
  onHeadingChange?: (heading: string) => void;
}

export const ProcessStepsEditor: React.FC<ProcessStepsEditorProps> = ({
  value,
  onChange,
  heading,
  onHeadingChange,
}) => {
  const addStep = () => {
    onChange([
      ...value,
      { id: Date.now().toString(), title: '', content: '', note: '', noteDescription: '' },
    ]);
  };

  const removeStep = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const updateStep = (index: number, field: keyof ProcessStepItem, newValue: string) => {
    const updated = [...value];
    updated[index] = { ...updated[index], [field]: newValue };
    onChange(updated);
  };

  return (
    <div className="space-y-6">
      {onHeadingChange && (
        <div className="space-y-2">
          <Label htmlFor="process_section_heading">Section Heading</Label>
          <Input
            id="process_section_heading"
            value={heading || ''}
            onChange={(e) => onHeadingChange(e.target.value)}
            placeholder="Our Process"
          />
        </div>
      )}

      <div className="space-y-4">
        <Label>Process Steps</Label>

        {value.map((step, index) => (
          <div
            key={step.id || index}
            className="bg-muted p-4 rounded-lg border"
          >
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-bold flex items-center justify-center mt-1">
                {index + 1}
              </div>

              <div className="flex-1 space-y-3">
                <div className="space-y-1">
                  <Label htmlFor={`step-title-${index}`}>Step Title</Label>
                  <Input
                    id={`step-title-${index}`}
                    value={step.title}
                    onChange={(e) => updateStep(index, 'title', e.target.value)}
                    placeholder="e.g., Discovery & Audit"
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor={`step-content-${index}`}>Description</Label>
                  <Textarea
                    id={`step-content-${index}`}
                    value={step.content}
                    onChange={(e) => updateStep(index, 'content', e.target.value)}
                    placeholder="What happens in this step..."
                    className="min-h-[80px] text-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor={`step-note-${index}`} className="text-xs text-muted-foreground">
                      Note label (optional)
                    </Label>
                    <Input
                      id={`step-note-${index}`}
                      value={step.note || ''}
                      onChange={(e) => updateStep(index, 'note', e.target.value)}
                      placeholder="e.g., Timeline"
                      className="text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor={`step-note-desc-${index}`} className="text-xs text-muted-foreground">
                      Note value (optional)
                    </Label>
                    <Input
                      id={`step-note-desc-${index}`}
                      value={step.noteDescription || ''}
                      onChange={(e) => updateStep(index, 'noteDescription', e.target.value)}
                      placeholder="e.g., Week 1–2"
                      className="text-sm"
                    />
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => removeStep(index)}
                className="text-muted-foreground hover:text-red-500 transition-colors p-1 flex-shrink-0"
                aria-label="Remove step"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}

        <Button type="button" variant="outline" onClick={addStep} className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          Add Step
        </Button>
      </div>

      {value.length > 0 && (
        <div className="bg-card p-4 rounded border">
          <p className="text-xs text-muted-foreground mb-2">Preview ({value.length} steps):</p>
          <div className="flex flex-wrap gap-2">
            {value.map((step, i) => (
              <div
                key={i}
                className="flex items-center gap-1.5 bg-muted px-2 py-1 rounded text-xs text-foreground"
              >
                <span className="font-bold text-primary">{i + 1}.</span>
                {step.title || 'Untitled'}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
