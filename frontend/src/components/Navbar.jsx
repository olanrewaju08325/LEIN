import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Activity, LayoutDashboard, LineChart, LogOut, Moon, ShieldAlert, Sun } from 'lucide-react';
import { getUser, isAuthenticated, logout, getToken } from '../services/auth';

export default function Navbar({ toggleTheme, isLightMode }) {
  const [time, setTime] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const user = getUser();
  const authed = isAuthenticated();

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' WAT');
    };
    updateTime();
    const t = setInterval(updateTime, 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    // Validate stored token on mount; clear stale session if invalid.
    async function validate() {
      try {
        const token = getToken();
        if (!token) return;
        const res = await fetch('http://localhost:8000/incidents/my', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.status === 401 || res.status === 403) {
          // invalid or expired token -> clear session
          sessionStorage.removeItem('access_token');
          sessionStorage.removeItem('refresh_token');
          sessionStorage.removeItem('user');
          // optional: navigate to login if currently on protected route
        }
      } catch (e) {
        // network issues - keep session for now
        console.warn('Token validation failed:', e);
      }
    }
    if (authed) validate();
  }, [authed]);

  const links = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/analytics', label: 'Analytics', icon: LineChart },
    { to: '/report', label: 'Report', icon: Activity },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="nav-wrapper" style={{ pointerEvents: 'none' }}>
      <motion.nav
        className="lein-navbar"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        style={{
          pointerEvents: 'auto',
          background: 'rgba(10,15,30,0.82)',
          border: '1px solid var(--border-bright)',
          borderRadius: 999,
          boxShadow: 'var(--shadow-panel)',
          backdropFilter: 'blur(18px)',
          padding: '10px 14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 18,
          color: 'var(--text-primary)',
          fontFamily: 'Inter, system-ui, sans-serif',
        }}
      >
        <NavLink to="/" className="navbar-logo" style={{ display: 'flex', alignItems: 'center', gap: 9, textDecoration: 'none', color: 'var(--text-primary)', minWidth: 110 }}>
          <ShieldAlert size={25} color="var(--premium-gold)" />
          <div style={{ fontSize: 18, fontWeight: 900 }}>LEIN</div>
        </NavLink>

        <div className="navbar-links" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {links.map(({ to, label, icon: Icon }) => {
            const isActive = location.pathname === to;
            return (
              <NavLink
                key={to}
                to={to}
                className={`navbar-link ${isActive ? 'active' : ''}`}
                style={{
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  height: 40,
                  padding: '0 14px',
                  borderRadius: 999,
                  color: isActive ? 'var(--text-primary)' : 'var(--text-muted)',
                  textDecoration: 'none',
                  fontSize: 14,
                  fontWeight: 800,
                  background: isActive ? 'var(--bg-card)' : 'transparent',
                  transition: 'all 0.2s ease',
                }}
              >
                <Icon size={15} />
                {label}
                {isActive && (
                  <motion.div
                    layoutId="navIndicator"
                    className="nav-active-indicator"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    style={{ position: 'absolute', left: 16, right: 16, bottom: 4, height: 2, borderRadius: 999, background: 'var(--ai-blue)' }}
                  />
                )}
              </NavLink>
            );
          })}
        </div>

        <div className="navbar-status" style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'var(--text-muted)', fontSize: 13, fontWeight: 800 }}>
          <span className="navbar-time" style={{ color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{time}</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, color: 'var(--safe-green)' }}>
            <motion.span
              animate={{ opacity: [0.45, 1, 0.45], scale: [0.9, 1.15, 0.9] }}
              transition={{ duration: 1.25, repeat: Infinity }}
              style={{ width: 9, height: 9, borderRadius: 999, background: 'var(--safe-green)', boxShadow: '0 0 14px rgba(16,185,129,0.7)' }}
            />
            Online
          </div>
          {authed && user && (
            <span style={{ color: 'var(--text-primary)', maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user.full_name}
            </span>
          )}
          <button
            onClick={toggleTheme}
            aria-label="Toggle Theme"
            style={{ width: 38, height: 38, borderRadius: 999, border: '1px solid var(--border-bright)', background: 'var(--bg-panel)', color: 'var(--text-secondary)', display: 'grid', placeItems: 'center', cursor: 'pointer' }}
          >
            {isLightMode ? <Moon size={18} /> : <Sun size={18} />}
          </button>
          {authed ? (
            <button
              onClick={handleLogout}
              aria-label="Logout"
              title="Logout"
              style={{ width: 38, height: 38, borderRadius: 999, border: '1px solid var(--border-bright)', background: 'var(--bg-panel)', color: 'var(--alert-red)', display: 'grid', placeItems: 'center', cursor: 'pointer', transition: 'all 0.2s ease' }}
            >
              <LogOut size={18} />
            </button>
          ) : (
            <button
              onClick={() => navigate('/login')}
              style={{ height: 38, padding: '0 16px', borderRadius: 999, border: '1px solid var(--ai-blue)', background: 'var(--ai-blue)', color: 'var(--text-primary)', fontSize: 13, fontWeight: 900, cursor: 'pointer' }}
            >
              Login
            </button>
          )}
        </div>
      </motion.nav>
    </div>
  );
}
