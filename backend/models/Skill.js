const mongoose = require('mongoose');

const skillSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { 
    type: String, 
    enum: ['technical', 'soft', 'management', 'design', 'other'],
    required: true 
  },
  level: { 
    type: String, 
    enum: ['beginner', 'intermediate', 'advanced', 'expert'],
    required: true 
  },
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
  certified: { type: Boolean, default: false },
  certificationExpiry: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('Skill', skillSchema);