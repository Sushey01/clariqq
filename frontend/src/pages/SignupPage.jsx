import { Navigate, useNavigate } from 'react-router-dom';
import { useCallback } from 'react';
import { useAuth } from '@/auth/AuthContext';
import { homePathForRole, userRole } from '@/auth/roles';
import AuthForm from '@/components/auth/AuthForm';
import AuthLayout from '@/components/auth/AuthLayout';

export default function SignupPage() {
  const { user, signup, loginWithGoogle, loginDemo } = useAuth();
  const navigate = useNavigate();

  const goHome = useCallback(
    (session) => {
      navigate(homePathForRole(userRole(session)), { replace: true });
    },
    [navigate]
  );

  const onGoogle = useCallback(
    async (idToken) => {
      const session = await loginWithGoogle(idToken);
      goHome(session);
    },
    [loginWithGoogle, goHome]
  );

  if (user) {
    return <Navigate to={homePathForRole(userRole(user))} replace />;
  }

  return (
    <AuthLayout eyebrow="Get started" title="Create your student account">
      <AuthForm
        mode="signup"
        onSubmit={async ({ name, email, password }) => {
          const session = await signup({ name, email, password });
          goHome(session);
        }}
        onGoogle={onGoogle}
        onDemo={async (role) => {
          const session = await loginDemo(role);
          goHome(session);
        }}
      />
    </AuthLayout>
  );
}
