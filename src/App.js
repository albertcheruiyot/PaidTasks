// src/App.js - Fixed version

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
// We're not using NotificationContext anymore to avoid circular dependency

// Import CSS
import './styles/global.css';

// Layout components
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import GlobalNotification from './components/GlobalNotification';

// Page components
import LandingPage from './pages/landing/LandingPage';
import LoginPage from './pages/auth/Login';
import RegisterPage from './pages/auth/Register';
import ForgotPasswordPage from './pages/auth/ForgotPassword';
import DashboardPage from './pages/dashboard/Dashboard';
import VideoTasksPage from './pages/tasks/video/VideoTasks';
import SurveyTasksPage from './pages/tasks/survey/SurveyTasks';
import ReferralPage from './pages/referral/Referral';
import WalletPage from './pages/wallet/Wallet';
import ProfilePage from './pages/profile/Profile';
import NotFoundPage from './pages/NotFoundPage';

// Auth Guard component for protected routes
const ProtectedRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();
  
  if (loading) {
    return <div className="loading-container">Loading...</div>;
  }
  
  if (!currentUser) {
    return <Navigate to="/login" />;
  }
  
  return <>{children}</>;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app-container">
          <Header />
          {/* Render global notification component */}
          <GlobalNotification />
          <main>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              
              {/* Protected routes */}
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/tasks/videos" 
                element={
                  <ProtectedRoute>
                    <VideoTasksPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/tasks/surveys" 
                element={
                  <ProtectedRoute>
                    <SurveyTasksPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/referrals" 
                element={
                  <ProtectedRoute>
                    <ReferralPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/wallet" 
                element={
                  <ProtectedRoute>
                    <WalletPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                } 
              />
              
              {/* 404 route */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;