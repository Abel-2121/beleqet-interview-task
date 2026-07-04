'use client';

import { useState, useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  description?: string;
  duration?: number;
}

let toasts: Toast[] = [];
let listeners: ((toasts: Toast[]) => void)[] = [];

const notify = (listeners: ((toasts: Toast[]) => void)[]) => listeners.forEach(listener => listener(toasts));

export const toast = {
  success: (title: string, description?: string) => {
    const id = Math.random().toString(36).substr(2, 9);
    toasts = [...toasts, { id, type: 'success', title, description, duration: 4000 }];
    notify(listeners);
  },
  error: (title: string, description?: string) => {
    const id = Math.random().toString(36).substr(2, 9);
    toasts = [...toasts, { id, type: 'error', title, description, duration: 6000 }];
    notify(listeners);
  },
  info: (title: string, description?: string) => {
    const id = Math.random().toString(36).substr(2, 9);
    toasts = [...toasts, { id, type: 'info', title, description, duration: 4000 }];
    notify(listeners);
  },
  warning: (title: string, description?: string) => {
    const id = Math.random().toString(36).substr(2, 9);
    toasts = [...toasts, { id, type: 'warning', title, description, duration: 5000 }];
    notify(listeners);
  },
  dismiss: (id: string) => {
    toasts = toasts.filter(toast => toast.id !== id);
    notify(listeners);
  }
};

export function Toaster() {
  const [toastList, setToastList] = useState<Toast[]>([]);

  useEffect(() => {
    const listener = (newToasts: Toast[]) => setToastList(newToasts);
    listeners.push(listener);
    return () => {
      listeners = listeners.filter(l => l !== listener);
    };
  }, []);

  const removeToast = (id: string) => {
    toast.dismiss(id);
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toastList.map((item) => (
        <ToastItem
          key={item.id}
          toast={item}
          onRemove={() => removeToast(item.id)}
        />
      ))}
    </div>
  );
}

function ToastItem({ toast: item, onRemove }: { toast: Toast; onRemove: () => void }) {
  useEffect(() => {
    if (item.duration) {
      const timer = setTimeout(onRemove, item.duration);
      return () => clearTimeout(timer);
    }
  }, [item.duration, onRemove]);

  const getIcon = () => {
    switch (item.type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'info':
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getBgColor = () => {
    switch (item.type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'info':
        return 'bg-blue-50 border-blue-200';
    }
  };

  return (
    <div className={`
      max-w-sm w-full shadow-lg rounded-lg border p-4 flex items-start space-x-3
      animate-in slide-in-from-right-full duration-300
      ${getBgColor()}
    `}>
      {getIcon()}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900">
          {item.title}
        </p>
        {item.description && (
          <p className="text-sm text-gray-500 mt-1">
            {item.description}
          </p>
        )}
      </div>
      <button
        onClick={onRemove}
        className="flex-shrink-0 p-0.5 rounded-md text-gray-400 hover:text-gray-600"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}