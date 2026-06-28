const Leave = require('../models/Leave');
const { notifyByEmployeeId } = require('../utils/notify');

exports.applyLeave = async (req, res) => {
  try {
    const { employeeId, leaveType, startDate, endDate, reason } = req.body;

    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

    const leave = await Leave.create({
      employee: employeeId,
      leaveType,
      startDate,
      endDate,
      days,
      reason
    });

    res.status(201).json(leave);

    const { notifyAdmins } = require('../utils/notify');

// After leave is created:
await notifyAdmins({
  title: 'New Leave Request',
  message: `${leave.employee?.name || 'An employee'} has applied for ${leaveType} leave from ${startDate} to ${endDate}. Please review and approve.`,
  type: 'general',
  link: '/leaves'
});
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getMyLeaves = async (req, res) => {
  try {
    const leaves = await Leave.find({ employee: req.params.employeeId })
      .sort({ appliedOn: -1 });
    res.json(leaves);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAllLeaves = async (req, res) => {
  try {
    const leaves = await Leave.find()
      .populate('employee', 'name role department')
      .sort({ appliedOn: -1 });
    res.json(leaves);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getPendingLeaves = async (req, res) => {
  try {
    const leaves = await Leave.find({ status: 'pending' })
      .populate('employee', 'name role department')
      .sort({ appliedOn: -1 });
    res.json(leaves);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateLeaveStatus = async (req, res) => {
  try {
    const { status, adminComment } = req.body;
    const leave = await Leave.findByIdAndUpdate(
      req.params.id,
      { status, adminComment },
      { new: true }
    ).populate('employee', 'name role department');
    
    const statusText = status === 'approved' ? 'approved' : 'rejected';
await notifyByEmployeeId({
  employeeId: leave.employee._id,
  title: `Leave Request ${statusText.charAt(0).toUpperCase() + statusText.slice(1)}`,
  message: `Your ${leave.leaveType} leave request from ${leave.startDate} to ${leave.endDate} has been ${statusText}.${adminComment ? ' Comment: ' + adminComment : ''}`,
  type: status === 'approved' ? 'leave_approved' : 'leave_rejected',
  link: '/employee/leaves'
});

    res.json(leave);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteLeave = async (req, res) => {
  try {
    await Leave.findByIdAndDelete(req.params.id);
    res.json({ message: 'Leave request deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};