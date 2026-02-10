import { toast } from 'vue-sonner'

export const notify = {
  success: (message: string) => toast.success(message),
  error: (message: string) => toast.error(message),
}
