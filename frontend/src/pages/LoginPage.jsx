import { Navigate, useNavigate } from 'react-router-dom';
import { useCallback } from 'react';
import { useAuth } from '@/auth/AuthContext';
import AuthForm from '@/components/auth/AuthForm';
import AuthLayout from '@/components/auth/AuthLayout';

export default function LoginPage() {
  const { user, login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const onGoogle = useCallback(
    async (idToken) => {
      await loginWithGoogle(idToken);
      navigate('/', { replace: true });
    },
    [loginWithGoogle, navigate]
  );

  if (user) {
    return <Navigate to="/" replace />;
  }

  return (
    <AuthLayout eyebrow="Welcome back" title="Log in to Clariq">
      <AuthForm
        mode="login"
        onSubmit={async ({ email, password }) => {
          login({ email, password });
          navigate('/', { replace: true });
        }}
        onGoogle={onGoogle}
      />
    </AuthLayout>
  );
}
