import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error(
    'Missing Supabase admin environment variables. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.',
  );
}

// Service role client — bypasses RLS. For admin CMS use only.
// This is an internal admin tool; the admin URL is the access control boundary.
export const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

export const checkConnection = async () => {
  try {
    const { data, error } = await supabase.from('businesses').select('id').limit(1);
    if (error) throw error;
    return true;
  } catch (e) {
    console.error('Supabase admin connection check failed:', e);
    return false;
  }
};

export const uploadFile = async (bucket: string, path: string, file: File) => {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: true,
      });

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(path);

    return publicUrl;
  } catch (error) {
    console.error(`Upload failed to ${bucket}:`, error);
    throw error;
  }
};
