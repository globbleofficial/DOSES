import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { WipeProvider } from './context/WipeContext';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';

function AppContent() {
  const { user } = useAuth();
  return user ? <DashboardPage /> : <LoginPage />;
}

export default function App() {
  return (
    <AuthProvider>
      <WipeProvider>
        <AppContent />
      </WipeProvider>
    </AuthProvider>
  );
}
