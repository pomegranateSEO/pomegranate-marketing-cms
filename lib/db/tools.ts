import { supabase } from '../supabaseClient';
import type { FreeTool } from '../types';

export const fetchTools = async () => {
  const { data, error } = await supabase
    .from('free_tools')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.warn("Free Tools fetch error:", error);
    return [];
  }
  return data as FreeTool[];
};

export const createTool = async (tool: Partial<FreeTool>) => {
  // Ensure array/json defaults
  const payload = {
    ...tool,
    tags: tool.tags || [],
    published: tool.published ?? false,
    featured: tool.featured ?? false,
  };

  const { data, error } = await supabase
    .from('free_tools')
    .insert([payload])
    .select()
    .single();

  if (error) throw error;
  return data as FreeTool;
};

export const updateTool = async (id: string, tool: Partial<FreeTool>) => {
  const { data, error } = await supabase
    .from('free_tools')
    .update({ ...tool, last_updated: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as FreeTool;
};

export const deleteTool = async (id: string) => {
  const { data, error } = await supabase
    .from('free_tools')
    .delete()
    .eq('id', id)
    .select();

  if (error) throw error;
  if (!data || data.length === 0) {
    throw new Error(`Delete failed: Record not found (ID: ${id}) or permissions denied.`);
  }
};