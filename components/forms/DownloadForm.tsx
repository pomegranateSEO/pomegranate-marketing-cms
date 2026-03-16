import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Loader2, Upload, ExternalLink } from 'lucide-react';
import type { Download } from '../../lib/types';
import { uploadFile } from '../../lib/supabaseAdmin';

const DOWNLOAD_TYPES = [
  'Guide',
  'Template',
  'Checklist',
  'Report',
  'Whitepaper',
  'ebook',
  'Case Study',
  'Presentation'
];

const downloadFormSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  type: z.string().min(1, 'Type is required'),
  description: z.string().max(1000).optional(),
  file_url: z.string().optional(),
  preview_image_url: z.string().optional(),
  file_size_label: z.string().max(50).optional(),
  page_count_label: z.string().max(50).optional(),
  gated: z.coerce.boolean(),
  published: z.coerce.boolean(),
  sort_order: z.coerce.number(),
  seo_title: z.string().max(100).optional(),
  seo_meta_desc: z.string().max(200).optional(),
});

type DownloadFormValues = z.input<typeof downloadFormSchema>;

interface Props {
  initialData?: Partial<Download>;
  businessId: string;
  onSubmit: (data: any) => void;
  isLoading?: boolean;
  onCancel: () => void;
}

export const DownloadForm: React.FC<Props> = ({ initialData, businessId, onSubmit, isLoading, onCancel }) => {
  const [uploadingFile, setUploadingFile] = React.useState(false);
  const [uploadingPreview, setUploadingPreview] = React.useState(false);

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<DownloadFormValues>({
    resolver: zodResolver(downloadFormSchema),
    defaultValues: {
      title: initialData?.title || '',
      type: initialData?.type || 'Guide',
      description: initialData?.description || '',
      file_url: initialData?.file_url || '',
      preview_image_url: initialData?.preview_image_url || '',
      file_size_label: initialData?.file_size_label || '',
      page_count_label: initialData?.page_count_label || '',
      gated: initialData?.gated ?? false,
      published: initialData?.published ?? false,
      sort_order: initialData?.sort_order ?? 0,
      seo_title: initialData?.seo_title || '',
      seo_meta_desc: initialData?.seo_meta_desc || '',
    },
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingFile(true);
    try {
      const url = await uploadFile('downloads', file.name, file);
      setValue('file_url', url);
      const sizeKB = (file.size / 1024).toFixed(1);
      const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
      setValue('file_size_label', parseFloat(sizeMB) > 1 ? `${sizeMB} MB` : `${sizeKB} KB`);
    } catch (err: any) {
      console.error('Upload failed:', err);
    } finally {
      setUploadingFile(false);
    }
  };

  const handlePreviewUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingPreview(true);
    try {
      const url = await uploadFile('downloads', `preview-${file.name}`, file);
      setValue('preview_image_url', url);
    } catch (err: any) {
      console.error('Preview upload failed:', err);
    } finally {
      setUploadingPreview(false);
    }
  };

  const onFormSubmit = (values: DownloadFormValues) => {
    onSubmit({
      ...values,
      business_id: businessId,
    });
  };

  const fileUrl = watch('file_url');

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-slate-800">Download Details</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" {...register('title')} placeholder="e.g., Brand Strategy Guide" />
            {errors.title && <p className="text-xs text-red-500">{errors.title.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Type</Label>
            <select
              id="type"
              {...register('type')}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {DOWNLOAD_TYPES.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            {...register('description')}
            placeholder="Brief description of this downloadable resource..."
            className="min-h-[80px]"
          />
        </div>

        <div className="space-y-2">
          <Label>File Upload</Label>
          <div className="flex items-center gap-3">
            <Label htmlFor="file-upload" className="cursor-pointer inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring bg-slate-100 text-slate-900 hover:bg-slate-200 h-10 px-4 py-2">
              {uploadingFile ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
              {uploadingFile ? 'Uploading...' : 'Upload File'}
            </Label>
            <Input id="file-upload" type="file" className="hidden" onChange={handleFileUpload} disabled={uploadingFile} />
            {fileUrl && (
              <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline flex items-center gap-1">
                <ExternalLink className="h-3 w-3" /> View File
              </a>
            )}
          </div>
          <Input type="hidden" {...register('file_url')} />
          <p className="text-xs text-slate-500">Uploads to the 'downloads' storage bucket</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="file_size_label">File Size Label</Label>
            <Input id="file_size_label" {...register('file_size_label')} placeholder="e.g., 2.5 MB" />
            <p className="text-xs text-slate-500">Auto-filled on upload, or enter manually</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="page_count_label">Page Count</Label>
            <Input id="page_count_label" {...register('page_count_label')} placeholder="e.g., 24 pages" />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Preview Image (Optional)</Label>
          <div className="flex items-center gap-3">
            <Label htmlFor="preview-upload" className="cursor-pointer inline-flex items-center justify-center rounded-md text-sm font-medium h-9 px-3 bg-slate-100 text-slate-700 hover:bg-slate-200">
              {uploadingPreview ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : 'Upload Preview'}
            </Label>
            <Input id="preview-upload" type="file" accept="image/*" className="hidden" onChange={handlePreviewUpload} disabled={uploadingPreview} />
            {watch('preview_image_url') && (
              <img src={watch('preview_image_url')} alt="Preview" className="h-10 w-10 object-cover rounded" />
            )}
          </div>
        </div>
      </div>

      <div className="space-y-4 pt-4 border-t">
        <h3 className="text-lg font-semibold text-slate-800">Visibility & Access</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="sort_order">Sort Order</Label>
            <Input id="sort_order" type="number" {...register('sort_order', { valueAsNumber: true })} />
            <p className="text-xs text-slate-500">Lower numbers appear first</p>
          </div>

          <div className="flex items-center gap-2 pt-6">
            <input type="checkbox" id="gated" {...register('gated')} className="h-4 w-4 rounded border-slate-300" />
            <Label htmlFor="gated" className="font-normal">Gated (requires email)</Label>
          </div>

          <div className="flex items-center gap-2 pt-6">
            <input type="checkbox" id="published" {...register('published')} className="h-4 w-4 rounded border-slate-300" />
            <Label htmlFor="published" className="font-normal">Published</Label>
          </div>
        </div>
      </div>

      <div className="space-y-4 pt-4 border-t">
        <h3 className="text-lg font-semibold text-slate-800">SEO Settings</h3>
        
        <div className="space-y-2">
          <Label htmlFor="seo_title">SEO Title</Label>
          <Input id="seo_title" {...register('seo_title')} placeholder="Custom title tag (optional)" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="seo_meta_desc">SEO Meta Description</Label>
          <Textarea
            id="seo_meta_desc"
            {...register('seo_meta_desc')}
            placeholder="Custom meta description (optional)"
            className="min-h-[60px]"
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={isLoading} className="w-40">
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {initialData ? 'Update Download' : 'Create Download'}
        </Button>
      </div>
    </form>
  );
};