import { useAuthStore } from '../store/auth.store';

export const usePermissions = () => {
  const user = useAuthStore((state) => state.user);

  const hasPermission = (permission: string): boolean => {
    if (!user || !user.permisos) return false;
    return user.permisos.includes(permission);
  };

  const hasAnyPermission = (permissions: string[]): boolean => {
    if (!user || !user.permisos) return false;
    return permissions.some((permission) => user.permisos.includes(permission));
  };

  const hasAllPermissions = (permissions: string[]): boolean => {
    if (!user || !user.permisos) return false;
    return permissions.every((permission) => user.permisos.includes(permission));
  };

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    permissions: user?.permisos || [],
  };
};
