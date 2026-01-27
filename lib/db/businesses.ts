import { supabase } from '../supabaseClient';
import type { Business } from '../types';

export const fetchBusinesses = async () => {
  const { data, error } = await supabase
    .from('businesses')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data as Business[];
};

export const fetchBusinessById = async (id: string) => {
  const { data, error } = await supabase
    .from('businesses')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data as Business;
};

export const createBusiness = async (business: Omit<Business, 'id' | 'created_at' | 'last_updated'>) => {
  const { data, error } = await supabase
    .from('businesses')
    .insert([business])
    .select()
    .single();

  if (error) throw error;
  return data as Business;
};

export const updateBusiness = async (id: string, business: Partial<Business>) => {
  const { data, error } = await supabase
    .from('businesses')
    .update({ ...business, last_updated: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as Business;
};

export const deleteBusiness = async (id: string) => {
  // DEEP CLEAN CASCADE DELETE
  // We must remove all child records before deleting the root business to satisfy Foreign Key constraints.

  try {
    // 1. Get Service IDs to clean up Page Instances (if table exists)
    const { data: services } = await supabase.from('services').select('id').eq('business_id', id);
    const serviceIds = services?.map(s => s.id) || [];

    if (serviceIds.length > 0) {
      // Attempt to delete generated pages associated with these services
      // We use try/catch here because pseo_page_instances might not exist in early schema versions
      try {
        await supabase.from('pseo_page_instances').delete().in('service_id', serviceIds);
      } catch (e) {
        console.warn("Could not delete pages, or table does not exist yet.", e);
      }
    }

    // 2. Delete Knowledge Entities (Wiki/Data links)
    const { error: keError } = await supabase
      .from('knowledge_entities')
      .delete()
      .eq('business_id', id);
    if (keError && keError.code !== '42P01') { // Ignore "undefined table" error
       console.error("Error deleting knowledge entities:", keError);
    }

    // 3. Delete Target Locations linked to this business
    const { error: locError } = await supabase
      .from('target_locations')
      .delete()
      .eq('business_id', id);
    
    if (locError) {
      throw new Error(`Failed to delete related locations: ${locError.message}`);
    }

    // 4. Delete Services linked to this business
    const { error: servError } = await supabase
      .from('services')
      .delete()
      .eq('business_id', id);

    if (servError) {
      throw new Error(`Failed to delete related services: ${servError.message}`);
    }

    // 5. Finally, Delete the Business itself
    const { error } = await supabase
      .from('businesses')
      .delete()
      .eq('id', id);

    if (error) throw error;

  } catch (err: any) {
    console.error("Deep delete failed:", err);
    throw new Error(err.message || "Failed to perform cascade delete.");
  }
};