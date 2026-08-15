import { toast } from 'react-toastify';
import { ApiError } from './api/client';

export function notifySuccess(message: string): void {
  toast.success(message);
}

// Prefers the backend's own message (ApiError) so validation/permission errors
// read clearly, falling back to a generic message otherwise.
export function notifyError(error: unknown, fallback: string): void {
  toast.error(error instanceof ApiError ? error.message : fallback);
}
