import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({}); setLoading(true);
    try {
      await register(form);
      toast.success('Account created!');
      navigate('/dashboard');
    } catch (err) {
      const data = err.response?.data;
      if (data?.errors) {
        const map = {};
        data.errors.forEach(e => { map[e.field] = e.message; });
        setErrors(map);
      } else {
        setErrors({ general: data?.message || 'Registration failed' });
      }
    } finally {
      setLoading(false);
    }
  };

  const field = (key) => ({
    value: form[key],
    onChange: (e) => setForm({ ...form, [key]: e.target.value }),
  });

  return (
    <div style={pageStyle}>
      <div className="card" style={{ width: '100%', maxWidth: 420 }}>
        <h1 style={{ fontSize: 22, fontWeight: 600, marginBottom: 6 }}>Create account</h1>
        <p style={{ color: 'var(--text-dim)', fontSize: 14, marginBottom: 24 }}>
          Start managing your tasks today
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={labelStyle}>Full name</label>
            <input type="text" placeholder="John Doe" {...field('name')} required />
            {errors.name && <p className="error-msg">{errors.name}</p>}
          </div>
          <div>
            <label style={labelStyle}>Email</label>
            <input type="email" placeholder="you@example.com" {...field('email')} required />
            {errors.email && <p className="error-msg">{errors.email}</p>}
          </div>
          <div>
            <label style={labelStyle}>Password</label>
            <input type="password" placeholder="Min 8 chars, upper + lower + number" {...field('password')} required />
            {errors.password && <p className="error-msg">{errors.password}</p>}
          </div>
          {errors.general && <p className="error-msg">{errors.general}</p>}
          <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: 4 }}>
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: 'var(--text-dim)' }}>
          Have an account? <Link to="/login" style={{ color: 'var(--accent)' }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}

const pageStyle = {
  minHeight: '100vh', display: 'flex', alignItems: 'center',
  justifyContent: 'center', padding: 24, background: 'var(--bg)'
};
const labelStyle = { display: 'block', fontSize: 13, color: 'var(--text-dim)', marginBottom: 6 };
