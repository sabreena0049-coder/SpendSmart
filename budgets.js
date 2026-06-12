const express = require('express');
const Budget = require('../models/Budget');
const Expense = require('../models/Expense');
const { protect } = require('../middleware/auth');

const router = express.Router();

// GET budgets for a month
router.get('/', protect, async (req, res) => {
  try {
    const { month = new Date().getMonth() + 1, year = new Date().getFullYear() } = req.query;
    const budgets = await Budget.find({ user: req.user._id, month: Number(month), year: Number(year) });

    // Get spending per category for the month
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0, 23, 59, 59);
    const expenses = await Expense.find({
      user: req.user._id, type: 'expense',
      date: { $gte: start, $lte: end }
    });

    const spending = {};
    expenses.forEach(e => {
      spending[e.category] = (spending[e.category] || 0) + e.amount;
    });

    const budgetsWithSpending = budgets.map(b => ({
      ...b.toJSON(),
      spent: spending[b.category] || 0,
      remaining: b.limit - (spending[b.category] || 0),
      percentage: Math.min(100, Math.round(((spending[b.category] || 0) / b.limit) * 100))
    }));

    res.json({ success: true, budgets: budgetsWithSpending });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST set budget
router.post('/', protect, async (req, res) => {
  try {
    const { category, limit, month, year } = req.body;
    const budget = await Budget.findOneAndUpdate(
      { user: req.user._id, category, month, year },
      { limit },
      { upsert: true, new: true }
    );
    res.status(201).json({ success: true, budget });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE budget
router.delete('/:id', protect, async (req, res) => {
  try {
    await Budget.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    res.json({ success: true, message: 'Budget deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;