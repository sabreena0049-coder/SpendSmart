import React, { useState, useEffect } from 'react';
import { createExpense, updateExpense } from '../api';
import toast from 'react-hot-toast';

const EXPENSE_CATS = ['Food & Dining','Transportation','Shopping','Entertainment','Health & Fitness','Housing','Utilities','Education','Travel','Personal Care','Other'];
const INCOME_CATS = ['Salary','Freelance','Investment','Gift','Other'];

export default function TransactionModal({ onClose, onSave, expense }) {
  const editing = !!expense;
  const [form, setForm] = useState({
    title: '', amount: '', type: 'expense', category: 'Food & Dining',
    date: new Date().toISOString().split('T')[0], note: '',
    recurring: false, recurringPeriod: 'monthly',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (expense) {
      setForm({
        title: expense.title, amount: expense.amount, type: expense.type,
        category: expense.category,
        date: expense.date?.split('T')[0] || new Date().toISOString().split('T')[0],
        note: expense.note || '', recurring: expense.recurring || false,
        recurringPeriod: expense.recurringPeriod || 'monthly',
      });
    }
  }, [expense]);

  const cats = form.type === 'income' ? INCOME_CATS : EXPENSE_CATS;

  const handleTypeChange = (type) => {
    setForm(f => ({ ...f, type, category: type === 'income' ? 'Salary' : 'Food & Dining' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.amount) { toast.error('Fill all required fields'); return; }
    setLoading(true);
    try {
      const payload = { ...form, amount: parseFloat(form.amount), recurringPeriod: form.recurring ? form.recurringPeriod : null };
      if (editing) await updateExpense(expense._id, payload);
      else await createExpense(payload);
      toast.success(editing ? 'Transaction updated!' : 'Transaction added!');
      onSave();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h3 className="modal-title">{editing ? 'Edit Transaction' : 'New Transaction'}</h3>
          <button onClick={onClose} className="btn btn-ghost btn-sm">✕</button>
        </div>

        {/* Type toggle */}
        <div style={{ display: 'flex', gap: 4, background: 'var(--surface2)', borderRadius: 9, padding: 4, marginBottom: '1.25rem' }}>
          {['expense', 'income'].map(t => (
            <button key={t} onClick={() => handleTypeChange(t)} className="btn btn-sm"
              style={{
                flex: 1, justifyContent: 'center', textTransform: 'capitalize',
                background: form.type === t
                  ? (t === 'expense' ? 'rgba(201,112,112,0.18)' : 'rgba(127,182,133,0.18)')
                  : 'transparent',
                color: form.type === t
                  ? (t === 'expense' ? 'var(--red)' : 'var(--green)')
                  : 'var(--text-dim)',
                border: 'none', borderRadius: 7,
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: '0.95rem', letterSpacing: '0.02em',
              }}>
              {t === 'expense' ? '↑ Expense' : '↓ Income'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Title</label>
            <input placeholder="e.g. Groceries, Salary..." value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Amount</label>
              <input type="number" min="0" step="0.01" placeholder="0.00" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Date</label>
              <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Category</label>
            <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
              {cats.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Note (optional)</label>
            <input placeholder="Add a note..." value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <input type="checkbox" id="recurring" checked={form.recurring} onChange={e => setForm(f => ({ ...f, recurring: e.target.checked }))} style={{ width: 'auto', accentColor: 'var(--accent)' }} />
            <label htmlFor="recurring" style={{ fontSize: '0.85rem', color: 'var(--text-muted)', cursor: 'pointer' }}>Recurring transaction</label>
            {form.recurring && (
              <select value={form.recurringPeriod} onChange={e => setForm(f => ({ ...f, recurringPeriod: e.target.value }))} style={{ width: 'auto', padding: '0.3rem 0.6rem', fontSize: '0.8rem' }}>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            )}
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
            <button type="button" onClick={onClose} className="btn btn-ghost">Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Saving...' : editing ? 'Update' : 'Add Transaction'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}