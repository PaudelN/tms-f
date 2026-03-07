import { toast, type ExternalToast } from "vue-sonner";

const buildOptions = (description?: string): ExternalToast | undefined =>
  description ? { description } : undefined;

const mergeOptions = (
  description?: string,
  options?: ExternalToast,
): ExternalToast => ({
  ...buildOptions(description),
  ...options,
});

export const notify = {
  success(message: string, description?: string, options?: ExternalToast) {
    return toast.success(message, mergeOptions(description, options));
  },
  error(message: string, description?: string, options?: ExternalToast) {
    return toast.error(message, mergeOptions(description, options));
  },
  warning(message: string, description?: string, options?: ExternalToast) {
    return toast.warning(message, mergeOptions(description, options));
  },
  info(message: string, description?: string, options?: ExternalToast) {
    return toast.info(message, mergeOptions(description, options));
  },
  loading(message: string, description?: string, options?: ExternalToast) {
    return toast.loading(message, mergeOptions(description, options));
  },
  deletionSuccess(message: string, description?: string, options?: ExternalToast) {
    return toast.success(
      message,
      mergeOptions(description, { position: "bottom-right", ...options }),
    );
  },
  deletionError(message: string, description?: string, options?: ExternalToast) {
    return toast.error(
      message,
      mergeOptions(description, { position: "bottom-right", ...options }),
    );
  },
  dismiss(id?: string | number) {
    toast.dismiss(id);
  },
  promise: toast.promise,
};
