import React from 'react';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';

const ICON_OPTIONS = [
  'Zap', 'Search', 'Code2', 'Network', 'Settings', 'TrendingUp', 'Users', 'MessageSquare', 
  'Globe', 'Target', 'Award', 'CheckCircle', 'Palette', 'Monitor', 'ShoppingCart', 'Smartphone',
  'BookOpen', 'GraduationCap', 'Presentation', 'BarChart3', 'FileText', 'Link', 'Database',
  'Shield', 'Clock', 'Star', 'Heart', 'Lightbulb', 'Rocket'
];

export interface DeliverableItem {
  icon: string;
  title: string;
  description: string;
}

interface DeliverablesEditorProps {
  value: DeliverableItem[];
  onChange: (items: DeliverableItem[]) => void;
  heading?: string;
  onHeadingChange?: (heading: string) => void;
}

export const DeliverablesEditor: React.FC<DeliverablesEditorProps> = ({
  value,
  onChange,
  heading,
  onHeadingChange,
}) => {
  const addItem = () => {
    onChange([
      ...value,
      { icon: 'CheckCircle', title: '', description: '' }
    ]);
  };

  const removeItem = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof DeliverableItem, newValue: string) => {
    const updated = [...value];
    updated[index] = { ...updated[index], [field]: newValue };
    onChange(updated);
  };

  return (
    <div className="space-y-6">
      {onHeadingChange && (
        <div className="space-y-2">
          <Label htmlFor="deliverables_heading">Section Heading</Label>
          <Input
            id="deliverables_heading"
            value={heading || ''}
            onChange={(e) => onHeadingChange(e.target.value)}
            placeholder="What You Get"
          />
        </div>
      )}

      <div className="space-y-4">
        <Label>Deliverable Items</Label>
        
        {value.map((item, index) => (
          <div key={index} className="bg-slate-50 p-4 rounded-lg border border-slate-200 relative group">
            <div className="absolute top-2 right-2">
              <button
                type="button"
                onClick={() => removeItem(index)}
                className="text-slate-400 hover:text-red-500 transition-colors p-1"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-12 md:col-span-3 space-y-2">
                <Label htmlFor={`icon-${index}`}>Icon</Label>
                <select
                  id={`icon-${index}`}
                  value={item.icon}
                  onChange={(e) => updateItem(index, 'icon', e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  {ICON_OPTIONS.map(icon => (
                    <option key={icon} value={icon}>{icon}</option>
                  ))}
                </select>
              </div>

              <div className="col-span-12 md:col-span-4 space-y-2">
                <Label htmlFor={`title-${index}`}>Title</Label>
                <Input
                  id={`title-${index}`}
                  value={item.title}
                  onChange={(e) => updateItem(index, 'title', e.target.value)}
                  placeholder="e.g., Technical SEO"
                />
              </div>

              <div className="col-span-12 md:col-span-5 space-y-2">
                <Label htmlFor={`desc-${index}`}>Description</Label>
                <Input
                  id={`desc-${index}`}
                  value={item.description}
                  onChange={(e) => updateItem(index, 'description', e.target.value)}
                  placeholder="Brief description of this deliverable"
                />
              </div>
            </div>
          </div>
        ))}

        <Button
          type="button"
          variant="outline"
          onClick={addItem}
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Deliverable
        </Button>
      </div>

      {value.length > 0 && (
        <div className="bg-white p-4 rounded border border-slate-200">
          <p className="text-xs text-slate-500 mb-2">Preview:</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {value.map((item, i) => (
              <div key={i} className="bg-slate-50 p-3 rounded text-center">
                <div className="font-medium text-sm text-slate-800">{item.title || 'Untitled'}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};