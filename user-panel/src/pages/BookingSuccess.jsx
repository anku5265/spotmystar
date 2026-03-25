import { Link } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';

export default function BookingSuccess() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="card max-w-md w-full text-center">
        <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="text-green-500" size={40} />
        </div>
        <h1 className="text-3xl font-bold mb-4">Booking Request Sent!</h1>
        <p className="text-gray-400 mb-8">
          The artist will review your request and contact you soon via email or WhatsApp.
        </p>
        <div className="flex gap-4">
          <Link to="/" className="flex-1 btn-primary">
            Back to Home
          </Link>
          <Link to="/search" className="flex-1 glass px-6 py-3 rounded-lg hover:bg-white/10 transition">
            Browse More
          </Link>
        </div>
      </div>
    </div>
  );
}
