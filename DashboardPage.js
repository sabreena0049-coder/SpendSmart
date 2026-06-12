import React, { useState, useEffect } from 'react';
import { getDashboardStats } from '../api';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';
import TransactionModal from '../components/TransactionModal';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const CATEGORY_COLORS = {
  'Food & Dining': '#c9956c', 'Transportation': '#d4a853', 'Shopping': '#c97890',
  'Entertainment': '#a07858', 'Health & Fitness': '#7fb685', 'Housing': '#8fa8b8',
  'Utilities': '#b8a070', 'Education': '#c8906a', 'Travel': '#90b8a8',
  'Personal Care': '#d4908a', 'Savings': '#7fb685', 'Salary': '#7fb685',
  'Freelance': '#c9956c', 'Investment': '#d4a853', 'Gift': '#c97890', 'Other': '#8a6858'
};

const StatCard = ({ label, value, color, sub, subColor, delay }) => (
  <div className="card fade-up" style={{ padding: '1.25rem 1.5rem', animationDelay: delay }}>
    <div style={{ fontSize: 10, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8, fontWeight: 500 }}>{label}</div>
    <div style={{ fontSize: 24, fontWeight: 500, color, marginBottom: 4, fontFamily: "'Cormorant Garamond', serif" }}>{value}</div>
    {sub && <div style={{ fontSize: 11, color: subColor || 'var(--text-dim)' }}>{sub}</div>}
  </div>
);

const CustomTooltip = ({ active, payload, label, fmt }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border2)', borderRadius: 9, padding: '0.6rem 0.9rem', fontSize: 12 }}>
      <div style={{ color: 'var(--text-muted)', marginBottom: 4 }}>{label}</div>
      {payload.map(p => (
        <div key={p.name} style={{ color: p.color, fontWeight: 500 }}>{p.name}: {fmt(p.value)}</div>
      ))}
    </div>
  );
};

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const currency = user?.currency || 'USD';
  const fmt = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(n || 0);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const { data } = await getDashboardStats();
      setStats(data.stats);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchStats(); }, []);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  if (loading) return <div className="spinner" />;

  const { thisMonth, lastMonth, categoryBreakdown, trend, recentTransactions } = stats || {};
  const maxCat = Math.max(...Object.values(categoryBreakdown || {}), 1);
  const savingsRate = thisMonth?.income ? Math.round(((thisMonth.income - thisMonth.expense) / thisMonth.income) * 100) : 0;

  return (
    <div className="page">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }} className="fade-up">
        <div>
          <div style={{ fontSize: 11, color: 'var(--text-dim)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{greeting()}, {user?.name?.split(' ')[0]}</div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 500, lineHeight: 1.1 }}>Financial Overview</h1>
          <div style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 4 }}>{format(new Date(), 'MMMM yyyy')}</div>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)} style={{ marginTop: 8 }}>+ New Entry</button>
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: 'linear-gradient(to right, transparent, var(--border2), transparent)', marginBottom: '1.75rem' }} />

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 24 }}>
        <StatCard label="Balance" value={fmt(thisMonth?.balance)} color="var(--accent2)" delay="0s"
          sub={`${(thisMonth?.balance || 0) >= (lastMonth?.balance || 0) ? '↑' : '↓'} vs last month`}
          subColor={(thisMonth?.balance || 0) >= (lastMonth?.balance || 0) ? 'var(--green)' : 'var(--red)'} />
        <StatCard label="Income" value={fmt(thisMonth?.income)} color="var(--green)" delay="0.05s"
          sub={lastMonth?.income ? `Was ${fmt(lastMonth.income)}` : 'This month'} />
        <StatCard label="Expenses" value={fmt(thisMonth?.expense)} color="var(--red)" delay="0.1s"
          sub={lastMonth?.expense ? `Was ${fmt(lastMonth.expense)}` : 'This month'} />
        <StatCard label="Savings Rate" value={`${savingsRate}%`} color="var(--gold)" delay="0.15s"
          sub="Of income saved" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 16, marginBottom: 16 }}>
        {/* Chart */}
        <div className="card fade-up">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 500 }}>6-Month Overview</h3>
            <div style={{ display: 'flex', gap: 14, fontSize: 11, color: 'var(--text-dim)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><span style={{ width: 8, height: 8, borderRadius: 2, background: 'var(--green)', display: 'inline-block' }} />Income</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><span style={{ width: 8, height: 8, borderRadius: 2, background: 'var(--red)', display: 'inline-block' }} />Expense</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={170}>
            <BarChart data={trend || []} barCategoryGap="32%">
              <XAxis dataKey="month" tick={{ fill: '#8a6858', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip content={<CustomTooltip fmt={fmt} />} />
              <Bar dataKey="income" fill="#7fb685" radius={[4, 4, 0, 0]} name="Income" />
              <Bar dataKey="expense" fill="#c97070" radius={[4, 4, 0, 0]} name="Expense" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Category breakdown */}
        <div className="card fade-up">
          <h3 style={{ fontSize: '1.1rem', fontWeight: 500, marginBottom: 18 }}>Top Categories</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {Object.entries(categoryBreakdown || {}).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([cat, amt]) => (
              <div key={cat}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{cat}</span>
                  <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--accent2)' }}>{fmt(amt)}</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${(amt / maxCat) * 100}%`, background: CATEGORY_COLORS[cat] || '#8a6858' }} />
                </div>
              </div>
            ))}
            {Object.keys(categoryBreakdown || {}).length === 0 && (
              <div style={{ color: 'var(--text-dim)', fontSize: 13, textAlign: 'center', padding: '1.5rem', fontFamily: "'Cormorant Garamond', serif" }}>No expenses this month</div>
            )}
          </div>
        </div>
      </div>

      {/* Recent transactions */}
      <div className="card fade-up">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 500 }}>Recent Transactions</h3>
          <a href="/transactions" style={{ fontSize: 11, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>View all →</a>
        </div>
        {!recentTransactions?.length ? (
          <div className="empty-state"><h3>No transactions yet</h3><p style={{ fontSize: 12 }}>Begin by adding your first entry</p></div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {recentTransactions.map(tx => (
              <div key={tx._id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '0.7rem 1rem', background: 'var(--bg2)', borderRadius: 10, border: '1px solid var(--border)' }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: tx.type === 'income' ? 'rgba(127,182,133,0.12)' : 'rgba(201,112,112,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: tx.type === 'income' ? 'var(--green)' : 'var(--red)', flexShrink: 0 }}>
                  {tx.type === 'income' ? '↓' : '↑'}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{tx.title}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>{tx.category} · {format(new Date(tx.date), 'MMM d')}</div>
                </div>
                {tx.recurring && <span className="badge badge-info" style={{ fontSize: 9 }}>recurring</span>}
                <div style={{ fontSize: 14, fontWeight: 600, color: tx.type === 'income' ? 'var(--green)' : 'var(--red)', fontFamily: "'DM Mono', monospace" }}>
                  {tx.type === 'income' ? '+' : '-'}{fmt(tx.amount)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && <TransactionModal onClose={() => setShowModal(false)} onSave={() => { setShowModal(false); fetchStats(); }} />}
    </div>
  );
}