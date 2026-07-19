import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { hasPermission, hasRole, USER_ROLES } from '../../utils/authorization';

export default function RoleRoute({ roles, permission, children }) {
  const { auth, accessToken } = useAuth();
  const location = useLocation();

  if (!accessToken) return <Navigate to="/login" replace state={{ from: location }} />;

  const roleAllowed = !roles || roles.some((role) => hasRole(auth, role));
  const permissionAllowed = !permission || hasPermission(auth, permission);
  if (!roleAllowed || !permissionAllowed) return <Navigate to="/tickets" replace />;

  return children;
}

export function ManagerRoute({ children }) {
  return <RoleRoute roles={[USER_ROLES.TEAM_MANAGER]}>{children}</RoleRoute>;
}
