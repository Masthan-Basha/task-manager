import React, { useState, useEffect, useCallback } from 'react';
import { adminAPI } from '../services/api';
import toast from 'react-hot-toast';

export default function AdminPanel() {
  const [users, setUsers] = useState([]);
  const [dashStats, setDashStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [usersRes, statsRes] = await Promise.all([
        adminAPI.getUsers(),
        adminAPI.getStats(),
      ]);
      setUsers(usersRes.data.data.users);
      setDashStats(statsRes.data.data);
    } catch { toast.error('Failed to load admin data'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleRoleChange = async (id, role) => {
    try {
      await adminAPI.updateRole(id, role);
      toast.success('Role updated');
      fetchData();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleToggleStatus = async (id) => {
    try {
      await adminAPI.toggleStatus(id);
      toast.success('Status updated');
      fetchData();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  if (loading) return <div style={{ color: 'var(--text-dim)' }}>Loading...</div>;

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 600, marginBottom: 24 }}>Admin Panel</h1>

      {/* Stats */}
      {dashStats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 28 }}>
          <div className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 32, fontWeight: 700, color: 'var(--accent)', fontFamily: 'var(--mono)' }}>{dashStats.totalUsers}</div>
            <div style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 4 }}>Total Users</div>
          </div>
          <div className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 32, fontWeight: 700, color: 'var(--success)', fontFamily: 'var(--mono)' }}>{dashStats.totalTasks}</div>
            <div style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 4 }}>Total Tasks</div>
          </div>
          <div className="card" style={{ padding: 16 }}>
            <div style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 8 }}>Tasks by Status</div>
            {dashStats.tasksByStatus.map(s => (
              <div key={s._id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                <span className={`badge badge-${s._id}`}>{s._id}</span>
                <span style={{ fontFamily: 'var(--mono)', fontSize: 13 }}>{s.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Users table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>
          All Users ({users.length})
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              {['Name', 'Email', 'Role', 'Status', 'Joined', 'Actions'].map(h => (
                <th key={h} style={{ padding: '11px 16px', textAlign: 'left', fontSize: 12, color: 'var(--text-dim)', fontWeight: 500 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map((u, i) => (
              <tr key={u._id} style={{ borderBottom: i < users.length - 1 ? '1px solid var(--border)' : 'none' }}>
                <td style={{ padding: '12px 16px', fontSize: 14, fontWeight: 500 }}>{u.name}</td>
                <td style={{ padding: '12px 16px', fontSize: 13, color: 'var(--text-dim)', fontFamily: 'var(--mono)' }}>{u.email}</td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{ fontSize: 12, padding: '2px 8px', borderRadius: 20, background: u.role === 'admin' ? '#2a1060' : 'var(--surface2)', color: u.role === 'admin' ? 'var(--accent)' : 'var(--text-dim)', fontFamily: 'var(--mono)' }}>
                    {u.role}
                  </span>
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{ fontSize: 12, color: u.isActive ? 'var(--success)' : 'var(--danger)' }}>
                    {u.isActive ? '● Active' : '○ Inactive'}
                  </span>
                </td>
                <td style={{ padding: '12px 16px', fontSize: 12, color: 'var(--text-dim)' }}>
                  {new Date(u.createdAt).toLocaleDateString()}
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button className="btn-ghost" style={{ fontSize: 11, padding: '4px 8px' }}
                      onClick={() => handleRoleChange(u._id, u.role === 'admin' ? 'user' : 'admin')}>
                      {u.role === 'admin' ? 'Make User' : 'Make Admin'}
                    </button>
                    <button className="btn-ghost" style={{ fontSize: 11, padding: '4px 8px' }}
                      onClick={() => handleToggleStatus(u._id)}>
                      {u.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
