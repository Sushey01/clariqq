import { useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { AuthProvider } from '@/auth/AuthContext';
import { ThemeProvider } from '@/theme/ThemeProvider';
import LoginPage from '@/pages/LoginPage';
import SignupPage from '@/pages/SignupPage';
import DemoPage from '@/pages/DemoPage';
import LandingPage from '@/pages/LandingPage';
import NebularHome from '@/nebular/NebularHome';
import NebularPreview from '@/nebular/NebularPreview';
import SubjectsPage from '@/pages/SubjectsPage';
import SubjectDetailPage from '@/pages/SubjectDetailPage';
import HowItWorksPage from '@/pages/HowItWorksPage';
import StoriesPage from '@/pages/StoriesPage';
import FaqPage from '@/pages/FaqPage';
import AboutPage from '@/pages/AboutPage';
import ForStudentsPage from '@/pages/ForStudentsPage';
import ForTeachersPage from '@/pages/ForTeachersPage';
import HubPage from '@/pages/HubPage';
import ChatPage from '@/pages/ChatPage';
import ProtectedRoute from '@/pages/ProtectedRoute';

function ScrollToTop() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) {
      const id = hash.slice(1);
      requestAnimationFrame(() => {
        document.getElementById(id)?.scrollIntoView();
      });
      return;
    }
    window.scrollTo(0, 0);
  }, [pathname, hash]);
  return null;
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
        <div data-lab="cinematic" className="min-h-screen bg-[var(--bg-canvas)] text-[var(--ink)]">
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<NebularHome />} />
            <Route path="/preview" element={<NebularPreview />} />
            <Route path="/classic" element={<LandingPage />} />
            <Route path="/subjects" element={<SubjectsPage />} />
            <Route path="/subjects/:slug" element={<SubjectDetailPage />} />
            <Route path="/how-it-works" element={<HowItWorksPage />} />
            <Route path="/stories" element={<StoriesPage />} />
            <Route path="/faq" element={<FaqPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/for-students" element={<ForStudentsPage />} />
            <Route path="/for-teachers" element={<ForTeachersPage />} />
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
        </div>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
