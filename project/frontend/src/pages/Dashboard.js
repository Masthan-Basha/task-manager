import React, { useState, useEffect, useCallback } from 'react';
import { tasksAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import TaskModal from '../components/TaskModal';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [pagination, setPagination] = useState({});
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // null | 'create' | task object
  const [filters, setFilters] = useState({ status: '', priority: '', page: 1, search: '' });

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      const params = { page: filters.page, limit: 10 };
      if (filters.status) params.status = filters.status;
      if (filters.priority) params.priority = filters.priority;
      if (filters.search) params.search = filters.search;
      const { data } = await tasksAPI.getAll(params);
      setTasks(data.data.tasks);
      setPagination(data.data.pagination);
    } catch { toast.error('Failed to load tasks'); }
    finally { setLoading(false); }
  }, [filters]);

  const fetchStats = useCallback(async () => {
    try {
      const { data } = await tasksAPI.getStats();
      const map = {};
      data.data.statusStats.forEach(s => { map[s._id] = s.count; });
      setStats(map);
    } catch {}
  }, []);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);
  useEffect(() => { fetchStats(); }, [fetchStats]);

  const handleSave = async (formData) => {
    if (modal?._id) {
      await tasksAPI.update(modal._id, formData);
      toast.success('Task updated');
    } else {
      await tasksAPI.create(formData);
      toast.success('Task created');
    }
    setModal(null);
    fetchTasks(); fetchStats();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this task?')) return;
    await tasksAPI.delete(id);
    toast.success('Task deleted');
    fetchTasks(); fetchStats();
  };

  const statCards = [
    { label: 'To Do', value: stats['todo'] || 0, color: 'var(--text-dim)' },
    { label: 'In Progress', value: stats['in-progress'] || 0, color: 'var(--warning)' },
    { label: 'Done', value: stats['done'] || 0, color: 'var(--success)' },
    { label: 'Total', value: pagination.total || 0, color: 'var(--accent)' },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 600 }}>My Tasks</h1>
          <p style={{ color: 'var(--text-dim)', fontSize: 14, marginTop: 4 }}>Hello, {user?.name} 👋</p>
        </div>
        <button className="btn-primary" onClick={() => setModal({})}>+ New Task</button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
        {statCards.map(s => (
          <div key={s.label} className="card" style={{ textAlign: 'center', padding: '16px' }}>
            <div style={{ fontSize: 28, fontWeight: 700, color: s.color, fontFamily: 'var(--mono)' }}>{s.value}</div>
            <div style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 18, flexWrap: 'wrap' }}>
        <input type="text" placeholder="Search tasks..." style={{ maxWidth: 220 }}
          value={filters.search}
          onChange={e => setFilters({ ...filters, search: e.target.value, page: 1 })} />
        <select style={{ maxWidth: 140 }} value={filters.status}
          onChange={e => setFilters({ ...filters, status: e.target.value, page: 1 })}>
          <option value="">All Status</option>
          <option value="todo">To Do</option>
          <option value="in-progress">In Progress</option>
          <option value="done">Done</option>
        </select>
        <select style={{ maxWidth: 140 }} value={filters.priority}
          onChange={e => setFilters({ ...filters, priority: e.target.value, page: 1 })}>
          <option value="">All Priority</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>

      {/* Tasks table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-dim)' }}>Loading...</div>
        ) : tasks.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-dim)' }}>
            No tasks found. <button className="btn-ghost" style={{ marginLeft: 8 }} onClick={() => setModal({})}>Create one</button>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['Title', 'Status', 'Priority', 'Due Date', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, color: 'var(--text-dim)', fontWeight: 500 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tasks.map((task, i) => (
                <tr key={task._id} style={{ borderBottom: i < tasks.length - 1 ? '1px solid var(--border)' : 'none' }}>
                  <td style={{ padding: '13px 16px' }}>
                    <div style={{ fontWeight: 500, fontSize: 14 }}>{task.title}</div>
                    {task.description && <div style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 2 }}>{task.description.slice(0, 60)}{task.description.length > 60 ? '…' : ''}</div>}
                  </td>
                  <td style={{ padding: '13px 16px' }}>
                    <span className={`badge badge-${task.status}`}>{task.status}</span>
                  </td>
                  <td style={{ padding: '13px 16px' }}>
                    <span className={`badge badge-${task.priority}`}>{task.priority}</span>
                  </td>
                  <td style={{ padding: '13px 16px', fontSize: 13, color: task.isOverdue ? 'var(--danger)' : 'var(--text-dim)' }}>
                    {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '—'}
                    {task.isOverdue && ' ⚠'}
                  </td>
                  <td style={{ padding: '13px 16px' }}>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="btn-ghost" style={{ fontSize: 12, padding: '5px 10px' }}
                        onClick={() => setModal(task)}>Edit</button>
                      <button className="btn-danger" onClick={() => handleDelete(task._id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 16 }}>
          {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(p => (
            <button key={p} onClick={() => setFilters({ ...filters, page: p })}
              className={p === filters.page ? 'btn-primary' : 'btn-ghost'}
              style={{ padding: '6px 12px' }}>{p}</button>
          ))}
        </div>
      )}

      {modal !== null && (
        <TaskModal task={modal} onClose={() => setModal(null)} onSave={handleSave} />
      )}
    </div>
  );
}
