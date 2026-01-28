
import { supabase } from '../supabaseClient';
import type { PseoPageInstance } from '../types';

export const fetchPageInstances = async (serviceId?: string) => {
  let query = supabase
    .from('pseo_page_instances')
    .select('*')
    .order('created_at', { ascending: false });

  if (serviceId) {
    query = query.eq('service_id', serviceId);
  }

  const { data, error } = await query;

  if (error) {
    console.warn("Error fetching page instances:", error);
    return [];
  }
  return data as PseoPageInstance[];
};

export const bulkCreatePageInstances = async (pages: Partial<PseoPageInstance>[]) => {
  if (pages.length === 0) return;

  const { data, error } = await supabase
    .from('pseo_page_instances')
    .insert(pages)
    .select();

  if (error) throw error;
  return data;
};

export const updatePageInstance = async (id: string, updates: Partial<PseoPageInstance>) => {
  const { data, error } = await supabase
    .from('pseo_page_instances')
    .update({ 
      ...updates, 
      last_updated: new Date().toISOString() 
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as PseoPageInstance;
};

export const deletePageInstance = async (id: string) => {
  const { error } = await supabase
    .from('pseo_page_instances')
    .delete()
    .eq('id', id);

  if (error) throw error;
};
