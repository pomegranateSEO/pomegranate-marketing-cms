import React from 'react';
import { useFormContext } from 'react-hook-form';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Globe, Twitter, Linkedin, Facebook, Instagram } from 'lucide-react';

export const FooterSection: React.FC = () => {
  const { register } = useFormContext();

  return (
    <section className="space-y-4">
      <h3 className="text-xl font-bold border-b pb-2 flex items-center gap-2">
        <Globe className="h-5 w-5 text-primary" />
        Footer & Social Media
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="footer_tagline">Footer Tagline</Label>
          <Input 
            id="footer_tagline" 
            {...register('footer_tagline')} 
            placeholder="pomegranate work to plant the seeds..."
          />
          <p className="text-xs text-muted-foreground">Text shown below the logo in the footer</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="footer_copyright_text">Copyright Text</Label>
          <Input 
            id="footer_copyright_text" 
            {...register('footer_copyright_text')} 
            placeholder="Custom copyright text..."
          />
          <p className="text-xs text-muted-foreground">Overrides default copyright text</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="social_twitter" className="flex items-center gap-2">
            <Twitter className="h-4 w-4" /> Twitter/X
          </Label>
          <Input 
            id="social_twitter" 
            {...register('social_twitter')} 
            placeholder="https://twitter.com/..."
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="social_linkedin" className="flex items-center gap-2">
            <Linkedin className="h-4 w-4" /> LinkedIn
          </Label>
          <Input 
            id="social_linkedin" 
            {...register('social_linkedin')} 
            placeholder="https://linkedin.com/company/..."
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="social_facebook" className="flex items-center gap-2">
            <Facebook className="h-4 w-4" /> Facebook
          </Label>
          <Input 
            id="social_facebook" 
            {...register('social_facebook')} 
            placeholder="https://facebook.com/..."
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="social_instagram" className="flex items-center gap-2">
            <Instagram className="h-4 w-4" /> Instagram
          </Label>
          <Input 
            id="social_instagram" 
            {...register('social_instagram')} 
            placeholder="https://instagram.com/..."
          />
        </div>
      </div>
    </section>
  );
};
