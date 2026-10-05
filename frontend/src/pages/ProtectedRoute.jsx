import { Navigate } from 'react-router-dom';
import { useAuth } from '@/auth/AuthContext';
import { homePathForRole, userRole } from '@/auth/roles';

export default function ProtectedRoute({ children, roles }) {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  const role = userRole(user);
  if (roles && !roles.includes(role)) {
    return <Navigate to={homePathForRole(role)} replace />;
  }
  return children;
}
