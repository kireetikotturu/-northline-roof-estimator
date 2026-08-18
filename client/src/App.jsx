import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import EstimatorPage from './pages/EstimatorPage.jsx';
import AdminLogin from './pages/AdminLogin.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import { useAuth } from './hooks/useAuth.js';

function FullScreenLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center text-ink-soft dark:text-mist-soft">
      <Loader2 className="animate-spin" size={22} />
    </div>
  );
}

function ProtectedRoute({ auth, children }) {
  if (auth.status === 'checking') return <FullScreenLoader />;
  if (auth.status !== 'authed') return <Navigate to="/admin/login" replace />;
  return children;
}

export default function App() {
  const auth = useAuth();

  return (
    <Routes>
      <Route path="/" element={<EstimatorPage />} />
      <Route
        path="/admin/login"
        element={auth.status === 'authed' ? <Navigate to="/admin" replace /> : <AdminLogin auth={auth} />}
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute auth={auth}>
            <AdminDashboard auth={auth} />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
