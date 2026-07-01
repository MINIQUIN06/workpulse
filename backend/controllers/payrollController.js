const Payroll = require('../models/Payroll');
const { notifyByEmployeeId } = require('../utils/notify');

const calculatePayroll = (basicSalary, percentages) => {
  const basic = Number(basicSalary) || 0;

  const hra = Math.round(basic * (Number(percentages.hra) || 0) / 100);
  const da = Math.round(basic * (Number(percentages.da) || 0) / 100);
  const ta = Math.round(basic * (Number(percentages.ta) || 0) / 100);
  const medical = Math.round(basic * (Number(percentages.medical) || 0) / 100);
  const totalAllowances = hra + da + ta + medical;
  const grossSalary = basic + totalAllowances;

  const pf = Math.round(basic * (Number(percentages.pf) || 0) / 100);
  const incomeTax = Math.round(grossSalary * (Number(percentages.incomeTax) || 0) / 100);
  const professionalTax = Math.round(grossSalary * (Number(percentages.professionalTax) || 0) / 100);
  const esi = Math.round(grossSalary * (Number(percentages.esi) || 0) / 100);
  const totalDeductions = pf + incomeTax + professionalTax + esi;
  const netSalary = grossSalary - totalDeductions;

  return {
    allowances: { hra, da, ta, medical },
    deductions: { pf, incomeTax, professionalTax, esi },
    grossSalary,
    totalDeductions,
    netSalary
  };
};

exports.createPayroll = async (req, res) => {
  try {
    const { employeeId, month, year, basicSalary, percentages } = req.body;

    const existing = await Payroll.findOne({ employee: employeeId, month, year });
    if (existing) {
      return res.status(400).json({ message: 'Payroll already exists for this month' });
    }

    const calculated = calculatePayroll(basicSalary, percentages);

    const payroll = await Payroll.create({
      employee: employeeId,
      month,
      year,
      basicSalary: Number(basicSalary),
      percentages,
      ...calculated
    });

    await notifyByEmployeeId({
      employeeId,
      title: 'Payroll Generated',
      message: `Your salary slip for ${month} ${year} is ready. Net salary: Rs.${calculated.netSalary.toLocaleString()}.`,
      type: 'payroll',
      link: '/employee/payroll'
    });

    const populated = await Payroll.findById(payroll._id)
      .populate('employee', 'name role department');
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAllPayrolls = async (req, res) => {
  try {
    const payrolls = await Payroll.find()
      .populate('employee', 'name role department')
      .sort({ createdAt: -1 });
    res.json(payrolls);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getMyPayrolls = async (req, res) => {
  try {
    const payrolls = await Payroll.find({ employee: req.params.employeeId })
      .sort({ year: -1, createdAt: -1 });
    res.json(payrolls);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.markAsPaid = async (req, res) => {
  try {
    const payroll = await Payroll.findByIdAndUpdate(
      req.params.id,
      { status: 'paid', paidOn: new Date() },
      { new: true }
    ).populate('employee', 'name role department');
    res.json(payroll);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deletePayroll = async (req, res) => {
  try {
    await Payroll.findByIdAndDelete(req.params.id);
    res.json({ message: 'Payroll deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getPayrollStats = async (req, res) => {
  try {
    const total = await Payroll.countDocuments();
    const pending = await Payroll.countDocuments({ status: 'pending' });
    const paid = await Payroll.countDocuments({ status: 'paid' });
    const allPayrolls = await Payroll.find();
    const totalPayout = allPayrolls.reduce((acc, p) => acc + (p.netSalary || 0), 0);
    res.json({ total, pending, paid, totalPayout });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const PDFDocument = require('pdfkit');

exports.downloadPayslip = async (req, res) => {
  try {
    const payroll = await Payroll.findById(req.params.id)
      .populate('employee', 'name role department employeeId email');

    if (!payroll) {
      return res.status(404).json({ message: 'Payroll record not found' });
    }

    const doc = new PDFDocument({ margin: 50 });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=Payslip_${payroll.employee.employeeId}_${payroll.month}_${payroll.year}.pdf`
    );

    doc.pipe(res);

    // Header
    doc.fontSize(20).font('Helvetica-Bold').text('WorkPulse', { align: 'center' });
    doc.fontSize(12).font('Helvetica').text('Employee Salary Slip', { align: 'center' });
    doc.moveDown(1.5);

    // Employee Info
    doc.fontSize(10);
    doc.text(`Employee ID: ${payroll.employee.employeeId}`);
    doc.text(`Name: ${payroll.employee.name}`);
    doc.text(`Department: ${payroll.employee.department}`);
    doc.text(`Role: ${payroll.employee.role}`);
    doc.text(`Pay Period: ${payroll.month} ${payroll.year}`);
    doc.text(`Status: ${payroll.status.toUpperCase()}`);
    doc.moveDown();

    // Divider
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown();

    // Earnings
    doc.fontSize(12).font('Helvetica-Bold').text('Earnings');
    doc.fontSize(10).font('Helvetica');
    doc.text(`Basic Salary: Rs. ${payroll.basicSalary.toLocaleString()}`);
    doc.text(`HRA: Rs. ${payroll.allowances.hra.toLocaleString()}`);
    doc.text(`DA: Rs. ${payroll.allowances.da.toLocaleString()}`);
    doc.text(`TA: Rs. ${payroll.allowances.ta.toLocaleString()}`);
    doc.text(`Medical: Rs. ${payroll.allowances.medical.toLocaleString()}`);
    doc.moveDown(0.5);
    doc.font('Helvetica-Bold').text(`Gross Salary: Rs. ${payroll.grossSalary.toLocaleString()}`);
    doc.moveDown();

    // Deductions
    doc.fontSize(12).font('Helvetica-Bold').text('Deductions');
    doc.fontSize(10).font('Helvetica');
    doc.text(`PF: Rs. ${payroll.deductions.pf.toLocaleString()}`);
    doc.text(`Income Tax: Rs. ${payroll.deductions.incomeTax.toLocaleString()}`);
    doc.text(`Professional Tax: Rs. ${payroll.deductions.professionalTax.toLocaleString()}`);
    doc.text(`ESI: Rs. ${payroll.deductions.esi.toLocaleString()}`);
    doc.moveDown(0.5);
    doc.font('Helvetica-Bold').text(`Total Deductions: Rs. ${payroll.totalDeductions.toLocaleString()}`);
    doc.moveDown();

    // Divider
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown();

    // Net Salary
    doc.fontSize(14).font('Helvetica-Bold').text(`Net Salary: Rs. ${payroll.netSalary.toLocaleString()}`);
    doc.moveDown(2);

    doc.fontSize(8).font('Helvetica').fillColor('gray')
      .text('This is a computer-generated payslip and does not require a signature.', { align: 'center' });

    doc.end();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};