const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  checkIn, checkOut,
  getMyAttendance, getTodayStatus,
  getAllAttendance, getAttendanceReport
} = require('../controllers/attendanceController');

router.post('/check-in', auth, checkIn);
router.post('/check-out', auth, checkOut);
router.get('/my/:employeeId', auth, getMyAttendance);
router.get('/today/:employeeId', auth, getTodayStatus);
router.get('/all', auth, getAllAttendance);
router.get('/report', auth, getAttendanceReport);

module.exports = router;