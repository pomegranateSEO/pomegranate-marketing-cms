
import { supabase } from '../supabaseAdmin';
import type { BlogTopic } from '../types';

export const fetchBlogTopics = async () => {
  const { data, error } = await supabase
    .from('blog_topics')
    .select('*')
    .order('depth_level', { ascending: true }) // Load pillars first
    .order('topical_authority_score', { ascending: false });
  
  if (error) {
    console.warn("Error fetching blog topics:", error);
    return [];
  }
  return data as BlogTopic[];
};

export const createBlogTopic = async (topic: Partial<BlogTopic>) => {
  const { data, error } = await supabase
    .from('blog_topics')
    .insert([topic])
    .select()
    .single();

  if (error) throw error;
  return data as BlogTopic;
};

export const updateBlogTopic = async (id: string, updates: Partial<BlogTopic>) => {
  const { data, error } = await supabase
    .from('blog_topics')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as BlogTopic;
};

export const bulkCreateBlogTopics = async (topics: Partial<BlogTopic>[]) => {
  if (topics.length === 0) return;
  
  const { data, error } = await supabase
    .from('blog_topics')
    .insert(topics)
    .select();

  if (error) throw error;
  return data as BlogTopic[];
};

export const deleteBlogTopic = async (id: string) => {
  const { error } = await supabase
    .from('blog_topics')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

export const clearAllTopics = async (businessId: string) => {
  const { error } = await supabase
    .from('blog_topics')
    .delete()
    .eq('business_id', businessId);
    
  if (error) throw error;
};
