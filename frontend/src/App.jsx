import { BrowserRouter, Navigate, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import OTPPage from './pages/OTPPage';
import LandingPage from './pages/LandingPage';
import ReportPage from './pages/ReportPage';
import DashboardPage from './pages/DashboardPage';
import CitizenDashboard from './pages/CitizenDashboard';
import AnalyticsPage from './pages/AnalyticsPage';
import LoadingScreen from './components/LoadingScreen';
import { useState, useEffect } from 'react';
import { isCitizen } from './services/auth';
import './index.css';

function AppRoutes({ toggleTheme, isLightMode }) {
  const location = useLocation();
  const hideNavbar = ['/login', '/register', '/verify-otp'].includes(location.pathname);

  return (
    <>
      {!hideNavbar && <Navbar toggleTheme={toggleTheme} isLightMode={isLightMode} />}
      <div className={hideNavbar ? '' : 'app-content'}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/verify-otp" element={<OTPPage />} />
          <Route path="/report" element={<ReportPage />} />
          <Route path="/intake" element={<Navigate to="/report" replace />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                {isCitizen() ? <CitizenDashboard /> : <DashboardPage />}
              </ProtectedRoute>
            }
          />
          <Route
            path="/analytics"
            element={
              <ProtectedRoute>
                <AnalyticsPage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </>
  );
}

function App() {
  const [loading, setLoading] = useState(true);
  const [isLightMode, setIsLightMode] = useState(false);

  useEffect(() => {
    if (isLightMode) {
      document.body.classList.add('light-mode');
    } else {
      document.body.classList.remove('light-mode');
    }
  }, [isLightMode]);

  const toggleTheme = () => setIsLightMode(!isLightMode);

  if (loading) {
    return <LoadingScreen onComplete={() => setLoading(false)} />;
  }

  return (
    <BrowserRouter>
      <AppRoutes toggleTheme={toggleTheme} isLightMode={isLightMode} />
    </BrowserRouter>
  );
}

export default App;
