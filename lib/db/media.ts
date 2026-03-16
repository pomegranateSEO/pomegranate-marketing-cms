import { supabase } from '../supabaseAdmin';

export interface MediaMetadata {
  id: string;
  storage_path: string;
  original_filename: string | null;
  custom_filename: string | null;
  alt_text: string | null;
  description: string | null;
  width: number | null;
  height: number | null;
  mime_type: string | null;
  file_size: number | null;
  uploaded_by: string | null;
  created_at: string;
  updated_at: string;
}

export async function fetchMediaMetadata(storagePath: string): Promise<MediaMetadata | null> {
  const { data, error } = await supabase
    .from('media_metadata')
    .select('*')
    .eq('storage_path', storagePath)
    .single();
  
  if (error) {
    if (error.code === 'PGRST116') return null; // Not found
    console.error('Error fetching media metadata:', error);
    return null;
  }
  
  return data;
}

export async function upsertMediaMetadata(
  metadata: Partial<MediaMetadata> & { storage_path: string }
): Promise<MediaMetadata | null> {
  const { data, error } = await supabase
    .from('media_metadata')
    .upsert(metadata, { onConflict: 'storage_path' })
    .select()
    .single();
  
  if (error) {
    console.error('Error upserting media metadata:', error);
    return null;
  }
  
  return data;
}

export async function updateMediaMetadata(
  storagePath: string,
  updates: Partial<MediaMetadata>
): Promise<MediaMetadata | null> {
  const { data, error } = await supabase
    .from('media_metadata')
    .update(updates)
    .eq('storage_path', storagePath)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating media metadata:', error);
    return null;
  }
  
  return data;
}

export async function createMediaRecord(
  storagePath: string,
  file: File
): Promise<MediaMetadata | null> {
  const metadata: Partial<MediaMetadata> & { storage_path: string } = {
    storage_path: storagePath,
    original_filename: file.name,
    mime_type: file.type,
    file_size: file.size,
  };
  
  return upsertMediaMetadata(metadata);
}