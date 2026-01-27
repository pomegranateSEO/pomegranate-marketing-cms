import React, { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { Input } from '../../ui/input';
import { Textarea } from '../../ui/textarea';
import { Label } from '../../ui/label';
import { Upload, Sparkles, FileText, CheckCircle2, Loader2 } from 'lucide-react';
import { analyzeBrandGuidelines } from '../../../lib/ai/gemini';
import { uploadFile } from '../../../lib/supabaseClient';

export const BrandSection: React.FC = () => {
  const { register, setValue, watch } = useFormContext();
  const [analyzingBrand, setAnalyzingBrand] = useState(false);
  const [analyzedFileName, setAnalyzedFileName] = useState<string | null>(null);
  
  const globalTheme = watch('global_theme');
  const visualIdentity = watch('global_theme.visual_identity') || {};

  const getSafeColor = (val: string | undefined) => {
      if (!val) return '#ffffff';
      if (/^#[0-9A-F]{6}$/i.test(val)) return val;
      return '#ffffff';
  };

  const handleBrandUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAnalyzingBrand(true);
    setAnalyzedFileName(file.name);

    try {
      // 1. Upload to Storage
      const publicUrl = await uploadFile('brand_guidelines', `guidelines_${Date.now()}_${file.name}`, file);
      console.log("Uploaded Guidelines to:", publicUrl);

      // 2. Read for AI Analysis
      const reader = new FileReader();
      reader.onload = async () => {
        const base64String = (reader.result as string).split(',')[1];
        try {
            const theme = await analyzeBrandGuidelines(base64String, file.type);
            setValue('global_theme', theme);
            alert(`Analysis Complete! Guidelines uploaded & brand identity extracted.`);
        } catch (apiError: any) {
            console.error(apiError);
            alert(`AI Analysis Failed: ${apiError.message}`);
        } finally {
            setAnalyzingBrand(false);
        }
      };
      reader.readAsDataURL(file);

    } catch (err: any) {
      console.error(err);
      alert("Failed to upload or analyze file: " + err.message);
      setAnalyzingBrand(false);
    }
  };

  return (
    <section className="space-y-6 bg-slate-50 p-6 rounded-lg border relative overflow-hidden transition-all">
      <div className="flex justify-between items-center border-b pb-4 mb-4">
         <div>
           <h3 className="text-xl font-bold flex items-center gap-2 text-slate-800">
            <Upload className="h-5 w-5 text-purple-600" />
            Brand DNA
          </h3>
          <p className="text-xs text-slate-500 mt-1">Upload brand guidelines (PDF/Image) to 'brand_guidelines' bucket & auto-populate fields.</p>
         </div>
        
        <div className="flex items-center gap-3">
           {analyzedFileName && !analyzingBrand && (
             <div className="flex items-center gap-2 text-xs font-medium text-green-700 bg-green-50 px-3 py-1.5 rounded-full border border-green-200">
               <CheckCircle2 className="h-3 w-3" />
               Processed: {analyzedFileName}
             </div>
           )}
          <Label 
            htmlFor="brand-upload" 
            className={`cursor-pointer border hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-colors shadow-sm
              ${analyzingBrand ? 'bg-slate-100 cursor-not-allowed opacity-50' : 'bg-white'}`}
          >
             {analyzingBrand ? <Loader2 className="h-4 w-4 animate-spin text-purple-600" /> : <FileText className="h-4 w-4 text-purple-600" />}
             {analyzedFileName ? 'Replace PDF' : 'Upload PDF'}
          </Label>
          <Input 
            id="brand-upload" 
            type="file" 
            accept="application/pdf,image/*" 
            className="hidden" 
            onChange={handleBrandUpload} 
            disabled={analyzingBrand}
          />
        </div>
      </div>

      {analyzingBrand && (
        <div className="absolute inset-0 bg-white/90 z-10 flex flex-col items-center justify-center backdrop-blur-[1px]">
          <div className="flex flex-col items-center animate-pulse">
            <Sparkles className="h-10 w-10 text-purple-600 mb-3 animate-spin" />
            <h4 className="text-lg font-semibold text-purple-900">Uploading & Analyzing...</h4>
            <p className="text-sm text-purple-700 mt-1">Extracting colours, tone, and values...</p>
          </div>
        </div>
      )}

      <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 transition-opacity duration-500 ${analyzingBrand ? 'opacity-20' : 'opacity-100'}`}>
          <div className="space-y-2 md:col-span-2">
            <Label>Brand Mission & Vision</Label>
            <Input {...register('global_theme.brand_essence')} placeholder="e.g., To make organic food accessible to everyone" className="bg-white" />
          </div>
          
          <div className="space-y-2">
            <Label>Brand Personality</Label>
            <Input {...register('global_theme.personality')} placeholder="e.g., Friendly, Professional, Innovative" className="bg-white" />
          </div>
          
          <div className="space-y-2">
             <Label>Customer Engagement Style</Label>
             <Input {...register('global_theme.interaction_style')} placeholder="e.g., Helpful, Proactive, Consultative" className="bg-white" />
          </div>

          <div className="space-y-2 p-4 bg-white rounded border md:col-span-2">
            <Label className="text-xs uppercase text-slate-500 font-bold mb-3 block">Colour Palette</Label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
               {/* PRIMARY */}
               <div>
                  <Label className="text-xs">Primary</Label>
                  <div className="flex gap-2 items-center mt-1">
                    <input 
                      type="color" 
                      className="w-8 h-8 rounded cursor-pointer border-0 p-0"
                      value={getSafeColor(visualIdentity.primary)}
                      onChange={(e) => setValue('global_theme.visual_identity.primary', e.target.value)}
                    />
                    <Input 
                      {...register('global_theme.visual_identity.primary')} 
                      className="h-8 text-xs font-mono" 
                      placeholder="#000000" 
                    />
                  </div>
               </div>
               
               {/* SECONDARY */}
               <div>
                  <Label className="text-xs">Secondary</Label>
                  <div className="flex gap-2 items-center mt-1">
                     <input 
                      type="color" 
                      className="w-8 h-8 rounded cursor-pointer border-0 p-0"
                      value={getSafeColor(visualIdentity.secondary)}
                      onChange={(e) => setValue('global_theme.visual_identity.secondary', e.target.value)}
                    />
                    <Input 
                      {...register('global_theme.visual_identity.secondary')} 
                      className="h-8 text-xs font-mono" 
                      placeholder="#000000" 
                    />
                  </div>
               </div>

               {/* ACCENT */}
               <div>
                  <Label className="text-xs">Accent</Label>
                  <div className="flex gap-2 items-center mt-1">
                    <input 
                      type="color" 
                      className="w-8 h-8 rounded cursor-pointer border-0 p-0"
                      value={getSafeColor(visualIdentity.accent)}
                      onChange={(e) => setValue('global_theme.visual_identity.accent', e.target.value)}
                    />
                    <Input 
                      {...register('global_theme.visual_identity.accent')} 
                      className="h-8 text-xs font-mono" 
                      placeholder="#000000" 
                    />
                  </div>
               </div>

               {/* NEUTRAL LIGHT */}
               <div>
                  <Label className="text-xs">Neutral (Light)</Label>
                  <div className="flex gap-2 items-center mt-1">
                    <input 
                      type="color" 
                      className="w-8 h-8 rounded cursor-pointer border-0 p-0"
                      value={getSafeColor(visualIdentity.neutral_light)}
                      onChange={(e) => setValue('global_theme.visual_identity.neutral_light', e.target.value)}
                    />
                    <Input 
                      {...register('global_theme.visual_identity.neutral_light')} 
                      className="h-8 text-xs font-mono" 
                      placeholder="#F5F5F5" 
                    />
                  </div>
               </div>

               {/* NEUTRAL DARK */}
               <div>
                  <Label className="text-xs">Neutral (Dark)</Label>
                  <div className="flex gap-2 items-center mt-1">
                    <input 
                      type="color" 
                      className="w-8 h-8 rounded cursor-pointer border-0 p-0"
                      value={getSafeColor(visualIdentity.neutral_dark)}
                      onChange={(e) => setValue('global_theme.visual_identity.neutral_dark', e.target.value)}
                    />
                    <Input 
                      {...register('global_theme.visual_identity.neutral_dark')} 
                      className="h-8 text-xs font-mono" 
                      placeholder="#1A1A1A" 
                    />
                  </div>
               </div>
            </div>
          </div>

          <div className="space-y-2 p-4 bg-white rounded border md:col-span-2">
             <Label className="text-xs uppercase text-slate-500 font-bold mb-2 block">Typography</Label>
             <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs">Primary Font (Headings)</Label>
                  <Input {...register('global_theme.typography.primary_font')} className="mt-1" placeholder="e.g., Inter, Roboto" />
                </div>
                <div>
                  <Label className="text-xs">Secondary Font (Body)</Label>
                  <Input {...register('global_theme.typography.secondary_font')} className="mt-1" placeholder="e.g., Open Sans" />
                </div>
             </div>
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label>Voice & Tone Guidelines</Label>
            <Textarea 
              {...register('global_theme.voice_and_tone.description')} 
              className="bg-white min-h-[100px]" 
              placeholder="Describe how the brand should sound. E.g., 'We are professional but approachable. We avoid jargon.'"
            />
          </div>
          
           <div className="space-y-2 md:col-span-2">
            <Label>Market Positioning</Label>
            <Input 
              {...register('global_theme.strategic_positioning')} 
              className="bg-white" 
              placeholder="e.g., Premium service provider for small businesses"
            />
          </div>
      </div>
    </section>
  );
};
