import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AlertTriangle, Ban, Clock, Mail, MessageCircle } from 'lucide-react';

export default function AccountBlocked() {
  const location = useLocation();
  const navigate = useNavigate();
  const { status, reason, suspensionEnd } = location.state || {};
  const [timeRemaining, setTimeRemaining] = useState('');

  useEffect(() => {
    // If no status provided, redirect to home
    if (!status) {
      navigate('/');
      return;
    }

    if (status === 'suspended' && suspensionEnd) {
      const updateTimer = () => {
        const now = new Date();
        const end = new Date(suspensionEnd);
        const diff = end - now;

        if (diff <= 0) {
          setTimeRemaining('Suspension expired. Please refresh the page.');
          return;
        }

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        let timeStr = '';
        if (days > 0) timeStr += `${days}d `;
        if (hours > 0) timeStr += `${hours}h `;
        if (minutes > 0) timeStr += `${minutes}m `;
        timeStr += `${seconds}s`;

        setTimeRemaining(timeStr);
      };

      updateTimer();
      const interval = setInterval(updateTimer, 1000);
      return () => clearInterval(interval);
    }
  }, [status, suspensionEnd, navigate]);

  if (status === 'inactive') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full bg-gray-800/50 backdrop-blur-lg rounded-2xl border border-orange-500/30 p-8 shadow-2xl">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-orange-500/20 rounded-full mb-6">
              <AlertTriangle className="text-orange-400" size={48} />
            </div>
            
            <h1 className="text-3xl font-bold text-white mb-4">
              Account Temporarily Inactive
            </h1>
            
            <p className="text-gray-300 text-lg mb-6">
              Your account has been temporarily deactivated by our admin team.
            </p>

            <div className="bg-gray-900/50 rounded-xl p-6 mb-6 border border-orange-500/20">
              <h3 className="text-orange-400 font-semibold mb-2 flex items-center justify-center gap-2">
                <Ban size={20} />
                Reason for Deactivation
              </h3>
              <p className="text-gray-300">
                {reason || 'Policy violation detected'}
              </p>
            </div>

            <p className="text-gray-400 mb-6">
              If you believe this is a mistake, please contact our support team.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="mailto:support@spotmystar.com"
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg hover:shadow-lg hover:shadow-blue-500/50 transition-all font-medium flex items-center justify-center gap-2"
              >
                <Mail size={20} />
                Email Support
              </a>
              <a
                href="https://wa.me/1234567890"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 rounded-lg hover:shadow-lg hover:shadow-green-500/50 transition-all font-medium flex items-center justify-center gap-2"
              >
                <MessageCircle size={20} />
                WhatsApp Support
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'suspended') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full bg-gray-800/50 backdrop-blur-lg rounded-2xl border border-yellow-500/30 p-8 shadow-2xl">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-yellow-500/20 rounded-full mb-6">
              <Clock className="text-yellow-400" size={48} />
            </div>
            
            <h1 className="text-3xl font-bold text-white mb-4">
              Account Suspended
            </h1>
            
            <p className="text-gray-300 text-lg mb-6">
              Your account has been temporarily suspended.
            </p>

            <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-xl p-8 mb-6 border border-yellow-500/30">
              <h3 className="text-yellow-400 font-semibold mb-4 text-xl">Time Remaining</h3>
              <div className="text-5xl font-bold text-white mb-2 font-mono">
                {timeRemaining}
              </div>
              <p className="text-gray-400 text-sm">
                Suspension ends: {new Date(suspensionEnd).toLocaleString()}
              </p>
            </div>

            <div className="bg-gray-900/50 rounded-xl p-6 mb-6 border border-yellow-500/20">
              <h3 className="text-yellow-400 font-semibold mb-2 flex items-center justify-center gap-2">
                <Ban size={20} />
                Reason for Suspension
              </h3>
              <p className="text-gray-300">
                {reason || 'Terms of service violation'}
              </p>
            </div>

            <p className="text-gray-400">
              Your account will be automatically reactivated after the suspension period ends.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'terminated') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full bg-gray-800/50 backdrop-blur-lg rounded-2xl border border-red-500/30 p-8 shadow-2xl">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-red-500/20 rounded-full mb-6">
              <Ban className="text-red-400" size={48} />
            </div>
            
            <h1 className="text-3xl font-bold text-white mb-4">
              Account Terminated
            </h1>
            
            <p className="text-gray-300 text-lg mb-6">
              Your account has been permanently terminated due to serious policy violations.
            </p>

            <div className="bg-gray-900/50 rounded-xl p-6 mb-6 border border-red-500/20">
              <h3 className="text-red-400 font-semibold mb-2 flex items-center justify-center gap-2">
                <Ban size={20} />
                Reason for Termination
              </h3>
              <p className="text-gray-300">
                {reason || 'Serious violation of terms of service'}
              </p>
            </div>

            <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl p-6 mb-6 border border-blue-500/20">
              <h3 className="text-blue-400 font-semibold mb-3 text-xl">Want to Appeal?</h3>
              <p className="text-gray-300 mb-4">
                If you believe this action was taken in error, please contact our support team.
              </p>
              <p className="text-gray-400 text-sm mb-6">
                We will review your case within 24 hours.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="mailto:support@spotmystar.com"
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg hover:shadow-lg hover:shadow-blue-500/50 transition-all font-medium flex items-center justify-center gap-2"
                >
                  <Mail size={20} />
                  Email Support
                </a>
                <a
                  href="https://wa.me/1234567890"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 rounded-lg hover:shadow-lg hover:shadow-green-500/50 transition-all font-medium flex items-center justify-center gap-2"
                >
                  <MessageCircle size={20} />
                  WhatsApp Support
                </a>
              </div>
            </div>

            <p className="text-gray-500 text-sm">
              Support Email: support@spotmystar.com
            </p>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
