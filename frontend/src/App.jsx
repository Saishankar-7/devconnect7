import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import PageTransition from './components/ui/PageTransition';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import Discover from './pages/Discover';
import Network from './pages/Network';
import Referrals from './pages/Referrals';
import Profile from './pages/Profile';
import UserProfile from './pages/UserProfile';
import Chat from './pages/Chat';
import Notifications from './pages/Notifications';
import Settings from './pages/Settings';
import ResumeViewer from './pages/ResumeViewer';

function App() {
  return (
    <Router>
      <div className="app-container">
        <Navbar />
        <main className="main-content">
          <PageTransition>
            <Routes>
              {/* Public routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />

            {/* Protected routes — unauthenticated users are redirected to /login */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/discover"
              element={
                <ProtectedRoute>
                  <Discover />
                </ProtectedRoute>
              }
            />
            <Route
              path="/network"
              element={
                <ProtectedRoute>
                  <Network />
                </ProtectedRoute>
              }
            />
            <Route
              path="/referrals"
              element={
                <ProtectedRoute>
                  <Referrals />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile/:id"
              element={
                <ProtectedRoute>
                  <UserProfile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/chat"
              element={
                <ProtectedRoute>
                  <Chat />
                </ProtectedRoute>
              }
            />
            <Route
              path="/chat/:userId"
              element={
                <ProtectedRoute>
                  <Chat />
                </ProtectedRoute>
              }
            />
            <Route
              path="/notifications"
              element={
                <ProtectedRoute>
                  <Notifications />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/resume"
              element={
                <ProtectedRoute>
                  <ResumeViewer />
                </ProtectedRoute>
              }
            />

            {/* Fallback route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </PageTransition>
      </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
