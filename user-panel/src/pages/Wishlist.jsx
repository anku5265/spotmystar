import { Link } from 'react-router-dom';
import { Heart, Trash2 } from 'lucide-react';

export default function Wishlist() {
  // Mock data - implement with localStorage or backend
  const wishlist = [];

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8 flex items-center gap-3">
        <Heart className="text-primary" />
        My Wishlist
      </h1>

      {wishlist.length === 0 ? (
        <div className="card text-center py-20">
          <Heart size={64} className="mx-auto mb-4 text-gray-600" />
          <h2 className="text-2xl font-bold mb-4">Your wishlist is empty</h2>
          <p className="text-gray-400 mb-8">Start adding artists you like to compare and book later</p>
          <Link to="/search" className="btn-primary inline-block">
            Browse Artists
          </Link>
        </div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-3 px-4">Artist</th>
                <th className="text-left py-3 px-4">Category</th>
                <th className="text-left py-3 px-4">City</th>
                <th className="text-left py-3 px-4">Price Range</th>
                <th className="text-left py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {/* Map wishlist items here */}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
