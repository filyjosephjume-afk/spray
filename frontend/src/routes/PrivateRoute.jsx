import { Navigate, useLocation } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

// Protège une page : il faut être connecté, et avoir un des rôles demandés si "roles" est fourni.
export default function PrivateRoute({ children, roles }) {
  const { user, hasAnyRole } = useAuth();
  const location = useLocation();

  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;
  if (roles && !hasAnyRole(roles)) return <Navigate to="/" replace />;
  return children;
}
