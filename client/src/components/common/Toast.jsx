import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { CheckCircle2, Info, X, XCircle } from 'lucide-react';

const ToastContext = createContext(null);

const ICONS = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
};

let nextId = 1;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timers = useRef(new Map());

  const dismiss = useCallback((id) => {
    setToasts((current) =>
      current.map((toast) => (toast.id === id ? { ...toast, leaving: true } : toast)),
    );
    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
      timers.current.delete(id);
    }, 280);
  }, []);

  const push = useCallback(
    (type, title, message) => {
      const id = nextId++;
      setToasts((current) => [...current.slice(-4), { id, type, title, message }]);
      timers.current.set(id, window.setTimeout(() => dismiss(id), 4200));
      return id;
    },
    [dismiss],
  );

  const api = useMemo(
    () => ({
      success: (title, message) => push('success', title, message),
      error: (title, message) => push('error', title, message),
      info: (title, message) => push('info', title, message),
    }),
    [push],
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <Toaster toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used inside a ToastProvider.');
  return context;
}

function Toaster({ toasts, onDismiss }) {
  if (toasts.length === 0) return null;

  return (
    <div className="toast-viewport" aria-live="polite" role="region" aria-label="Notifications">
      {toasts.map((toast) => {
        const Icon = ICONS[toast.type] || Info;
        return (
          <div key={toast.id} className={`toast toast--${toast.type}${toast.leaving ? ' is-leaving' : ''}`} role="status">
            <span className="toast-icon" aria-hidden="true">
              <Icon size={16} />
            </span>
            <div className="toast-body">
              <p className="toast-title">{toast.title}</p>
              {toast.message && <p className="toast-message">{toast.message}</p>}
            </div>
            <button
              type="button"
              className="toast-close"
              aria-label="Dismiss notification"
              onClick={() => onDismiss(toast.id)}
            >
              <X size={15} />
            </button>
          </div>
        );
      })}
    </div>
  );
}