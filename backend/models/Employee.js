const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  employeeCode: { type: String, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String },
  department: { type: String, required: true },
  role: { type: String, required: true },
  experience: { type: Number, default: 0 },
  skills: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Skill' }],
  projects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Project' }],
  joinDate: { type: Date, default: Date.now },
  profileImage: { type: String },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' }
}, { timestamps: true });

//EMP0001
employeeSchema.pre('save', async function () {
  if (this.isNew && !this.employeeCode) {
    const Employee = mongoose.model('Employee');
    const count = await Employee.countDocuments();
    const nextNumber = count + 1;
    this.employeeCode = `EMP${String(nextNumber).padStart(4, '0')}`;
  }
  //next();
});


module.exports = mongoose.model('Employee', employeeSchema);