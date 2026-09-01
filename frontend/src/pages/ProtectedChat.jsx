import { Navigate } from 'react-router-dom';
import { useAuth } from '@/auth/AuthContext';
import ChatPage from '@/pages/ChatPage';

export default function ProtectedChat() {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return <ChatPage />;
}
