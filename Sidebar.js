import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const navItems = [
  { path: '/', icon: '◈', label: 'Dashboard' },
  { path: '/transactions', icon: '↕', label: 'Transactions' },
  { path: '/budgets', icon: '◎', label: 'Budgets' },
  { path: '/analytics', icon: '▦', label: 'Analytics' },
  { path: '/settings', icon: '⚙', label: 'Settings' },
];

export default function Sidebar() {
  const { pathname } = useLocation();
  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutUser();
    toast.success('Logged out');
    navigate('/login');
  };

  const initials = user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '?';

  return (
    <div style={styles.sidebar}>
      {/* Logo */}
      <div style={styles.logoWrap}>
        <div style={styles.logoIcon}>S</div>
        <div>
          <div style={styles.logoText}>SpendSmart</div>
          <div style={styles.logoSub}>Finance Tracker</div>
        </div>
      </div>

      {/* Ornament */}
      <div style={styles.ornament}>· · ·</div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '0 0.5rem' }}>
        {navItems.map(item => {
          const active = pathname === item.path;
          return (
            <Link key={item.path} to={item.path} style={{ ...styles.navItem, ...(active ? styles.navActive : {}) }}>
              <span style={{ fontSize: 15, opacity: active ? 1 : 0.7 }}>{item.icon}</span>
              <span>{item.label}</span>
              {active && <div style={styles.activeBar} />}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div style={styles.ornament}>· · ·</div>
      <div style={styles.userSection}>
        <div style={styles.userRow}>
          <div style={styles.avatar}>{initials}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name}</div>
            <div style={{ fontSize: 10, color: 'var(--text-dim)' }}>{user?.currency || 'USD'}</div>
          </div>
          <button onClick={handleLogout} style={styles.logoutBtn} title="Logout">⏻</button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  sidebar: {
    position: 'fixed', left: 0, top: 0, bottom: 0, width: 220,
    background: 'var(--bg3)',
    borderRight: '1px solid var(--border)',
    display: 'flex', flexDirection: 'column',
    zIndex: 50,
  },
  logoWrap: {
    display: 'flex', alignItems: 'center', gap: '0.65rem',
    padding: '1.5rem 1.25rem 1rem',
  },
  logoIcon: {
    width: 34, height: 34, borderRadius: 10,
    background: 'linear-gradient(135deg, #c9956c, #d4a853)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: '#1a0e08', fontSize: 16, fontWeight: 700,
    fontFamily: "'Cormorant Garamond', serif",
    flexShrink: 0,
  },
  logoText: {
    fontSize: 13, fontWeight: 600,
    color: 'var(--text)',
    fontFamily: "'Cormorant Garamond', serif",
    letterSpacing: '0.03em',
  },
  logoSub: { fontSize: 10, color: 'var(--text-dim)', marginTop: 1 },
  ornament: {
    textAlign: 'center', color: 'var(--border2)',
    fontSize: 10, letterSpacing: '0.3em',
    padding: '0.4rem 0',
  },
  navItem: {
    display: 'flex', alignItems: 'center', gap: '0.65rem',
    padding: '0.55rem 0.85rem', margin: '0.15rem 0',
    borderRadius: 9, color: 'var(--text-dim)',
    fontSize: 13, fontWeight: 400,
    textDecoration: 'none', position: 'relative',
    transition: 'all 0.15s', letterSpacing: '0.01em',
  },
  navActive: {
    color: 'var(--accent2)',
    background: 'rgba(201,149,108,0.1)',
    border: '1px solid rgba(201,149,108,0.18)',
    fontWeight: 500,
  },
  activeBar: {
    position: 'absolute', right: -1, top: '20%', bottom: '20%',
    width: 2, background: 'var(--accent)',
    borderRadius: '2px 0 0 2px',
  },
  userSection: { padding: '0.5rem 0.75rem 1rem' },
  userRow: {
    display: 'flex', alignItems: 'center', gap: '0.5rem',
    padding: '0.6rem 0.75rem', borderRadius: 9,
    background: 'var(--surface2)',
    border: '1px solid var(--border)',
  },
  avatar: {
    width: 28, height: 28, borderRadius: '50%',
    background: 'linear-gradient(135deg, #c9956c, #d4a853)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 10, fontWeight: 700, color: '#1a0e08', flexShrink: 0,
    fontFamily: "'Cormorant Garamond', serif",
  },
  logoutBtn: {
    background: 'none', border: 'none', color: 'var(--text-dim)',
    fontSize: 13, cursor: 'pointer', padding: 2,
    borderRadius: 4, transition: 'color 0.15s',
  },
};