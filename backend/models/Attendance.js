const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  employee: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Employee', 
    required: true 
  },
  date: { 
    type: String, 
    required: true 
  },
  checkIn: { type: String },
  checkOut: { type: String },
  status: { 
    type: String, 
    enum: ['present', 'absent', 'late', 'half-day'], 
    default: 'present' 
  },
  workHours: { type: Number, default: 0 },
  notes: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Attendance', attendanceSchema);