import React, { useState, useEffect } from 'react';
import { getExpenses, deleteExpense } from '../api';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';
import TransactionModal from '../components/TransactionModal';
import toast from 'react-hot-toast';

const CATEGORIES = ['All', 'Food & Dining','Transportation','Shopping','Entertainment','Health & Fitness','Housing','Utilities','Education','Travel','Personal Care','Savings','Salary','Freelance','Investment','Gift','Other'];

export default function TransactionsPage() {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [filters, setFilters] = useState({ type: '', category: '', startDate: '', endDate: '' });
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const currency = user?.currency || 'USD';
  const fmt = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(n || 0);

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 15, ...filters };
      Object.keys(params).forEach(k => !params[k] && delete params[k]);
      const { data } = await getExpenses(params);
      setExpenses(data.expenses);
      setPages(data.pages);
      setTotal(data.total);
    } catch { toast.error('Failed to load'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchExpenses(); }, [page, filters]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this transaction?')) return;
    try { await deleteExpense(id); toast.success('Deleted'); fetchExpenses(); }
    catch { toast.error('Failed'); }
  };

  const totalIncome = expenses.filter(e => e.type === 'income').reduce((a, e) => a + e.amount, 0);
  const totalExpense = expenses.filter(e => e.type === 'expense').reduce((a, e) => a + e.amount, 0);

  return (
    <div className="page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }} className="fade-up">
        <h1 className="page-title" style={{ margin: 0 }}>Transactions</h1>
        <button className="btn btn-primary btn-sm" onClick={() => { setEditing(null); setShowModal(true); }}>+ Add Transaction</button>
      </div>

      {/* Summary strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 16 }} className="fade-up">
        <div className="card" style={{ padding: '0.75rem 1rem' }}>
          <div style={{ fontSize: 10, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Showing ({total} total)</div>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginTop: 2 }}>All Transactions</div>
        </div>
        <div className="card" style={{ padding: '0.75rem 1rem' }}>
          <div style={{ fontSize: 10, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Income shown</div>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--green)', marginTop: 2 }}>+{fmt(totalIncome)}</div>
        </div>
        <div className="card" style={{ padding: '0.75rem 1rem' }}>
          <div style={{ fontSize: 10, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Expenses shown</div>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--red)', marginTop: 2 }}>-{fmt(totalExpense)}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="card fade-up" style={{ marginBottom: 16, padding: '0.75rem 1rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10 }}>
          <select value={filters.type} onChange={e => setFilters(f => ({ ...f, type: e.target.value }))}>
            <option value="">All types</option>
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>
          <select value={filters.category} onChange={e => setFilters(f => ({ ...f, category: e.target.value }))}>
            {CATEGORIES.map(c => <option key={c} value={c === 'All' ? '' : c}>{c}</option>)}
          </select>
          <input type="date" value={filters.startDate} onChange={e => setFilters(f => ({ ...f, startDate: e.target.value }))} placeholder="From date" />
          <input type="date" value={filters.endDate} onChange={e => setFilters(f => ({ ...f, endDate: e.target.value }))} placeholder="To date" />
        </div>
      </div>

      {/* Table */}
      <div className="card fade-up" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? <div className="spinner" /> : expenses.length === 0 ? (
          <div className="empty-state"><h3>No transactions found</h3><p>Try different filters or add one!</p></div>
        ) : (
          <>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    {['Title', 'Category', 'Date', 'Type', 'Amount', ''].map(h => (
                      <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: 11, color: 'var(--text-dim)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {expenses.map((tx, i) => (
                    <tr key={tx._id} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--surface2)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <td style={{ padding: '0.7rem 1rem' }}>
                        <div style={{ fontSize: 13, fontWeight: 500 }}>{tx.title}</div>
                        {tx.note && <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>{tx.note}</div>}
                        {tx.recurring && <span className="badge badge-info" style={{ fontSize: 9, marginTop: 2 }}>{tx.recurringPeriod}</span>}
                      </td>
                      <td style={{ padding: '0.7rem 1rem', fontSize: 12, color: 'var(--text-muted)' }}>{tx.category}</td>
                      <td style={{ padding: '0.7rem 1rem', fontSize: 12, color: 'var(--text-dim)', whiteSpace: 'nowrap' }}>{format(new Date(tx.date), 'MMM d, yyyy')}</td>
                      <td style={{ padding: '0.7rem 1rem' }}>
                        <span className={`badge ${tx.type === 'income' ? 'badge-income' : 'badge-expense'}`}>{tx.type}</span>
                      </td>
                      <td style={{ padding: '0.7rem 1rem', fontWeight: 600, color: tx.type === 'income' ? 'var(--green)' : 'var(--red)', whiteSpace: 'nowrap' }}>
                        {tx.type === 'income' ? '+' : '-'}{fmt(tx.amount)}
                      </td>
                      <td style={{ padding: '0.7rem 1rem' }}>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button className="btn btn-ghost btn-sm" onClick={() => { setEditing(tx); setShowModal(true); }}>Edit</button>
                          <button className="btn btn-danger btn-sm" onClick={() => handleDelete(tx._id)}>Del</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: 6, padding: '0.75rem', borderTop: '1px solid var(--border)' }}>
                <button className="btn btn-ghost btn-sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>← Prev</button>
                {Array.from({ length: pages }, (_, i) => (
                  <button key={i} onClick={() => setPage(i + 1)} className={`btn btn-sm ${page === i + 1 ? 'btn-primary' : 'btn-ghost'}`}>{i + 1}</button>
                ))}
                <button className="btn btn-ghost btn-sm" disabled={page === pages} onClick={() => setPage(p => p + 1)}>Next →</button>
              </div>
            )}
          </>
        )}
      </div>

      {showModal && <TransactionModal expense={editing} onClose={() => { setShowModal(false); setEditing(null); }} onSave={() => { setShowModal(false); setEditing(null); fetchExpenses(); }} />}
    </div>
  );
}