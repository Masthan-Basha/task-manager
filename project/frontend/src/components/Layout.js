import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Layout({ children }) {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out');
    navigate('/login');
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <aside style={{
        width: 220, background: 'var(--surface)', borderRight: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column', padding: '24px 16px', gap: 8, flexShrink: 0
      }}>
        <div style={{ padding: '0 8px 20px', borderBottom: '1px solid var(--border)', marginBottom: 8 }}>
          <div style={{ fontWeight: 600, fontSize: 16, color: 'var(--accent)' }}>⚡ TaskManager</div>
          <div style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 4 }}>{user?.name}</div>
          <div style={{ fontSize: 11, color: 'var(--text-dim)', fontFamily: 'var(--mono)' }}>{user?.role}</div>
        </div>

        <NavLink to="/dashboard" style={({ isActive }) => navStyle(isActive)}>
          📋 Dashboard
        </NavLink>
        {isAdmin && (
          <NavLink to="/admin" style={({ isActive }) => navStyle(isActive)}>
            🛡 Admin Panel
          </NavLink>
        )}

        <div style={{ marginTop: 'auto' }}>
          <button onClick={handleLogout} className="btn-ghost" style={{ width: '100%', textAlign: 'left' }}>
            ↩ Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, overflow: 'auto', padding: 32 }}>{children}</main>
    </div>
  );
}

const navStyle = (isActive) => ({
  display: 'block', padding: '9px 12px', borderRadius: 8, fontSize: 14,
  color: isActive ? 'var(--text)' : 'var(--text-dim)',
  background: isActive ? 'var(--surface2)' : 'transparent',
  transition: 'all 0.15s',
});
