import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Filter, Grid, List, Heart } from 'lucide-react';
import axios from 'axios';

export default function Search() {
  const [searchParams] = useSearchParams();
  const [artists, setArtists] = useState([]);
  const [categories, setCategories] = useState([]);
  const [viewMode, setViewMode] = useState('grid');
  const [filters, setFilters] = useState({
    city: searchParams.get('city') || '',
    category: searchParams.get('category') || '',
    minPrice: '',
    maxPrice: '',
    search: ''
  });

  useEffect(() => {
    fetchCategories();
    fetchArtists();
  }, [filters]);

  const fetchCategories = async () => {
    const { data } = await axios.get('/api/categories');
    setCategories(data);
  };

  const fetchArtists = async () => {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
      const { data } = await axios.get(`/api/artists/search?${params}`);
      setArtists(data);
    } catch (error) {
      console.error('Error fetching artists:', error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Filters Sidebar */}
        <aside className="md:w-64 space-y-6">
          <div className="card">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <Filter size={20} />
              Filters
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-2">City</label>
                <input
                  type="text"
                  value={filters.city}
                  onChange={(e) => setFilters({ ...filters, city: e.target.value })}
                  className="w-full bg-white/5 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Enter city"
                />
              </div>

              <div>
                <label className="block text-sm mb-2">Category</label>
                <select
                  value={filters.category}
                  onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                  className="w-full bg-white/5 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">All Categories</option>
                  {categories.map(cat => (
                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm mb-2">Budget Range</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.minPrice}
                    onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                    className="w-full bg-white/5 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-primary"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.maxPrice}
                    onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                    className="w-full bg-white/5 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <button
                onClick={() => setFilters({ city: '', category: '', minPrice: '', maxPrice: '', search: '' })}
                className="w-full glass px-4 py-2 rounded-lg hover:bg-white/10 transition"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </aside>

        {/* Results */}
        <main className="flex-1">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">{artists.length} Artists Found</h2>
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-primary' : 'glass'}`}
              >
                <Grid size={20} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-primary' : 'glass'}`}
              >
                <List size={20} />
              </button>
            </div>
          </div>

          <div className={viewMode === 'grid' ? 'grid md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
            {artists.map((artist) => (
              <div key={artist._id} className="card group relative">
                <button className="absolute top-4 right-4 z-10 p-2 glass rounded-full hover:bg-primary transition">
                  <Heart size={20} />
                </button>

                <Link to={`/${artist.stageName}`}>
                  <div className="relative h-48 -m-6 mb-4 overflow-hidden rounded-t-xl">
                    <img
                      src={artist.profileImage}
                      alt={artist.stageName}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    {artist.isVerified && (
                      <div className="absolute top-4 left-4 bg-primary px-3 py-1 rounded-full text-sm">
                        ✓ Verified
                      </div>
                    )}
                  </div>

                  <h3 className="text-xl font-bold mb-2">{artist.stageName}</h3>
                  <p className="text-gray-400 mb-2">{artist.category?.name} • {artist.city}</p>
                  <p className="text-primary font-semibold">₹{artist.priceMin.toLocaleString()} - ₹{artist.priceMax.toLocaleString()}</p>
                  <div className="flex items-center gap-2 mt-2 text-sm text-gray-400">
                    <span>⭐ {artist.rating || 'New'}</span>
                    <span>•</span>
                    <span>{artist.totalBookings || 0} bookings</span>
                  </div>
                </Link>
              </div>
            ))}
          </div>

          {artists.length === 0 && (
            <div className="text-center py-20 text-gray-400">
              <p className="text-xl">No artists found. Try adjusting your filters.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
