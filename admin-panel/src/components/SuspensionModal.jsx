import { useState } from 'react';
import { X, Clock } from 'lucide-react';

export default function SuspensionModal({ user, userType, onClose, onSubmit }) {
  const [action, setAction] = useState('suspended');
  const [duration, setDuration] = useState('3600');
  const [customDuration, setCustomDuration] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    let finalDuration = duration === 'custom' ? parseInt(customDuration) * 3600 : parseInt(duration);
    let finalStatus = action;

    if (action === 'terminated') {
      finalDuration = null;
    }

    await onSubmit({
      status: finalStatus,
      reason,
      duration: finalDuration,
      adminName: 'Admin'
    });

    setLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-2xl max-w-md w-full border border-gray-700 shadow-2xl">
        <div className="flex justify-between items-center p-6 border-b border-gray-700">
          <h3 className="text-xl font-bold text-white">Manage Account Status</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">User</label>
            <p className="text-white font-semibold">{user.name || user.full_name}</p>
            <p className="text-gray-400 text-sm">{user.email}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Action</label>
            <select
              value={action}
              onChange={(e) => setAction(e.target.value)}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="suspended">Suspend (Time-bound)</option>
              <option value="terminated">Terminate (Permanent)</option>
              <option value="active">Reactivate Account</option>
            </select>
          </div>

          {action === 'suspended' && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Clock className="inline mr-2" size={16} />
                Suspension Duration
              </label>
              <select
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
                required
              >
                <option value="3600">1 Hour</option>
                <option value="18000">5 Hours</option>
                <option value="86400">1 Day</option>
                <option value="259200">3 Days</option>
                <option value="604800">1 Week</option>
                <option value="custom">Custom</option>
              </select>

              {duration === 'custom' && (
                <input
                  type="number"
                  placeholder="Enter hours"
                  value={customDuration}
                  onChange={(e) => setCustomDuration(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  min="1"
                />
              )}
            </div>
          )}

          {action !== 'active' && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Reason {action === 'terminated' && <span className="text-red-400">(Required)</span>}
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder={`Explain why you are ${action === 'suspended' ? 'suspending' : 'terminating'} this account...`}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
                required={action === 'terminated'}
              />
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors text-white font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`flex-1 px-4 py-2 rounded-lg transition-all font-medium ${
                action === 'active'
                  ? 'bg-gradient-to-r from-green-500 to-green-600 hover:shadow-lg hover:shadow-green-500/50'
                  : action === 'terminated'
                  ? 'bg-gradient-to-r from-red-500 to-red-600 hover:shadow-lg hover:shadow-red-500/50'
                  : 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:shadow-lg hover:shadow-yellow-500/50'
              } text-white disabled:opacity-50`}
            >
              {loading ? 'Processing...' : action === 'active' ? 'Reactivate' : action === 'terminated' ? 'Terminate' : 'Apply'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
