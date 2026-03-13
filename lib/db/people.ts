import { supabase } from '../supabaseClient';
import type { Person } from '../types';

export const fetchPeople = async () => {
  const { data, error } = await supabase
    .from('people')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.warn("People fetch error:", error);
    return [];
  }
  return data as Person[];
};

export const fetchPerson = async (id: string) => {
  const { data, error } = await supabase
    .from('people')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    console.warn("Person fetch error:", error);
    return null;
  }
  return data as Person;
};

export const fetchAuthors = async () => {
  const { data, error } = await supabase
    .from('people')
    .select('*')
    .eq('is_author', true)
    .eq('published', true)
    .order('full_name', { ascending: true });
  
  if (error) {
    console.warn("Authors fetch error:", error);
    return [];
  }
  return data as Person[];
};

export const createPerson = async (person: Partial<Person>) => {
  const { data, error } = await supabase
    .from('people')
    .insert([person])
    .select()
    .single();

  if (error) throw error;
  return data as Person;
};

export const updatePerson = async (id: string, person: Partial<Person>) => {
  const payload = {
    ...person,
    last_updated: new Date().toISOString()
  };

  const { data, error } = await supabase
    .from('people')
    .update(payload)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as Person;
};

export const deletePerson = async (id: string) => {
  const { data, error } = await supabase
    .from('people')
    .delete()
    .eq('id', id)
    .select();

  if (error) throw error;
  if (!data || data.length === 0) {
    throw new Error(`Delete failed: Record not found (ID: ${id}) or permissions denied.`);
  }
};