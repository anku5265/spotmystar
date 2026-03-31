import { useState, useEffect } from 'react';
import { Star, ThumbsUp, MessageCircle, Edit, Trash2, Send, ChevronDown } from 'lucide-react';
import api from '../config/api';

const TAGS = [
  { label: '🔥 Energetic', value: 'Energetic' },
  { label: '😂 Funny', value: 'Funny' },
  { label: '🎯 Professional', value: 'Professional' },
  { label: '⏰ On Time', value: 'On Time' },
  { label: '💸 Worth the Money', value: 'Worth the Money' },
  { label: '🎤 Great Performance', value: 'Great Performance' },
  { label: '💬 Good Communication', value: 'Good Communication' },
  { label: '🔁 Would Book Again', value: 'Would Book Again' },
];

function StarRating({ value, onChange, size = 28 }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          type="button"
          onClick={() => onChange && onChange(star)}
          onMouseEnter={() => onChange && setHover(star)}
          onMouseLeave={() => onChange && setHover(0)}
          className="transition-transform hover:scale-110"
        >
          <Star
            size={size}
            className={`transition-colors ${(hover || value) >= star ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'}`}
          />
        </button>
      ))}
    </div>
  );
}

function ReviewCard({ review, currentUserId, onHelpful, onDelete, onEdit, onReply, isArtist }) {
  const [showReply, setShowReply] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [editing, setEditing] = useState(false);
  const [editRating, setEditRating] = useState(review.rating);
  const [editText, setEditText] = useState(review.review_text);
  const [editTags, setEditTags] = useState(review.tags || []);

  const isOwner = String(review.user_id) === String(currentUserId);

  return (
    <div className="card p-5 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center text-primary font-bold text-lg flex-shrink-0">
            {(review.user_name || 'U').charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-white">{review.user_name || 'User'}</p>
            <p className="text-xs text-gray-500">{new Date(review.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
          </div>
        </div>
        <StarRating value={review.rating} size={18} />
      </div>

      {/* Tags */}
      {review.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {review.tags.map(tag => (
            <span key={tag} className="text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-full border border-primary/20">{tag}</span>
          ))}
        </div>
      )}

      {/* Review text */}
      {!editing ? (
        review.review_text && <p className="text-gray-300 text-sm leading-relaxed">"{review.review_text}"</p>
      ) : (
        <div className="space-y-3">
          <StarRating value={editRating} onChange={setEditRating} />
          <div className="flex flex-wrap gap-2">
            {TAGS.map(t => (
              <button key={t.value} type="button"
                onClick={() => setEditTags(prev => prev.includes(t.value) ? prev.filter(x => x !== t.value) : [...prev, t.value])}
                className={`text-xs px-3 py-1.5 rounded-full border transition ${editTags.includes(t.value) ? 'bg-primary text-white border-primary' : 'border-gray-600 text-gray-400 hover:border-primary/50'}`}>
                {t.label}
              </button>
            ))}
          </div>
          <textarea value={editText} onChange={e => setEditText(e.target.value)} rows={3}
            className="w-full bg-white/5 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-primary/50 resize-none" />
          <div className="flex gap-2">
            <button onClick={() => { onEdit(review.id, editRating, editText, editTags); setEditing(false); }}
              className="px-4 py-1.5 bg-primary text-white rounded-lg text-sm font-medium">Save</button>
            <button onClick={() => setEditing(false)} className="px-4 py-1.5 glass rounded-lg text-sm">Cancel</button>
          </div>
        </div>
      )}

      {/* Artist reply */}
      {review.artist_reply && (
        <div className="bg-white/5 border border-gray-700 rounded-lg p-3 ml-4">
          <p className="text-xs text-primary font-semibold mb-1">🎤 Artist replied:</p>
          <p className="text-sm text-gray-300">{review.artist_reply}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3 pt-1">
        <button onClick={() => onHelpful(review.id)}
          className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-green-400 transition">
          <ThumbsUp size={14} /> Helpful {review.helpful_count > 0 && `(${review.helpful_count})`}
        </button>

        {isArtist && !review.artist_reply && (
          <button onClick={() => setShowReply(!showReply)}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-primary transition">
            <MessageCircle size={14} /> Reply
          </button>
        )}

        {isOwner && !editing && (
          <>
            <button onClick={() => setEditing(true)}
              className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-blue-400 transition">
              <Edit size={14} /> Edit
            </button>
            <button onClick={() => onDelete(review.id)}
              className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-red-400 transition">
              <Trash2 size={14} /> Delete
            </button>
          </>
        )}
      </div>

      {/* Reply input */}
      {showReply && (
        <div className="flex gap-2 mt-2">
          <input value={replyText} onChange={e => setReplyText(e.target.value)}
            placeholder="Write your reply..."
            className="flex-1 bg-white/5 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-primary/50" />
          <button onClick={() => { onReply(review.id, replyText); setShowReply(false); setReplyText(''); }}
            className="p-2 bg-primary rounded-lg text-white hover:bg-primary/80 transition">
            <Send size={16} />
          </button>
        </div>
      )}
    </div>
  );
}

export default function ReviewSection({ artistId, isArtist = false }) {
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState(null);
  const [topTags, setTopTags] = useState([]);
  const [canReview, setCanReview] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);
  const [bookingId, setBookingId] = useState(null);
  const [sort, setSort] = useState('recent');
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  const token = localStorage.getItem('userToken');
  const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
  const currentUserId = userInfo?.id;

  useEffect(() => {
    fetchReviews();
    if (token && !isArtist) checkCanReview();
  }, [artistId, sort]);

  const fetchReviews = async () => {
    try {
      const { data } = await api.get(`/api/reviews/artist/${artistId}?sort=${sort}`);
      setReviews(data.reviews || []);
      setStats(data.stats);
      setTopTags(data.topTags || []);
    } catch { /* silent */ }
  };

  const checkCanReview = async () => {
    try {
      const { data } = await api.get(`/api/reviews/can-review/${artistId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCanReview(data.canReview);
      setHasReviewed(data.hasReviewed);
      setBookingId(data.bookingId);
    } catch { /* silent */ }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rating) { setToast('Please select a rating'); return; }
    setSubmitting(true);
    try {
      await api.post('/api/reviews', {
        artistId, bookingId, rating, reviewText, tags: selectedTags
      }, { headers: { Authorization: `Bearer ${token}` } });
      setShowForm(false);
      setRating(0); setReviewText(''); setSelectedTags([]);
      setHasReviewed(true); setCanReview(false);
      fetchReviews();
    } catch (err) {
      setToast(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const handleHelpful = async (id) => {
    try {
      await api.post(`/api/reviews/${id}/helpful`, {}, { headers: { Authorization: `Bearer ${token}` } });
      fetchReviews();
    } catch { /* silent */ }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this review?')) return;
    try {
      await api.delete(`/api/reviews/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      fetchReviews();
      setHasReviewed(false); setCanReview(true);
    } catch { /* silent */ }
  };

  const handleEdit = async (id, r, text, tags) => {
    try {
      await api.put(`/api/reviews/${id}`, { rating: r, reviewText: text, tags }, { headers: { Authorization: `Bearer ${token}` } });
      fetchReviews();
    } catch { /* silent */ }
  };

  const handleReply = async (id, reply) => {
    try {
      const artistToken = localStorage.getItem('artistToken');
      await api.post(`/api/reviews/${id}/reply`, { reply }, { headers: { Authorization: `Bearer ${artistToken}` } });
      fetchReviews();
    } catch { /* silent */ }
  };

  const totalReviews = parseInt(stats?.total || 0);
  const avgRating = parseFloat(stats?.avg_rating || 0);

  return (
    <div className="card space-y-6">
      {toast && (
        <div className="bg-red-500/20 border border-red-500/30 text-red-400 px-4 py-2 rounded-lg text-sm">
          {toast} <button onClick={() => setToast(null)} className="ml-2 text-red-300">✕</button>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Star className="text-yellow-400 fill-yellow-400" size={22} />
            Reviews & Ratings
          </h2>
          {totalReviews > 0 && (
            <p className="text-gray-400 text-sm mt-0.5">
              <span className="text-white font-bold text-lg">{avgRating}</span>/5 · {totalReviews} review{totalReviews !== 1 ? 's' : ''}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <select value={sort} onChange={e => setSort(e.target.value)}
            className="glass px-3 py-1.5 rounded-lg text-sm text-gray-300 outline-none">
            <option value="recent">Most Recent</option>
            <option value="highest">Highest Rated</option>
            <option value="helpful">Most Helpful</option>
          </select>
          {canReview && !showForm && (
            <button onClick={() => setShowForm(true)}
              className="btn-primary text-sm px-4 py-1.5">
              ✍️ Write Review
            </button>
          )}
          {hasReviewed && <span className="text-xs text-green-400 bg-green-500/10 px-3 py-1.5 rounded-full">✓ Reviewed</span>}
        </div>
      </div>

      {/* Rating breakdown */}
      {totalReviews > 0 && (
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            {[5, 4, 3, 2, 1].map(star => {
              const count = parseInt(stats?.[`${['', 'one', 'two', 'three', 'four', 'five'][star]}_star`] || 0);
              const pct = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
              return (
                <div key={star} className="flex items-center gap-2 text-xs">
                  <span className="text-gray-400 w-3">{star}</span>
                  <Star size={12} className="text-yellow-400 fill-yellow-400 flex-shrink-0" />
                  <div className="flex-1 bg-gray-700 rounded-full h-1.5">
                    <div className="bg-yellow-400 h-1.5 rounded-full transition-all" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-gray-500 w-4">{count}</span>
                </div>
              );
            })}
          </div>
          {topTags.length > 0 && (
            <div>
              <p className="text-xs text-gray-400 mb-2">Top mentions</p>
              <div className="flex flex-wrap gap-1.5">
                {topTags.map(t => (
                  <span key={t.tag} className="text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-full border border-primary/20">
                    {t.tag} <span className="text-gray-500">({t.count})</span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Write review form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="glass rounded-xl p-5 space-y-4 border border-primary/20">
          <h3 className="font-semibold text-white">Share your experience</h3>

          <div>
            <p className="text-sm text-gray-400 mb-2">Your Rating</p>
            <StarRating value={rating} onChange={setRating} size={32} />
          </div>

          <div>
            <p className="text-sm text-gray-400 mb-2">Tags (select all that apply)</p>
            <div className="flex flex-wrap gap-2">
              {TAGS.map(t => (
                <button key={t.value} type="button"
                  onClick={() => setSelectedTags(prev => prev.includes(t.value) ? prev.filter(x => x !== t.value) : [...prev, t.value])}
                  className={`text-sm px-3 py-1.5 rounded-full border transition ${selectedTags.includes(t.value) ? 'bg-primary text-white border-primary' : 'border-gray-600 text-gray-400 hover:border-primary/50'}`}>
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm text-gray-400 mb-2">Your Review (optional)</p>
            <textarea value={reviewText} onChange={e => setReviewText(e.target.value)} rows={3}
              placeholder="How was your experience? Tell others what made this artist special…"
              className="w-full bg-white/5 border border-gray-700 rounded-lg px-4 py-3 text-sm text-white outline-none focus:ring-2 focus:ring-primary/50 resize-none placeholder-gray-600" />
          </div>

          <div className="flex gap-3">
            <button type="submit" disabled={submitting || !rating}
              className="btn-primary px-6 disabled:opacity-50">
              {submitting ? 'Submitting...' : 'Submit Review'}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="glass px-6 py-2 rounded-lg text-sm">Cancel</button>
          </div>
        </form>
      )}

      {/* Reviews list */}
      {reviews.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Star size={40} className="mx-auto mb-3 opacity-30" />
          <p>No reviews yet. Be the first to review!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map(review => (
            <ReviewCard
              key={review.id}
              review={review}
              currentUserId={currentUserId}
              onHelpful={handleHelpful}
              onDelete={handleDelete}
              onEdit={handleEdit}
              onReply={handleReply}
              isArtist={isArtist}
            />
          ))}
        </div>
      )}
    </div>
  );
}
