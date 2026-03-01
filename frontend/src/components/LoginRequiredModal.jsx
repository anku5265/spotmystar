import { X, LogIn, UserPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function LoginRequiredModal({ onClose, message = "Please login or signup first to continue" }) {
  const navigate = useNavigate();

  const handleUserLogin = () => {
    onClose();
    navigate('/user/login');
  };

  const handleUserSignup = () => {
    onClose();
    navigate('/user/register');
  };

  const handleArtistLogin = () => {
    onClose();
    navigate('/artist/login');
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-2xl max-w-md w-full border border-gray-700 shadow-2xl animate-scale-in">
        <div className="flex justify-between items-center p-6 border-b border-gray-700">
          <h3 className="text-xl font-bold text-white">Authentication Required</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-500/20 rounded-full mb-4">
              <LogIn className="text-blue-400" size={32} />
            </div>
            <p className="text-gray-300 text-lg">
              {message}
            </p>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleUserLogin}
              className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg hover:shadow-lg hover:shadow-blue-500/50 transition-all font-semibold flex items-center justify-center gap-2"
            >
              <LogIn size={20} />
              Login as User
            </button>

            <button
              onClick={handleUserSignup}
              className="w-full px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 rounded-lg hover:shadow-lg hover:shadow-green-500/50 transition-all font-semibold flex items-center justify-center gap-2"
            >
              <UserPlus size={20} />
              Signup as User
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-800 text-gray-400">or</span>
              </div>
            </div>

            <button
              onClick={handleArtistLogin}
              className="w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg hover:shadow-lg hover:shadow-purple-500/50 transition-all font-semibold flex items-center justify-center gap-2"
            >
              <LogIn size={20} />
              Login as Artist
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
