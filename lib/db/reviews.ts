import { supabase } from '../supabaseAdmin';
import type { Review } from '../types';

export const fetchReviews = async () => {
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
     console.warn("Reviews table fetch error:", error);
     return [];
  }
  return data as Review[];
};

export const createReview = async (review: Partial<Review>) => {
  // Ensure we don't send business_id if it's not in the schema
  // We explicitly select fields that match the schema
  const payload = {
    service_id: review.service_id || null,
    location_id: review.location_id || null,
    author_name: review.author_name,
    rating_value: review.rating_value,
    review_body: review.review_body,
    date_published: review.date_published,
    publisher_name: review.publisher_name || null,
    publisher_url: review.publisher_url || null
  };

  const { data, error } = await supabase
    .from('reviews')
    .insert([payload])
    .select()
    .single();

  if (error) throw error;
  return data as Review;
};

export const deleteReview = async (id: string) => {
  const { data, error } = await supabase
    .from('reviews')
    .delete()
    .eq('id', id)
    .select();

  if (error) throw error;
  if (!data || data.length === 0) {
    throw new Error(`Delete failed: Record not found (ID: ${id}) or permissions denied.`);
  }
};