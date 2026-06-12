const express = require('express');
const Expense = require('../models/Expense');
const { protect } = require('../middleware/auth');

const router = express.Router();

// GET all expenses with filters
router.get('/', protect, async (req, res) => {
  try {
    const { type, category, startDate, endDate, page = 1, limit = 20, sort = '-date' } = req.query;
    const query = { user: req.user._id };

    if (type) query.type = type;
    if (category) query.category = category;
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const expenses = await Expense.find(query)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Expense.countDocuments(query);

    res.json({ success: true, expenses, total, pages: Math.ceil(total / limit), currentPage: Number(page) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET single expense
router.get('/:id', protect, async (req, res) => {
  try {
    const expense = await Expense.findOne({ _id: req.params.id, user: req.user._id });
    if (!expense) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, expense });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST create expense
router.post('/', protect, async (req, res) => {
  try {
    const { title, amount, type, category, date, note, recurring, recurringPeriod } = req.body;
    const expense = await Expense.create({
      user: req.user._id, title, amount, type, category,
      date: date || new Date(), note, recurring, recurringPeriod
    });
    res.status(201).json({ success: true, expense });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT update expense
router.put('/:id', protect, async (req, res) => {
  try {
    const expense = await Expense.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!expense) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, expense });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE expense
router.delete('/:id', protect, async (req, res) => {
  try {
    const expense = await Expense.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!expense) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE all expenses
router.delete('/', protect, async (req, res) => {
  try {
    await Expense.deleteMany({ user: req.user._id });
    res.json({ success: true, message: 'All expenses deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;