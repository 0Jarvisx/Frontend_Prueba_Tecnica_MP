import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../store/auth.store';
import { usePermissions } from '../../hooks/usePermissions';

interface ProtectedRouteWithPermissionProps {
  children: React.ReactNode;
  permission?: string;
  permissionId?: number;
}

export const ProtectedRouteWithPermission = ({
  children,
  permission,
  permissionId
}: ProtectedRouteWithPermissionProps) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { hasPermission, hasPermissionById } = usePermissions();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Validar por ID (prioridad) o por nombre
  const hasAccess = permissionId
    ? hasPermissionById(permissionId)
    : permission
      ? hasPermission(permission)
      : true;

  if (!hasAccess) {
    return <Navigate to="/error/forbidden" replace />;
  }

  return <>{children}</>;
};
