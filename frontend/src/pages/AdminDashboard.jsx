import { useState, useEffect } from 'react';
import { Users, Calendar, CheckCircle, Clock } from 'lucide-react';
import axios from 'axios';

export default function AdminDashboard() {
  const [stats, setStats] = useState({});
  const [artists, setArtists] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [users, setUsers] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchStats();
    fetchArtists();
    fetchBookings();
    fetchUsers();
  }, []);

  const fetchStats = async () => {
    try {
      const { data } = await axios.get('/api/admin/stats');
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchArtists = async () => {
    try {
      const { data } = await axios.get('/api/admin/artists');
      setArtists(data);
    } catch (error) {
      console.error('Error fetching artists:', error);
    }
  };

  const fetchBookings = async () => {
    try {
      const { data } = await axios.get('/api/admin/bookings');
      setBookings(data);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const { data } = await axios.get('/api/admin/users');
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const approveArtist = async (artistId) => {
    try {
      await axios.patch(`/api/admin/artists/${artistId}/verify`, {
        isVerified: true,
        status: 'active'
      });
      fetchArtists();
      fetchStats();
    } catch (error) {
      alert('Failed to approve artist');
    }
  };

  const rejectArtist = async (artistId) => {
    try {
      await axios.patch(`/api/admin/artists/${artistId}/verify`, {
        isVerified: false,
        status: 'inactive'
      });
      fetchArtists();
      fetchStats();
    } catch (error) {
      alert('Failed to reject artist');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

      {/* Stats */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="card">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/20 rounded-lg">
              <Users className="text-primary" size={24} />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.artists?.total || 0}</p>
              <p className="text-gray-400">Total Artists</p>
              <p className="text-sm text-green-500">{stats.artists?.active || 0} Active</p>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-yellow-500/20 rounded-lg">
              <Clock className="text-yellow-500" size={24} />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.artists?.pending || 0}</p>
              <p className="text-gray-400">Pending Approvals</p>
              <p className="text-sm text-blue-500">{stats.artists?.verified || 0} Verified</p>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-secondary/20 rounded-lg">
              <Calendar className="text-secondary" size={24} />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.bookings?.total || 0}</p>
              <p className="text-gray-400">Total Bookings</p>
              <p className="text-sm text-yellow-500">{stats.bookings?.pending || 0} Pending</p>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-500/20 rounded-lg">
              <CheckCircle className="text-green-500" size={24} />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.users?.total || 0}</p>
              <p className="text-gray-400">Total Users</p>
              <p className="text-sm text-primary">{stats.bookings?.today || 0} Today's Bookings</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="card">
        <div className="flex gap-4 mb-6 border-b border-white/10 overflow-x-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-3 px-4 whitespace-nowrap ${activeTab === 'overview' ? 'border-b-2 border-primary text-primary' : 'text-gray-400'}`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('artists')}
            className={`pb-3 px-4 whitespace-nowrap ${activeTab === 'artists' ? 'border-b-2 border-primary text-primary' : 'text-gray-400'}`}
          >
            Artists Management
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`pb-3 px-4 whitespace-nowrap ${activeTab === 'users' ? 'border-b-2 border-primary text-primary' : 'text-gray-400'}`}
          >
            Users
          </button>
          <button
            onClick={() => setActiveTab('bookings')}
            className={`pb-3 px-4 whitespace-nowrap ${activeTab === 'bookings' ? 'border-b-2 border-primary text-primary' : 'text-gray-400'}`}
          >
            All Bookings
          </button>
        </div>

        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-bold mb-4">Platform Statistics</h3>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="glass rounded-lg p-4">
                  <h4 className="font-semibold mb-2">Artists Breakdown</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Total:</span>
                      <span className="font-semibold">{stats.artists?.total || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Active:</span>
                      <span className="text-green-500">{stats.artists?.active || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Pending:</span>
                      <span className="text-yellow-500">{stats.artists?.pending || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Verified:</span>
                      <span className="text-blue-500">{stats.artists?.verified || 0}</span>
                    </div>
                  </div>
                </div>

                <div className="glass rounded-lg p-4">
                  <h4 className="font-semibold mb-2">Bookings Breakdown</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Total:</span>
                      <span className="font-semibold">{stats.bookings?.total || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Pending:</span>
                      <span className="text-yellow-500">{stats.bookings?.pending || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Completed:</span>
                      <span className="text-green-500">{stats.bookings?.completed || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Today:</span>
                      <span className="text-primary">{stats.bookings?.today || 0}</span>
                    </div>
                  </div>
                </div>

                <div className="glass rounded-lg p-4">
                  <h4 className="font-semibold mb-2">User Statistics</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Total Users:</span>
                      <span className="font-semibold">{stats.users?.total || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Total Artists:</span>
                      <span className="font-semibold">{stats.artists?.total || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Total Bookings:</span>
                      <span className="font-semibold">{stats.bookings?.total || 0}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {stats.categoryBreakdown && stats.categoryBreakdown.length > 0 && (
              <div>
                <h3 className="text-xl font-bold mb-4">Artists by Category</h3>
                <div className="grid md:grid-cols-3 gap-4">
                  {stats.categoryBreakdown.map((cat) => (
                    <div key={cat.name} className="glass rounded-lg p-4">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold">{cat.name}</span>
                        <span className="text-2xl font-bold text-primary">{cat.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'artists' && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 px-4">Artist</th>
                  <th className="text-left py-3 px-4">Category</th>
                  <th className="text-left py-3 px-4">City</th>
                  <th className="text-left py-3 px-4">Status</th>
                  <th className="text-left py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {artists.map((artist) => (
                  <tr key={artist._id} className="border-b border-white/5">
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-semibold">{artist.stageName}</p>
                        <p className="text-sm text-gray-400">{artist.email}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4">{artist.category?.name}</td>
                    <td className="py-3 px-4">{artist.city}</td>
                    <td className="py-3 px-4">
                      <span className={`px-3 py-1 rounded-full text-sm ${
                        artist.status === 'active' ? 'bg-green-500/20 text-green-500' :
                        artist.status === 'pending' ? 'bg-yellow-500/20 text-yellow-500' :
                        'bg-red-500/20 text-red-500'
                      }`}>
                        {artist.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {artist.status === 'pending' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => approveArtist(artist._id)}
                            className="bg-green-500 hover:bg-green-600 px-3 py-1 rounded text-sm transition"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => rejectArtist(artist._id)}
                            className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded text-sm transition"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'bookings' && (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <div key={booking._id} className="glass rounded-lg p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-bold mb-2">{booking.artist?.stageName}</h3>
                    <p className="text-gray-400">Client: {booking.userName}</p>
                    <p className="text-gray-400">📞 {booking.phone}</p>
                    <p className="text-gray-400">📅 {new Date(booking.eventDate).toLocaleDateString()}</p>
                    <p className="text-gray-400">💰 ₹{booking.budget.toLocaleString()}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    booking.status === 'pending' ? 'bg-yellow-500/20 text-yellow-500' :
                    booking.status === 'accepted' ? 'bg-green-500/20 text-green-500' :
                    'bg-red-500/20 text-red-500'
                  }`}>
                    {booking.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'users' && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 px-4">Name</th>
                  <th className="text-left py-3 px-4">Email</th>
                  <th className="text-left py-3 px-4">Phone</th>
                  <th className="text-left py-3 px-4">Joined Date</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-white/5">
                    <td className="py-3 px-4">
                      <p className="font-semibold">{user.name}</p>
                    </td>
                    <td className="py-3 px-4">{user.email}</td>
                    <td className="py-3 px-4">{user.phone || 'N/A'}</td>
                    <td className="py-3 px-4">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {users.length === 0 && (
              <div className="text-center py-8 text-gray-400">
                No users registered yet
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
