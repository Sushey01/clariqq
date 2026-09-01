import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/auth/AuthContext';
import AuthForm from '@/components/auth/AuthForm';
import AuthLayout from '@/components/auth/AuthLayout';

export default function SignupPage() {
  const { user, signup } = useAuth();
  const navigate = useNavigate();

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
      />
    </AuthLayout>
  );
}
