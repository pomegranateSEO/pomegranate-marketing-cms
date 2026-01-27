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

export const createPost = async (post: any) => {
  // Map UI fields to DB schema
  const payload = {
    business_id: post.business_id,
    headline: post.title || post.headline, // Map title to headline
    slug: post.slug,
    status: post.status || 'draft',
    // Store content in content_body AND article_body_raw (for markdown)
    content_body: post.content || post.content_body, 
    article_body_raw: post.content || post.article_body_raw,
    // Map excerpt to seo_meta_desc
    seo_meta_desc: post.excerpt || post.seo_meta_desc,
    featured_image_url: post.featured_image_url,
    // Map faqs (JSONB), ensure defaults
    faqs: post.faqs || []
  };

  const { data, error } = await supabase
    .from('blog_posts')
    .insert([payload])
    .select()
    .single();

  if (error) throw error;
  return data as BlogPost;
};

export const updatePost = async (id: string, post: any) => {
  const payload: any = {
    last_updated: new Date().toISOString()
  };

  if (post.title || post.headline) payload.headline = post.title || post.headline;
  if (post.slug) payload.slug = post.slug;
  if (post.status) payload.status = post.status;
  if (post.content || post.content_body) {
     payload.content_body = post.content || post.content_body;
     payload.article_body_raw = post.content || post.content_body;
  }
  if (post.excerpt || post.seo_meta_desc) payload.seo_meta_desc = post.excerpt || post.seo_meta_desc;
  if (post.featured_image_url) payload.featured_image_url = post.featured_image_url;
  if (post.faqs !== undefined) payload.faqs = post.faqs;

  const { data, error } = await supabase
    .from('blog_posts')
    .update(payload)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as BlogPost;
};

export const deletePost = async (id: string) => {
  const { data, error } = await supabase
    .from('blog_posts')
    .delete()
    .eq('id', id)
    .select();

  if (error) throw error;
  if (!data || data.length === 0) {
    throw new Error(`Delete failed: Record not found (ID: ${id}) or permissions denied.`);
  }
};
