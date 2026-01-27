import { supabase } from '../supabaseClient';
import type { Industry } from '../types';

export const fetchIndustries = async () => {
  const { data, error } = await supabase
    .from('industries')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.warn("Industries fetch error:", error);
    return [];
  }
  return data as Industry[];
};

export const createIndustry = async (industry: Partial<Industry>) => {
  const { data, error } = await supabase
    .from('industries')
    .insert([industry])
    .select()
    .single();

  if (error) throw error;
  return data as Industry;
};

export const updateIndustry = async (id: string, industry: Partial<Industry>) => {
  const { data, error } = await supabase
    .from('industries')
    .update({ ...industry, last_updated: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as Industry;
};

export const deleteIndustry = async (id: string) => {
  const { data, error } = await supabase
    .from('industries')
    .delete()
    .eq('id', id)
    .select();

  if (error) throw error;
  if (!data || data.length === 0) {
    throw new Error(`Delete failed: Record not found (ID: ${id}) or permissions denied.`);
  }
};