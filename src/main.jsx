// ============================================
// main.jsx - React Application Entry Point
// ============================================
// Initializes React app with providers and renders root.
// Providers set up: GoogleOAuth, Router, Auth, Toast notifications
// ============================================

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { Toaster } from 'react-hot-toast';
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import './index.css';

// Get Google OAuth client ID from environment variables
const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

/**
 * React application root
 * Wrapped in multiple providers for:
 * - React.StrictMode: Enables additional dev warnings
 * - GoogleOAuthProvider: Google authentication
 * - BrowserRouter: Client-side routing
 * - AuthProvider: Auth state management
 * - Toaster: Toast notifications
 */
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* Google OAuth configuration */}
    <GoogleOAuthProvider clientId={googleClientId}>
      {/* Client-side routing provider */}
      <BrowserRouter>
        {/* Authentication context provider */}
        <AuthProvider>
          {/* Main app component */}
          <App />
          {/* Toast notification system
              position: top-right corner
              duration: 3000ms (3 seconds)
          */}
          <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
        </AuthProvider>
      </BrowserRouter>
    </GoogleOAuthProvider>
  </React.StrictMode>
);
