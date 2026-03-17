import React, { useEffect, useState } from 'react';
import { supabase, uploadFile } from '../../lib/supabaseAdmin';
import { Button } from '../ui/button';
import { Loader2, Upload, Image as ImageIcon, Copy, X, Save, Edit2 } from 'lucide-react';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { fetchMediaMetadata, upsertMediaMetadata, MediaMetadata } from '../../lib/db/media';
import { toast } from '../../lib/toast';
import { useConfirm } from '../../lib/confirm-dialog';

interface FileObject {
  name: string;
  id: string;
  bucket?: string;
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
  const [selectedMetadata, setSelectedMetadata] = useState<MediaMetadata | null>(null);
  const [editingAlt, setEditingAlt] = useState(false);
  const [editingFilename, setEditingFilename] = useState(false);
  const [altText, setAltText] = useState('');
  const [customFilename, setCustomFilename] = useState('');
  const [saving, setSaving] = useState(false);
  const { confirm, ConfirmDialog } = useConfirm();

  const loadImages = async () => {
    setLoading(true);
    setFiles([]); 
    
    try {
      const { data: rootFiles } = await supabase.storage.from('images').list('', {
        limit: 100,
        sortBy: { column: 'created_at', order: 'desc' },
      });

      const { data: uploads } = await supabase.storage.from('images').list('uploads', { 
        limit: 100, sortBy: { column: 'created_at', order: 'desc' } 
      });
      
      const { data: logos } = await supabase.storage.from('images').list('logos', { 
        limit: 100, sortBy: { column: 'created_at', order: 'desc' } 
      });

      const { data: associates } = await supabase.storage.from('images').list('associates', { 
        limit: 100, sortBy: { column: 'created_at', order: 'desc' } 
      });

      // Blog images from separate bucket
      const { data: blogImages } = await supabase.storage.from('blog-images').list('', { 
        limit: 100, sortBy: { column: 'created_at', order: 'desc' } 
      });

      const isFile = (f: any) => f.id && f.metadata;

      const mappedRoot = (rootFiles || []).filter(isFile).map(f => ({ ...f, name: f.name, bucket: 'images' }));
      const mappedUploads = (uploads || []).filter(isFile).map(f => ({ ...f, name: `uploads/${f.name}`, bucket: 'images' }));
      const mappedLogos = (logos || []).filter(isFile).map(f => ({ ...f, name: `logos/${f.name}`, bucket: 'images' }));
      const mappedAssociates = (associates || []).filter(isFile).map(f => ({ ...f, name: `associates/${f.name}`, bucket: 'images' }));
      const mappedBlogImages = (blogImages || []).filter(isFile).map(f => ({ ...f, name: f.name, bucket: 'blog-images' }));

      const allFiles = [
        ...mappedRoot,
        ...mappedUploads,
        ...mappedLogos,
        ...mappedAssociates,
        ...mappedBlogImages
      ];

      allFiles.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      const uniqueFiles = Array.from(new Map(allFiles.map((item: any) => [item.id, item])).values());

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

    if (file.size > 10 * 1024* 1024) {
      toast.error("Image is too large. Please upload an image under 10MB.");
      return;
    }

    setUploading(true);
    try {
      const timestamp = Date.now();
      const cleanName = file.name.replace(/[^a-zA-Z0-9.]/g, '_');
      const path = `uploads/${timestamp}_${cleanName}`;
      
      await uploadFile('images', path, file);
      
      // Create metadata record
      await upsertMediaMetadata({
        storage_path: path,
        original_filename: file.name,
        mime_type: file.type,
        file_size: file.size,
      });
      
      e.target.value = '';
      
      await loadImages();
    } catch (err: any) {
      toast.error("Upload failed", err.message);
    } finally {
      setUploading(false);
    }
  };

  const getPublicUrl = (path: string, bucket: string = 'images') => {
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  };

  const handleImageClick = async (file: FileObject) => {
    const bucket = file.bucket || 'images';
    const url = getPublicUrl(file.name, bucket);
    
    if (mode === 'picker' && onSelect) {
      onSelect(url);
    } else {
      setSelectedFile(url);
      // Load metadata
      const metadata = await fetchMediaMetadata(file.name);
      setSelectedMetadata(metadata);
      setAltText(metadata?.alt_text || '');
      setCustomFilename(metadata?.custom_filename || '');
      setEditingAlt(false);
      setEditingFilename(false);
    }
  };

  const handleSaveMetadata = async () => {
    if (!selectedFile) return;
    
    const storagePath = selectedFile.replace(/^.*\/images\//, '');
    
    setSaving(true);
    try {
      const updated = await upsertMediaMetadata({
        storage_path: storagePath,
        alt_text: altText,
        custom_filename: customFilename,
      });
      
      if (updated) {
        setSelectedMetadata(updated);
        setEditingAlt(false);
        setEditingFilename(false);
      }
    } catch (err) {
      console.error('Error saving metadata:', err);
      toast.error("Failed to save metadata");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedFile) return;
    
    const confirmed = await confirm({
      title: "Delete Image",
      message: "Are you sure you want to delete this image? This cannot be undone.",
      confirmText: "Delete",
      cancelText: "Cancel",
      variant: "destructive",
    });
    if (!confirmed) return;
    
    const storagePath = selectedFile.replace(/^.*\/images\//, '');
    
    try {
      const { error } = await supabase.storage.from('images').remove([storagePath]);
      
      if (error) {
        throw error;
      }
      
      await supabase.from('media_metadata').delete().eq('storage_path', storagePath);
      
      setSelectedFile(null);
      setSelectedMetadata(null);
      await loadImages();
      toast.success("Image deleted successfully");
    } catch (err: any) {
      toast.error("Delete failed", err.message);
    }
  };

  return (
    <div className="bg-card rounded-lg border shadow-sm flex flex-col h-[600px]">
      <div className="p-4 border-b flex justify-between items-center bg-muted">
        <h3 className="font-bold text-foreground flex items-center gap-2">
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
             <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close media manager">
               <X className="h-4 w-4" aria-hidden="true" />
             </Button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex">
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground/50" />
            </div>
          ) : files.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground border-2 border-dashed rounded-lg">
              <ImageIcon className="h-12 w-12 mx-auto mb-2 opacity-20" />
              <p>No images found in storage.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {files.map((file) => {
                const bucket = file.bucket || 'images';
                const url = getPublicUrl(file.name, bucket);
                return (
                  <div 
                    key={file.id} 
                    onClick={() => handleImageClick(file)}
                    className={`
                      group relative aspect-square bg-muted rounded-md overflow-hidden cursor-pointer border hover:border-purple-500 transition-all
                      ${selectedFile === url && mode === 'page' ? 'ring-2 ring-purple-600 ring-offset-2 ring-offset-background' : ''}
                    `}
                  >
                    <img 
                      src={url} 
                      alt={selectedMetadata?.alt_text || file.name} 
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

        {mode === 'page' && selectedFile && (
          <div className="w-80 border-l bg-muted p-4 flex flex-col overflow-y-auto">
            <h4 className="font-bold text-sm mb-4">Image Details</h4>
            <div className="aspect-square bg-card rounded border mb-4 flex items-center justify-center p-2">
              <img src={selectedFile} className="max-w-full max-h-full object-contain" alt={selectedMetadata?.alt_text || ''} />
            </div>
            
            <div className="space-y-4 flex-1">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Public URL</Label>
<Button size="icon" variant="ghost" className="h-9 w-9" onClick={() => navigator.clipboard.writeText(selectedFile)} aria-label="Copy URL to clipboard">
                      <Copy className="h-4 w-4" aria-hidden="true" />
                   </Button>
                </div>
                <Input value={selectedFile} readOnly className="text-xs font-mono h-8" />
              </div>
              
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Custom Filename</Label>
<Button size="icon" variant="ghost" className="h-9 w-9" onClick={() => setEditingFilename(!editingFilename)} aria-label={editingFilename ? "Save filename" : "Edit filename"}>
                      <Edit2 className="h-4 w-4" aria-hidden="true" />
                   </Button>
                </div>
                {editingFilename ? (
                  <Input 
                    value={customFilename} 
                    onChange={(e) => setCustomFilename(e.target.value)}
                    placeholder="custom-filename.jpg"
                    className="text-xs h-8"
                  />
                ) : (
                  <Input 
                    value={customFilename || selectedMetadata?.original_filename || selectedFile.split('/').pop() || ''} 
                    readOnly 
                    className="text-xs h-8 text-muted-foreground"
                  />
                )}
              </div>
              
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Alt Text (Accessibility)</Label>
<Button size="icon" variant="ghost" className="h-9 w-9" onClick={() => setEditingAlt(!editingAlt)} aria-label={editingAlt ? "Save alt text" : "Edit alt text"}>
                      <Edit2 className="h-4 w-4" aria-hidden="true" />
                   </Button>
                </div>
                {editingAlt ? (
                  <Textarea 
                    value={altText} 
                    onChange={(e) => setAltText(e.target.value)}
                    placeholder="Describe this image for screen readers..."
                    className="text-xs min-h-[60px]"
                  />
                ) : (
                  <div className="text-xs text-foreground bg-card p-2 rounded border min-h-[40px]">
                    {altText || <span className="text-muted-foreground italic">No alt text provided</span>}
                  </div>
                )}
              </div>
              
              {selectedMetadata?.file_size && (
                <div className="text-xs text-muted-foreground">
                  Size: {(selectedMetadata.file_size / 1024).toFixed(1)} KB
                </div>
              )}
              
              {(editingAlt || editingFilename) && (
                <Button 
                  onClick={handleSaveMetadata} 
                  disabled={saving}
                  size="sm"
                  className="w-full"
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                  Save Changes
                </Button>
              )}

              <Button variant="destructive" size="sm" className="w-full" onClick={handleDelete}>
                Delete Image
              </Button>
            </div>
          </div>
        )}
      </div>
      <ConfirmDialog />
    </div>
  );
};