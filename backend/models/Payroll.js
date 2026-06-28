const mongoose = require('mongoose');

const payrollSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true
  },
  month: { type: String, required: true },
  year: { type: Number, required: true },
  basicSalary: { type: Number, required: true },
  percentages: {
    hra: { type: Number, default: 40 },
    da: { type: Number, default: 20 },
    ta: { type: Number, default: 10 },
    medical: { type: Number, default: 5 },
    pf: { type: Number, default: 12 },
    incomeTax: { type: Number, default: 10 },
    professionalTax: { type: Number, default: 2 },
    esi: { type: Number, default: 1 }
  },
  allowances: {
    hra: { type: Number, default: 0 },
    da: { type: Number, default: 0 },
    ta: { type: Number, default: 0 },
    medical: { type: Number, default: 0 }
  },
  deductions: {
    pf: { type: Number, default: 0 },
    incomeTax: { type: Number, default: 0 },
    professionalTax: { type: Number, default: 0 },
    esi: { type: Number, default: 0 }
  },
  grossSalary: { type: Number },
  totalDeductions: { type: Number },
  netSalary: { type: Number },
  status: {
    type: String,
    enum: ['pending', 'paid'],
    default: 'pending'
  },
  paidOn: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Payroll', payrollSchema);