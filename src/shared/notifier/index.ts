import { ReactText } from 'react';
import { toast } from 'react-toastify';

export const showNotification: (
  message: string,
  type?: 'success' | 'error',
  timeout?: number,
) => ReactText
  = (message, type = 'success', timeout = 5000) => toast(
      message, { type, autoClose: timeout },
    );

export const dismissNotification = (toastId: ReactText) => toast.dismiss(toastId);
