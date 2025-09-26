import { toast as sonnerToast } from "sonner";

// Re-export Sonner toast functions for consistency
export const toast = {
  success: (message: string, options?: any) => sonnerToast.success(message, options),
  error: (message: string, options?: any) => sonnerToast.error(message, options),
  info: (message: string, options?: any) => sonnerToast.info(message, options),
  warning: (message: string, options?: any) => sonnerToast.warning(message, options),
  promise: sonnerToast.promise,
  dismiss: sonnerToast.dismiss,
  loading: (message: string, options?: any) => sonnerToast.loading(message, options),
};

// Hook for accessing toast context (if needed)
export { toast as useToast } from "sonner";