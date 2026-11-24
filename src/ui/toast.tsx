import { useEffect, useSyncExternalStore } from 'react';

/** A short message at the bottom of the screen (e.g. "saved on this phone"), optionally with
 *  one action ("Hoàn tác") — then it stays longer so there is time to tap it. */
export interface ToastAction {
  label: string;
  onClick: () => void;
}
let current: { id: number; text: string; action?: ToastAction; ms: number } | null = null;
const listeners = new Set<() => void>();
let seq = 0;

export function showToast(text: string, action?: ToastAction, ms = action ? 10_000 : 5000) {
  current = { id: ++seq, text, action, ms };
  listeners.forEach((l) => l());
}

function hide(id: number) {
  if (current?.id !== id) return;
  current = null;
  listeners.forEach((l) => l());
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

export function Toaster() {
  const toast = useSyncExternalStore(subscribe, () => current);
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => hide(toast.id), toast.ms);
    return () => clearTimeout(timer);
  }, [toast]);
  if (!toast) return null;
  return (
    <div
      className={`toast${toast.action ? ' with-action' : ''}`}
      role="status"
      data-testid="toast"
      key={toast.id}
    >
      <span className="toast-text">{toast.text}</span>
      {toast.action && (
        <button
          className="toast-action"
          data-testid="toast-action"
          onClick={() => {
            hide(toast.id);
            toast.action!.onClick();
          }}
        >
          ↩️ {toast.action.label}
        </button>
      )}
    </div>
  );
}
