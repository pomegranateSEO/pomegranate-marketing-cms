
import React, { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Button } from '../../ui/button';
import { LinkIcon, Loader2, Search, Plus, Trash2, Globe } from 'lucide-react';
import { findSocialLinks } from '../../../lib/ai/gemini';
import { toast } from '../../../lib/toast';

export const ContactSection: React.FC = () => {
  const { register, getValues, setValue, watch } = useFormContext();
  const [newSocialLink, setNewSocialLink] = useState('');
  const [isSearchingSocials, setIsSearchingSocials] = useState(false);

  const socialLinks = watch('social_links') || [];

  const handleFindSocials = async () => {
    const name = getValues('name');
    const location = getValues('address_locality');
    if (!name) { toast.warning("Please enter a business name first."); return; }

    setIsSearchingSocials(true);
    try {
      const links = await findSocialLinks(name, location);
      // Merge new links without duplicates
      const uniqueLinks = [...new Set([...socialLinks, ...links])];
      setValue('social_links', uniqueLinks);
      if (links.length > 0) toast.success(`Found ${links.length} social profiles.`);
      else toast.info("No social links found using Google Search.");
    } catch (e) {
      toast.error("AI Search failed to find links.");
    } finally {
      setIsSearchingSocials(false);
    }
  };

  const handleAddSocial = () => {
    if (newSocialLink && !socialLinks.includes(newSocialLink)) {
      setValue('social_links', [...socialLinks, newSocialLink]);
      setNewSocialLink('');
    }
  };

  const updateLink = (index: number, value: string) => {
    const updated = [...socialLinks];
    updated[index] = value;
    setValue('social_links', updated);
  };

  const removeSocial = (index: number) => {
    const updated = [...socialLinks];
    updated.splice(index, 1);
    setValue('social_links', updated);
  };

  return (
    <section className="space-y-4">
      <h3 className="text-xl font-bold border-b pb-2 flex items-center gap-2">
        <LinkIcon className="h-5 w-5 text-primary" />
        Contact & Socials
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         <div className="space-y-2">
          <Label htmlFor="website_url">Website URL</Label>
          <Input id="website_url" {...register('website_url')} placeholder="https://..." />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" {...register('email')} placeholder="hello@company.com" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="telephone">Telephone</Label>
          <Input id="telephone" {...register('telephone')} placeholder="+44 20 ..." />
        </div>
      </div>
      
      {/* Social Links */}
      <div className="space-y-3 pt-4 border-t">
        <div className="flex justify-between items-center">
          <Label className="flex items-center gap-2">
             <Globe className="h-4 w-4 text-slate-500" />
             SameAs / Social Links
          </Label>
          <Button 
            type="button" 
            variant="outline" 
            size="sm" 
            onClick={handleFindSocials}
            disabled={isSearchingSocials}
            className="text-purple-600 border-purple-200 hover:bg-purple-50"
          >
            {isSearchingSocials ? <Loader2 className="h-3 w-3 animate-spin mr-2" /> : <Search className="h-3 w-3 mr-2" />}
            Auto-Discover Socials
          </Button>
        </div>
        <p className="text-xs text-slate-500">
          These URLs populate the <code>sameAs</code> schema field, helping Google understand your digital footprint.
        </p>
        
        {/* Add New Link */}
        <div className="flex gap-2">
          <Input 
            value={newSocialLink} 
            onChange={(e) => setNewSocialLink(e.target.value)} 
            placeholder="Add a new URL (e.g. https://twitter.com/pomegranate)"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddSocial();
              }
            }}
          />
          <Button type="button" variant="secondary" onClick={handleAddSocial}><Plus className="h-4 w-4" /></Button>
        </div>

        {/* List of Editable Links */}
        <div className="space-y-2 mt-3">
          {socialLinks.length === 0 && <p className="text-sm text-slate-400 italic">No social links added.</p>}
          {socialLinks.map((link: string, idx: number) => (
            <div key={idx} className="flex gap-2 items-center group">
              <Input 
                value={link} 
                onChange={(e) => updateLink(idx, e.target.value)}
                className="text-sm font-mono text-slate-700 bg-slate-50 border-transparent focus:bg-white focus:border-input transition-colors"
              />
              <Button 
                type="button" 
                variant="ghost" 
                size="icon" 
                onClick={() => removeSocial(idx)} 
                className="text-slate-400 hover:text-red-500 hover:bg-red-50 opacity-50 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
