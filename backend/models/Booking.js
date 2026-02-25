import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  artist: { type: mongoose.Schema.Types.ObjectId, ref: 'Artist', required: true },
  userName: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true },
  eventDate: { type: Date, required: true },
  eventLocation: { type: String, required: true },
  budget: { type: Number, required: true },
  message: { type: String },
  status: { type: String, enum: ['pending', 'accepted', 'rejected', 'completed'], default: 'pending' }
}, { timestamps: true });

export default mongoose.model('Booking', bookingSchema);
