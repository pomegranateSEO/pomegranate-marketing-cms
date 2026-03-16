import { supabase } from '../supabaseAdmin';
import type { StaticPage } from '../types';

export const fetchPages = async () => {
  const { data, error } = await supabase
    .from('pages')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.warn("Pages fetch error:", error);
    // Return empty array if table doesn't exist yet to prevent crash
    return [];
  }
  return data as StaticPage[];
};

export const createPage = async (page: Partial<StaticPage>) => {
  const payload = {
    ...page,
    page_type: page.page_type || 'static',
    content_html: page.content_html || '',
  };

  const { data, error } = await supabase
    .from('pages')
    .insert([payload])
    .select()
    .single();

  if (error) throw error;
  return data as StaticPage;
};

export const updatePage = async (id: string, page: Partial<StaticPage>) => {
  const payload = { 
    ...page, 
    last_updated: new Date().toISOString()
  };

  const { data, error } = await supabase
    .from('pages')
    .update(payload)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as StaticPage;
};

export const deletePage = async (id: string) => {
  const { data, error } = await supabase
    .from('pages')
    .delete()
    .eq('id', id)
    .select();

  if (error) throw error;
  if (!data || data.length === 0) {
    throw new Error(`Delete failed: Record not found (ID: ${id}) or permissions denied.`);
  }
};
