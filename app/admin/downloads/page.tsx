import React, { useEffect, useState } from 'react';
import { Download, Plus, Loader2, File, Trash2, ExternalLink } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { supabase, uploadFile } from '../../../lib/supabaseClient';
import { EntityGenerator } from '../../../components/shared/EntityGenerator';
import { fetchBusinesses } from '../../../lib/db/businesses';
import { toast } from '../../../lib/toast';

// Simple interface for file objects from Storage
interface FileObject {
  name: string;
  id: string;
  updated_at: string;
  created_at: string;
  last_accessed_at: string;
  metadata: {
    eTag: string;
    size: number;
    mimetype: string;
    cacheControl: string;
    lastModified: string;
    contentLength: number;
    httpStatusCode: number;
  };
}

export default function DownloadsPage() {
  const [files, setFiles] = useState<FileObject[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [rootBusinessId, setRootBusinessId] = useState<string | null>(null);

  const loadFiles = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.storage.from('downloads').list();
      if (error) throw error;
      setFiles(data || []);
      
      const businesses = await fetchBusinesses();
      if (businesses.length > 0) setRootBusinessId(businesses[0].id);
    } catch (err) {
      console.error("Failed to load downloads:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFiles();
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      await uploadFile('downloads', file.name, file);
      await loadFiles();
      toast.success("File uploaded successfully!");
    } catch (err: any) {
      toast.error("Upload failed", err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (fileName: string) => {
    if (!confirm(`Delete ${fileName}? This cannot be undone.`)) return;

    try {
      const { error } = await supabase.storage.from('downloads').remove([fileName]);
      if (error) throw error;
      loadFiles();
    } catch (err: any) {
      toast.error("Delete failed", err.message);
    }
  };

  const getPublicUrl = (fileName: string) => {
    const { data } = supabase.storage.from('downloads').getPublicUrl(fileName);
    return data.publicUrl;
  };
  
  const getAllDownloadsContent = () => {
    return files.map(f => `File: ${f.name} (${f.metadata.mimetype})`).join('\n');
  };

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-slate-400" /></div>;

  return (
    <div className="p-6 max-w-5xl mx-auto">
       <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Downloads</h1>
          <p className="text-slate-500 mt-2">
            Manage downloadable resources (PDFs, Whitepapers) stored in the <code>downloads</code> bucket.
          </p>
        </div>
        <div className="flex gap-2 items-center">
           {rootBusinessId && files.length > 0 && (
             <EntityGenerator 
               getContent={getAllDownloadsContent} 
               businessId={rootBusinessId} 
               sourceName="Downloads" 
             />
           )}
           <Label htmlFor="file-upload" className={`cursor-pointer inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 ${uploading ? 'opacity-50' : ''}`}>
              {uploading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
              {uploading ? 'Uploading...' : 'Upload Resource'}
           </Label>
           <Input 
             id="file-upload" 
             type="file" 
             className="hidden" 
             onChange={handleUpload} 
             disabled={uploading}
           />
        </div>
      </div>

      {files.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed rounded-lg bg-slate-50">
          <Download className="h-12 w-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900">No downloads yet</h3>
          <p className="text-slate-500 mb-6">Upload resources for your users to download.</p>
        </div>
      ) : (
        <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
            <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 border-b font-medium text-slate-500">
                    <tr>
                        <th className="px-6 py-4">File Name</th>
                        <th className="px-6 py-4">Size</th>
                        <th className="px-6 py-4">Uploaded</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y">
                    {files.map(file => (
                        <tr key={file.id} className="hover:bg-slate-50">
                            <td className="px-6 py-4 font-medium flex items-center gap-2">
                                <File className="h-4 w-4 text-slate-400" />
                                {file.name}
                            </td>
                            <td className="px-6 py-4 text-slate-500">
                                {(file.metadata.size / 1024).toFixed(1)} KB
                            </td>
                            <td className="px-6 py-4 text-slate-500">
                                {new Date(file.created_at).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 text-right flex justify-end gap-2">
                                <a 
                                    href={getPublicUrl(file.name)} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center justify-center h-8 w-8 rounded-md hover:bg-slate-100 text-slate-500"
                                >
                                    <ExternalLink className="h-4 w-4" />
                                </a>
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                                    onClick={() => handleDelete(file.name)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      )}
    </div>
  );
}
