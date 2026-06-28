const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  requiredSkills: [{ type: String }],
  teamMembers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Employee' }],
  status: {
    type: String,
    enum: ['planning', 'active', 'completed'],
    default: 'planning'
  },
  startDate: { type: Date },
  endDate: { type: Date },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  }
}, { timestamps: true });

module.exports = mongoose.model('Project', projectSchema);