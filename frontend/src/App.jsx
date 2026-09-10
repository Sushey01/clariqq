import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from '@/auth/AuthContext';
import { ThemeProvider } from '@/theme/ThemeProvider';
import LoginPage from '@/pages/LoginPage';
import SignupPage from '@/pages/SignupPage';
import DemoPage from '@/pages/DemoPage';
import LandingPage from '@/pages/LandingPage';
import HubPage from '@/pages/HubPage';
import ChatPage from '@/pages/ChatPage';
import ProtectedRoute from '@/pages/ProtectedRoute';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/demo" element={<DemoPage />} />
            <Route
              path="/app"
              element={
                <ProtectedRoute>
                  <HubPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/app/chat"
              element={
                <ProtectedRoute>
                  <ChatPage />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
