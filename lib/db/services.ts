import { supabase } from '../supabaseClient';
import type { Service } from '../types';

export const fetchServices = async () => {
  const { data, error } = await supabase
    .from('services')
    .select('*, businesses(name)')
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data as (Service & { businesses: { name: string } | null })[];
};

export const createService = async (service: Partial<Service>) => {
  const { data, error } = await supabase
    .from('services')
    .insert([service])
    .select()
    .single();

  if (error) throw error;
  return data as Service;
};

export const updateService = async (id: string, service: Partial<Service>) => {
  const { data, error } = await supabase
    .from('services')
    .update({ ...service, last_updated: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as Service;
};

export const deleteService = async (id: string) => {
  const { data, error } = await supabase
    .from('services')
    .delete()
    .eq('id', id)
    .select();

  if (error) throw error;
  if (!data || data.length === 0) {
    throw new Error(`Delete failed: Record not found (ID: ${id}) or permissions denied.`);
  }
};