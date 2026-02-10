export interface ToastApi {
  success: (message: string) => void
  error: (message: string) => void
}

function log(prefix: string, message: string): void {
  // centralized placeholder until sonner is wired globally
  console.info(`${prefix} ${message}`)
}

export const toast: ToastApi = {
  success(message) {
    log('✅', message)
  },
  error(message) {
    log('❌', message)
  },
}
