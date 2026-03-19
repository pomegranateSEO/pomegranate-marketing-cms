
import React, { useEffect, useState } from 'react';
import { Mail, Loader2, Save, ArrowLeft } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { fetchEmailTemplates, createEmailTemplate, updateEmailTemplate } from '../../lib/db/email_templates';
import type { EmailTemplate } from '../../lib/types';
import { toast } from '../../lib/toast';
import { TableSkeleton, PageHeaderSkeleton } from '../shared/skeletons';

const EMAIL_TEMPLATE_KEYS = [
  'contact_auto_reply',
  'download_confirmation',
  'audit_request_received',
  'brand_check_submitted',
];

export default function EmailTemplatesForm() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  
  const [formState, setFormState] = useState({
    subject: '',
    body: '',
  });

  const loadData = async () => {
    try {
      setLoading(true);
      let data = await fetchEmailTemplates();
      
      for (const key of EMAIL_TEMPLATE_KEYS) {
        if (!data.find(t => t.template_key === key)) {
          await createEmailTemplate({
            template_key: key,
            subject: key.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
            body: '',
          });
        }
      }
      
      data = await fetchEmailTemplates();
      setTemplates(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingKey) return;

    setSaving(true);
    try {
      const existingTemplate = templates.find(t => t.template_key === editingKey);
      if (existingTemplate) {
        await updateEmailTemplate(existingTemplate.id, {
          subject: formState.subject,
          body: formState.body,
        });
      }
      toast.success('Email template saved successfully');
      setEditingKey(null);
      loadData();
    } catch (err: any) {
      toast.error("Failed to save template", err.message);
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (key: string) => {
    const template = templates.find(t => t.template_key === key);
    if (template) {
      setFormState({
        subject: template.subject,
        body: template.body,
      });
    } else {
      setFormState({
        subject: key.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
        body: '',
      });
    }
    setEditingKey(key);
  };

  const formatKeyName = (key: string) => {
    return key.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  };

  if (loading) {
    return (
      <div className="p-6">
        <PageHeaderSkeleton />
        <TableSkeleton rows={4} columns={3} />
      </div>
    );
  }

  if (editingKey) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" onClick={() => setEditingKey(null)}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Back
          </Button>
          <h2 className="text-2xl font-bold">Edit: {formatKeyName(editingKey)}</h2>
        </div>

        <form onSubmit={handleSave} className="space-y-6 bg-card p-6 rounded-lg border shadow-sm">
          <div className="space-y-2">
            <Label>Email Subject</Label>
            <Input 
              value={formState.subject} 
              onChange={e => setFormState({...formState, subject: e.target.value})} 
              placeholder="Email subject line"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Email Body</Label>
            <p className="text-xs text-muted-foreground mb-2">
              Use variables like {"{{name}}"}, {"{{email}}"} for dynamic content.
            </p>
            <Textarea 
              value={formState.body} 
              onChange={e => setFormState({...formState, body: e.target.value})} 
              placeholder="Enter email body content. Use {{variable}} for dynamic content."
              className="min-h-[400px] font-mono text-sm"
            />
          </div>

          <div className="flex justify-end pt-4 border-t">
            <Button type="submit" disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
              Save Template
            </Button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Email Templates</h1>
          <p className="text-muted-foreground mt-2">
            Manage automated email templates.
          </p>
        </div>
      </div>

      <div className="bg-card border rounded-lg shadow-sm overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-muted border-b font-medium text-muted-foreground">
            <tr>
              <th className="px-6 py-4">Template Name</th>
              <th className="px-6 py-4">Subject</th>
              <th className="px-6 py-4">Last Updated</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {EMAIL_TEMPLATE_KEYS.map(key => {
              const template = templates.find(t => t.template_key === key);
              return (
                <tr key={key} className="hover:bg-muted/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-foreground">
                    {formatKeyName(key)}
                  </td>
                  <td className="px-6 py-4 text-muted-foreground text-sm truncate max-w-xs">
                    {template?.subject || '-'}
                  </td>
                  <td className="px-6 py-4 text-muted-foreground text-sm">
                    {template?.updated_at ? new Date(template.updated_at).toLocaleDateString() : 'Never'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Button variant="ghost" size="sm" onClick={() => startEdit(key)}>
                      <Mail className="h-4 w-4 mr-2" /> Edit
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
