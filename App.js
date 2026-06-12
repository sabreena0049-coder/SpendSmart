import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import DashboardPage from './pages/DashboardPage';
import TransactionsPage from './pages/TransactionsPage';
import BudgetsPage from './pages/BudgetsPage';
import AnalyticsPage from './pages/AnalyticsPage';
import SettingsPage from './pages/SettingsPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

const PrivateRoute = ({ children }) => {
  const { isAuth, loading } = useAuth();
  if (loading) return <div className="spinner" style={{ marginTop: '6rem' }} />;
  return isAuth ? children : <Navigate to="/login" replace />;
};

const GuestRoute = ({ children }) => {
  const { isAuth, loading } = useAuth();
  if (loading) return <div className="spinner" style={{ marginTop: '6rem' }} />;
  return !isAuth ? children : <Navigate to="/" replace />;
};

const AppLayout = ({ children }) => (
  <div style={{ display: 'flex', minHeight: '100vh' }}>
    <Sidebar />
    <div style={{ flex: 1, marginLeft: 220, minHeight: '100vh', background: 'var(--bg)' }}>
      {children}
    </div>
  </div>
);

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
        <Route path="/register" element={<GuestRoute><RegisterPage /></GuestRoute>} />
        <Route path="/" element={<PrivateRoute><AppLayout><DashboardPage /></AppLayout></PrivateRoute>} />
        <Route path="/transactions" element={<PrivateRoute><AppLayout><TransactionsPage /></AppLayout></PrivateRoute>} />
        <Route path="/budgets" element={<PrivateRoute><AppLayout><BudgetsPage /></AppLayout></PrivateRoute>} />
        <Route path="/analytics" element={<PrivateRoute><AppLayout><AnalyticsPage /></AppLayout></PrivateRoute>} />
        <Route path="/settings" element={<PrivateRoute><AppLayout><SettingsPage /></AppLayout></PrivateRoute>} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}