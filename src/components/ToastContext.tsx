// Toast Context for managing toast notifications
/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useCallback, type ReactNode, type FC } from 'react';
import Toast, { type ToastProps } from './Toast';

interface ToastContextValue {
  showToast: (message: string, options?: Partial<ToastProps>) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export const useToast = (): ToastContextValue => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};

interface ToastProviderProps {
  children: ReactNode;
}

export const ToastProvider: FC<ToastProviderProps> = ({ children }) => {
  const [toasts, setToasts] = useState<Array<ToastProps & { id: string }>>([]);

  const showToast = useCallback((message: string, options?: Partial<ToastProps>) => {
    // Use crypto.randomUUID for better ID uniqueness
    const id = crypto.randomUUID();
    const newToast = {
      id,
      message,
      type: options?.type || 'success',
      duration: options?.duration || 4000,
      icon: options?.icon,
      onClose: () => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      },
    };
    setToasts((prev) => [...prev, newToast]);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toasts.map((toast) => (
        <Toast key={toast.id} {...toast} />
      ))}
    </ToastContext.Provider>
  );
};
