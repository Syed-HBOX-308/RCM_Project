import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ClaimProvider } from './contexts/ClaimContext';
import './index.css';

// Loading fallback component
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-dark-600 to-dark-800">
    <div className="p-4 rounded-lg bg-dark-500 bg-opacity-80 backdrop-blur-sm shadow-lg">
      <div className="flex flex-col items-center">
        <div className="w-12 h-12 border-4 border-transparent border-t-accent-400 border-r-accent-400 rounded-full animate-spin"></div>
        <p className="mt-4 text-white/80">Loading...</p>
      </div>
    </div>
  </div>
);

// Lazy load components for better performance
const LoginPage = lazy(() => import('./pages/LoginPage'));
const SearchPage = lazy(() => import('./pages/SearchPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const FullProfilePage = lazy(() => import('./pages/FullProfilePage'));
const UserManagementPage = lazy(() => import('./pages/UserManagementPage'));
const HistoryPage = lazy(() => import('./pages/HistoryPage'));

function App() {
  return (
    <AuthProvider>
      <ClaimProvider>
        <BrowserRouter>
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/profile/:id" element={<ProfilePage />} />
              <Route path="/full-profile/:id" element={<FullProfilePage />} />
              <Route path="/user-management" element={<UserManagementPage />} />
              <Route path="/history" element={<HistoryPage />} />
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="*" element={<Navigate to="/search" replace />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </ClaimProvider>
    </AuthProvider>
  );
}

export default App;
