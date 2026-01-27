import React, { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Button } from '../../ui/button';
import { LinkIcon, Loader2, Search, Plus, Trash2 } from 'lucide-react';
import { findSocialLinks } from '../../../lib/ai/gemini';

interface Props {
  socialLinks: string[];
  setSocialLinks: (links: string[]) => void;
}

export const ContactSection: React.FC<Props> = ({ socialLinks, setSocialLinks }) => {
  const { register, getValues } = useFormContext();
  const [newSocialLink, setNewSocialLink] = useState('');
  const [isSearchingSocials, setIsSearchingSocials] = useState(false);

  const handleFindSocials = async () => {
    const name = getValues('name');
    const location = getValues('address_locality');
    if (!name) return alert("Please enter a business name first.");

    setIsSearchingSocials(true);
    try {
      const links = await findSocialLinks(name, location);
      // Merge new links without duplicates
      const uniqueLinks = [...new Set([...socialLinks, ...links])];
      setSocialLinks(uniqueLinks);
      if (links.length > 0) alert(`Found ${links.length} new links!`);
      else alert("No social links found.");
    } catch (e) {
      alert("AI Search failed to find links.");
    } finally {
      setIsSearchingSocials(false);
    }
  };

  const handleAddSocial = () => {
    if (newSocialLink && !socialLinks.includes(newSocialLink)) {
      setSocialLinks([...socialLinks, newSocialLink]);
      setNewSocialLink('');
    }
  };

  const updateLink = (index: number, value: string) => {
    const updated = [...socialLinks];
    updated[index] = value;
    setSocialLinks(updated);
  };

  const removeSocial = (index: number) => {
    const updated = [...socialLinks];
    updated.splice(index, 1);
    setSocialLinks(updated);
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
          <Input id="website_url" {...register('website_url')} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" {...register('email')} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="telephone">Telephone</Label>
          <Input id="telephone" {...register('telephone')} />
        </div>
      </div>
      
      {/* Social Links (SameAs) */}
      <div className="space-y-3 pt-4 border-t">
        <div className="flex justify-between items-center">
          <Label>SameAs / Social Links</Label>
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
          {socialLinks.map((link, idx) => (
            <div key={idx} className="flex gap-2 items-center">
              <Input 
                value={link} 
                onChange={(e) => updateLink(idx, e.target.value)}
                className="text-sm font-mono text-slate-700 bg-slate-50"
              />
              <Button 
                type="button" 
                variant="ghost" 
                size="icon" 
                onClick={() => removeSocial(idx)} 
                className="text-slate-400 hover:text-red-500 hover:bg-red-50"
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