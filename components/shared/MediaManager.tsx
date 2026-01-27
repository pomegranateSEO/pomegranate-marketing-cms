import React, { useEffect, useState } from 'react';
import { supabase, uploadFile } from '../../lib/supabaseClient';
import { Button } from '../ui/button';
import { Loader2, Upload, Image as ImageIcon, Copy, X } from 'lucide-react';
import { Label } from '../ui/label';
import { Input } from '../ui/input';

interface FileObject {
  name: string;
  id: string;
  metadata: {
    mimetype: string;
    size: number;
  };
  created_at: string;
}

interface Props {
  mode?: 'page' | 'picker';
  onSelect?: (url: string) => void;
  onClose?: () => void;
}

export const MediaManager: React.FC<Props> = ({ mode = 'page', onSelect, onClose }) => {
  const [files, setFiles] = useState<FileObject[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);

  const loadImages = async () => {
    setLoading(true);
    // Clear current state to avoid confusion
    setFiles([]); 
    
    try {
      // 1. Fetch Root (for direct uploads)
      const { data: rootFiles } = await supabase.storage.from('images').list('', {
        limit: 100,
        sortBy: { column: 'created_at', order: 'desc' },
      });

      // 2. Fetch 'uploads' folder
      const { data: uploads } = await supabase.storage.from('images').list('uploads', { 
        limit: 100, sortBy: { column: 'created_at', order: 'desc' } 
      });
      
      // 3. Fetch 'logos' folder
      const { data: logos } = await supabase.storage.from('images').list('logos', { 
        limit: 100, sortBy: { column: 'created_at', order: 'desc' } 
      });

      // 4. Fetch 'associates' folder
      const { data: associates } = await supabase.storage.from('images').list('associates', { 
        limit: 100, sortBy: { column: 'created_at', order: 'desc' } 
      });

      // Helper to check if item is a file (has ID and metadata)
      const isFile = (f: any) => f.id && f.metadata;

      // Map to full paths
      // Root files have name 'filename.jpg'
      const mappedRoot = (rootFiles || []).filter(isFile).map(f => ({ ...f, name: f.name }));
      const mappedUploads = (uploads || []).filter(isFile).map(f => ({ ...f, name: `uploads/${f.name}` }));
      const mappedLogos = (logos || []).filter(isFile).map(f => ({ ...f, name: `logos/${f.name}` }));
      const mappedAssociates = (associates || []).filter(isFile).map(f => ({ ...f, name: `associates/${f.name}` }));

      // Combine all
      const allFiles = [
        ...mappedRoot,
        ...mappedUploads,
        ...mappedLogos,
        ...mappedAssociates
      ];

      // Sort combined list by created_at (newest first)
      allFiles.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      // Deduplicate by ID (in case a file appears in multiple lists, though unlikely with this structure)
      const uniqueFiles = Array.from(new Map(allFiles.map(item => [item.id, item])).values());

      setFiles(uniqueFiles as FileObject[]);

    } catch (err) {
      console.error("Failed to load images:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadImages();
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert("Image is too large. Please upload an image under 2MB.");
      return;
    }

    setUploading(true);
    try {
      const timestamp = Date.now();
      // Sanitize filename
      const cleanName = file.name.replace(/[^a-zA-Z0-9.]/g, '_');
      const path = `uploads/${timestamp}_${cleanName}`;
      
      await uploadFile('images', path, file);
      
      // Clear file input so the same file can be selected again if needed
      e.target.value = '';
      
      await loadImages(); // Refresh list
    } catch (err: any) {
      alert("Upload failed: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  const getPublicUrl = (path: string) => {
    const { data } = supabase.storage.from('images').getPublicUrl(path);
    return data.publicUrl;
  };

  const handleImageClick = (file: FileObject) => {
    const url = getPublicUrl(file.name); 
    
    if (mode === 'picker' && onSelect) {
      onSelect(url);
    } else {
      setSelectedFile(url);
    }
  };

  return (
    <div className="bg-white rounded-lg border shadow-sm flex flex-col h-[600px]">
      {/* Header */}
      <div className="p-4 border-b flex justify-between items-center bg-slate-50">
        <h3 className="font-bold text-slate-800 flex items-center gap-2">
          <ImageIcon className="h-5 w-5 text-purple-600" />
          Media Library
        </h3>
        <div className="flex items-center gap-2">
           <Label 
             htmlFor="media-upload" 
             className={`cursor-pointer inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors h-9 px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
           >
              {uploading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
              {uploading ? 'Uploading...' : 'Upload Image'}
           </Label>
           <Input 
             id="media-upload" 
             type="file" 
             accept="image/*"
             className="hidden" 
             onChange={handleUpload} 
             disabled={uploading}
           />
           {mode === 'picker' && onClose && (
             <Button variant="ghost" size="icon" onClick={onClose}>
               <X className="h-4 w-4" />
             </Button>
           )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden flex">
        {/* Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-slate-300" />
            </div>
          ) : files.length === 0 ? (
            <div className="text-center py-20 text-slate-400 border-2 border-dashed rounded-lg">
              <ImageIcon className="h-12 w-12 mx-auto mb-2 opacity-20" />
              <p>No images found in storage.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {files.map((file) => {
                const url = getPublicUrl(file.name);
                return (
                  <div 
                    key={file.id} 
                    onClick={() => handleImageClick(file)}
                    className={`
                      group relative aspect-square bg-slate-100 rounded-md overflow-hidden cursor-pointer border hover:border-purple-500 transition-all
                      ${selectedFile === url && mode === 'page' ? 'ring-2 ring-purple-600 ring-offset-2' : ''}
                    `}
                  >
                    <img 
                      src={url} 
                      alt={file.name} 
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute inset-x-0 bottom-0 bg-black/60 p-1 text-[10px] text-white truncate opacity-0 group-hover:opacity-100 transition-opacity">
                      {file.name.split('/').pop()}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Sidebar (Page Mode Only) */}
        {mode === 'page' && selectedFile && (
          <div className="w-80 border-l bg-slate-50 p-4 flex flex-col overflow-y-auto">
             <h4 className="font-bold text-sm mb-4">Image Details</h4>
             <div className="aspect-square bg-white rounded border mb-4 flex items-center justify-center p-2">
                <img src={selectedFile} className="max-w-full max-h-full object-contain" />
             </div>
             
             <div className="space-y-4">
                <div className="space-y-1">
                   <Label className="text-xs">Public URL</Label>
                   <div className="flex gap-1">
                      <Input value={selectedFile} readOnly className="text-xs font-mono h-8" />
                      <Button size="icon" variant="outline" className="h-8 w-8 flex-shrink-0" onClick={() => navigator.clipboard.writeText(selectedFile)}>
                         <Copy className="h-3 w-3" />
                      </Button>
                   </div>
                </div>
                
                <Button variant="destructive" size="sm" className="w-full" disabled>
                   Delete Image (Disabled)
                </Button>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};
