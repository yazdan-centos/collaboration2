import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { hasPermission, hasRole, USER_ROLES } from '../../utils/authorization';

/**
 * RoleRoute Component
 * 
 * Keywords:
 * - Navigate: React Router component to redirect users to different routes
 * - useLocation: React Router hook to access current URL location
 * - useAuth: Custom hook to access authentication state and tokens
 * - hasPermission: Utility function to check if user has specific permission
 * - hasRole: Utility function to check if user has specific role
 * - accessToken: JWT token for authenticated API requests
 * 
 * Workflow:
 * ┌─────────────────────────────────────────────┐
 * │         RoleRoute Component Renders         │
 * └────────────────┬────────────────────────────┘
 *                  │
 *                  ▼
 *      ┌───────────────────────────┐
 *      │ Is accessToken present?   │
 *      └───────┬─────────────┬─────┘
 *              │ NO          │ YES
 *              ▼             ▼
 *      Navigate to    Check roles and
 *       /login page   permissions
 *                          │
 *                ┌─────────┴─────────┐
 *                │                   │
 *                ▼                   ▼
 *          ✗ Denied?           ✓ Allowed?
 *          (Navigate to         │
 *          /tickets page)       ▼
 *                          Render
 *                          children
 */

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
