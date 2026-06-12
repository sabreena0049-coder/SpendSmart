const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true, trim: true },
  amount: { type: Number, required: true, min: 0 },
  type: { type: String, enum: ['expense', 'income'], required: true },
  category: {
    type: String,
    required: true,
    enum: [
      'Food & Dining', 'Transportation', 'Shopping', 'Entertainment',
      'Health & Fitness', 'Housing', 'Utilities', 'Education',
      'Travel', 'Personal Care', 'Savings', 'Salary', 'Freelance',
      'Investment', 'Gift', 'Other'
    ]
  },
  date: { type: Date, required: true, default: Date.now },
  note: { type: String, maxlength: 300, default: '' },
  recurring: { type: Boolean, default: false },
  recurringPeriod: { type: String, enum: ['weekly', 'monthly', 'yearly', null], default: null },
}, { timestamps: true });

module.exports = mongoose.model('Expense', expenseSchema);