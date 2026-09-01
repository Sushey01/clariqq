import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/auth/AuthContext';
import AuthForm from '@/components/auth/AuthForm';
import AuthLayout from '@/components/auth/AuthLayout';

export default function LoginPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();

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
      />
    </AuthLayout>
  );
}
