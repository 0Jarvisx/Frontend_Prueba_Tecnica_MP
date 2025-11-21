import axios from 'axios';
import { useAuthStore } from '../store/auth.store';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor para agregar el token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor para manejar errores globales
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const isLoginPage = window.location.pathname === '/login' || window.location.pathname === '/';
    const isLoginRequest = error.config?.url?.includes('/auth/login');
    const isErrorPage = window.location.pathname.startsWith('/error/');

    // No redirigir si ya estamos en login, es un intento de login, o ya estamos en una página de error
    if (isLoginPage || isLoginRequest || isErrorPage) {
      return Promise.reject(error);
    }

    const status = error.response?.status;

    if (status === 401) {
      // 401: No autenticado o sesión expirada
      useAuthStore.getState().logout();
      window.location.href = '/error/unauthorized';
    } else if (status === 403) {
      // 403: Autenticado pero sin permisos
      window.location.href = '/error/forbidden';
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
