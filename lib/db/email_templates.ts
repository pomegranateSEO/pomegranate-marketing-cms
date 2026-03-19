
import { supabase } from '../supabaseAdmin';
import type { EmailTemplate } from '../types';

export const fetchEmailTemplates = async () => {
  const { data, error } = await supabase
    .from('email_templates')
    .select('*')
    .order('template_key', { ascending: true });
  
  if (error) {
    console.warn("Email templates fetch error:", error);
    return [];
  }
  return data as EmailTemplate[];
};

export const fetchEmailTemplateByKey = async (templateKey: string) => {
  const { data, error } = await supabase
    .from('email_templates')
    .select('*')
    .eq('template_key', templateKey)
    .single();

  if (error) {
    console.warn("Email template fetch error:", error);
    return null;
  }
  return data as EmailTemplate;
};

export const createEmailTemplate = async (template: Omit<EmailTemplate, 'id'>) => {
  const { data, error } = await supabase
    .from('email_templates')
    .insert([template])
    .select()
    .single();

  if (error) throw error;
  return data as EmailTemplate;
};

export const updateEmailTemplate = async (id: string, template: Partial<EmailTemplate>) => {
  const payload = { 
    ...template, 
    updated_at: new Date().toISOString()
  };

  const { data, error } = await supabase
    .from('email_templates')
    .update(payload)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as EmailTemplate;
};
