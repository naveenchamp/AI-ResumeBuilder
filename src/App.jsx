// ============================================
// App.jsx - Main Application Router
// ============================================
// Defines all route paths and their components.
// Implements access control with ProtectedRoute and PublicRoute.
// Routes: Landing, Login, Home, Builder, Dashboard, Templates, Versions
// ============================================

import './App.css';
import { useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext } from './context/AuthContext.jsx';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import DashboardPage from './pages/DashboardPage';
import BuilderPage from './pages/BuilderPage';
import VersionsPage from './pages/VersionsPage';
import TemplatesPage from './pages/TemplatesPage';
import ProtectedRoute from './components/ProtectedRoute';

/**
 * PublicRoute component
 * Routes accessible only to logged-out users
 * If user is logged in, redirects to /home
 * 
 * @param {Object} props - { children: component to render }
 * @returns {JSX} Either renders children, redirect, or loading state
 */
function PublicRoute({ children }) {
  const { user, loading } = useContext(AuthContext);

  // Show loading spinner while checking auth status
  if (loading) {
    return (
      <div className="page-bg flex-center min-h-screen">
        <div className="flex-col items-center gap-sm">
          <div className="spinner" />
          <p className="text-muted">Loading...</p>
        </div>
      </div>
    );
  }

  // If user is logged in, redirect to home
  if (user) return <Navigate to="/home" />;

  // Otherwise render the public page
  return children;
}

/**
 * App component - Main router
 * Defines all application routes and access levels
 */
function App() {
  return (
    <Routes>
      {/* ========== PUBLIC ROUTES ========== */}

      {/* Landing page - entry point for new users */}
      <Route
        path="/"
        element={
          <PublicRoute>
            <LandingPage />
          </PublicRoute>
        }
      />

      {/* Login page - email/password and Google OAuth */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />

      {/* ========== PROTECTED ROUTES ========== */}

      {/* Home/Dashboard - user's resume list and overview */}
      <Route
        path="/home"
        element={
          <ProtectedRoute>
            <HomePage />
          </ProtectedRoute>
        }
      />

      {/* Browse/select resume templates */}
      <Route
        path="/templates"
        element={
          <ProtectedRoute>
            <TemplatesPage />
          </ProtectedRoute>
        }
      />

      {/* Analytics dashboard - resume stats and ATS insights */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />

      {/* Resume builder - main editing interface
          :id = resume ID passed as URL parameter
      */}
      <Route
        path="/builder/:id"
        element={
          <ProtectedRoute>
            <BuilderPage />
          </ProtectedRoute>
        }
      />

      {/* Version history - view and restore previous resume versions
          :id = resume ID
      */}
      <Route
        path="/versions/:id"
        element={
          <ProtectedRoute>
            <VersionsPage />
          </ProtectedRoute>
        }
      />

      {/* ========== CATCH-ALL ========== */}

      {/* Any unknown routes redirect to landing page */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;
