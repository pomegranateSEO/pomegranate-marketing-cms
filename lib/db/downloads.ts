import { supabase } from '../supabaseClient';
import type { Download } from '../types';

export const fetchDownloads = async () => {
  const { data, error } = await supabase
    .from('downloads')
    .select('*')
    .order('sort_order', { ascending: true });
  
  if (error) throw error;
  return data as Download[];
};

export const fetchDownloadById = async (id: string) => {
  const { data, error } = await supabase
    .from('downloads')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) throw error;
  return data as Download;
};

export const createDownload = async (download: Omit<Download, 'id' | 'created_at' | 'last_updated'>) => {
  const { data, error } = await supabase
    .from('downloads')
    .insert([download])
    .select()
    .single();

  if (error) throw error;
  return data as Download;
};

export const updateDownload = async (id: string, updates: Partial<Download>) => {
  const { data, error } = await supabase
    .from('downloads')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as Download;
};

export const deleteDownload = async (id: string) => {
  const { data, error } = await supabase
    .from('downloads')
    .delete()
    .eq('id', id)
    .select();

  if (error) throw error;
  
  if (!data || data.length === 0) {
    throw new Error(`Delete failed: No download found with ID ${id}`);
  }
};