import { toast } from "vue-sonner";

type ToastOptions = {
  description?: string;
};

const toOptions = (description?: string): ToastOptions | undefined =>
  description ? { description } : undefined;

export const notify = {
  success(message: string, description?: string) {
    toast.success(message, toOptions(description));
  },

  error(message: string, description?: string) {
    toast.error(message, toOptions(description));
  },

  warning(message: string, description?: string) {
    toast.warning(message, toOptions(description));
  },

  info(message: string, description?: string) {
    toast.info(message, toOptions(description));
  },

  loading(message: string, description?: string) {
    return toast.loading(message, toOptions(description));
  },

  dismiss(id?: string | number) {
    toast.dismiss(id);
  },
};
