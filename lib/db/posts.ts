import { supabase } from '../supabaseAdmin';
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
  const status = post.status || 'draft';
  
  // Ensure headline and slug are present (required fields)
  if (!post.title && !post.headline) {
    throw new Error('Headline is required');
  }
  if (!post.slug) {
    throw new Error('Slug is required');
  }
  
  const payload = {
    business_id: post.business_id,
    headline: post.title || post.headline,
    slug: post.slug,
    status: status,
    published: status === 'published',
    content_body: post.content || post.content_body || null,
    article_body_raw: post.content || post.article_body_raw || null,
    seo_meta_desc: post.excerpt || post.seo_meta_desc || null,
    featured_image_url: post.featured_image_url || null,
    faq_list: post.faqs || [],
    keywords: post.keywords || [],
    about_entities: post.about_entities || [],
    mentions_entities: post.mentions_entities || [],
  };

  const { data, error } = await supabase
    .from('blog_posts')
    .insert([payload])
    .select()
    .single();

  if (error) {
    console.error('createPost error:', error);
    throw new Error(`Failed to create post: ${error.message}`);
  }
  return data as BlogPost;
};

export const updatePost = async (id: string, post: any) => {
  const payload: any = {
    last_updated: new Date().toISOString()
  };

  if (post.title || post.headline) payload.headline = post.title || post.headline;
  if (post.slug) payload.slug = post.slug;
  if (post.status) {
    payload.status = post.status;
    if (post.status === 'published') {
      payload.published = true;
    }
  }
  if (post.content || post.content_body) {
    payload.content_body = post.content || post.content_body;
    payload.article_body_raw = post.content || post.content_body;
  }
  if (post.excerpt || post.seo_meta_desc) payload.seo_meta_desc = post.excerpt || post.seo_meta_desc;
  if (post.featured_image_url) payload.featured_image_url = post.featured_image_url;
  if (post.faqs !== undefined) payload.faq_list = post.faqs;

  const { data, error } = await supabase
    .from('blog_posts')
    .update(payload)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('updatePost error:', error);
    throw new Error(`Failed to update post: ${error.message}`);
  }
  return data as BlogPost;
};

export const deletePost = async (id: string) => {
  const { data, error } = await supabase
    .from('blog_posts')
    .delete()
    .eq('id', id)
    .select();

  if (error) {
    console.error('deletePost error:', error);
    throw new Error(`Failed to delete post: ${error.message}`);
  }
  if (!data || data.length === 0) {
    throw new Error(`Delete failed: Record not found (ID: ${id}) or permissions denied.`);
  }
};
