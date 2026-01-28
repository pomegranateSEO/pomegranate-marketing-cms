
import React from 'react';
import { useFormContext, useFieldArray } from 'react-hook-form';
import { Input } from '../../ui/input';
import { Clock } from 'lucide-react';

export const OpeningHoursSection: React.FC = () => {
  const { control, register } = useFormContext();
  
  // Use field array to manage the list of hours efficiently
  const { fields } = useFieldArray({
    control,
    name: "opening_hours"
  });

  return (
    <section className="space-y-4">
       <h3 className="text-xl font-bold border-b pb-2 flex items-center gap-2">
        <Clock className="h-5 w-5 text-primary" />
        Opening Hours
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {fields.map((field, index) => (
          <div key={field.id} className="p-3 rounded border bg-white">
            <div className="flex justify-between items-center mb-2">
              {/* @ts-ignore - field.day exists on the object but RHF types can be strict */}
              <span className="font-medium text-sm">{field.day}</span>
              <label className="text-xs flex items-center gap-1 cursor-pointer">
                <input 
                  type="checkbox" 
                  {...register(`opening_hours.${index}.closed`)}
                /> 
                Closed
              </label>
            </div>
            
            <div className="flex gap-2">
                <Input 
                  type="time" 
                  {...register(`opening_hours.${index}.opens`)}
                  className="h-8 text-xs"
                />
                <span className="text-slate-400">-</span>
                <Input 
                  type="time" 
                  {...register(`opening_hours.${index}.closes`)}
                  className="h-8 text-xs"
                />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
