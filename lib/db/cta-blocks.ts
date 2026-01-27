import { supabase } from '../supabaseClient';
import type { CTABlock } from '../types';

export const fetchCTABlocks = async () => {
  const { data, error } = await supabase
    .from('cta_blocks')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.warn("CTA Blocks fetch error (table might not exist yet):", error);
    return [];
  }
  return data as CTABlock[];
};

export const createCTABlock = async (cta: Partial<CTABlock>) => {
  const { data, error } = await supabase
    .from('cta_blocks')
    .insert([cta])
    .select()
    .single();

  if (error) throw error;
  return data as CTABlock;
};

export const updateCTABlock = async (id: string, cta: Partial<CTABlock>) => {
  const { data, error } = await supabase
    .from('cta_blocks')
    .update({ ...cta, last_updated: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as CTABlock;
};

export const deleteCTABlock = async (id: string) => {
  const { data, error } = await supabase
    .from('cta_blocks')
    .delete()
    .eq('id', id)
    .select();

  if (error) throw error;
  if (!data || data.length === 0) {
    throw new Error(`Delete failed: Record not found (ID: ${id}) or permissions denied.`);
  }
};