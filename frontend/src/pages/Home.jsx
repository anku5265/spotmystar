import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, MapPin, Star, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../config/api';

export default function Home() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [featuredArtists, setFeaturedArtists] = useState([]);
  const [searchCity, setSearchCity] = useState('');

  const cities = ['Delhi', 'Mumbai', 'Bangalore', 'Pune', 'Hyderabad', 'Chennai', 'Kolkata', 'Ahmedabad'];

  useEffect(() => {
    fetchCategories();
    fetchFeaturedArtists();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data } = await api.get('/api/categories');
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchFeaturedArtists = async () => {
    try {
      const { data } = await api.get('/api/artists/featured');
      setFeaturedArtists(data);
    } catch (error) {
      console.error('Error fetching featured artists:', error);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchCity) navigate(`/search?city=${searchCity}`);
  };

  const handleNearMe = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          navigate(`/search?lat=${position.coords.latitude}&lng=${position.coords.longitude}`);
        },
        () => alert('Location access denied')
      );
    }
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 blur-3xl"></div>
        
        <div className="container mx-auto relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Discover <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Talented Artists</span> Near You
            </h1>
            <p className="text-xl text-gray-400 mb-8">Book DJs, Anchors, Bands & Performers for your events</p>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="glass rounded-2xl p-4 flex flex-col md:flex-row gap-4 max-w-2xl mx-auto">
              <div className="flex-1 flex items-center gap-3 bg-white/5 rounded-lg px-4">
                <MapPin className="text-primary" size={20} />
                <input
                  type="text"
                  placeholder="Enter city..."
                  value={searchCity}
                  onChange={(e) => setSearchCity(e.target.value)}
                  className="bg-transparent flex-1 py-3 outline-none"
                  list="cities"
                />
                <datalist id="cities">
                  {cities.map(city => <option key={city} value={city} />)}
                </datalist>
              </div>
              <button type="submit" className="btn-primary">
                <Search size={20} className="inline mr-2" />
                Search
              </button>
              <button type="button" onClick={handleNearMe} className="glass px-6 py-3 rounded-lg hover:bg-white/10 transition">
                Near Me
              </button>
            </form>
          </motion.div>
        </div>
      </section>

      {/* Categories */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold mb-8 flex items-center gap-3">
          <TrendingUp className="text-primary" />
          Browse by Category
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/search?category=${cat.id}`}
              className="card text-center hover:scale-105 transition-transform"
            >
              <div className="text-4xl mb-3">{cat.icon || '🎵'}</div>
              <h3 className="font-semibold">{cat.name}</h3>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Artists */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold mb-8 flex items-center gap-3">
          <Star className="text-primary" />
          Featured Artists
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {featuredArtists.map((artist) => (
            <Link
              key={artist.id}
              to={`/${artist.stageName}`}
              className="card group overflow-hidden"
            >
              <div className="relative h-64 -m-6 mb-4 overflow-hidden">
                <img
                  src={artist.profileImage}
                  alt={artist.stageName}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-darker to-transparent"></div>
                {artist.isVerified && (
                  <div className="absolute top-4 right-4 bg-primary px-3 py-1 rounded-full text-sm">
                    ✓ Verified
                  </div>
                )}
              </div>
              <h3 className="text-xl font-bold mb-2">{artist.stageName || artist.stage_name}</h3>
              <p className="text-gray-400 mb-2">{artist.category?.name || artist.category_name} • {artist.city}</p>
              <p className="text-primary font-semibold">
                ₹{(artist.priceMin || artist.price_min || 0).toLocaleString()} - ₹{(artist.priceMax || artist.price_max || 0).toLocaleString()}
              </p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
