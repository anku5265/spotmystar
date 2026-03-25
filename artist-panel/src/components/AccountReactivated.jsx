import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle, Sparkles, ArrowRight } from 'lucide-react';

export default function AccountReactivated() {
  const navigate = useNavigate();
  const location = useLocation();
  const { previousStatus } = location.state || {};

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/dashboard');
    }, 5000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-gradient-to-br from-green-500/10 to-blue-500/10 backdrop-blur-lg rounded-2xl border border-green-500/30 p-8 shadow-2xl">
        <div className="text-center">
          <div className="relative inline-flex items-center justify-center mb-6">
            <div className="absolute w-32 h-32 bg-green-500/20 rounded-full animate-ping"></div>
            <div className="relative inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-green-500 to-green-600 rounded-full shadow-lg shadow-green-500/50">
              <CheckCircle className="text-white" size={56} />
            </div>
          </div>

          <h1 className="text-4xl font-bold text-white mb-3 flex items-center justify-center gap-3">
            <Sparkles className="text-yellow-400" size={32} />
            Welcome Back!
            <Sparkles className="text-yellow-400" size={32} />
          </h1>

          {previousStatus === 'terminated' ? (
            <p className="text-xl text-green-400 font-semibold mb-4">Your Account Has Been Fully Restored</p>
          ) : (
            <p className="text-xl text-green-400 font-semibold mb-4">Your Suspension Has Been Lifted</p>
          )}

          <p className="text-gray-300 text-lg mb-8">
            Your account is now fully active. You can now receive bookings and manage your profile.
          </p>

          <button
            onClick={() => navigate('/dashboard')}
            className="px-8 py-4 bg-gradient-to-r from-green-500 to-green-600 rounded-lg hover:shadow-lg hover:shadow-green-500/50 transition-all font-semibold text-lg flex items-center justify-center gap-3 mx-auto group"
          >
            Continue to Dashboard
            <ArrowRight className="group-hover:translate-x-1 transition-transform" size={24} />
          </button>

          <p className="text-gray-500 text-sm mt-4">Redirecting automatically in 5 seconds...</p>
        </div>
      </div>
    </div>
  );
}
