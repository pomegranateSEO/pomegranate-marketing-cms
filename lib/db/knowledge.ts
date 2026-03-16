
import { supabase } from '../supabaseAdmin';
import type { KnowledgeEntity } from '../types';

export const fetchKnowledgeEntities = async () => {
  const { data, error } = await supabase
    .from('knowledge_graph_entities')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data as KnowledgeEntity[];
};

export const createKnowledgeEntity = async (entity: Omit<KnowledgeEntity, 'id' | 'created_at'>) => {
  const { data, error } = await supabase
    .from('knowledge_graph_entities')
    .insert([entity])
    .select()
    .single();

  if (error) throw error;
  return data as KnowledgeEntity;
};

export const updateKnowledgeEntity = async (id: string, updates: Partial<KnowledgeEntity>) => {
  const { data, error } = await supabase
    .from('knowledge_graph_entities')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as KnowledgeEntity;
};

export const deleteKnowledgeEntity = async (id: string) => {
  // .select() returns the rows that were actually deleted
  const { data, error } = await supabase
    .from('knowledge_graph_entities')
    .delete()
    .eq('id', id)
    .select();

  if (error) throw error;
  
  // If no data returned, it means 0 rows were deleted (RLS or ID mismatch)
  if (!data || data.length === 0) {
    throw new Error(`Delete failed: The database found no record with ID ${id} to delete, or permissions (RLS) blocked the action.`);
  }
};
