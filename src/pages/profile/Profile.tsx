import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useApi, useLazyApi } from '../../hooks/useApi';
import { useAuthStore } from '../../store/auth.store';
import { DashboardSidebar } from '../../components/layout/DashboardSidebar';

// Schemas de validación
const updateProfileSchema = z.object({
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  apellido: z.string().min(2, 'El apellido debe tener al menos 2 caracteres'),
  telefono: z.string().optional(),
});

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'La contraseña actual es requerida'),
    newPassword: z
      .string()
      .min(6, 'La nueva contraseña debe tener al menos 6 caracteres')
      .regex(/[A-Z]/, 'Debe contener al menos una mayúscula')
      .regex(/[0-9]/, 'Debe contener al menos un número'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  });

type UpdateProfileFormData = z.infer<typeof updateProfileSchema>;
type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

interface ProfileData {
  id: number;
  email: string;
  nombre: string;
  apellido: string;
  dpi: string | null;
  telefono: string | null;
  rol: string;
  permisos: string[];
}

const Profile = () => {
  const user = useAuthStore((state) => state.user);
  const setAuth = useAuthStore((state) => state.setAuth);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);

  // Obtener perfil
  const { data: profileData, loading: loadingProfile, execute: fetchProfile } = useApi<{ data: ProfileData }>(
    '/auth/profile',
    'GET',
    { showErrorMessage: true }
  );

  // Cargar el perfil al montar el componente
  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // Actualizar perfil
  const { loading: updatingProfile, execute: executeUpdateProfile } = useLazyApi({
    showSuccessMessage: true,
    showErrorMessage: true,
  });

  // Cambiar contraseña
  const { loading: changingPassword, execute: executeChangePassword } = useLazyApi({
    showSuccessMessage: true,
    showErrorMessage: true,
  });

  // Form para actualizar perfil
  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    formState: { errors: errorsProfile },
    reset: resetProfile,
  } = useForm<UpdateProfileFormData>({
    resolver: zodResolver(updateProfileSchema),
    values: {
      nombre: profileData?.data?.nombre || '',
      apellido: profileData?.data?.apellido || '',
      telefono: profileData?.data?.telefono || '',
    },
  });

  // Form para cambiar contraseña
  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    formState: { errors: errorsPassword },
    reset: resetPassword,
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const onSubmitProfile = async (data: UpdateProfileFormData) => {
    const response = await executeUpdateProfile('/auth/profile', 'PUT', data);

    if (response) {
      setIsEditingProfile(false);
      // Recargar los datos del perfil desde el backend
      await fetchProfile();
      // Actualizar el store de auth con los nuevos datos
      if (user) {
        setAuth(
          {
            ...user,
            nombre: data.nombre,
            apellido: data.apellido,
          },
          useAuthStore.getState().token!
        );
      }
    }
  };

  const onSubmitPassword = async (data: ChangePasswordFormData) => {
    const response = await executeChangePassword('/auth/change-password', 'POST', {
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
    });

    if (response) {
      setShowChangePassword(false);
      resetPassword();
    }
  };

  const profile = profileData?.data;

  // Obtener el rol del usuario (puede ser string directo o objeto)
  const userRole = typeof user?.rol === 'string' ? user.rol : user?.rol?.nombreRol || 'Usuario';

  if (loadingProfile) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <DashboardSidebar
          userName={`${user?.nombre} ${user?.apellido}`}
          userRole={userRole}
        />
        <main className="flex-1 lg:ml-64 transition-all duration-300">
          <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <DashboardSidebar
        userName={`${user?.nombre} ${user?.apellido}`}
        userRole={userRole}
      />

      {/* Main content */}
      <main className="flex-1 lg:ml-64 transition-all duration-300">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-20 shadow-sm">
          <div className="px-6 lg:px-8 py-6">
            <div className="flex flex-col gap-2">
              <h1 className="text-3xl font-bold text-gray-900">Mi Perfil</h1>
              <p className="text-gray-600">Gestiona tu información personal y seguridad</p>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-6 lg:p-8 space-y-6 max-w-5xl">

      {/* Información Personal */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">Información Personal</h2>
          {!isEditingProfile && (
            <button
              onClick={() => setIsEditingProfile(true)}
              className="btn-secondary"
            >
              Editar
            </button>
          )}
        </div>

        <div className="p-6">
          {!isEditingProfile ? (
            // Vista de solo lectura
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium text-gray-600">Nombre</label>
                <p className="mt-1 text-gray-900">{profile?.nombre}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Apellido</label>
                <p className="mt-1 text-gray-900">{profile?.apellido}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Email</label>
                <p className="mt-1 text-gray-900">{profile?.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">DPI</label>
                <p className="mt-1 text-gray-900">{profile?.dpi || 'No registrado'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Teléfono</label>
                <p className="mt-1 text-gray-900">{profile?.telefono || 'No registrado'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Rol</label>
                <p className="mt-1">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800">
                    {profile?.rol}
                  </span>
                </p>
              </div>
            </div>
          ) : (
            // Formulario de edición
            <form onSubmit={handleSubmitProfile(onSubmitProfile)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">
                    Nombre *
                  </label>
                  <input
                    {...registerProfile('nombre')}
                    type="text"
                    className={`input-field ${errorsProfile.nombre ? 'input-error' : ''}`}
                  />
                  {errorsProfile.nombre && (
                    <p className="mt-1 text-sm text-red-500">{errorsProfile.nombre.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">
                    Apellido *
                  </label>
                  <input
                    {...registerProfile('apellido')}
                    type="text"
                    className={`input-field ${errorsProfile.apellido ? 'input-error' : ''}`}
                  />
                  {errorsProfile.apellido && (
                    <p className="mt-1 text-sm text-red-500">{errorsProfile.apellido.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">
                    Teléfono
                  </label>
                  <input
                    {...registerProfile('telefono')}
                    type="tel"
                    className="input-field"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={updatingProfile}
                  className="btn-primary"
                >
                  {updatingProfile ? 'Guardando...' : 'Guardar Cambios'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditingProfile(false);
                    resetProfile();
                  }}
                  className="btn-secondary"
                >
                  Cancelar
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Seguridad */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Seguridad</h2>
        </div>

        <div className="p-6">
          {!showChangePassword ? (
            <div>
              <p className="text-gray-600 mb-4">
                Mantén tu cuenta segura actualizando tu contraseña regularmente.
              </p>
              <button
                onClick={() => setShowChangePassword(true)}
                className="btn-primary"
              >
                Cambiar Contraseña
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmitPassword(onSubmitPassword)} className="space-y-6 max-w-md">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  Contraseña Actual *
                </label>
                <input
                  {...registerPassword('currentPassword')}
                  type="password"
                  className={`input-field ${errorsPassword.currentPassword ? 'input-error' : ''}`}
                />
                {errorsPassword.currentPassword && (
                  <p className="mt-1 text-sm text-red-500">{errorsPassword.currentPassword.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  Nueva Contraseña *
                </label>
                <input
                  {...registerPassword('newPassword')}
                  type="password"
                  className={`input-field ${errorsPassword.newPassword ? 'input-error' : ''}`}
                />
                {errorsPassword.newPassword && (
                  <p className="mt-1 text-sm text-red-500">{errorsPassword.newPassword.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  Confirmar Nueva Contraseña *
                </label>
                <input
                  {...registerPassword('confirmPassword')}
                  type="password"
                  className={`input-field ${errorsPassword.confirmPassword ? 'input-error' : ''}`}
                />
                {errorsPassword.confirmPassword && (
                  <p className="mt-1 text-sm text-red-500">{errorsPassword.confirmPassword.message}</p>
                )}
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-xs font-medium text-gray-700 mb-2">
                  La contraseña debe contener:
                </p>
                <ul className="text-xs text-gray-600 space-y-1">
                  <li>• Mínimo 6 caracteres</li>
                  <li>• Al menos una letra mayúscula</li>
                  <li>• Al menos un número</li>
                </ul>
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={changingPassword}
                  className="btn-primary"
                >
                  {changingPassword ? 'Cambiando...' : 'Cambiar Contraseña'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowChangePassword(false);
                    resetPassword();
                  }}
                  className="btn-secondary"
                >
                  Cancelar
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

          {/* Permisos (solo vista) */}
          {profile?.permisos && profile.permisos.length > 0 && (
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-800">Permisos Asignados</h2>
              </div>
              <div className="p-6">
                <div className="flex flex-wrap gap-2">
                  {profile.permisos.map((permiso, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800"
                    >
                      {permiso}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Profile;
