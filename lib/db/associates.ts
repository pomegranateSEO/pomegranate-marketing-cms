import { supabase } from '../supabaseAdmin';
import type { Associate } from '../types';

export const fetchAssociates = async () => {
  const { data, error } = await supabase
    .from('associates')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.warn("Associates fetch error:", error);
    return [];
  }
  return data as Associate[];
};

export const createAssociate = async (associate: Partial<Associate>) => {
  const { data, error } = await supabase
    .from('associates')
    .insert([associate])
    .select()
    .single();

  if (error) throw error;
  return data as Associate;
};

export const updateAssociate = async (id: string, associate: Partial<Associate>) => {
  const { data, error } = await supabase
    .from('associates')
    .update({ ...associate, last_updated: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as Associate;
};

export const deleteAssociate = async (id: string) => {
  const { data, error } = await supabase
    .from('associates')
    .delete()
    .eq('id', id)
    .select();

  if (error) throw error;
  if (!data || data.length === 0) {
    throw new Error(`Delete failed: Record not found (ID: ${id}) or permissions denied.`);
  }
};