import React, { useState, useEffect } from 'react';

export default function TaskModal({ task, onClose, onSave }) {
  const [form, setForm] = useState({
    title: '', description: '', status: 'todo', priority: 'medium', dueDate: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (task) {
      setForm({
        title: task.title || '',
        description: task.description || '',
        status: task.status || 'todo',
        priority: task.priority || 'medium',
        dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
      });
    }
  }, [task]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({}); setLoading(true);
    try {
      const payload = { ...form };
      if (!payload.dueDate) delete payload.dueDate;
      await onSave(payload);
    } catch (err) {
      const data = err.response?.data;
      if (data?.errors) {
        const map = {};
        data.errors.forEach(e => { map[e.field] = e.message; });
        setErrors(map);
      } else {
        setErrors({ general: data?.message || 'Failed to save task' });
      }
    } finally {
      setLoading(false);
    }
  };

  const f = (key) => ({ value: form[key], onChange: e => setForm({ ...form, [key]: e.target.value }) });

  return (
    <div style={overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="card" style={{ width: '100%', maxWidth: 480, position: 'relative' }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 20 }}>
          {task?._id ? 'Edit Task' : 'New Task'}
        </h2>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={lbl}>Title *</label>
            <input type="text" placeholder="Task title..." {...f('title')} required />
            {errors.title && <p className="error-msg">{errors.title}</p>}
          </div>
          <div>
            <label style={lbl}>Description</label>
            <textarea rows={3} placeholder="Optional description..." {...f('description')}
              style={{ resize: 'vertical' }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={lbl}>Status</label>
              <select {...f('status')}>
                <option value="todo">To Do</option>
                <option value="in-progress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>
            <div>
              <label style={lbl}>Priority</label>
              <select {...f('priority')}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>
          <div>
            <label style={lbl}>Due Date</label>
            <input type="date" {...f('dueDate')} />
          </div>
          {errors.general && <p className="error-msg">{errors.general}</p>}

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 6 }}>
            <button type="button" className="btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Saving...' : 'Save Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const overlay = {
  position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
  display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 20
};
const lbl = { display: 'block', fontSize: 13, color: 'var(--text-dim)', marginBottom: 6 };
