import { useState } from 'react';
import { X, Calendar, MapPin, DollarSign, MessageSquare, User, Phone, Mail } from 'lucide-react';

export default function BookingModal({ artist, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    userName: '',
    phone: '',
    email: '',
    eventDate: '',
    eventLocation: '',
    budget: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await onSubmit(formData);
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-darker rounded-2xl max-w-2xl w-full border border-gray-700 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-darker/95 backdrop-blur-sm flex justify-between items-center p-6 border-b border-gray-700">
          <div>
            <h3 className="text-2xl font-bold text-white">Book {artist.stage_name || artist.stageName}</h3>
            <p className="text-gray-400 text-sm mt-1">{artist.category_name} • {artist.city}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Artist Info */}
          <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg p-4 border border-primary/20">
            <p className="text-sm text-gray-400 mb-1">Price Range</p>
            <p className="text-xl font-bold text-primary">
              ₹{(artist.price_min || artist.priceMin || 0).toLocaleString()} - ₹{(artist.price_max || artist.priceMax || 0).toLocaleString()}
            </p>
          </div>

          {/* User Details */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <User className="inline mr-2" size={16} />
                Your Name
              </label>
              <input
                type="text"
                name="userName"
                value={formData.userName}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white/5 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary"
                required
                placeholder="Enter your name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Phone className="inline mr-2" size={16} />
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white/5 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary"
                required
                placeholder="Enter phone number"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <Mail className="inline mr-2" size={16} />
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-white/5 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary"
              required
              placeholder="Enter email address"
            />
          </div>

          {/* Event Details */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Calendar className="inline mr-2" size={16} />
                Event Date
              </label>
              <input
                type="date"
                name="eventDate"
                value={formData.eventDate}
                onChange={handleChange}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-3 bg-white/5 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <DollarSign className="inline mr-2" size={16} />
                Your Budget (₹)
              </label>
              <input
                type="number"
                name="budget"
                value={formData.budget}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white/5 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary"
                required
                placeholder="Enter budget"
                min="0"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <MapPin className="inline mr-2" size={16} />
              Event Location
            </label>
            <input
              type="text"
              name="eventLocation"
              value={formData.eventLocation}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-white/5 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary"
              required
              placeholder="Enter event venue/location"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <MessageSquare className="inline mr-2" size={16} />
              Additional Message (Optional)
            </label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-white/5 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary min-h-[100px]"
              placeholder="Tell the artist about your event..."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-white/5 hover:bg-white/10 rounded-lg transition-colors text-white font-medium border border-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-primary to-secondary hover:shadow-lg hover:shadow-primary/50 rounded-lg transition-all text-white font-medium disabled:opacity-50"
            >
              {loading ? 'Sending Request...' : 'Send Booking Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
