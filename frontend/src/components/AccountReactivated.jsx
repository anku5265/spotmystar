import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle, Sparkles, ArrowRight } from 'lucide-react';

export default function AccountReactivated() {
  const navigate = useNavigate();
  const location = useLocation();
  const { userType, previousStatus } = location.state || {};

  useEffect(() => {
    // Auto redirect after 5 seconds
    const timer = setTimeout(() => {
      if (userType === 'artist') {
        navigate('/artist/dashboard');
      } else {
        navigate('/user/dashboard');
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, [navigate, userType]);

  const handleContinue = () => {
    if (userType === 'artist') {
      navigate('/artist/dashboard');
    } else {
      navigate('/user/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-gradient-to-br from-green-500/10 to-blue-500/10 backdrop-blur-lg rounded-2xl border border-green-500/30 p-8 shadow-2xl">
        <div className="text-center">
          {/* Success Icon with Animation */}
          <div className="relative inline-flex items-center justify-center mb-6">
            <div className="absolute w-32 h-32 bg-green-500/20 rounded-full animate-ping"></div>
            <div className="relative inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-green-500 to-green-600 rounded-full shadow-lg shadow-green-500/50">
              <CheckCircle className="text-white" size={56} />
            </div>
          </div>
          
          {/* Welcome Back Message */}
          <div className="mb-6">
            <h1 className="text-4xl font-bold text-white mb-3 flex items-center justify-center gap-3">
              <Sparkles className="text-yellow-400" size={32} />
              Welcome Back!
              <Sparkles className="text-yellow-400" size={32} />
            </h1>
            
            {previousStatus === 'terminated' ? (
              <>
                <p className="text-xl text-green-400 font-semibold mb-4">
                  Your Account Has Been Fully Restored
                </p>
                <p className="text-gray-300 text-lg leading-relaxed">
                  We are delighted to inform you that after careful review, your account has been completely reactivated. 
                  You now have full access to all platform features and services.
                </p>
              </>
            ) : previousStatus === 'suspended' ? (
              <>
                <p className="text-xl text-green-400 font-semibold mb-4">
                  Your Suspension Has Been Lifted
                </p>
                <p className="text-gray-300 text-lg leading-relaxed">
                  Great news! Your account is now fully active and all restrictions have been removed. 
                  You can now enjoy complete access to all features.
                </p>
              </>
            ) : (
              <>
                <p className="text-xl text-green-400 font-semibold mb-4">
                  Your Account Is Now Active
                </p>
                <p className="text-gray-300 text-lg leading-relaxed">
                  Your account has been successfully reactivated. Welcome back to SpotMyStar!
                </p>
              </>
            )}
          </div>

          {/* Features Box */}
          <div className="bg-gray-900/50 rounded-xl p-6 mb-8 border border-green-500/20">
            <h3 className="text-green-400 font-semibold mb-4 text-lg">You Can Now:</h3>
            <div className="grid md:grid-cols-2 gap-3 text-left">
              {userType === 'artist' ? (
                <>
                  <div className="flex items-center gap-2 text-gray-300">
                    <CheckCircle className="text-green-400" size={18} />
                    <span>Receive and manage bookings</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-300">
                    <CheckCircle className="text-green-400" size={18} />
                    <span>Update your artist profile</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-300">
                    <CheckCircle className="text-green-400" size={18} />
                    <span>Interact with clients</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-300">
                    <CheckCircle className="text-green-400" size={18} />
                    <span>Access all platform features</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2 text-gray-300">
                    <CheckCircle className="text-green-400" size={18} />
                    <span>Book your favorite artists</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-300">
                    <CheckCircle className="text-green-400" size={18} />
                    <span>Manage your bookings</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-300">
                    <CheckCircle className="text-green-400" size={18} />
                    <span>Update your profile</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-300">
                    <CheckCircle className="text-green-400" size={18} />
                    <span>Access all platform features</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Thank You Message */}
          <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl p-6 mb-8 border border-blue-500/20">
            <p className="text-gray-300 text-lg">
              Thank you for your patience and understanding. We're excited to have you back on SpotMyStar!
            </p>
          </div>

          {/* Continue Button */}
          <button
            onClick={handleContinue}
            className="px-8 py-4 bg-gradient-to-r from-green-500 to-green-600 rounded-lg hover:shadow-lg hover:shadow-green-500/50 transition-all font-semibold text-lg flex items-center justify-center gap-3 mx-auto group"
          >
            Continue to Dashboard
            <ArrowRight className="group-hover:translate-x-1 transition-transform" size={24} />
          </button>

          <p className="text-gray-500 text-sm mt-4">
            Redirecting automatically in 5 seconds...
          </p>
        </div>
      </div>
    </div>
  );
}
