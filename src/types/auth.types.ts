export interface LoginCredentials {
  email: string;
  password: string;
}

export interface Usuario {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  dpi?: string;
  telefono?: string;
  activo?: boolean;
  idRol?: number;
  rol:
    | string
    | {
        id: number;
        nombreRol: string;
        descripcion?: string;
      };
  permisos: string[];
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    user: Usuario;
    requiereCambioPassword: boolean;
  };
}

export interface ApiError {
  success: boolean;
  message: string;
  errors?: Record<string, string[]>;
}
