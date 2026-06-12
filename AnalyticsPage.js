import React, { useState, useEffect } from 'react';
import { getDashboardStats } from '../api';
import { useAuth } from '../context/AuthContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, CartesianGrid, Legend } from 'recharts';

const COLORS = ['#818cf8','#34d399','#f87171','#fbbf24','#a78bfa','#38bdf8','#fb923c','#e879f9','#2dd4bf','#f472b6'];

export default function AnalyticsPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const currency = user?.currency || 'USD';
  const fmt = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(n || 0);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await getDashboardStats();
        setStats(data.stats);
      } catch {} finally { setLoading(false); }
    })();
  }, []);

  if (loading) return <div className="spinner" />;

  const pieData = Object.entries(stats?.categoryBreakdown || {}).map(([name, value]) => ({ name, value }));
  const netData = stats?.trend?.map(t => ({ ...t, net: t.income - t.expense })) || [];

  return (
    <div className="page">
      <h1 className="page-title fade-up">Analytics</h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        {/* Net trend */}
        <div className="card fade-up">
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 16 }}>Net savings trend</div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={netData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e1e2e" />
              <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: '#161622', border: '1px solid #2a2a3e', borderRadius: 8, fontSize: 12 }} formatter={v => fmt(v)} />
              <Line type="monotone" dataKey="net" stroke="#818cf8" strokeWidth={2} dot={{ fill: '#818cf8', r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Income vs Expense */}
        <div className="card fade-up">
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 16 }}>Income vs Expenses</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={stats?.trend || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e1e2e" />
              <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: '#161622', border: '1px solid #2a2a3e', borderRadius: 8, fontSize: 12 }} formatter={v => fmt(v)} />
              <Legend wrapperStyle={{ fontSize: 11, color: '#94a3b8' }} />
              <Bar dataKey="income" fill="#34d399" radius={[4,4,0,0]} name="Income" />
              <Bar dataKey="expense" fill="#f87171" radius={[4,4,0,0]} name="Expense" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Pie chart */}
        <div className="card fade-up">
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 16 }}>Spending by category</div>
          {pieData.length === 0 ? (
            <div className="empty-state"><h3>No data</h3><p>Add some expenses first</p></div>
          ) : (
            <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
              <ResponsiveContainer width={160} height={160}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value" paddingAngle={2}>
                    {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#161622', border: '1px solid #2a2a3e', borderRadius: 8, fontSize: 12 }} formatter={v => fmt(v)} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                {pieData.slice(0, 6).map((item, i) => (
                  <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 8, height: 8, borderRadius: 2, background: COLORS[i % COLORS.length], flexShrink: 0 }} />
                    <span style={{ fontSize: 11, color: 'var(--text-muted)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</span>
                    <span style={{ fontSize: 11, fontWeight: 600 }}>{fmt(item.value)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* All time summary */}
        <div className="card fade-up">
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 16 }}>All time summary</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              { label: 'Total Income', value: fmt(stats?.allTime?.income), color: 'var(--green)' },
              { label: 'Total Expenses', value: fmt(stats?.allTime?.expense), color: 'var(--red)' },
              { label: 'Net Balance', value: fmt(stats?.allTime?.balance), color: stats?.allTime?.balance >= 0 ? 'var(--green)' : 'var(--red)' },
            ].map(item => (
              <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', background: 'var(--bg2)', borderRadius: 8, border: '1px solid var(--border)' }}>
                <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{item.label}</span>
                <span style={{ fontSize: 16, fontWeight: 600, color: item.color }}>{item.value}</span>
              </div>
            ))}
            <div style={{ padding: '0.75rem 1rem', background: 'rgba(99,102,241,0.06)', borderRadius: 8, border: '1px solid rgba(99,102,241,0.15)' }}>
              <div style={{ fontSize: 11, color: 'var(--text-dim)', marginBottom: 4 }}>This month vs last month</div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Expense change</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: (stats?.thisMonth?.expense || 0) > (stats?.lastMonth?.expense || 0) ? 'var(--red)' : 'var(--green)' }}>
                  {stats?.lastMonth?.expense ? `${Math.round(((stats.thisMonth.expense - stats.lastMonth.expense) / stats.lastMonth.expense) * 100)}%` : 'N/A'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}