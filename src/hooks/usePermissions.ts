import { useAuthStore } from '../store/auth.store';

export const usePermissions = () => {
  const user = useAuthStore((state) => state.user);

  // Verificar por ID de permiso
  const hasPermissionById = (permissionId: number): boolean => {
    if (!user || !user.permisos) return false;
    return user.permisos.some((p) => p.id_permiso === permissionId);
  };

  // Verificar por nombre de permiso (retrocompatibilidad)
  const hasPermission = (permissionName: string): boolean => {
    if (!user || !user.permisos) return false;
    return user.permisos.some((p) => p.nombre_permiso === permissionName);
  };

  // Verificar si tiene alguno de los IDs
  const hasAnyPermissionById = (permissionIds: number[]): boolean => {
    if (!user || !user.permisos) return false;
    return permissionIds.some((id) => user.permisos.some((p) => p.id_permiso === id));
  };

  // Verificar si tiene alguno de los nombres
  const hasAnyPermission = (permissionNames: string[]): boolean => {
    if (!user || !user.permisos) return false;
    return permissionNames.some((name) => user.permisos.some((p) => p.nombre_permiso === name));
  };

  // Verificar si tiene todos los IDs
  const hasAllPermissionsById = (permissionIds: number[]): boolean => {
    if (!user || !user.permisos) return false;
    return permissionIds.every((id) => user.permisos.some((p) => p.id_permiso === id));
  };

  // Verificar si tiene todos los nombres
  const hasAllPermissions = (permissionNames: string[]): boolean => {
    if (!user || !user.permisos) return false;
    return permissionNames.every((name) => user.permisos.some((p) => p.nombre_permiso === name));
  };

  // Obtener permisos por módulo
  const getPermissionsByModule = (moduleName: string) => {
    if (!user || !user.permisos) return [];
    return user.permisos.filter((p) => p.modulo === moduleName);
  };

  return {
    hasPermission,
    hasPermissionById,
    hasAnyPermission,
    hasAnyPermissionById,
    hasAllPermissions,
    hasAllPermissionsById,
    getPermissionsByModule,
    permissions: user?.permisos || [],
  };
};
