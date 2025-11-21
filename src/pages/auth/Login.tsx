import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '../../store/auth.store';
import { useLazyApi } from '../../hooks/useApi';
import type { AuthResponse, LoginCredentials } from '../../types/auth.types';
import { CambiarPasswordModal } from '../../components/CambiarPasswordModal';

const loginSchema = z.object({
  email: z.string().email('Ingrese un email válido'),
  password: z.string().min(1, 'La contraseña es requerida'),
});

type LoginFormData = z.infer<typeof loginSchema>;

const Login = () => {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [mostrarCambioPassword, setMostrarCambioPassword] = useState(false);
  const { loading, execute } = useLazyApi<AuthResponse, LoginCredentials>({
    showSuccessMessage: true,
    showErrorMessage: true,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    const response = await execute('/auth/login', 'POST', data);

    console.log('Login response:', response);

    if (response?.success && response.data) {
      setAuth(response.data.user, response.data.token);

      console.log('requiereCambioPassword:', response.data.requiereCambioPassword);

      // Verificar si requiere cambio de contraseña
      if (response.data.requiereCambioPassword) {
        console.log('Mostrando modal de cambio de contraseña');
        setMostrarCambioPassword(true);
      } else {
        console.log('Navegando al dashboard');
        navigate('/dashboard');
      }
    }
  };

  const handlePasswordChanged = () => {
    setMostrarCambioPassword(false);
    navigate('/dashboard');
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-gray-100">
      <div className="flex w-full max-w-5xl overflow-hidden bg-white shadow-2xl rounded-2xl">
        {/* Panel izquierdo - Formulario */}
        <div className="flex items-center justify-center flex-1 p-8 md:p-12">
          <div className="w-full max-w-md">
            {/* Header */}
            <div className="mb-10 text-center">
              <img
                src="/Logo_MP.png"
                alt="Logo Ministerio Público"
                className="object-contain mx-auto w-46 h-46"
              />
              <h1 className="mb-2 text-3xl font-semibold text-gray-800">
                Bienvenido
              </h1>
              <p className="text-gray-500">
                Sistema de Control de Indicios - DICRI
              </p>
            </div>

            {/* Formulario */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <label
                  htmlFor="email"
                  className="block mb-2 text-sm font-medium text-gray-600"
                >
                  Correo electrónico
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                    <svg
                      className="w-5 h-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                  <input
                    {...register('email')}
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="correo@mp.gob.gt"
                    className={`input-field pl-12 ${errors.email ? 'input-error' : ''}`}
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block mb-2 text-sm font-medium text-gray-600"
                >
                  Contraseña
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                    <svg
                      className="w-5 h-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                  </div>
                  <input
                    {...register('password')}
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    placeholder="Ingrese su contraseña"
                    className={`input-field pl-12 ${errors.password ? 'input-error' : ''}`}
                  />
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex items-center justify-center w-full btn-primary"
              >
                {loading ? (
                  <svg
                    className="w-5 h-5 text-white animate-spin"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                ) : (
                  'Iniciar Sesión'
                )}
              </button>
            </form>

            {/* Footer */}
            <div className="mt-8 text-center">
              <p className="text-sm text-gray-500">
                ¿Olvidaste tu contraseña?{' '}
                <button
                  type="button"
                  onClick={() => navigate('/request-reset')}
                  className="font-medium text-primary-500 hover:text-primary-600"
                >
                  Recupérala aquí
                </button>
              </p>
            </div>
          </div>
        </div>

        {/* Panel derecho - Imagen/Branding */}
        <div className="relative flex-1 hidden overflow-hidden lg:flex bg-gradient-to-br from-primary-700 via-primary-600 to-primary-800">
          {/* Patrón decorativo de fondo */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 rounded-full w-96 h-96 bg-primary-400 blur-3xl" />
            <div className="absolute bottom-0 right-0 rounded-full w-96 h-96 bg-primary-900 blur-3xl" />
          </div>

          {/* Grid pattern sutil */}
          <div
            className="absolute inset-0 opacity-5"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23ffffff' fillOpacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />

          {/* Contenido */}
          <div className="relative z-10 flex flex-col items-start justify-between w-full p-12 text-white">
          
            {/* Contenido central */}
            <div className="max-w-lg space-y-6">
              <h2 className="text-4xl font-bold leading-tight text-balance">Ministerio Público de Guatemala</h2>
              <div className="w-16 h-1 rounded-full bg-white/80" />
              <p className="text-xl font-medium text-white/95">Dirección de Investigación Criminalística</p>
              <p className="text-base leading-relaxed text-white/80">
                Sistema integral para el registro, control y procesamiento de indicios recolectados en escena,
                facilitando la investigación criminalística y el análisis de evidencia material, digital y de cualquier índole
                relacionada con actos delictivos.
              </p>

              {/* Features */}
              <div className="pt-4 space-y-3">
                {[
                  "Registro y control de indicios en escena",
                  "Cadena de custodia automatizada",
                  "Análisis criminalístico eficiente",
                  "Reportes y trazabilidad completa"
                ].map(
                  (feature, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="flex items-center justify-center flex-shrink-0 w-5 h-5 rounded-full bg-white/20">
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="text-sm text-white/90">{feature}</span>
                    </div>
                  ),
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de cambio de contraseña obligatorio */}
      {mostrarCambioPassword && (
        <CambiarPasswordModal onSuccess={handlePasswordChanged} />
      )}
    </div>
  );
};

export default Login;
