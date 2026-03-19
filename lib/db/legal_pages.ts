
import { supabase } from '../supabaseAdmin';
import type { LegalPage } from '../types';

export const fetchLegalPages = async () => {
  const { data, error } = await supabase
    .from('legal_pages')
    .select('*')
    .order('slug', { ascending: true });
  
  if (error) {
    console.warn("Legal pages fetch error:", error);
    return [];
  }
  return data as LegalPage[];
};

export const fetchLegalPageBySlug = async (slug: string) => {
  const { data, error } = await supabase
    .from('legal_pages')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) {
    console.warn("Legal page fetch error:", error);
    return null;
  }
  return data as LegalPage;
};

export const createLegalPage = async (page: Omit<LegalPage, 'id'>) => {
  const { data, error } = await supabase
    .from('legal_pages')
    .insert([page])
    .select()
    .single();

  if (error) throw error;
  return data as LegalPage;
};

export const updateLegalPage = async (id: string, page: Partial<LegalPage>) => {
  const payload = { 
    ...page, 
    updated_at: new Date().toISOString()
  };

  const { data, error } = await supabase
    .from('legal_pages')
    .update(payload)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as LegalPage;
};
