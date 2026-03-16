import { supabase } from '../supabaseAdmin';
import type { Service } from '../types';

export const fetchServices = async () => {
  const { data, error } = await supabase
    .from('services')
    .select('*, businesses(name)')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('fetchServices error:', error);
    throw error;
  }
  return data as (Service & { businesses: { name: string } | null })[];
};

export const createService = async (service: Partial<Service>) => {
  // Ensure required fields
  if (!service.name) {
    throw new Error('Service name is required');
  }
  if (!service.base_slug) {
    throw new Error('Service slug is required');
  }

  const payload = {
    ...service,
    keyword_cycling_blocks: service.keyword_cycling_blocks || [],
    faq_list: service.faq_list || [],
  };

  const { data, error } = await supabase
    .from('services')
    .insert([payload])
    .select()
    .single();

  if (error) {
    console.error('createService error:', error);
    throw new Error(`Failed to create service: ${error.message}`);
  }
  return data as Service;
};

export const updateService = async (id: string, service: Partial<Service>) => {
  const payload = {
    ...service,
    last_updated: new Date().toISOString()
  };

  const { data, error } = await supabase
    .from('services')
    .update(payload)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('updateService error:', error);
    throw new Error(`Failed to update service: ${error.message}`);
  }
  return data as Service;
};

export const deleteService = async (id: string) => {
  const { data, error } = await supabase
    .from('services')
    .delete()
    .eq('id', id)
    .select();

  if (error) {
    console.error('deleteService error:', error);
    throw new Error(`Failed to delete service: ${error.message}`);
  }
  if (!data || data.length === 0) {
    throw new Error(`Delete failed: Record not found (ID: ${id}) or permissions denied.`);
  }
};