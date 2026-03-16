import { supabase } from '../supabaseClient';

export interface Redirect {
  id: string;
  from_path: string;
  to_path: string;
  status_code: number;
  hit_count: number;
  last_hit_at: string | null;
  notes: string | null;
  is_active: boolean;
  source: string;
  created_at: string;
}

export interface ErrorLog {
  id: string;
  path: string;
  path_hash: string;
  referrer: string | null;
  user_agent: string | null;
  ip_hash: string | null;
  hit_count: number;
  first_seen_at: string;
  last_seen_at: string;
  resolved: boolean;
  resolved_by_redirect: string | null;
  resolved_at: string | null;
  notes: string | null;
}

export const fetchRedirects = async (options?: { activeOnly?: boolean }) => {
  let query = supabase
    .from('redirects')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (options?.activeOnly) {
    query = query.eq('is_active', true);
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.warn('Redirects fetch error:', error);
    return [];
  }
  return data as Redirect[];
};

export const createRedirect = async (redirect: Partial<Redirect>) => {
  const { data, error } = await supabase
    .from('redirects')
    .insert([{
      from_path: redirect.from_path,
      to_path: redirect.to_path,
      status_code: redirect.status_code || 301,
      is_active: redirect.is_active ?? true,
      source: redirect.source || 'manual',
      notes: redirect.notes,
    }])
    .select()
    .single();

  if (error) throw error;
  return data as Redirect;
};

export const updateRedirect = async (id: string, redirect: Partial<Redirect>) => {
  const { data, error } = await supabase
    .from('redirects')
    .update(redirect)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as Redirect;
};

export const deleteRedirect = async (id: string) => {
  const { error } = await supabase
    .from('redirects')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

export const bulkCreateRedirects = async (redirects: Array<Partial<Redirect>>) => {
  const { data, error } = await supabase
    .from('redirects')
    .insert(redirects.map(r => ({
      from_path: r.from_path,
      to_path: r.to_path,
      status_code: r.status_code || 301,
      is_active: r.is_active ?? true,
      source: r.source || 'import',
      notes: r.notes,
    })))
    .select();

  if (error) throw error;
  return data as Redirect[];
};

export const fetchErrorLogs = async (options?: { unresolvedOnly?: boolean; limit?: number }) => {
  let query = supabase
    .from('error_logs')
    .select('*')
    .order('hit_count', { ascending: false });
  
  if (options?.unresolvedOnly) {
    query = query.eq('resolved', false);
  }
  
  if (options?.limit) {
    query = query.limit(options.limit);
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.warn('Error logs fetch error:', error);
    return [];
  }
  return data as ErrorLog[];
};

export const resolveErrorLog = async (id: string, redirectId?: string) => {
  const { data, error } = await supabase
    .from('error_logs')
    .update({
      resolved: true,
      resolved_by_redirect: redirectId || null,
      resolved_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as ErrorLog;
};

export const log404 = async (path: string, referrer?: string, userAgent?: string) => {
  const { error } = await supabase.rpc('log_404', {
    p_path: path,
    p_referrer: referrer || null,
    p_user_agent: userAgent || null,
  });

  if (error) console.warn('404 logging error:', error);
};