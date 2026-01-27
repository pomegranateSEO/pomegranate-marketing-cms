import React from 'react';
import { Input } from '../../ui/input';
import { Clock } from 'lucide-react';
import { OpeningHours } from '../../../lib/types';

interface Props {
  hours: OpeningHours[];
  onChange: (hours: OpeningHours[]) => void;
}

export const OpeningHoursSection: React.FC<Props> = ({ hours, onChange }) => {
  const updateOpeningHour = (index: number, field: keyof OpeningHours, value: any) => {
    const newHours = [...hours];
    newHours[index] = { ...newHours[index], [field]: value };
    onChange(newHours);
  };

  return (
    <section className="space-y-4">
       <h3 className="text-xl font-bold border-b pb-2 flex items-center gap-2">
        <Clock className="h-5 w-5 text-primary" />
        Opening Hours
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {hours.map((oh, index) => (
          <div key={oh.day} className={`p-3 rounded border ${oh.closed ? 'bg-slate-100 opacity-70' : 'bg-white'}`}>
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium text-sm">{oh.day}</span>
              <label className="text-xs flex items-center gap-1 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={oh.closed} 
                  onChange={(e) => updateOpeningHour(index, 'closed', e.target.checked)} 
                /> 
                Closed
              </label>
            </div>
            {!oh.closed && (
              <div className="flex gap-2">
                <Input 
                  type="time" 
                  value={oh.opens} 
                  onChange={(e) => updateOpeningHour(index, 'opens', e.target.value)}
                  className="h-8 text-xs"
                />
                <span className="text-slate-400">-</span>
                <Input 
                  type="time" 
                  value={oh.closes} 
                  onChange={(e) => updateOpeningHour(index, 'closes', e.target.value)}
                  className="h-8 text-xs"
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};