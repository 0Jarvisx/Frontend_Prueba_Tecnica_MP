import { useState, useCallback } from 'react';
import axiosInstance from '../config/axios.config';
import type { AxiosError, AxiosRequestConfig } from 'axios';
import type { RequestConfig } from '../types/api.types';
import type { ApiError } from '../types/auth.types';

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface UseApiReturn<T> extends UseApiState<T> {
  execute: (config?: AxiosRequestConfig) => Promise<T | null>;
  reset: () => void;
}

// Sistema simple de notificaciones (toast)
const showToast = (message: string, type: 'success' | 'error') => {
  const toast = document.createElement('div');
  toast.className = `fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg text-white font-medium transform transition-all duration-300 ${
    type === 'success' ? 'bg-green-500' : 'bg-red-500'
  }`;
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('opacity-0', 'translate-x-full');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
};

export function useApi<T = unknown>(
  url: string,
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' = 'GET',
  requestConfig: RequestConfig = {}
): UseApiReturn<T> {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const { showErrorMessage = true, showSuccessMessage = false } = requestConfig;

  const execute = useCallback(
    async (config?: AxiosRequestConfig): Promise<T | null> => {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        const response = await axiosInstance.request<T>({
          url,
          method,
          ...config,
        });

        setState({
          data: response.data,
          loading: false,
          error: null,
        });

        if (showSuccessMessage && response.data && typeof response.data === 'object' && 'message' in response.data) {
          showToast((response.data as { message: string }).message, 'success');
        }

        return response.data;
      } catch (err) {
        const axiosError = err as AxiosError<ApiError>;
        const errorMessage = axiosError.response?.data?.message || axiosError.message || 'Error en la solicitud';

        setState({
          data: null,
          loading: false,
          error: errorMessage,
        });

        if (showErrorMessage) {
          showToast(errorMessage, 'error');
        }

        return null;
      }
    },
    [url, method, showErrorMessage, showSuccessMessage]
  );

  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
    });
  }, []);

  return {
    ...state,
    execute,
    reset,
  };
}

// Hook simplificado para peticiones lazy
export function useLazyApi<T = unknown, D = unknown>(
  requestConfig: RequestConfig = {}
) {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const { showErrorMessage = true, showSuccessMessage = false } = requestConfig;

  const execute = useCallback(
    async (
      url: string,
      method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' = 'GET',
      data?: D,
      config?: AxiosRequestConfig
    ): Promise<T | null> => {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        const response = await axiosInstance.request<T>({
          url,
          method,
          data,
          ...config,
        });

        setState({
          data: response.data,
          loading: false,
          error: null,
        });

        if (showSuccessMessage && response.data && typeof response.data === 'object' && 'message' in response.data) {
          showToast((response.data as { message: string }).message, 'success');
        }

        return response.data;
      } catch (err) {
        const axiosError = err as AxiosError<ApiError>;
        const errorMessage = axiosError.response?.data?.message || axiosError.message || 'Error en la solicitud';

        setState({
          data: null,
          loading: false,
          error: errorMessage,
        });

        if (showErrorMessage) {
          showToast(errorMessage, 'error');
        }

        return null;
      }
    },
    [showErrorMessage, showSuccessMessage]
  );

  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
    });
  }, []);

  return {
    ...state,
    execute,
    reset,
  };
}

export default useApi;
