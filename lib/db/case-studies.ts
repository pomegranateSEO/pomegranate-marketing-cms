import { supabase } from '../supabaseAdmin';
import type { CaseStudy } from '../types';

export const fetchCaseStudies = async () => {
  const { data, error } = await supabase
    .from('case_studies')
    .select('*, services(name), industries(name)')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.warn("Case Studies fetch error:", error);
    return [];
  }
  // Supabase returns related data as objects, need to type cast properly if strict
  return data as (CaseStudy & { services: { name: string } | null, industries: { name: string } | null })[];
};

export const createCaseStudy = async (study: Partial<CaseStudy>) => {
  const { data, error } = await supabase
    .from('case_studies')
    .insert([study])
    .select()
    .single();

  if (error) throw error;
  return data as CaseStudy;
};

export const updateCaseStudy = async (id: string, study: Partial<CaseStudy>) => {
  const { data, error } = await supabase
    .from('case_studies')
    .update({ ...study, last_updated: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as CaseStudy;
};

export const deleteCaseStudy = async (id: string) => {
  const { data, error } = await supabase
    .from('case_studies')
    .delete()
    .eq('id', id)
    .select();

  if (error) throw error;
  if (!data || data.length === 0) {
    throw new Error(`Delete failed: Record not found (ID: ${id}) or permissions denied.`);
  }
};