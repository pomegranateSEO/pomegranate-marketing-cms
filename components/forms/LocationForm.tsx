import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Loader2, MapPin } from 'lucide-react';
import type { TargetLocation } from '../../lib/types';

// Schema Validation
const locationFormSchema = z.object({
  name: z.string().min(1, "Location name is required"),
  slug: z.string().min(1, "Slug is required").regex(/^[a-z0-9-]+$/, "Slug must be URL-safe"),
  address_region: z.string().optional(),
  demographics_tag: z.string().optional(),
  geo_data: z.object({
    lat: z.number(),
    lng: z.number(),
    radius: z.string().default("5km"),
  }),
  landmarks_text: z.string().optional(), // Temporary field for text area input
});

type LocationFormValues = z.infer<typeof locationFormSchema>;

interface Props {
  initialData?: Partial<TargetLocation>;
  businessId: string;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const LocationForm: React.FC<Props> = ({ initialData, businessId, onSubmit, onCancel, isLoading }) => {
  const [geocoding, setGeocoding] = useState(false);

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<LocationFormValues>({
    resolver: zodResolver(locationFormSchema) as any,
    defaultValues: {
      name: initialData?.name || '',
      slug: initialData?.slug || '',
      address_region: initialData?.address_region || '',
      demographics_tag: initialData?.demographics_tag || '',
      geo_data: {
        lat: initialData?.geo_data?.lat || 0,
        lng: initialData?.geo_data?.lng || 0,
        radius: initialData?.geo_data?.radius || '5km',
      },
      // Join array into newline-separated string for editing
      landmarks_text: initialData?.landmarks_list?.join('\n') || '',
    },
  });

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    const currentSlug = watch('slug');
    if (!currentSlug || currentSlug.length === 0) {
      const slug = val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      setValue('slug', slug);
    }
  };

  const handleGeocode = async () => {
    const name = watch('name');
    const region = watch('address_region');
    const query = `${name} ${region}`.trim();

    if (!query) return alert("Enter a name to geocode.");

    setGeocoding(true);
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`);
      const data = await response.json();
      if (data && data.length > 0) {
        setValue('geo_data.lat', parseFloat(data[0].lat));
        setValue('geo_data.lng', parseFloat(data[0].lon));
      } else {
        alert("Could not find coordinates.");
      }
    } catch (e) {
      console.error(e);
      alert("Geocoding failed.");
    } finally {
      setGeocoding(false);
    }
  };

  const onFormSubmit = (values: LocationFormValues) => {
    // Convert newline separated text back to array
    const landmarksList = values.landmarks_text
      ? values.landmarks_text.split('\n').map(s => s.trim()).filter(s => s.length > 0)
      : [];

    const submissionData = {
      business_id: businessId,
      name: values.name,
      slug: values.slug,
      address_region: values.address_region,
      demographics_tag: values.demographics_tag,
      geo_data: values.geo_data,
      landmarks_list: landmarksList,
    };

    onSubmit(submissionData);
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Basic Info */}
        <div className="space-y-2">
          <Label htmlFor="name">Location Name</Label>
          <Input 
            id="name" 
            {...register('name')} 
            placeholder="e.g. Brixton" 
            onChange={(e) => {
              register('name').onChange(e);
              handleNameChange(e);
            }}
          />
          <p className="text-xs text-red-500">{errors.name?.message}</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="slug">URL Slug</Label>
          <Input id="slug" {...register('slug')} placeholder="brixton" />
          <p className="text-xs text-red-500">{errors.slug?.message}</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="address_region">Region / City (Optional)</Label>
          <Input id="address_region" {...register('address_region')} placeholder="e.g. South London" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="demographics_tag">Demographics Tag</Label>
          <Input id="demographics_tag" {...register('demographics_tag')} placeholder="e.g. urban professionals" />
          <p className="text-xs text-slate-500">Used in AI content generation: "We help [tag] in [name]..."</p>
        </div>

        {/* Geodata */}
        <div className="md:col-span-2 space-y-4 p-4 bg-slate-50 rounded-lg border">
          <div className="flex justify-between items-center">
             <h4 className="font-semibold text-sm flex items-center gap-2">
               <MapPin className="h-4 w-4" /> Geo-Coordinates
             </h4>
             <Button type="button" size="sm" variant="outline" onClick={handleGeocode} disabled={geocoding}>
                {geocoding ? <Loader2 className="h-3 w-3 animate-spin mr-2" /> : null}
                Auto-Find Coordinates
             </Button>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
             <div className="space-y-1">
               <Label className="text-xs">Latitude</Label>
               <Input type="number" step="any" {...register('geo_data.lat', { valueAsNumber: true })} />
             </div>
             <div className="space-y-1">
               <Label className="text-xs">Longitude</Label>
               <Input type="number" step="any" {...register('geo_data.lng', { valueAsNumber: true })} />
             </div>
             <div className="space-y-1">
               <Label className="text-xs">Radius</Label>
               <Input {...register('geo_data.radius')} placeholder="5km" />
             </div>
          </div>
          {(errors.geo_data?.lat || errors.geo_data?.lng) && (
             <p className="text-xs text-red-500">Valid coordinates are required.</p>
          )}
        </div>

        {/* Landmarks */}
        <div className="md:col-span-2 space-y-2">
           <Label htmlFor="landmarks">Key Landmarks (One per line)</Label>
           <Textarea 
             id="landmarks" 
             {...register('landmarks_text')} 
             placeholder="Brixton Market&#10;O2 Academy Brixton&#10;Brockwell Park" 
             className="min-h-[120px]"
           />
           <p className="text-xs text-slate-500">These will be rotated into content to prove local relevance.</p>
        </div>

      </div>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          {initialData ? 'Update Location' : 'Add Location'}
        </Button>
      </div>
    </form>
  );
};