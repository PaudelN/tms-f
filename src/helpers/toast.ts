import { toast, type ExternalToast } from "vue-sonner";

const defaultOptions: ExternalToast = {
  position: "top-right",
};

const deleteOptions: ExternalToast = {
  position: "bottom-right",
};

const buildOptions = (
  description?: string,
  options?: ExternalToast,
): ExternalToast => ({
  ...defaultOptions,
  ...(description ? { description } : {}),
  ...options,
});

export const notify = {
  success(message: string, description?: string, options?: ExternalToast) {
    return toast.success(message, buildOptions(description, options));
  },
  error(message: string, description?: string, options?: ExternalToast) {
    return toast.error(message, buildOptions(description, options));
  },
  warning(message: string, description?: string, options?: ExternalToast) {
    return toast.warning(message, buildOptions(description, options));
  },
  info(message: string, description?: string, options?: ExternalToast) {
    return toast.info(message, buildOptions(description, options));
  },
  loading(message: string, description?: string, options?: ExternalToast) {
    return toast.loading(message, buildOptions(description, options));
  },
  deleteSuccess(message: string, description?: string, options?: ExternalToast) {
    return toast.success(message, buildOptions(description, { ...deleteOptions, ...options }));
  },
  deleteError(message: string, description?: string, options?: ExternalToast) {
    return toast.error(message, buildOptions(description, { ...deleteOptions, ...options }));
  },
  dismiss(id?: string | number) {
    toast.dismiss(id);
  },
  promise: toast.promise,
};
