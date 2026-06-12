import React, { useState } from 'react';
import { updateProfile } from '../api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const CURRENCIES = ['USD','EUR','GBP','INR','JPY','CAD','AUD','CHF','CNY','SGD'];

export default function SettingsPage() {
  const { user, refreshUser } = useAuth();
  const [form, setForm] = useState({ name: user?.name || '', currency: user?.currency || 'USD', avatar: user?.avatar || '' });
  const [saving, setSaving] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfile(form);
      await refreshUser();
      toast.success('Settings saved!');
    } catch { toast.error('Failed to save'); }
    finally { setSaving(false); }
  };

  const initials = user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '?';

  return (
    <div className="page">
      <h1 className="page-title fade-up">Settings</h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, maxWidth: 800 }}>
        {/* Profile */}
        <div className="card fade-up">
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 16 }}>Profile</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, padding: '0.75rem', background: 'var(--bg2)', borderRadius: 8, border: '1px solid var(--border)' }}>
            {form.avatar ? (
              <img src={form.avatar} alt="" style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover' }} onError={e => e.target.style.display = 'none'} />
            ) : (
              <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg,#6366f1,#a78bfa)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 600, color: '#fff' }}>{initials}</div>
            )}
            <div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>{user?.name}</div>
              <div style={{ fontSize: 12, color: 'var(--text-dim)' }}>{user?.email}</div>
            </div>
          </div>
          <form onSubmit={handleSave}>
            <div className="form-group">
              <label className="form-label">Display Name</label>
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Avatar URL (optional)</label>
              <input placeholder="https://..." value={form.avatar} onChange={e => setForm(f => ({ ...f, avatar: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Currency</label>
              <select value={form.currency} onChange={e => setForm(f => ({ ...f, currency: e.target.value }))}>
                {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save changes'}</button>
          </form>
        </div>

        {/* Account info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card fade-up">
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 16 }}>Account info</div>
            {[
              { label: 'Email', value: user?.email },
              { label: 'Currency', value: user?.currency || 'USD' },
              { label: 'Member since', value: user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A' },
            ].map(item => (
              <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem 0', borderBottom: '1px solid var(--border)' }}>
                <span style={{ fontSize: 12, color: 'var(--text-dim)' }}>{item.label}</span>
                <span style={{ fontSize: 12, fontWeight: 500 }}>{item.value}</span>
              </div>
            ))}
          </div>

          <div className="card fade-up" style={{ border: '1px solid rgba(248,113,113,0.2)' }}>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, color: 'var(--red)' }}>Danger zone</div>
            <p style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 12 }}>These actions are permanent and cannot be undone.</p>
            <button className="btn btn-danger btn-sm" onClick={() => toast.error('Contact support to delete your account')}>Delete account</button>
          </div>
        </div>
      </div>
    </div>
  );
}