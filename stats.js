const express = require('express');
const Expense = require('../models/Expense');
const { protect } = require('../middleware/auth');

const router = express.Router();

// GET dashboard stats
router.get('/dashboard', protect, async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

    const [thisMonth, lastMonth, allTime] = await Promise.all([
      Expense.find({ user: req.user._id, date: { $gte: startOfMonth, $lte: endOfMonth } }),
      Expense.find({ user: req.user._id, date: { $gte: startOfLastMonth, $lte: endOfLastMonth } }),
      Expense.find({ user: req.user._id }),
    ]);

    const sum = (arr, type) => arr.filter(e => e.type === type).reduce((a, e) => a + e.amount, 0);

    const thisIncome = sum(thisMonth, 'income');
    const thisExpense = sum(thisMonth, 'expense');
    const lastIncome = sum(lastMonth, 'income');
    const lastExpense = sum(lastMonth, 'expense');

    // Category breakdown this month
    const categoryBreakdown = {};
    thisMonth.filter(e => e.type === 'expense').forEach(e => {
      categoryBreakdown[e.category] = (categoryBreakdown[e.category] || 0) + e.amount;
    });

    // Monthly trend last 6 months
    const trend = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);
      const month = allTime.filter(e => e.date >= d && e.date <= end);
      trend.push({
        month: d.toLocaleString('default', { month: 'short' }),
        income: sum(month, 'income'),
        expense: sum(month, 'expense'),
      });
    }

    res.json({
      success: true,
      stats: {
        thisMonth: { income: thisIncome, expense: thisExpense, balance: thisIncome - thisExpense },
        lastMonth: { income: lastIncome, expense: lastExpense, balance: lastIncome - lastExpense },
        allTime: { income: sum(allTime, 'income'), expense: sum(allTime, 'expense'), balance: sum(allTime, 'income') - sum(allTime, 'expense') },
        categoryBreakdown,
        trend,
        recentTransactions: allTime.sort((a, b) => b.date - a.date).slice(0, 5),
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;