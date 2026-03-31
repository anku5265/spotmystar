import { useState, useEffect } from 'react';
import { Zap, MapPin, Calendar, IndianRupee, ThumbsUp, X, Send } from 'lucide-react';
import api from '../config/api';

const CATEGORIES = ['All', 'DJ', 'Singer', 'Dancer', 'Comedian', 'Anchor', 'Band', 'Photographer', 'Videographer', 'Makeup Artist', 'Instagram Influencer', 'YouTube Creator', 'Content Creator', 'Model', 'Other'];

function getDaysUntil(dateStr) {
  if (!dateStr) return null;
  const diff = Math.ceil((new Date(dateStr) - new Date()) / (1000 * 60 * 60 * 24));
  return diff;
}

export default function OpportunitiesSection({ token }) {
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [locationFilter, setLocationFilter] = useState('');
  const [responding, setResponding] = useState(null);
  const [pitch, setPitch] = useState('');
  const [toast, setToast] = useState(null);

  useEffect(() => { fetchOpportunities(); }, [categoryFilter, locationFilter]);

  const fetchOpportunities = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (categoryFilter !== 'All') params.set('category', categoryFilter);
      if (locationFilter) params.set('location', locationFilter);
      const { data } = await api.get(`/api/brands/opportunities?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOpportunities(data);
    } catch { /* silent */ } finally {
      setLoading(false);
    }
  };

  const handleRespond = async (reqId, status) => {
    try {
      await api.post(`/api/brands/opportunities/${reqId}/respond`, { status, message: pitch }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showToast(status === 'interested' ? '👍 Marked as Interested!' : 'Response saved', 'success');
      setResponding(null); setPitch('');
      fetchOpportunities();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed', 'error');
    }
  };

  const showToast = (msg, type) => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000); };

  return (
    <div className="space-y-6 max-w-4xl">
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-2 rounded-xl text-sm font-medium ${toast.type === 'success' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-xl border border-yellow-500/20">
          <Zap className="text-yellow-400" size={20} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Brand Opportunities</h2>
          <p className="text-gray-400 text-sm">Requirements posted by brands — respond to get hired</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex gap-2 flex-wrap">
          {CATEGORIES.slice(0, 8).map(cat => (
            <button key={cat} onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${categoryFilter === cat ? 'bg-purple-500 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'}`}>
              {cat}
            </button>
          ))}
        </div>
        <input value={locationFilter} onChange={e => setLocationFilter(e.target.value)}
          placeholder="Filter by city..."
          className="bg-gray-800 border border-gray-700 rounded-xl px-3 py-1.5 text-sm text-white outline-none focus:ring-2 focus:ring-purple-500/50 w-full sm:w-40" />
      </div>

      {/* List */}
      {loading ? (
        <div className="text-center py-12 text-gray-500">
          <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          Loading opportunities...
        </div>
      ) : opportunities.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <Zap size={40} className="mx-auto mb-3 opacity-30" />
          <p>No opportunities available right now.</p>
          <p className="text-sm mt-1">Check back later or change filters.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {opportunities.map(opp => {
            const daysUntil = getDaysUntil(opp.event_date);
            const isUrgent = daysUntil !== null && daysUntil <= 3 && daysUntil >= 0;
            const isHighBudget = opp.budget_range && (opp.budget_range.includes('50,000') || opp.budget_range.includes('1,00,000') || opp.budget_range.includes('lakh'));

            return (
              <div key={opp.id} className={`bg-gray-800/60 backdrop-blur-xl border rounded-2xl overflow-hidden ${isUrgent ? 'border-orange-500/40' : 'border-gray-700/50'}`}>
                {/* Banner */}
                {opp.banner_image_url && (
                  <img src={opp.banner_image_url} alt={opp.title} className="w-full h-32 object-cover" />
                )}
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h3 className="font-bold text-white text-lg">{opp.title}</h3>
                        {isUrgent && <span className="text-xs bg-orange-500/20 text-orange-400 border border-orange-500/30 px-2 py-0.5 rounded-full">🔥 Urgent</span>}
                        {isHighBudget && <span className="text-xs bg-green-500/20 text-green-400 border border-green-500/30 px-2 py-0.5 rounded-full">💰 High Budget</span>}
                      </div>
                      <p className="text-xs text-purple-400 font-semibold">{opp.company_name}</p>
                    </div>
                    <span className="text-xs bg-blue-500/20 text-blue-400 px-2.5 py-1 rounded-full font-semibold flex-shrink-0">{opp.category}</span>
                  </div>

                  <p className="text-gray-300 text-sm leading-relaxed mb-3 line-clamp-3">{opp.description}</p>

                  <div className="flex flex-wrap gap-3 text-xs text-gray-400 mb-4">
                    {opp.location && <span className="flex items-center gap-1"><MapPin size={12} />{opp.location}</span>}
                    {opp.event_date && (
                      <span className="flex items-center gap-1">
                        <Calendar size={12} />
                        {new Date(opp.event_date).toLocaleDateString('en-IN')}
                        {daysUntil !== null && daysUntil >= 0 && <span className="text-orange-400 ml-1">({daysUntil === 0 ? 'Today!' : `${daysUntil}d left`})</span>}
                      </span>
                    )}
                    {opp.budget_range && <span className="flex items-center gap-1 text-green-400"><IndianRupee size={12} />{opp.budget_range}</span>}
                    <span className="text-gray-500">{opp.response_count} responses</span>
                  </div>

                  {/* Actions */}
                  {opp.already_responded ? (
                    <div className="flex items-center gap-2 text-sm text-green-400 bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-2">
                      <ThumbsUp size={14} /> Already responded
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {responding === opp.id ? (
                        <div className="space-y-2">
                          <textarea value={pitch} onChange={e => setPitch(e.target.value)} rows={2}
                            placeholder="Add a short pitch (optional)..."
                            className="w-full bg-gray-700 border border-gray-600 rounded-xl px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-purple-500/50 resize-none" />
                          <div className="flex gap-2">
                            <button onClick={() => handleRespond(opp.id, 'interested')}
                              className="flex items-center gap-1.5 px-4 py-2 bg-green-500/20 text-green-400 border border-green-500/30 rounded-xl text-sm font-semibold hover:bg-green-500/30 transition">
                              <ThumbsUp size={14} /> Interested
                            </button>
                            <button onClick={() => handleRespond(opp.id, 'not_interested')}
                              className="flex items-center gap-1.5 px-4 py-2 bg-gray-700 text-gray-400 rounded-xl text-sm hover:bg-gray-600 transition">
                              <X size={14} /> Not Interested
                            </button>
                            <button onClick={() => setResponding(null)} className="px-3 py-2 text-gray-500 text-sm hover:text-white transition">Cancel</button>
                          </div>
                        </div>
                      ) : (
                        <button onClick={() => setResponding(opp.id)}
                          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500/20 to-blue-500/20 text-purple-400 border border-purple-500/30 rounded-xl text-sm font-semibold hover:from-purple-500/30 hover:to-blue-500/30 transition">
                          <Send size={14} /> Respond to this opportunity
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
