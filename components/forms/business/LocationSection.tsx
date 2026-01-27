import React, { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Button } from '../../ui/button';
import { MapPin, Loader2 } from 'lucide-react';

export const LocationSection: React.FC = () => {
  const { register, setValue, getValues } = useFormContext();
  const [geocoding, setGeocoding] = useState(false);

  const handleGeocode = async () => {
    const address = `${getValues('street_address') || ''}, ${getValues('address_locality') || ''}, ${getValues('address_country') || ''}`;
    if (address.length < 10) return alert("Please enter a valid address first.");

    setGeocoding(true);
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`);
      const data = await response.json();
      if (data && data.length > 0) {
        setValue('latitude', parseFloat(data[0].lat));
        setValue('longitude', parseFloat(data[0].lon));
      } else {
        alert("Could not find coordinates for this address.");
      }
    } catch (e) {
      console.error(e);
      alert("Geocoding service unavailable.");
    } finally {
      setGeocoding(false);
    }
  };

  return (
    <section className="space-y-4">
      <h3 className="text-xl font-bold border-b pb-2 flex items-center gap-2">
        <MapPin className="h-5 w-5 text-primary" />
        Location & Coordinates
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="street_address">Street Address</Label>
          <Input id="street_address" {...register('street_address')} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="address_locality">City</Label>
          <Input id="address_locality" {...register('address_locality')} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="address_country">Country</Label>
          <Input id="address_country" {...register('address_country')} />
        </div>
         <div className="space-y-2 flex items-end">
           <Button type="button" onClick={handleGeocode} disabled={geocoding} className="w-full" variant="secondary">
              {geocoding ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <MapPin className="h-4 w-4 mr-2" />}
              Generate Coordinates from Address
           </Button>
        </div>
         <div className="space-y-2">
          <Label htmlFor="latitude">Latitude</Label>
          <Input 
            id="latitude" 
            type="number" 
            step="any" 
            {...register('latitude', { valueAsNumber: true })} 
            placeholder="51.5074" 
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="longitude">Longitude</Label>
          <Input 
            id="longitude" 
            type="number" 
            step="any" 
            {...register('longitude', { valueAsNumber: true })} 
            placeholder="-0.1278" 
          />
        </div>
      </div>
    </section>
  );
};