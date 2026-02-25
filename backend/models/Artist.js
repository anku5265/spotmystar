import mongoose from 'mongoose';

const artistSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  stageName: { type: String, required: true, unique: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  bio: { type: String, maxlength: 500 },
  city: { type: String, required: true },
  priceMin: { type: Number, required: true },
  priceMax: { type: Number, required: true },
  email: { type: String, required: true },
  whatsapp: { type: String, required: true },
  instagram: { type: String },
  profileImage: { type: String, default: 'https://via.placeholder.com/400' },
  gallery: [{ type: String }],
  videos: [{ type: String }],
  isVerified: { type: Boolean, default: false },
  status: { type: String, enum: ['pending', 'active', 'inactive'], default: 'pending' },
  rating: { type: Number, default: 0 },
  totalBookings: { type: Number, default: 0 },
  views: { type: Number, default: 0 },
  password: { type: String, required: true }
}, { timestamps: true });

export default mongoose.model('Artist', artistSchema);
