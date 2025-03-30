declare module 'vue-toastification' {
  import { App } from 'vue'
  
  export interface ToastOptions {
    position?: string
    timeout?: number
    closeOnClick?: boolean
    pauseOnHover?: boolean
    draggable?: boolean
    draggablePercent?: number
    showCloseButtonOnHover?: boolean
    hideProgressBar?: boolean
    closeButton?: string | boolean
    icon?: string | boolean
    rtl?: boolean
  }

  export function useToast(options?: ToastOptions): {
    success: (message: string, options?: ToastOptions) => void
    error: (message: string, options?: ToastOptions) => void
    info: (message: string, options?: ToastOptions) => void
    warning: (message: string, options?: ToastOptions) => void
  }

  export function createToastInterface(options?: ToastOptions): {
    install(app: App): void
  }

  const Toast: {
    install(app: App, options?: ToastOptions): void
  }

  export default Toast
}
