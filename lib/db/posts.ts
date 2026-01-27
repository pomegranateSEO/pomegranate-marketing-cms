import { supabase } from '../supabaseClient';
import type { BlogPost } from '../types';

export const fetchPosts = async () => {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.warn("Blog posts fetch error:", error);
    return [];
  }
  return data as BlogPost[];
};

export const createPost = async (post: Partial<BlogPost>) => {
  const { data, error } = await supabase
    .from('blog_posts')
    .insert([post])
    .select()
    .single();

  if (error) throw error;
  return data as BlogPost;
};

export const updatePost = async (id: string, post: Partial<BlogPost>) => {
  const { data, error } = await supabase
    .from('blog_posts')
    .update({ ...post, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as BlogPost;
};

export const deletePost = async (id: string) => {
  const { error } = await supabase
    .from('blog_posts')
    .delete()
    .eq('id', id);

  if (error) throw error;
};
