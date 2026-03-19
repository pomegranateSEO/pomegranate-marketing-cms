import React, { useEffect, useState } from 'react';
import { Loader2, Settings, Pencil, Trash2, Save, Image } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Textarea } from '../../../components/ui/textarea';
import { Label } from '../../../components/ui/label';
import { toast } from '../../../lib/toast';
import { useConfirm } from '../../../lib/confirm-dialog';
import { supabase } from '../../../lib/supabaseClient';
import { PageHeaderSkeleton } from '../../../components/shared/skeletons';
import type { SiteSetting } from '../../../lib/types';

const SETTING_DEFINITIONS = [
  { key: 'og_default_image', label: 'Default OG Image URL', type: 'text', placeholder: 'https://...' },
  { key: 'seo_fallback_title', label: 'SEO Fallback Title', type: 'text', placeholder: 'Default page title' },
  { key: 'seo_fallback_description', label: 'SEO Fallback Description', type: 'textarea', placeholder: 'Default meta description...' },
  { key: 'footer_tagline', label: 'Footer Tagline', type: 'text', placeholder: 'pomegranate work to plant the seeds...' },
  { key: 'footer_copyright_year', label: 'Copyright Year', type: 'text', placeholder: '2026' },
  { key: 'contact_email', label: 'Contact Email', type: 'text', placeholder: 'info@example.com' },
  { key: 'contact_phone', label: 'Contact Phone', type: 'text', placeholder: '+44...' },
  { key: 'whatsapp_url', label: 'WhatsApp URL', type: 'text', placeholder: 'https://wa.me/...' },
  { key: 'address', label: 'Address', type: 'textarea', placeholder: 'Full address...' },
];

export default function SiteSettingsPage() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { confirm, ConfirmDialog } = useConfirm();

  const loadSettings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('site_settings')
        .select('key, value');
      if (error) throw error;
      const settingsMap: Record<string, string> = {};
      (data || []).forEach((s: SiteSetting) => {
        settingsMap[s.key] = s.value;
      });
      SETTING_DEFINITIONS.forEach(def => {
        if (!settingsMap[def.key]) {
          settingsMap[def.key] = '';
        }
      });
      setSettings(settingsMap);
    } catch (err: any) {
      toast.error('Failed to load settings', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleSave = async (key: string, value: string) => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('site_settings')
        .upsert([
          { key, value, updated_at: new Date().toISOString() }
        ], { onConflict: 'key' });
      if (error) throw error;
      setSettings(prev => ({ ...prev, [key]: value }));
      toast.success('Setting saved');
    } catch (err: any) {
      toast.error('Failed to save', err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAll = async () => {
    setSaving(true);
    try {
      const updates = Object.entries(settings).map(([key, value]) => ({
        key,
        value,
        updated_at: new Date().toISOString(),
      }));
      const { error } = await supabase
        .from('site_settings')
        .upsert(updates, { onConflict: 'key' });
      if (error) throw error;
      toast.success('All settings saved');
      loadSettings();
    } catch (err: any) {
      toast.error('Failed to save', err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <PageHeaderSkeleton />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Site Settings</h1>
          <p className="text-muted-foreground mt-2">Global settings for SEO, contact info, and footer.</p>
        </div>
        <Button onClick={handleSaveAll} disabled={saving}>
          {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
          <Save className="h-4 w-4 mr-2" /> Save All
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {SETTING_DEFINITIONS.map(def => (
          <div key={def.key} className="bg-card p-6 rounded-lg border">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor={def.key} className="font-medium">{def.label}</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSave(def.key, settings[def.key] || '')}
                  disabled={saving}
                >
                  {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
                </Button>
              </div>
              {def.type === 'textarea' ? (
                <Textarea
                  id={def.key}
                  value={settings[def.key] || ''}
                  onChange={e => setSettings(prev => ({ ...prev, [def.key]: e.target.value }))}
                  placeholder={def.placeholder}
                  className="min-h-[100px]"
                />
              ) : (
                <Input
                  id={def.key}
                  value={settings[def.key] || ''}
                  onChange={e => setSettings(prev => ({ ...prev, [def.key]: e.target.value }))}
                  placeholder={def.placeholder}
                  type={def.key.includes('image') || def.key.includes('url') ? 'url' : 'text'}
                />
              )}
              {def.key === 'og_default_image' && settings[def.key] && (
                <div className="mt-2">
                  <img src={settings[def.key]} alt="OG Preview" className="max-h-32 rounded border" />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 flex justify-end">
        <Button onClick={handleSaveAll} disabled={saving} size="lg">
          {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
          <Save className="h-4 w-4 mr-2" /> Save All Settings
        </Button>
      </div>
      <ConfirmDialog />
    </div>
  );
}
