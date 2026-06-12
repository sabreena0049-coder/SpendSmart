import React, { useState, useEffect } from 'react';
import { getBudgets, setBudget, deleteBudget } from '../api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const EXPENSE_CATS = ['Food & Dining','Transportation','Shopping','Entertainment','Health & Fitness','Housing','Utilities','Education','Travel','Personal Care','Other'];

export default function BudgetsPage() {
  const { user } = useAuth();
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ category: 'Food & Dining', limit: '' });
  const [saving, setSaving] = useState(false);
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();
  const currency = user?.currency || 'USD';
  const fmt = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(n || 0);

  const fetchBudgets = async () => {
    setLoading(true);
    try {
      const { data } = await getBudgets({ month, year });
      setBudgets(data.budgets);
    } catch { toast.error('Failed to load budgets'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchBudgets(); }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.limit) { toast.error('Enter a budget limit'); return; }
    setSaving(true);
    try {
      await setBudget({ ...form, limit: parseFloat(form.limit), month, year });
      toast.success('Budget saved!');
      setForm(f => ({ ...f, limit: '' }));
      fetchBudgets();
    } catch { toast.error('Failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    try { await deleteBudget(id); toast.success('Budget removed'); fetchBudgets(); }
    catch { toast.error('Failed'); }
  };

  const totalBudget = budgets.reduce((a, b) => a + b.limit, 0);
  const totalSpent = budgets.reduce((a, b) => a + b.spent, 0);

  return (
    <div className="page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }} className="fade-up">
        <div>
          <h1 className="page-title" style={{ margin: 0 }}>Budgets</h1>
          <div style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 3 }}>
            {now.toLocaleString('default', { month: 'long', year: 'numeric' })}
          </div>
        </div>
      </div>

      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 20 }} className="fade-up">
        <div className="card" style={{ padding: '1rem' }}>
          <div style={{ fontSize: 10, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Budget</div>
          <div style={{ fontSize: 20, fontWeight: 600, color: 'var(--accent2)', marginTop: 4 }}>{fmt(totalBudget)}</div>
        </div>
        <div className="card" style={{ padding: '1rem' }}>
          <div style={{ fontSize: 10, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Spent</div>
          <div style={{ fontSize: 20, fontWeight: 600, color: 'var(--red)', marginTop: 4 }}>{fmt(totalSpent)}</div>
        </div>
        <div className="card" style={{ padding: '1rem' }}>
          <div style={{ fontSize: 10, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Remaining</div>
          <div style={{ fontSize: 20, fontWeight: 600, color: totalBudget - totalSpent >= 0 ? 'var(--green)' : 'var(--red)', marginTop: 4 }}>{fmt(totalBudget - totalSpent)}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 16 }}>
        {/* Budget list */}
        <div>
          {loading ? <div className="spinner" /> : budgets.length === 0 ? (
            <div className="card">
              <div className="empty-state"><h3>No budgets set</h3><p>Set your first budget using the form →</p></div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {budgets.map(b => {
                const over = b.percentage >= 100;
                const warn = b.percentage >= 80 && b.percentage < 100;
                const color = over ? 'var(--red)' : warn ? 'var(--yellow)' : 'var(--green)';
                const barColor = over ? '#f87171' : warn ? '#fbbf24' : '#34d399';
                return (
                  <div key={b._id} className="card fade-up" style={{ padding: '1rem 1.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600 }}>{b.category}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 2 }}>
                          {fmt(b.spent)} spent of {fmt(b.limit)}
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ fontSize: 16, fontWeight: 700, color }}>{b.percentage}%</div>
                        {over && <span className="badge badge-expense">Over budget!</span>}
                        {warn && <span className="badge badge-warning">Almost full</span>}
                        <button onClick={() => handleDelete(b._id)} className="btn btn-ghost btn-sm" style={{ padding: '0.2rem 0.5rem' }}>✕</button>
                      </div>
                    </div>
                    <div className="progress-bar" style={{ height: 6 }}>
                      <div className="progress-fill" style={{ width: `${b.percentage}%`, background: barColor }} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 10, color: 'var(--text-dim)' }}>
                      <span>Remaining: {fmt(b.remaining)}</span>
                      <span>Limit: {fmt(b.limit)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Add budget form */}
        <div className="card fade-up" style={{ height: 'fit-content' }}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 16 }}>Set Budget</div>
          <form onSubmit={handleSave}>
            <div className="form-group">
              <label className="form-label">Category</label>
              <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                {EXPENSE_CATS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Monthly Limit ({currency})</label>
              <input type="number" min="0" step="0.01" placeholder="0.00" value={form.limit} onChange={e => setForm(f => ({ ...f, limit: e.target.value }))} />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={saving}>
              {saving ? 'Saving...' : 'Set Budget'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}