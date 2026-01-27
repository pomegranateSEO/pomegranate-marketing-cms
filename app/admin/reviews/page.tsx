import React, { useEffect, useState } from 'react';
import { Star, Plus, Trash2, Loader2, Quote } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Textarea } from '../../../components/ui/textarea';
import { Label } from '../../../components/ui/label';
import { fetchReviews, createReview, deleteReview } from '../../../lib/db/reviews';
import { fetchBusinesses } from '../../../lib/db/businesses';
import type { Review } from '../../../lib/types';

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
    source_url: ''
  });

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
    if (!rootBusinessId) return alert("No Business Entity found.");

    try {
      await createReview({
        ...formData,
        business_id: rootBusinessId,
        date_published: new Date().toISOString()
      });
      setIsCreating(false);
      setFormData({ author_name: '', rating_value: 5, review_body: '', source_url: '' });
      loadData();
    } catch (err: any) {
      alert("Failed to save review. " + err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Delete this review?")) {
      await deleteReview(id);
      loadData();
    }
  };

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-slate-400" /></div>;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reviews</h1>
          <p className="text-slate-500 mt-2">Manage customer testimonials for social proof and Schema.org.</p>
        </div>
        <Button onClick={() => setIsCreating(!isCreating)}>
          {isCreating ? 'Cancel' : <><Plus className="h-4 w-4 mr-2" /> Add Review</>}
        </Button>
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
            <div className="space-y-2">
              <Label>Source URL (Optional)</Label>
              <Input 
                value={formData.source_url} 
                onChange={e => setFormData({...formData, source_url: e.target.value})} 
                placeholder="https://google.com/maps/..."
              />
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
                 <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-300 hover:text-red-500" onClick={() => handleDelete(review.id)}>
                   <Trash2 className="h-3 w-3" />
                 </Button>
              </div>
              <p className="text-sm text-slate-700 italic mb-3 line-clamp-3">"{review.review_body}"</p>
              <div className="text-xs text-slate-500 font-medium flex items-center gap-2">
                 <span>— {review.author_name}</span>
                 {review.source_url && (
                   <a href={review.source_url} target="_blank" className="text-blue-400 hover:underline truncate max-w-[150px]">
                     Source Link
                   </a>
                 )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
