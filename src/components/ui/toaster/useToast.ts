import { reactive } from "vue";

export type ToastVariant = "default" | "success" | "warning" | "destructive";

export type ToastOptions = {
  title: string;
  description?: string;
  duration?: number;
  variant?: ToastVariant;
};

type ToastItem = ToastOptions & {
  id: number;
};

const toasts = reactive<ToastItem[]>([]);
let toastId = 0;

function removeToast(id: number) {
  const index = toasts.findIndex((toast) => toast.id === id);
  if (index !== -1) {
    toasts.splice(index, 1);
  }
}

function pushToast(options: ToastOptions) {
  const id = toastId++;
  const duration = options.duration ?? 4000;
  const toast: ToastItem = {
    id,
    title: options.title,
    description: options.description,
    duration,
    variant: options.variant ?? "default",
  };

  toasts.push(toast);

  if (duration > 0) {
    window.setTimeout(() => removeToast(id), duration);
  }

  return id;
}

export function useToast() {
  return {
    toasts,
    pushToast,
    removeToast,
  };
}
