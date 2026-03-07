import { toast } from "vue-sonner";

export const notify = {
  success(message: string, description?: string) {
    toast.success(message, description ? { description } : undefined);
  },
  error(message: string, description?: string) {
    toast.error(message, description ? { description } : undefined);
  },
  warning(message: string, description?: string) {
    toast.warning(message, description ? { description } : undefined);
  },
  info(message: string, description?: string) {
    toast.info(message, description ? { description } : undefined);
  },
  loading(message: string, description?: string) {
    return toast.loading(message, description ? { description } : undefined);
  },
  dismiss(toastId?: string | number) {
    toast.dismiss(toastId);
  },
};
