import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register } from '../api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const CURRENCIES = ['USD','EUR','GBP','INR','JPY','CAD','AUD','CHF'];

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '', currency: 'USD' });
  const [loading, setLoading] = useState(false);
  const { loginUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) { toast.error('Passwords do not match'); return; }
    if (form.password.length < 6) { toast.error('Password min 6 characters'); return; }
    setLoading(true);
    try {
      const { data } = await register({ name: form.name, email: form.email, password: form.password, currency: form.currency });
      loginUser(data.token, data.user);
      toast.success('Account created!');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', padding: '1rem' }}>
      <div style={{ width: '100%', maxWidth: 400 }} className="fade-up">
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg,#6366f1,#818cf8)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', fontSize: 20, fontWeight: 700, color: '#fff' }}>S</div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: 4 }}>Create account</h1>
          <p style={{ color: 'var(--text-dim)', fontSize: 13 }}>Start tracking your finances</p>
        </div>
        <div className="card">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Full name</label>
              <input placeholder="Jane Doe" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input type="email" placeholder="you@example.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Password</label>
                <input type="password" placeholder="••••••••" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Confirm</label>
                <input type="password" placeholder="••••••••" value={form.confirm} onChange={e => setForm(f => ({ ...f, confirm: e.target.value }))} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Currency</label>
              <select value={form.currency} onChange={e => setForm(f => ({ ...f, currency: e.target.value }))}>
                {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 4 }} disabled={loading}>
              {loading ? 'Creating...' : 'Create account'}
            </button>
          </form>
          <div className="divider" />
          <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-dim)' }}>
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}