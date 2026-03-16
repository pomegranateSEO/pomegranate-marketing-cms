import React, { useEffect, useState } from 'react';
import { Star, Plus, Trash2, Loader2, Quote, Link as LinkIcon } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Textarea } from '../../../components/ui/textarea';
import { Label } from '../../../components/ui/label';
import { fetchReviews, createReview, deleteReview } from '../../../lib/db/reviews';
import { fetchBusinesses } from '../../../lib/db/businesses';
import type { Review } from '../../../lib/types';
import { EntityGenerator } from '../../../components/shared/EntityGenerator';
import { toast } from '../../../lib/toast';
import { useConfirm } from '../../../lib/confirm-dialog';
import { TableSkeleton, PageHeaderSkeleton } from '../../../components/shared/skeletons';

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [rootBusinessId, setRootBusinessId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<Review>>({
    author_name: '',
    rating_value: 5,
    review_body: '',
    publisher_url: '',
    publisher_name: ''
  });
  const { confirm, ConfirmDialog } = useConfirm();

  const loadData = async () => {
    try {
      setLoading(true);
      const [reviewsData, businessesData] = await Promise.all([
        fetchReviews(),
        fetchBusinesses()
      ]);
      setReviews(reviewsData);
      if (businessesData.length > 0) {
        setRootBusinessId(businessesData[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // business_id is NO LONGER required for reviews table based on schema provided

    try {
      await createReview({
        ...formData,
        date_published: new Date().toISOString()
      });
      setIsCreating(false);
      setFormData({ author_name: '', rating_value: 5, review_body: '', publisher_url: '', publisher_name: '' });
      loadData();
    } catch (err: any) {
      toast.error("Failed to save review", err.message);
    }
  };

  const handleDelete = async (id: string, authorName: string) => {
    const confirmed = await confirm({
      title: "Delete Review",
      message: `Are you sure you want to delete the review from "${authorName}"? This action cannot be undone.`,
      confirmText: "Delete",
      cancelText: "Cancel",
      variant: "destructive",
    });
    if (confirmed) {
      try {
        await deleteReview(id);
        toast.success(`Review from "${authorName}" deleted`);
        loadData();
      } catch (err: any) {
        toast.error("Failed to delete review", err.message);
      }
    }
  };

  const getAllReviewsContent = () => {
    if (reviews.length === 0) return "";
    return reviews.map(r => `
      Review by ${r.author_name} (${r.rating_value}/5):
      "${r.review_body}"
    `).join('\n---\n');
  };

  if (loading) {
    return (
      <div className="p-6">
        <PageHeaderSkeleton />
        <TableSkeleton rows={5} columns={4} />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reviews</h1>
          <p className="text-slate-500 mt-2">Manage customer testimonials for social proof and Schema.org.</p>
        </div>
        <div className="flex gap-2">
           {rootBusinessId && reviews.length > 0 && (
              <EntityGenerator 
                 getContent={getAllReviewsContent} 
                 businessId={rootBusinessId} 
                 sourceName="Customer Reviews" 
              />
           )}
           <Button onClick={() => setIsCreating(!isCreating)}>
            {isCreating ? 'Cancel' : <><Plus className="h-4 w-4 mr-2" /> Add Review</>}
           </Button>
        </div>
      </div>

      {isCreating && (
        <div className="bg-slate-50 border p-6 rounded-lg mb-8 shadow-inner">
          <h3 className="font-bold mb-4">Add New Review</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Author Name</Label>
                <Input 
                  value={formData.author_name} 
                  onChange={e => setFormData({...formData, author_name: e.target.value})} 
                  required 
                  placeholder="Jane Doe"
                />
              </div>
              <div className="space-y-2">
                <Label>Rating (1-5)</Label>
                <Input 
                  type="number" 
                  min="1" 
                  max="5" 
                  value={formData.rating_value} 
                  onChange={e => setFormData({...formData, rating_value: parseInt(e.target.value)})} 
                  required 
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Review Text</Label>
              <Textarea 
                value={formData.review_body} 
                onChange={e => setFormData({...formData, review_body: e.target.value})} 
                required 
                placeholder="Great service..."
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Publisher / Source Name</Label>
                <Input 
                  value={formData.publisher_name || ''} 
                  onChange={e => setFormData({...formData, publisher_name: e.target.value})} 
                  placeholder="e.g. Google Maps, Trustpilot"
                />
              </div>
              <div className="space-y-2">
                <Label>Publisher URL</Label>
                <Input 
                  value={formData.publisher_url || ''} 
                  onChange={e => setFormData({...formData, publisher_url: e.target.value})} 
                  placeholder="https://..."
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Button type="submit">Save Review</Button>
            </div>
          </form>
        </div>
      )}

      {reviews.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed rounded-lg bg-slate-50">
          <Star className="h-12 w-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900">No reviews yet</h3>
          <p className="text-slate-500">Add your first review to display on your site.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reviews.map(review => (
            <div key={review.id} className="bg-white p-4 rounded-lg border shadow-sm relative group">
              <div className="flex justify-between items-start mb-2">
                 <div className="flex items-center gap-1 text-amber-400">
                    {Array.from({ length: review.rating_value || 5 }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-current" />
                    ))}
                 </div>
                   <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-300 hover:text-red-500" onClick={() => handleDelete(review.id, review.author_name)} aria-label={`Delete review from ${review.author_name}`}>
                     <Trash2 className="h-3 w-3" aria-hidden="true" />
                  </Button>
              </div>
              <p className="text-sm text-slate-700 italic mb-3 line-clamp-3">"{review.review_body}"</p>
              <div className="flex justify-between items-end">
                  <div className="text-xs text-slate-500 font-medium">
                     <span>— {review.author_name}</span>
                     {review.publisher_name && <span className="text-slate-400"> on {review.publisher_name}</span>}
                  </div>
                  {review.publisher_url && (
                   <a href={review.publisher_url} target="_blank" className="text-blue-400 hover:text-blue-600">
                     <LinkIcon className="h-3 w-3" />
                   </a>
                 )}
              </div>
            </div>
          ))}
        </div>
      )}
      <ConfirmDialog />
    </div>
  );
}