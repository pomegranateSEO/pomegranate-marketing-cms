import React, { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { Input } from '../../ui/input';
import { Textarea } from '../../ui/textarea';
import { Label } from '../../ui/label';
import { Sparkles, Upload, Check, Loader2, AlertTriangle, Hexagon } from 'lucide-react';
import { SEO_LIMITS } from '../../../lib/seo/metadata-validator';
import { uploadFile } from '../../../lib/supabaseAdmin';
import { toast } from '../../../lib/toast';
import { CharacterCountInput, CharacterCountTextarea } from '../FormField';

const CODE_LOGO_VALUE = 'code:pomegranate-logo';

export const IdentitySection: React.FC = () => {
  const { register, watch, setValue } = useFormContext();
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const logoUrl = watch('logo_url');
  
  const isCodeLogo = logoUrl === CODE_LOGO_VALUE;

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Logo file is too large. Please upload an image under 2MB.");
      return;
    }

    setUploading(true);
    setUploadError(null);

    try {
      const timestamp = Date.now();
      const cleanFileName = file.name.replace(/[^a-zA-Z0-9.]/g, '_');
      const path = `logos/${timestamp}_${cleanFileName}`;
      
      const publicUrl = await uploadFile('images', path, file);
      setValue('logo_url', publicUrl);
    } catch (err: any) {
      console.error("Logo upload failed:", err);
      setUploadError("Failed to upload image. Please check your storage bucket permissions.");
    } finally {
      setUploading(false);
    }
  };

  const handleUseCodeLogo = () => {
    setValue('logo_url', CODE_LOGO_VALUE);
  };

  const handleUseCustomLogo = () => {
    setValue('logo_url', '');
  };

  return (
    <section className="space-y-4">
      <h3 className="text-xl font-bold border-b pb-2 flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-primary" />
        Core Identity
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Logo Section */}
        <div className="md:col-span-2 space-y-2">
           <Label htmlFor="logo_url">Company Logo</Label>
           
           {/* Code-based Logo Preview - Show when code logo is selected */}
           {isCodeLogo ? (
             <div className="mt-3 p-4 border rounded-lg bg-gradient-to-r from-[#0f0508] to-[#4c0519] flex items-center gap-4">
               <div className="bg-transparent p-2 flex items-center gap-3">
                 {/* Animated Pomegranate Logo */}
                 <div className="relative flex items-center justify-center group cursor-pointer">
                   {/* Outer hexagon - animated */}
                   <Hexagon 
                     className="text-[#f43f5e] group-hover:rotate-180 duration-700 drop-shadow-[0_0_8px_rgba(244,63,94,0.8)]"
                     strokeWidth={2}
                     size={40}
                   />
                   {/* Inner hexagon - static */}
                   <Hexagon 
                     className="text-[#fda4af] absolute scale-50 rotate-90"
                     strokeWidth={2}
                     size={40}
                   />
                 </div>
                 {/* Wordmark */}
                 <span className="text-2xl font-logo font-black tracking-tight text-white">
                   pomegranate
                 </span>
               </div>
               <div className="flex-1">
                 <p className="text-sm font-medium text-green-300 flex items-center gap-1">
                   <Check className="h-4 w-4" /> Code-Based Logo Active
                 </p>
                 <p className="text-xs text-slate-300">
                   Branded logo rendered from code. No image upload required.
                 </p>
                 <button 
                   type="button"
                   onClick={handleUseCustomLogo}
                   className="mt-2 text-xs text-[#fda4af] hover:text-[#f43f5e] underline underline-offset-2"
                 >
                   Switch to custom uploaded logo
                 </button>
               </div>
             </div>
           ) : (
             <>
               <div className="flex gap-3 items-start">
                 <div className="flex-1 space-y-2">
                     <div className="flex gap-2">
                       <Input id="logo_url" {...register('logo_url')} placeholder="https://example.com/logo.png" />
                        <Label htmlFor="logo-upload-btn" className={`cursor-pointer ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
                           <div className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 px-4 py-2 rounded-md text-sm font-medium transition-colors h-10 whitespace-nowrap">
                             {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                             {uploading ? 'Uploading...' : 'Upload'}
                           </div>
                       </Label>
                       <Input 
                           id="logo-upload-btn" 
                           type="file" 
                           accept="image/*" 
                           className="hidden" 
                           onChange={handleLogoUpload}
                           disabled={uploading}
                       />
                     </div>
                     {uploadError && (
                       <p className="text-xs text-red-500 flex items-center gap-1">
                         <AlertTriangle className="h-3 w-3" /> {uploadError}
                       </p>
                     )}
                     <p className="text-xs text-slate-400">
                       Upload an image or use the code-based logo below.
                     </p>
                 </div>
               </div>
               
               {/* Option to use code-based logo */}
               <div className="mt-3 p-3 border border-dashed border-slate-300 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
                 <button 
                   type="button"
                   onClick={handleUseCodeLogo}
                   className="w-full flex items-center justify-center gap-3 text-sm text-slate-600 hover:text-slate-800"
                 >
                   <div className="flex items-center gap-2">
                     <Hexagon className="text-[#f43f5e]" size={20} strokeWidth={2} />
                     <Hexagon className="text-[#fda4af] scale-50 rotate-90 absolute" size={20} strokeWidth={2} />
                   </div>
                   <span>Use <strong>pomegranate</strong> code-based logo (no upload needed)</span>
                 </button>
               </div>
               
               {logoUrl && !isCodeLogo && (
                 <div className="mt-3 p-4 border rounded-lg bg-slate-50 flex items-center gap-4">
                   <div className="bg-white p-2 border rounded shadow-sm">
                     <img src={logoUrl} alt="Logo Preview" className="h-16 object-contain" />
                   </div>
                   <div>
                     <p className="text-sm font-medium text-green-700 flex items-center gap-1">
                         <Check className="h-4 w-4" /> Image Linked
                     </p>
                     <p className="text-xs text-slate-500 max-w-xs truncate">{String(logoUrl).substring(0, 50)}...</p>
                   </div>
                 </div>
               )}
             </>
           )}
         </div>

        <CharacterCountInput
          name="name"
          label="Business Name / SEO Title"
          required
          placeholder="Pomegranate pSEO"
          maxLength={SEO_LIMITS.TITLE_MAX}
        />
        <div className="space-y-2">
          <Label htmlFor="legal_name">Legal Name</Label>
          <Input id="legal_name" {...register('legal_name')} placeholder="Pomegranate Ltd" />
        </div>
         <div className="md:col-span-2">
           <CharacterCountTextarea
             name="description"
             label="Knowledge Graph Description"
             placeholder="A clear, concise description of the entity for schema.org markup..."
             maxLength={SEO_LIMITS.DESC_MAX}
             rows={3}
             className="resize-none"
           />
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
        
        <div className="space-y-2">
           <Label htmlFor="rating_value">Aggregate Rating (1-5)</Label>
           <Input id="rating_value" type="number" step="0.1" min="1" max="5" {...register('rating_value', { valueAsNumber: true })} />
        </div>
        <div className="space-y-2">
           <Label htmlFor="review_count">Total Review Count</Label>
           <Input id="review_count" type="number" {...register('review_count', { valueAsNumber: true })} />
        </div>
      </div>
    </section>
  );
};