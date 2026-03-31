import { useState, useEffect } from 'react';
import { Plus, LogOut, Eye, Trash2, Edit, Users, Clock, CheckCircle, XCircle } from 'lucide-react';
import api from '../config/api';

const CATEGORIES = ['DJ', 'Singer', 'Dancer', 'Comedian', 'Anchor', 'Band', 'Photographer', 'Videographer', 'Makeup Artist', 'Instagram Influencer', 'YouTube Creator', 'Content Creator', 'Model', 'Other'];

function StatusBadge({ status }) {
  const map = {
    pending: 'bg-yellow-500/20 text-yellow-400',
    approved: 'bg-green-500/20 text-green-400',
    rejected: 'bg-red-500/20 text-red-400',
  };
  return <span className={`text-xs px-2.5 py-1 rounded-full font-semibold capitalize ${map[status] || map.pending}`}>{status}</span>;
}

export default function BrandDashboard() {
  const brand = JSON.parse(localStorage.getItem('brandData') || '{}');
  const [tab, setTab] = useState('posts');
  const [requirements, setRequirements] = useState([]);
  const [responses, setResponses] = useState([]);
  const [selectedReq, setSelectedReq] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingReq, setEditingReq] = useState(null);
  const [toast, setToast] = useState(null);
  const [form, setForm] = useState({ title: '', description: '', category: '', eventDate: '', eventTime: '', location: '', budgetRange: '', bannerImageUrl: '' });

  useEffect(() => { fetchRequirements(); }, []);

  const fetchRequirements = async () => {
    try {
      const { data } = await api.get('/api/brands/requirements/mine');
      setRequirements(data);
    } catch { /* silent */ }
  };

  const fetchResponses = async (reqId) => {
    try {
      const { data } = await api.get(`/api/brands/requirements/${reqId}/responses`);
      setResponses(data);
      setSelectedReq(reqId);
      setTab('responses');
    } catch { /* silent */ }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingReq) {
        await api.patch(`/api/brands/requirements/${editingReq}`, form);
        showToast('Updated!', 'success');
      } else {
        await api.post('/api/brands/requirements', form);
        showToast('Posted! Awaiting admin approval.', 'success');
      }
      setShowForm(false); setEditingReq(null);
      setForm({ title: '', description: '', category: '', eventDate: '', eventTime: '', location: '', budgetRange: '', bannerImageUrl: '' });
      fetchRequirements();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this requirement?')) return;
    try {
      await api.delete(`/api/brands/requirements/${id}`);
      showToast('Deleted', 'success');
      fetchRequirements();
    } catch (err) {
      showToast(err.response?.data?.message || 'Cannot delete', 'error');
    }
  };

  const startEdit = (req) => {
    setForm({ title: req.title, description: req.description, category: req.category, eventDate: req.event_date?.split('T')[0] || '', eventTime: req.event_time || '', location: req.location || '', budgetRange: req.budget_range || '', bannerImageUrl: req.banner_image_url || '' });
    setEditingReq(req.id);
    setShowForm(true);
  };

  const showToast = (msg, type) => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000); };

  const logout = () => { localStorage.removeItem('brandToken'); localStorage.removeItem('brandData'); window.location.href = '/login'; };

  return (
    <div className="min-h-screen bg-gray-950">
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-2 rounded-xl text-sm font-medium ${toast.type === 'success' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-white">{brand.companyName || 'Brand Dashboard'}</h1>
          <p className="text-xs text-gray-400">SpotMyStar — Brand Panel</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => { setShowForm(true); setEditingReq(null); setForm({ title: '', description: '', category: '', eventDate: '', eventTime: '', location: '', budgetRange: '', bannerImageUrl: '' }); }}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl text-sm font-semibold hover:opacity-90 transition">
            <Plus size={16} /> Post Requirement
          </button>
          <button onClick={logout} className="p-2 text-gray-400 hover:text-white transition"><LogOut size={18} /></button>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {[{ id: 'posts', label: 'My Posts' }, { id: 'responses', label: 'Responses' }].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${tab === t.id ? 'bg-purple-500 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'}`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Posts Tab */}
        {tab === 'posts' && (
          <div className="space-y-4">
            {requirements.length === 0 ? (
              <div className="text-center py-16 text-gray-500">
                <Plus size={40} className="mx-auto mb-3 opacity-30" />
                <p>No requirements posted yet.</p>
                <button onClick={() => setShowForm(true)} className="mt-3 text-purple-400 hover:underline text-sm">Post your first requirement</button>
              </div>
            ) : requirements.map(req => (
              <div key={req.id} className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="font-bold text-white">{req.title}</h3>
                      <StatusBadge status={req.status} />
                      <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full">{req.category}</span>
                    </div>
                    <p className="text-gray-400 text-sm line-clamp-2">{req.description}</p>
                    <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-500">
                      {req.location && <span>📍 {req.location}</span>}
                      {req.event_date && <span>📅 {new Date(req.event_date).toLocaleDateString('en-IN')}</span>}
                      {req.budget_range && <span>💰 {req.budget_range}</span>}
                      <span className="text-purple-400"><Users size={12} className="inline mr-1" />{req.response_count} responses</span>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button onClick={() => fetchResponses(req.id)} className="p-2 bg-purple-500/20 text-purple-400 rounded-lg hover:bg-purple-500/30 transition" title="View Responses">
                      <Eye size={16} />
                    </button>
                    {req.status === 'pending' && (
                      <>
                        <button onClick={() => startEdit(req)} className="p-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition"><Edit size={16} /></button>
                        <button onClick={() => handleDelete(req.id)} className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition"><Trash2 size={16} /></button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Responses Tab */}
        {tab === 'responses' && (
          <div className="space-y-4">
            {responses.length === 0 ? (
              <div className="text-center py-16 text-gray-500">
                <Users size={40} className="mx-auto mb-3 opacity-30" />
                <p>No responses yet. Select a post to view responses.</p>
              </div>
            ) : responses.map(r => (
              <div key={r.id} className="bg-gray-900 border border-gray-800 rounded-2xl p-5 flex items-start gap-4">
                <img src={r.profile_image || `https://ui-avatars.com/api/?name=${encodeURIComponent(r.stage_name || 'A')}&background=8B5CF6&color=fff&size=80`}
                  alt={r.stage_name} className="w-14 h-14 rounded-xl object-cover flex-shrink-0" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-bold text-white">{r.stage_name}</p>
                    <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full">{r.category_name}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${r.status === 'interested' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
                      {r.status === 'interested' ? '👍 Interested' : '❌ Not Interested'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">📍 {r.city} · ⭐ {r.rating || 'New'} · ID: A{r.artist_code}</p>
                  {r.message && <p className="text-sm text-gray-300 mt-2 bg-gray-800 rounded-lg px-3 py-2">"{r.message}"</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Post/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowForm(false)}>
          <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-800 flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">{editingReq ? 'Edit Requirement' : 'Post New Requirement'}</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-white">✕</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <input type="text" placeholder="Title *" value={form.title} onChange={e => setForm({...form, title: e.target.value})} required
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-purple-500/50" />
              <textarea placeholder="Description (max 500 words) *" value={form.description} onChange={e => setForm({...form, description: e.target.value})} required rows={4}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-purple-500/50 resize-none" />
              <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} required
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-purple-500/50">
                <option value="">Select Category *</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <div className="grid grid-cols-2 gap-4">
                <input type="date" value={form.eventDate} onChange={e => setForm({...form, eventDate: e.target.value})}
                  className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-purple-500/50" />
                <input type="time" value={form.eventTime} onChange={e => setForm({...form, eventTime: e.target.value})}
                  className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-purple-500/50" />
              </div>
              <input type="text" placeholder="Location" value={form.location} onChange={e => setForm({...form, location: e.target.value})}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-purple-500/50" />
              <input type="text" placeholder="Budget Range (e.g., ₹10,000 - ₹50,000)" value={form.budgetRange} onChange={e => setForm({...form, budgetRange: e.target.value})}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-purple-500/50" />
              <input type="url" placeholder="Banner Image URL (optional)" value={form.bannerImageUrl} onChange={e => setForm({...form, bannerImageUrl: e.target.value})}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-purple-500/50" />
              <div className="flex gap-3 pt-2">
                <button type="submit" className="flex-1 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl font-semibold hover:opacity-90 transition">
                  {editingReq ? 'Update' : 'Post Requirement'}
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="px-6 py-3 bg-gray-800 text-gray-300 rounded-xl hover:bg-gray-700 transition">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
