import { supabase } from '../supabaseClient';
import type { KnowledgeEntity } from '../types';

export const fetchKnowledgeEntities = async () => {
  const { data, error } = await supabase
    .from('knowledge_entities')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data as KnowledgeEntity[];
};

export const createKnowledgeEntity = async (entity: Omit<KnowledgeEntity, 'id' | 'created_at'>) => {
  const { data, error } = await supabase
    .from('knowledge_entities')
    .insert([entity])
    .select()
    .single();

  if (error) throw error;
  return data as KnowledgeEntity;
};

export const updateKnowledgeEntity = async (id: string, updates: Partial<KnowledgeEntity>) => {
  const { data, error } = await supabase
    .from('knowledge_entities')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as KnowledgeEntity;
};

export const deleteKnowledgeEntity = async (id: string) => {
  const { error } = await supabase
    .from('knowledge_entities')
    .delete()
    .eq('id', id);

  if (error) throw error;
};
