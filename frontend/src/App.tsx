import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
// Removed Supabase

// Components
import { Navbar } from './components/Navbar';
import { Landing } from './components/Landing';
import { Login } from './components/Login';
import { Signup } from './components/Signup';
import { Dashboard } from './components/Dashboard';
import { MedicineList } from './components/MedicineList';
import { MedicineDetail } from './components/MedicineDetail';
import { AddMedicine } from './components/AddMedicine';
import { Transactions } from './components/Transactions';
import { EditMedicine } from './components/EditMedicine';
import { Profile } from './components/Profile';
import { Notifications } from './components/Notifications';
import { LoadingSpinner } from './components/LoadingSpinner';

// Context
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';

// No Supabase client; using custom backend with JWT

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Router>
        <Navbar />
        <main className="pt-16">
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
            <Route path="/signup" element={user ? <Navigate to="/dashboard" /> : <Signup />} />
            
            {/* Protected routes */}
            <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/login" />} />
            <Route path="/medicines" element={user ? <MedicineList /> : <Navigate to="/login" />} />
            <Route path="/medicines/:id" element={user ? <MedicineDetail /> : <Navigate to="/login" />} />
            <Route path="/edit-medicine/:id" element={user ? <EditMedicine /> : <Navigate to="/login" />} />
            <Route path="/add-medicine" element={user ? <AddMedicine /> : <Navigate to="/login" />} />
            <Route path="/transactions" element={user ? <Transactions /> : <Navigate to="/login" />} />
            
            <Route path="/profile" element={user ? <Profile /> : <Navigate to="/login" />} />
            <Route path="/notifications" element={user ? <Notifications /> : <Navigate to="/login" />} />
            
            {/* Catch-all route for unmatched paths */}
            <Route path="*" element={user ? <Navigate to="/dashboard" replace /> : <Navigate to="/" replace />} />
          </Routes>
        </main>
      </Router>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <AppContent />
      </NotificationProvider>
    </AuthProvider>
  );
}