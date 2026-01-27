import { supabase } from '../supabaseClient';
import type { TargetLocation } from '../types';

export const fetchLocations = async () => {
  const { data, error } = await supabase
    .from('target_locations')
    .select('*, businesses(name)')
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data as (TargetLocation & { businesses: { name: string } | null })[];
};

export const createLocation = async (location: Partial<TargetLocation>) => {
  const { data, error } = await supabase
    .from('target_locations')
    .insert([location])
    .select()
    .single();

  if (error) throw error;
  return data as TargetLocation;
};

export const updateLocation = async (id: string, location: Partial<TargetLocation>) => {
  const { data, error } = await supabase
    .from('target_locations')
    .update({ ...location, last_updated: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as TargetLocation;
};

export const deleteLocation = async (id: string) => {
  const { data, error } = await supabase
    .from('target_locations')
    .delete()
    .eq('id', id)
    .select();

  if (error) throw error;
  if (!data || data.length === 0) {
    throw new Error(`Delete failed: Record not found (ID: ${id}) or permissions denied.`);
  }
};