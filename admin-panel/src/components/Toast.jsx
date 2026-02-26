import { useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react';

export default function Toast({ message, type = 'success', onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const icons = {
    success: <CheckCircle className="text-green-500" size={24} />,
    error: <XCircle className="text-red-500" size={24} />,
    warning: <AlertCircle className="text-yellow-500" size={24} />
  };

  const bgColors = {
    success: 'bg-green-500/10 border-green-500/20',
    error: 'bg-red-500/10 border-red-500/20',
    warning: 'bg-yellow-500/10 border-yellow-500/20'
  };

  return (
    <div className="fixed top-20 right-4 z-[100] animate-slide-in-right max-w-md">
      <div className={`glass ${bgColors[type]} border rounded-lg p-4 shadow-2xl flex items-start gap-3`}>
        {icons[type]}
        <p className="flex-1 text-white">{message}</p>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white transition"
        >
          <X size={20} />
        </button>
      </div>
    </div>
  );
}
