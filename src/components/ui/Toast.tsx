import { create } from 'zustand';

interface ToastItem {
  id: number;
  message: string;
}

interface ToastState {
  toasts: ToastItem[];
  pushToast: (message: string) => void;
  removeToast: (id: number) => void;
}

let toastCounter = 1;

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  pushToast: (message) => {
    const id = toastCounter;
    toastCounter += 1;

    set((state) => ({
      toasts: [...state.toasts, { id, message }]
    }));

    window.setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((toast) => toast.id !== id)
      }));
    }, 3000);
  },
  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id)
    }))
}));

export default function Toast(): JSX.Element {
  const toasts = useToastStore((state) => state.toasts);

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[100] flex w-72 flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto border border-border-subtle bg-background-surface px-3 py-2 text-xs text-text-primary"
        >
          {toast.message}
        </div>
      ))}
    </div>
  );
}
