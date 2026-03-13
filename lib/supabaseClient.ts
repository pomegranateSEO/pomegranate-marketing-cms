import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.',
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const checkConnection = async () => {
  try {
    // Simple query to verify connection to the businesses table
    const { data, error } = await supabase.from('businesses').select('id').limit(1);
    
    if (error) throw error;
    return true;
  } catch (e) {
    console.error("Supabase connection check failed:", e);
    return false;
  }
};

export const uploadFile = async (bucket: string, path: string, file: File) => {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (error) throw error;
    
    // Get Public URL
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(path);

    return publicUrl;
  } catch (error) {
    console.error(`Upload failed to ${bucket}:`, error);
    throw error;
  }
};
