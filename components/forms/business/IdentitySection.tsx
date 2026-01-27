import React, { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { Input } from '../../ui/input';
import { Textarea } from '../../ui/textarea';
import { Label } from '../../ui/label';
import { Sparkles, Upload, Save, Check } from 'lucide-react';
import { SEO_LIMITS, getCharacterCountColor } from '../../../lib/seo/metadata-validator';

export const IdentitySection: React.FC = () => {
  const { register, watch, setValue, formState: { errors } } = useFormContext();
  const nameLength = watch('name')?.length || 0;
  const descriptionLength = watch('description')?.length || 0;
  const logoUrl = watch('logo_url');

  // Load logo from local storage on mount if available and field is empty
  useEffect(() => {
    const localLogo = localStorage.getItem('pomegranate_logo');
    if (localLogo && !logoUrl) {
      setValue('logo_url', localLogo);
    }
  }, [setValue, logoUrl]);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 500 * 1024) { // 500KB limit
        alert("Logo file is too large. Please upload an image under 500KB.");
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        // 1. Update Form State
        setValue('logo_url', result);
        // 2. Persist Locally immediately
        try {
            localStorage.setItem('pomegranate_logo', result);
        } catch (err) {
            console.warn("Logo too large for local storage", err);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <section className="space-y-4">
      <h3 className="text-xl font-bold border-b pb-2 flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-primary" />
        Core Identity
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Logo Upload Section */}
        <div className="md:col-span-2 space-y-2">
           <Label htmlFor="logo_url">Company Logo</Label>
           <div className="flex gap-3 items-start">
              <div className="flex-1 space-y-2">
                  <div className="flex gap-2">
                    <Input id="logo_url" {...register('logo_url')} placeholder="https://example.com/logo.png" />
                     <Label htmlFor="logo-upload-btn" className="cursor-pointer">
                        <div className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 px-4 py-2 rounded-md text-sm font-medium transition-colors h-10 whitespace-nowrap">
                        <Upload className="h-4 w-4" />
                        Upload Image
                        </div>
                    </Label>
                    <Input 
                        id="logo-upload-btn" 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={handleLogoUpload}
                    />
                  </div>
                  <p className="text-xs text-slate-400">
                    * Saved locally to browser for immediate use. Will be synced to database on save.
                  </p>
              </div>
           </div>
           
           {logoUrl && (
             <div className="mt-3 p-4 border rounded-lg bg-slate-50 flex items-center gap-4">
               <div className="bg-white p-2 border rounded shadow-sm">
                 <img src={logoUrl} alt="Logo Preview" className="h-16 object-contain" />
               </div>
               <div>
                  <p className="text-sm font-medium text-green-700 flex items-center gap-1">
                      <Check className="h-4 w-4" /> Image Loaded
                  </p>
                  <p className="text-xs text-slate-500 max-w-xs truncate">{String(logoUrl).substring(0, 50)}...</p>
               </div>
             </div>
           )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="name">Business Name / SEO Title</Label>
          <Input id="name" {...register('name')} placeholder="Pomegranate pSEO" />
          <div className="flex justify-between text-xs">
             <span className="text-red-500">{errors.name?.message?.toString()}</span>
             <span className={getCharacterCountColor(nameLength, SEO_LIMITS.TITLE_MAX)}>
               {nameLength}/{SEO_LIMITS.TITLE_MAX}
             </span>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="legal_name">Legal Name</Label>
          <Input id="legal_name" {...register('legal_name')} placeholder="Pomegranate Ltd" />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="description">Knowledge Graph Description</Label>
          <Textarea 
            id="description" 
            {...register('description')} 
            placeholder="A clear, concise description of the entity for schema.org markup..."
            className="resize-none h-20"
          />
          <div className="flex justify-between text-xs">
             <span className="text-red-500">{errors.description?.message?.toString()}</span>
             <span className={getCharacterCountColor(descriptionLength, SEO_LIMITS.DESC_MAX)}>
               {descriptionLength}/{SEO_LIMITS.DESC_MAX}
             </span>
          </div>
        </div>
        
        <div className="space-y-2">
           <Label htmlFor="price_range">Price Range (Schema)</Label>
           <Input id="price_range" {...register('price_range')} placeholder="$$$" />
        </div>
        <div className="space-y-2">
           <Label htmlFor="employee_count">Employee Count</Label>
           <Input 
             id="employee_count" 
             type="number" 
             {...register('employee_count', { valueAsNumber: true })} 
           />
        </div>
        <div className="space-y-2">
           <Label htmlFor="founding_date">Founding Date</Label>
           <Input id="founding_date" type="date" {...register('founding_date')} />
        </div>
         <div className="space-y-2">
           <Label htmlFor="founder_names">Founders (comma separated)</Label>
           <Input id="founder_names" {...register('founder_names')} placeholder="Jane Doe, John Smith" />
        </div>
      </div>
    </section>
  );
};