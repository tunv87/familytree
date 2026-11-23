import { useEffect, useSyncExternalStore } from 'react';

/** A short message at the bottom of the screen (e.g. "saved on this phone"). */
let current: { id: number; text: string } | null = null;
const listeners = new Set<() => void>();
let seq = 0;

export function showToast(text: string) {
  current = { id: ++seq, text };
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
    const timer = setTimeout(() => {
      if (current?.id === toast.id) {
        current = null;
        listeners.forEach((l) => l());
      }
    }, 5000);
    return () => clearTimeout(timer);
  }, [toast]);
  if (!toast) return null;
  return (
    <div className="toast" role="status" data-testid="toast" key={toast.id}>
      {toast.text}
    </div>
  );
}
