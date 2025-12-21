import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react';

const ICONS = {
  success: CheckCircle,
  error: XCircle,
  info: Info,
  warning: AlertTriangle
};

const COLORS = {
  success: 'bg-green-50 border-green-500 text-green-800',
  error: 'bg-red-50 border-red-500 text-red-800',
  info: 'bg-blue-50 border-blue-500 text-blue-800',
  warning: 'bg-yellow-50 border-yellow-500 text-yellow-800'
};

const ICON_COLORS = {
  success: 'text-green-500',
  error: 'text-red-500',
  info: 'text-blue-500',
  warning: 'text-yellow-500'
};

export default function Toast({ message, type = 'info', onClose, duration = 3000 }) {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const Icon = ICONS[type];

  return (
    <div className={`fixed top-4 right-4 z-50 flex items-center gap-3 p-4 border-l-4 rounded-lg shadow-lg max-w-md animate-slide-in ${COLORS[type]}`}>
      <Icon className={ICON_COLORS[type]} size={24} />
      <p className="flex-1 font-medium">{message}</p>
      <button
        onClick={onClose}
        className="text-gray-500 hover:text-gray-700 transition-colors"
      >
        <X size={20} />
      </button>
    </div>
  );
}

// Composant pour gérer plusieurs toasts
export function ToastContainer({ toasts, removeToast }) {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
}

// Hook personnalisé pour gérer les toasts
export function useToast() {
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'info', duration = 3000) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type, duration }]);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  return { toasts, addToast, removeToast };
}
