import { useState, useEffect } from 'react';
import { Building2, CheckCircle, XCircle, Eye, Trash2 } from 'lucide-react';
import api from '../config/api';
import Toast from './Toast';

export default function BrandManagement() {
  const [brands, setBrands] = useState([]);
  const [requirements, setRequirements] = useState([]);
  const [tab, setTab] = useState('brands');
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reqFilter, setReqFilter] = useState('pending');

  useEffect(() => { fetchBrands(); fetchRequirements(); }, []);
  useEffect(() => { fetchRequirements(); }, [reqFilter]);

  const fetchBrands = async () => {
    try {
      const { data } = await api.get('/api/brands/admin/brands');
      setBrands(data);
    } catch { /* silent */ } finally { setLoading(false); }
  };

  const fetchRequirements = async () => {
    try {
      const { data } = await api.get(`/api/brands/admin/requirements?status=${reqFilter}`);
      setRequirements(data);
    } catch { /* silent */ }
  };

  const updateBrand = async (id, is_verified) => {
    try {
      await api.patch(`/api/brands/admin/brands/${id}`, { is_verified });
      setToast({ message: is_verified ? 'Brand approved ✅' : 'Brand rejected', type: is_verified ? 'success' : 'error' });
      fetchBrands();
    } catch { setToast({ message: 'Failed', type: 'error' }); }
  };

  const updateRequirement = async (id, status) => {
    try {
      await api.patch(`/api/brands/admin/requirements/${id}`, { status });
      setToast({ message: `Requirement ${status} ✅`, type: 'success' });
      fetchRequirements();
    } catch { setToast({ message: 'Failed', type: 'error' }); }
  };

  const deleteRequirement = async (id) => {
    if (!confirm('Delete this requirement?')) return;
    try {
      await api.delete(`/api/brands/admin/requirements/${id}`);
      setToast({ message: 'Deleted', type: 'success' });
      fetchRequirements();
    } catch { setToast({ message: 'Failed', type: 'error' }); }
  };

  return (
    <div className="space-y-6">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="flex items-center gap-3">
        <Building2 className="text-blue-400" size={28} />
        <div>
          <h2 className="text-2xl font-bold text-white">Brand Management</h2>
          <p className="text-gray-400 text-sm">Approve brands and manage requirements</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {[{ id: 'brands', label: `Brands (${brands.length})` }, { id: 'requirements', label: 'Requirements' }].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${tab === t.id ? 'bg-blue-500 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Brands Tab */}
      {tab === 'brands' && (
        <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-400">Loading...</div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-900/50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Company</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Contact</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Posts</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {brands.map(brand => (
                  <tr key={brand.id} className="border-t border-gray-700/50 hover:bg-white/5 transition">
                    <td className="px-6 py-4">
                      <p className="font-medium text-white">{brand.company_name}</p>
                      {brand.website && <p className="text-xs text-gray-400">{brand.website}</p>}
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-300">{brand.email}</p>
                      <p className="text-sm text-gray-400">{brand.mobile}</p>
                    </td>
                    <td className="px-6 py-4 text-gray-300">{brand.total_posts || 0}</td>
                    <td className="px-6 py-4">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${brand.is_verified ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                        {brand.is_verified ? 'Approved' : 'Pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        {!brand.is_verified ? (
                          <button onClick={() => updateBrand(brand.id, true)}
                            className="p-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition" title="Approve">
                            <CheckCircle size={16} />
                          </button>
                        ) : (
                          <button onClick={() => updateBrand(brand.id, false)}
                            className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition" title="Revoke">
                            <XCircle size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Requirements Tab */}
      {tab === 'requirements' && (
        <div className="space-y-4">
          <div className="flex gap-2">
            {['pending', 'approved', 'rejected'].map(s => (
              <button key={s} onClick={() => setReqFilter(s)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition ${reqFilter === s ? 'bg-purple-500 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'}`}>
                {s}
              </button>
            ))}
          </div>

          {requirements.length === 0 ? (
            <div className="text-center py-12 text-gray-500">No {reqFilter} requirements</div>
          ) : requirements.map(req => (
            <div key={req.id} className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h3 className="font-bold text-white">{req.title}</h3>
                    <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full">{req.category}</span>
                  </div>
                  <p className="text-xs text-purple-400 mb-1">by {req.company_name}</p>
                  <p className="text-sm text-gray-400 line-clamp-2">{req.description}</p>
                  <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-500">
                    {req.location && <span>📍 {req.location}</span>}
                    {req.event_date && <span>📅 {new Date(req.event_date).toLocaleDateString('en-IN')}</span>}
                    {req.budget_range && <span>💰 {req.budget_range}</span>}
                    <span>{req.response_count} responses</span>
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  {req.status === 'pending' && (
                    <>
                      <button onClick={() => updateRequirement(req.id, 'approved')}
                        className="p-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition" title="Approve">
                        <CheckCircle size={16} />
                      </button>
                      <button onClick={() => updateRequirement(req.id, 'rejected')}
                        className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition" title="Reject">
                        <XCircle size={16} />
                      </button>
                    </>
                  )}
                  <button onClick={() => deleteRequirement(req.id)}
                    className="p-2 bg-gray-700 text-gray-400 rounded-lg hover:bg-gray-600 transition" title="Delete">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
