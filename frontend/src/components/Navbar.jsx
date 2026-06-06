import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { ShieldAlert, Activity, LayoutDashboard, LineChart, Moon, Sun } from 'lucide-react';

export default function Navbar({ toggleTheme, isLightMode }) {
  const [time, setTime] = useState('');
  const location = useLocation();

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' WAT');
    };
    updateTime();
    const t = setInterval(updateTime, 1000);
    return () => clearInterval(t);
  }, []);

  const links = [
    { to: '/', label: 'Intake', icon: Activity },
    { to: '/dashboard', label: 'Command', icon: LayoutDashboard },
    { to: '/analytics', label: 'Intelligence', icon: LineChart },
  ];

  return (
    <div className="nav-wrapper">
      <motion.nav
        className="lein-navbar"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        <NavLink to="/" className="navbar-logo">
          <ShieldAlert className="navbar-logo-icon" size={24} />
          <div className="navbar-logo-title">LEIN.OS</div>
        </NavLink>

        <div className="navbar-links">
          {links.map(({ to, label, icon: Icon }) => {
            const isActive = location.pathname === to || (to === '/' && location.pathname === '');
            return (
              <NavLink key={to} to={to} className={`navbar-link ${isActive ? 'active' : ''}`}>
                <Icon size={14} />
                {label}
                {isActive && (
                  <motion.div
                    layoutId="navIndicator"
                    className="nav-active-indicator"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
              </NavLink>
            );
          })}
        </div>

        <div className="navbar-status">
          <button className="theme-toggle-btn" onClick={toggleTheme} aria-label="Toggle Theme">
            {isLightMode ? <Moon size={18} /> : <Sun size={18} />}
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 12 }}>
            <div className="status-dot" />
            <span style={{ color: 'var(--safe-green)' }}>SYS.OP</span>
          </div>
          <span className="navbar-time">{time}</span>
        </div>
      </motion.nav>
    </div>
  );
}
