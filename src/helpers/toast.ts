import { toast } from "vue-sonner";

type ToastOptions = {
  description?: string;
};

const withDescription = (description?: string) =>
  description ? { description } : undefined;

export const notify = {
  success(message: string, description?: string) {
    toast.success(message, withDescription(description));
  },
  error(message: string, description?: string) {
    toast.error(message, withDescription(description));
  },
  warning(message: string, description?: string) {
    toast.warning(message, withDescription(description));
  },
  info(message: string, description?: string) {
    toast.info(message, withDescription(description));
  },
  loading(message: string, description?: string) {
    return toast.loading(message, withDescription(description));
  },
  dismiss(toastId?: string | number) {
    toast.dismiss(toastId);
  },
  message(message: string, options?: ToastOptions) {
    toast(message, options);
  },
};
