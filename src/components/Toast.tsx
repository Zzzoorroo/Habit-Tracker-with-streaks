// Toast notification component for badge unlocks and other notifications
import { type FC, useEffect } from 'react';

export interface ToastProps {
  message: string;
  type?: 'success' | 'info' | 'warning' | 'error';
  duration?: number;
  onClose: () => void;
  icon?: string;
}

const Toast: FC<ToastProps> = ({
  message,
  type = 'success',
  duration = 4000,
  onClose,
  icon,
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const typeStyles = {
    success: 'bg-green-600 dark:bg-green-700',
    info: 'bg-blue-600 dark:bg-blue-700',
    warning: 'bg-yellow-600 dark:bg-yellow-700',
    error: 'bg-red-600 dark:bg-red-700',
  };

  return (
    <div
      role="alert"
      aria-live="polite"
      className={`fixed bottom-4 right-4 z-50 flex items-center gap-3 px-6 py-4 rounded-lg shadow-lg text-white ${typeStyles[type]} animate-slide-up max-w-md`}
      style={{
        animation: 'slideUp 0.3s ease-out',
      }}
    >
      {icon && <span className="text-2xl flex-shrink-0">{icon}</span>}
      <p className="flex-1 font-medium">{message}</p>
      <button
        onClick={onClose}
        className="ml-2 hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-green-600 rounded"
        aria-label="Close notification"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>
  );
};

export default Toast;
