import { supabase } from '../supabaseClient';

export interface PricingPlan {
  id?: string;
  service_id: string;
  category: string;
  subcategory?: string | null;
  tier_number: number;
  tier_name: string;
  price_min_gbp: number;
  price_max_gbp: number;
  features: string[];
  hosting_min_gbp?: number | null;
  hosting_max_gbp?: number | null;
  sort_order: number;
}

export interface ServiceOption {
  id: string;
  name: string;
  base_slug: string;
}

export async function fetchPricingServices(): Promise<ServiceOption[]> {
  const { data, error } = await supabase
    .from('services')
    .select('id, name, base_slug')
    .order('name');
  if (error) throw error;
  return data || [];
}

export async function fetchPricingPlans(serviceId?: string): Promise<PricingPlan[]> {
  let query = supabase
    .from('pricing_plans')
    .select('*')
    .order('sort_order', { ascending: true });

  if (serviceId) {
    query = query.eq('service_id', serviceId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data || []) as PricingPlan[];
}

export async function createPricingPlan(plan: Omit<PricingPlan, 'id'>): Promise<PricingPlan> {
  const { data, error } = await supabase
    .from('pricing_plans')
    .insert(plan)
    .select()
    .single();
  if (error) throw error;
  return data as PricingPlan;
}

export async function updatePricingPlan(id: string, plan: Partial<PricingPlan>): Promise<PricingPlan> {
  const { data, error } = await supabase
    .from('pricing_plans')
    .update(plan)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as PricingPlan;
}

export async function deletePricingPlan(id: string): Promise<void> {
  const { error } = await supabase
    .from('pricing_plans')
    .delete()
    .eq('id', id);
  if (error) throw error;
}
