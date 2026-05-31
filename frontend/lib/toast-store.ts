export type Toast = {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
};

// Simple in-memory store for toasts
let toasts: Toast[] = [];
let listeners: Set<() => void> = new Set();
let nextId = 0;

const notifyListeners = () => {
  listeners.forEach(listener => listener());
};

const createToast = (message: string, type: Toast['type']) => {
  const id = String(nextId++);
  const toast: Toast = { id, message, type };
  toasts.push(toast);
  notifyListeners();

  // Auto-remove after 5 seconds
  setTimeout(() => {
    toasts = toasts.filter(t => t.id !== id);
    notifyListeners();
  }, 5000);

  return id;
};

// Toast store API
const toastStore = {
  success: (message: string) => createToast(message, 'success'),
  error: (message: string) => createToast(message, 'error'),
  info: (message: string) => createToast(message, 'info'),
  warning: (message: string) => createToast(message, 'warning'),
};

// Hook to use toast store
export function useToastStore() {
  // Return current toasts and methods
  return {
    toasts,
    removeToast: (id: string) => {
      toasts = toasts.filter(t => t.id !== id);
      notifyListeners();
    },
    ...toastStore,
  };
}

// Direct export for convenience
export const toast = toastStore;
