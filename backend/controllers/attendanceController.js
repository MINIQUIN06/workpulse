const Attendance = require('../models/Attendance');
const Employee = require('../models/Employee');
const { notifyByEmployeeId } = require('../utils/notify');

exports.checkIn = async (req, res) => {
  try {
    const { employeeId } = req.body;
    const today = new Date().toISOString().split('T')[0];
    const now = new Date().toLocaleTimeString('en-US', { 
      hour: '2-digit', minute: '2-digit', hour12: true 
    });
    

    const existing = await Attendance.findOne({ employee: employeeId, date: today });
    if (existing) {
      return res.status(400).json({ message: 'Already checked in today' });
    }

    const checkInHour = new Date().getHours();
    const status = checkInHour >= 10 ? 'late' : 'present';

    const attendance = await Attendance.create({
      employee: employeeId,
      date: today,
      checkIn: now,
      status
    });

    await notifyByEmployeeId({
  employeeId,
  title: 'Check-in Confirmed',
  message: `Your attendance has been recorded. Check-in time: ${now}. Status: ${status}.`,
  type: 'attendance',
  link: '/employee/attendance'
});
    res.status(201).json(attendance);
      
  } catch (err) {
    res.status(500).json({ message: err.message });
  }

};

exports.checkOut = async (req, res) => {
  try {
    const { employeeId } = req.body;
    const today = new Date().toISOString().split('T')[0];
    const now = new Date().toLocaleTimeString('en-US', {
      hour: '2-digit', minute: '2-digit', hour12: true
    });

    const attendance = await Attendance.findOne({ employee: employeeId, date: today });
    if (!attendance) {
      return res.status(400).json({ message: 'No check-in found for today' });
    }
    if (attendance.checkOut) {
      return res.status(400).json({ message: 'Already checked out today' });
    }

    const checkInTime = new Date(`${today} ${attendance.checkIn}`);
    const checkOutTime = new Date(`${today} ${now}`);
    const workHours = ((checkOutTime - checkInTime) / (1000 * 60 * 60)).toFixed(1);

    const status = workHours < 4 ? 'half-day' : attendance.status;

    attendance.checkOut = now;
    attendance.workHours = workHours;
    attendance.status = status;
    await attendance.save();
     
  await notifyByEmployeeId({
  employeeId,
  title: 'Check-out Confirmed',
  message: `You have checked out at ${now}. Total work hours today: ${workHours} hrs.`,
  type: 'attendance',
  link: '/employee/attendance'
 });

    res.json(attendance);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }

};

exports.getMyAttendance = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const attendance = await Attendance.find({ employee: employeeId })
      .sort({ date: -1 })
      .limit(30);
    res.json(attendance);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getTodayStatus = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const today = new Date().toISOString().split('T')[0];
    const attendance = await Attendance.findOne({ employee: employeeId, date: today });
    res.json(attendance || null);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAllAttendance = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const attendance = await Attendance.find({ date: today })
      .populate('employee', 'name role department');
    res.json(attendance);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAttendanceReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const attendance = await Attendance.find({
      date: { $gte: startDate, $lte: endDate }
    }).populate('employee', 'name role department');
    res.json(attendance);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};