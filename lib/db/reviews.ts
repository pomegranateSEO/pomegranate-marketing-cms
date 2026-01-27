import { supabase } from '../supabaseClient';
import type { Review } from '../types';

export const fetchReviews = async () => {
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
     // Graceful fallback if table doesn't exist yet
     console.warn("Reviews table fetch error:", error);
     return [];
  }
  return data as Review[];
};

export const createReview = async (review: Partial<Review>) => {
  const { data, error } = await supabase
    .from('reviews')
    .insert([review])
    .select()
    .single();

  if (error) throw error;
  return data as Review;
};

export const deleteReview = async (id: string) => {
  const { error } = await supabase
    .from('reviews')
    .delete()
    .eq('id', id);

  if (error) throw error;
};
