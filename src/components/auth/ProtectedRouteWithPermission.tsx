import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../store/auth.store';
import { usePermissions } from '../../hooks/usePermissions';

interface ProtectedRouteWithPermissionProps {
  children: React.ReactNode;
  permission: string;
}

export const ProtectedRouteWithPermission = ({
  children,
  permission
}: ProtectedRouteWithPermissionProps) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { hasPermission } = usePermissions();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!hasPermission(permission)) {
    return <Navigate to="/error/forbidden" replace />;
  }

  return <>{children}</>;
};
