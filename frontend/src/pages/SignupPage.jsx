import { Navigate, useNavigate } from 'react-router-dom';
import { useCallback } from 'react';
import { useAuth } from '@/auth/AuthContext';
import AuthForm from '@/components/auth/AuthForm';
import AuthLayout from '@/components/auth/AuthLayout';

export default function SignupPage() {
  const { user, signup, loginWithGoogle } = useAuth();
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
    <AuthLayout eyebrow="Get started" title="Create your student account">
      <AuthForm
        mode="signup"
        onSubmit={async ({ name, email, password }) => {
          signup({ name, email, password });
          navigate('/', { replace: true });
        }}
        onGoogle={onGoogle}
      />
    </AuthLayout>
  );
}
